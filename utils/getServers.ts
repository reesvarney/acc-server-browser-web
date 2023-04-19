import { randomBytes } from "crypto";
import WebSocket from "ws";
import models from "./db";
import geoip from "geoip-country";

const trackData: {
  [key: string]: {
    name: string;
    dlc?: string;
    image?: string;
  };
} = {
  barcelona: {
    name: "Barcelona Grand Prix Circuit",
    image: "track-Barcelona",
  },
  mount_panorama: {
    name: "Bathurst - Mount Panorama Circuit",
    dlc: "icgt",
    image: "int_gt_pack-18",
  },
  brands_hatch: {
    name: "Brands Hatch",
    image: "track-Brands-Hatch",
  },
  donington: {
    name: "Donington Park",
    dlc: "bgt",
    image: "9-2",
  },
  hungaroring: {
    name: "Hungaroring",
  },
  imola: {
    name: "Imola",
    dlc: "gtwc",
    image: "track-imola",
  },
  kyalami: {
    name: "Kyalami",
    dlc: "icgt",
  },
  valencia: {
    name: "Valencia",
    dlc: "GTWC-2023"
  },
  laguna_seca: {
    name: "Laguna Seca",
    dlc: "icgt",
    image: "int_gt_pack-2",
  },
  misano: {
    name: "Misano",
  },
  monza: {
    name: "Monza",
  },
  nurburgring: {
    name: "Nurburgring",
  },
  oulton_park: {
    name: "Oulton Park",
    dlc: "bgt",
    image: "12-3",
  },
  paul_ricard: {
    name: "Paul Ricard",
    image: "track-Paul-Ricard",
  },
  silverstone: {
    name: "Silverstone",
  },
  snetterton: {
    name: "Snetterton 300",
    dlc: "bgt",
  },
  spa: {
    name: "Spa-Francorchamps",
  },
  suzuka: {
    name: "Suzuka",
    dlc: "icgt",
    image: "int_gt_pack-3",
  },
  zandvoort: {
    name: "Zandvoort",
  },
  zolder: {
    name: "Zolder",
  },
  watkins_glen: {
    name: "Watkins Glen",
    dlc: "atp",
    image: "9-2-3",
  },
  cota: {
    name: "Circuit of the Americas",
    dlc: "atp",
    image: "3-3",
  },
  indianapolis: {
    name: "Indianapolis Motor Speedway",
    dlc: "atp",
    image: "jp",
  },
};

function getTrack(id: string) {
  // todo: match legacy naming to current spec, see: https://www.acc-wiki.info/wiki/Racetracks_Overview
  if (id in trackData) {
    const track = trackData[id];
    if (!track.dlc) {
      track.dlc = "base";
    }
    if (!track.image) {
      track.image = `track-${track.name}`;
    }
    return { ...track, id };
  } else {
    console.log(
      `New track: ${id}, please create an issue at https://github.com/reesvarney/acc-server-browser-web to add it`
    );
  }
  return {
    name: id,
    dlc: "base",
    id,
    image: "",
  };
}

function getServers(): Promise<String> {
  return new Promise((resolve) => {
    let currentIndex = 0;
    let rawData: Buffer;

    console.log("Getting server list");
    const ws = new WebSocket("ws://809a.assettocorsa.net:80/kson809", "ws", {
      protocolVersion: 13,
      headers: {
        Pragma: "no-cache",
        "Sec-WebSocket-Protocol": "ws",
        "sec-websocket-key": randomBytes(16).toString("base64"),
        "Sec-WebSocket-Extensions":
          "permessage-deflate; client_max_window_bits",
      },
    });

    const queryString = process.env.QUERYSTRING ?? "";
    const authString = process.env.AUTHSTRING ?? "";
    ws.on("open", () => {
      ws.send(authString);
      const hex = Buffer.from(queryString, "hex");
      ws.send(hex);
    });

    ws.on("message", (data: Buffer) => {
      console.log("Received binary data");
      rawData = data;
      cleanData();
      ws.close();
    });

    ws.on("error", (err: string) => {
      resolve("offline");
      console.log("offline", err);
    });

    ws.on("unexpected-response", (err: string) => {
      console.log(err);
    });

    function readData(length: number) {
      const data = rawData.subarray(currentIndex, currentIndex + length);
      currentIndex += length;
      return data;
    }

    function readNumber() {
      const data = rawData.readUInt8(currentIndex);
      currentIndex += 1;
      return data;
    }

    function readLastBitBoolean() {
      return readData(1).readInt8() ? true : false;
    }

    function readFirstBitBoolean() {
      return readData(1)[0] === 0x80;
    }

    function getSessionType() {
      const data = readData(1)[0];
      if (data === 0x0a) return "Race";
      if (data === 0x04) return "Qualifying";
      if (data === 0x00) return "Practice";
    }

    function getVehicleClass() {
      const data = readData(1)[0];
      if (data === 0xfa) return "Mixed";
      if (data === 0x00) return "GT3";
      if (data === 0x07) return "GT4";
      if (data === 0xf9) return "GTC";
      if (data === 0x0c) return "TCX";
    }

    function readString(length: number) {
      return readData(length).toString("utf-8");
    }

    function readDynamicString() {
      const nextLength = readNumber();
      const compstring = readString(nextLength);
      return compstring;
    }

    async function cleanData() {
      currentIndex = 200;
      const start = Date.now();
      const bulk = models.Server.collection.initializeUnorderedBulkOp();

      const ids = [];
      while (rawData.length - currentIndex > 3) {
        // ip
        const misc = [];
        const ip = readDynamicString();
        if (!/^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(ip)) {
          continue;
        }
        // unknown?
        const port = {
          tcp: readNumber() + readNumber() * 256,
          udp: readNumber() + readNumber() * 256,
        };

        const id = `${ip}:${port.tcp}`;
        misc.push(readData(1));
        const track = getTrack(readDynamicString());
        const name = readDynamicString();
        misc.push(readData(2));
        const vehicleClass = getVehicleClass();
        misc.push(readData(10));
        const hotjoin = readLastBitBoolean();
        misc.push(readData(1));

        const numOfSessions = readNumber();
        const sessions = [];
        for (let i = 0; i < numOfSessions; i++) {
          sessions.push({
            type: getSessionType(),
            time: readNumber() + readNumber() * 256,
            active: false,
          });
        }
        const drivers = {
          max: readNumber(),
          connected: readNumber(),
        };
        misc.push(readData(3));
        const conditions = {
          rain: readFirstBitBoolean(),
          night: false,
          variability: 0,
        };
        // This has got something to do with cloud cover however it only seems to affect it when rain is also enabled?
        // Don't know how rain intensity is communicated when it seems to be true/ false though maybe we're looking at the wrong value
        // Maybe some of the data is for a forecast?
        misc.push(readData(1));
        conditions.night = readLastBitBoolean();
        conditions.variability = readNumber();

        const requirements = {
          trackMedals: readNumber(),
          safetyRating: readNumber(),
        };
        if (requirements.safetyRating == 255) {
          requirements.safetyRating = 0;
        }
        misc.push(readData(8));
        const currentSession = readNumber();
        if (currentSession < sessions.length) {
          sessions[currentSession].active = true;
        }
        ids.push(id);
        let country_code = "un";
        try {
          const geo = await geoip.lookup(ip || "");
          if (!geo) throw new Error("Could not lookup IP");
          country_code = geo.country.toLowerCase();
        } catch (err) {}

        bulk
          .find({ id })
          .upsert()
          .updateOne({
            $set: {
              ip,
              id,
              port,
              track,
              name,
              class: vehicleClass,
              hotjoin,
              numOfSessions,
              sessions,
              drivers,
              conditions,
              requirements,
              currentSession,
              isFull: drivers.max == drivers.connected,
              country_code,
            },
          });
      }
      const timeTaken_1 = Date.now() - start;
      console.log(`Converted servers in ${timeTaken_1} ms`);
      console.log(`Converted servers to JSON objects`);
      bulk.find({
        id: {
          $nin: ids,
        },
      }).delete();
      await bulk.execute();
      const timeTaken_2 = Date.now() - start;
      console.log(`Updated ${ids.length} servers in ${timeTaken_2} ms`);
      resolve("online");
    }
  });
}

export default getServers;
