import mongoose from "mongoose";
import fetch from "node-fetch";
await mongoose.connect(process.env.DB_URL, { dbName: "acc" });
import serverSchema from "./models/server.js";
const server= mongoose.model("Server", serverSchema)

import { randomBytes } from 'crypto';
import WebSocket from 'ws';
import "dotenv/config";

import geoip from "fast-geoip";

const sessionTypes = {
  "00" : "Practice",
  "04" : "Qualifying",
  "0a" : "Race"
};

const classes = {
  "fa" : "Mixed",
  "00" : "GT3",
  "07" : "GT4",
  "f9" : "GTC",
  "0c" : "TCX"
}

const standard_bool = {
  "01" : true,
  "00" : false
}

const rain = {
  "80" : true,
  "00" : false
}

const trackData = {
  "barcelona": {
    name: "Barcelona Grand Prix Circuit"
  },
  "mount_panorama": {
    name: "Bathurst - Mount Panorama Circuit",
    dlc: "icgt"
  },
  "brands_hatch": {
    name: "Brands Hatch"
  },
  "donington": {
    name: "Donington Park",
    dlc: "bgt"
  },
  "hungaroring": {
    name: "Hungaroring"
  },
  "imola": {
    name: "Imola",
    dlc: "gtwc"
  },
  "kyalami": {
    name: "Kyalami",
    dlc: "icgt"
  },
  "laguna_seca": {
    name: "Laguna Seca",
    dlc: "icgt"
  },
  "misano": {
    name: "Misano"
  },
  "monza": {
    name: "Monza"
  },
  "nurburgring": {
    name: "Nurburgring"
  },
  "oulton_park": {
    name: "Oulton Park",
    dlc: "bgt"
  },
  "paul_ricard": {
    name: "Paul Ricard"
  },
  "silverstone": {
    name: "Silverstone"
  },
  "snetterton" : {
    name: "Snetterton 300",
    dlc: "bgt"
  },
  "spa": {
    name: "Spa-Francorchamps"
  },
  "suzuka": {
    name: "Suzuka",
    dlc: "icgt"
  },
  "zandvoort": {
    name: "Zandvoort"
  },
  "zolder": {
    name: "Zolder"
  },
  "watkins_glen": {
    name: "Watkins Glen",
    dlc: "atp"
  },
  "cota": {
    name: "Circuit of the Americas",
    dlc: "atp"
  },
  "indianapolis": {
    name: "Indianapolis Motor Speedway",
    dlc: "atp"
  }
};

function getTrack(id){
  // todo: match legacy naming to current spec, see: https://www.acc-wiki.info/wiki/Racetracks_Overview
  if(id in trackData){
    const track = trackData[id];
    if(track.dlc == undefined){
      track.dlc = "base"
    };
    return track;
  } else {
    console.log(`New track: ${id}, please create an issue to add it`);
  }
  return {
    name: id,
    dlc: "base"
  }
}

function getServers(){
  let currentIndex;
  let rawData;

  console.log("Getting server list...");

  const ws = new WebSocket('ws://809a.assettocorsa.net:80/kson809','ws', {
    protocolVersion: 13,
    'Pragma': 'no-cache',
    'Sec-WebSocket-Protocol': 'ws',
    'sec-websocket-key': randomBytes(16).toString('base64'),
    'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
  });
  
  const queryString = process.env.QUERYSTRING;
  const authString = process.env.AUTHSTRING;
  ws.on("open", ()=>{
    console.log(`status=online`);
    ws.send(authString);
    const hex = Buffer.from(queryString, "hex");
    ws.send(hex);
  });

  ws.on("message", (data)=>{
    console.log("Got server hex data");
    rawData = data;
    cleanData();
    ws.close();
  })

  ws.on("error", (err)=>{
    console.log(`status=offline`);
    console.log(err)
  });

  ws.on("unexpected-response", (err)=>{
    console.log(err)
  })

  function readData(length){
    const data = rawData.subarray(currentIndex, currentIndex + length);
    currentIndex += length;
    return data
  }

  function readNumber(){
    const data = rawData.readUInt8(currentIndex);
    currentIndex += 1;
    return data
  }

  function readString(length){
    return readData(length).toString("utf-8")
  }

  function readHexPair(){
    return readData(1).toString("hex")
  }

  function readDynamicString(){
    const nextLength = readNumber();
    const compstring = readString(nextLength);
    return compstring
  }

  async function cleanData(){
    currentIndex = 200;
    const start = Date.now();
    console.log("Cleaning data")
  
    function getMetaLarge(record){
      record.misc.push(readData(2));
      record.class = classes[readHexPair()];
      record.misc.push(readData(10));
      record.hotjoin = standard_bool[readHexPair()];
      record.misc.push(readData(1));
  
      record.numOfSessions = readNumber();
      record.sessions = [];
      for(let i = 0; i < record.numOfSessions; i++){
        const sessionData = {};
        sessionData["type"] = sessionTypes[readHexPair()];
        const time1 = readNumber();
        const time2 = readNumber() * 256;
        sessionData["time"] = time1 + time2;
        sessionData["active"] = false;
        record.sessions.push(sessionData);
      }
      record.maxDrivers = readNumber();
      record.connectedDrivers = readNumber();
      record.isFull = (record.maxDrivers == record.connectedDrivers);
      record.misc.push(readData(3));
      record.conditions = {};
      record.conditions.rain = rain[readHexPair()];
      // This has got something to do with cloud cover however it only seems to affect it when rain is also enabled?
      // Don't know how rain intensity is communicated when it seems to be true/ false though maybe we're looking at the wrong value
      // Maybe some of the data is for a forecast?
      const tempVal = readHexPair();
      record.misc.push(tempVal);
      record.conditions.night = standard_bool[readHexPair()];
      record.conditions.variability = readNumber();
  
      record.requirements = {};
      record.requirements.trackMedals = readNumber();
      record.requirements.safetyRating = readNumber();
      if(record.requirements.safetyRating == 255){
        record.requirements.safetyRating = 0;
      }
      record.misc.push(readData(8));
  
      record.currentSession = readNumber();
      if(record.currentSession < record.sessions.length){
        record.sessions[record.currentSession].active = true;
      }
  
      return record
    }

    const ids = [];
    while(rawData.length - currentIndex > 3){
      let record = {};
      // ip
      record.ip = readDynamicString();
      if(!/^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(record.ip)){
        continue;
      }
      // unknown?
      record.misc = [];
      record.port = {};
      record.port.tcp = readNumber() + readNumber() * 256;
      record.port.udp = readNumber() + readNumber() * 256;
      
      record.id = (`${record.ip}:${record.port.tcp}`);
      
      record.misc.push(readData(1));
      // track
      const trackId = readDynamicString();
      record.track = getTrack(trackId);
      record.track.id = trackId;
      // server name
      record.name = readDynamicString();
      // record
      record = getMetaLarge(record);
      ids.push(record.id);

      // Hope this will be less blocking
      (async()=>{
        const pushed = await server.findOneAndUpdate({
          id: record.id,
        }, {
          $set: record
        }, {
          upsert: true,
          new: true
        });
        if(pushed.country_code === ""){
          try{
            const geo = await geoip.lookup(pushed.ip);
            pushed.country_code = geo.country.toLowerCase();
            pushed.save()
          } catch(err){
            pushed.country_code = "un";
            pushed.save()
          }
        }
      })()
    }
    console.log("Got server list!");
    const timeTaken = Date.now() - start;
    console.log(`Completed in ${timeTaken} ms`);
    server.deleteMany({
      id: {
        $nin: ids
      }
    });
  }
}

getServers(true)
const getServerLoop = setInterval(async()=>{
  getServers(false);
}, 2 * 60 * 1000 + 2000 + Math.floor(Math.random() * 30000));

