import mongoose from "mongoose";
import fs from "fs/promises";
await mongoose.connect(process.env.DB_URL);

import serverSchema from "./models/server.js";
const server= mongoose.model("Server", serverSchema)

import { randomBytes } from 'crypto';
import WebSocket from 'ws';
import "dotenv/config";

const sessionTypes = {
  "00" : "Practice",
  "04" : "Qualifying",
  "0a" : "Race"
};

const classes = {
  "fa" : "Mixed",
  "00" : "GT3",
  "07" : "GT4",
  "f9" : "GTC"
}

const standard_bool = {
  "01" : true,
  "00" : false
}

const rain = {
  "80" : true,
  "00" : false
}

// todo: add dlc requirements etc so it can be filtered
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
  }
  return {
    name: id,
    dlc: "base"
  }
}

let JSONdata = [];

function getServers(){
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
    console.log("Established websocket connection");
    ws.send(authString);
    const hex = Buffer.from(queryString, "hex");
    ws.send(hex);
  })
  
  ws.on("message", (data)=>{
    console.log("Got server hex data");
    const hexString = data.toString('hex');
    cleanData(hexString);
  })

  ws.on("error", (err)=>{
    console.log(err)
  })
  ws.on("unexpected-response", (err)=>{
    console.log(err)
  })

  async function cleanData(data){
    console.log("Cleaning data")
    let clone = data.slice(200).split('');
  
    function getDynamic(){
      // Length signifier
      const removedPair = clone.splice(0, 2);
      const nextLength = parseInt(removedPair.join(""), 16) * 2;
  
      // Extract by length
      const removedData = clone.splice(0, nextLength);
      const compstring = Buffer.from(removedData.join(""), "hex").toString("utf-8");
      return compstring
    }
  
    function getMetaLarge(record){
      record.misc.push(clone.splice(0, 4).join(""));
      record.class = classes[clone.splice(0, 2).join("")];
      record.misc.push(clone.splice(0, 20).join(""));
      record.hotjoin = standard_bool[clone.splice(0, 2).join("")];
      record.misc.push(clone.splice(0, 2).join(""));
  
      record.numOfSessions = parseInt(clone.splice(0, 2).join(""), 16);
      record.sessions = [];
      for(let i = 0; i < record.numOfSessions; i++){
        const sessionData = {};
        sessionData["type"] = sessionTypes[clone.splice(0, 2).join("")];
        const time1 = parseInt(clone.splice(0, 2).join(""), 16);
        const time2 = (parseInt(clone.splice(0, 2).join(""), 16) * 256);
        sessionData["time"] = time1 + time2;
        sessionData["active"] = false;
        record.sessions.push(sessionData);
      }
      record.maxDrivers = parseInt(clone.splice(0, 2).join(""), 16);
      record.connectedDrivers = parseInt(clone.splice(0, 2).join(""), 16);
      record.isFull = (record.maxDrivers == record.connectedDrivers);
      record.misc.push(clone.splice(0, 6).join(""));
      record.conditions = {};
      record.conditions.rain = rain[(clone.splice(0, 2).join(""))];
      // This has got something to do with cloud cover however it only seems to affect it when rain is also enabled?
      // Don't know how rain intensity is communicated when it seems to be true/ false though maybe we're looking at the wrong value
      // Maybe some of the data is for a forecast?
      const tempVal = clone.splice(0, 2).join("");
      record.misc.push(tempVal);
      record.conditions.night = standard_bool[(clone.splice(0, 2).join(""))];
      record.conditions.variability = parseInt(clone.splice(0, 2).join(""), 16);
  
      record.requirements = {};
      record.requirements.trackMedals = parseInt(clone.splice(0, 2).join(""), 16);
      record.requirements.safetyRating = parseInt(clone.splice(0, 2).join(""), 16);
      if(record.requirements.safetyRating == 255){
        record.requirements.safetyRating = 0;
      }
      record.misc.push(clone.splice(0, 16).join(""));
  
      record.currentSession = parseInt(clone.splice(0, 2).join(""), 16);
      if(record.currentSession < record.sessions.length){
        record.sessions[record.currentSession].active = true;
      }
  
      return record
    }

    JSONdata = [];
    while(clone.length > 3){
      let record = {};
      // ip
      record.ip = getDynamic();
      if(!/^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(record.ip)){
        // console.log(record.ip)
        continue;
      }
      // unknown?
      record.misc = [];
      record.port = {};
      record.port.tcp = parseInt(clone.splice(0, 2).join(""), 16) + parseInt(clone.splice(0, 2).join(""), 16) * 256;
      record.port.udp = parseInt(clone.splice(0, 2).join(""), 16) + parseInt(clone.splice(0, 2).join(""), 16) * 256;
      record.misc.push(clone.splice(0, 2).join(""));
      // track
      const trackId = getDynamic();
      record.track = getTrack(trackId);
      record.track.id = trackId;
      // server name
      record.name = getDynamic();
      // record
      record = getMetaLarge(record);
      JSONdata.push(record);
    }
  
    // TODO: Properly detect the last server, for now this should work though
    // JSONdata.pop();
    await server.deleteMany({});
    const pushed = await server.insertMany(JSONdata, {ordered: true});
    // console.log(JSONdata.length);
    console.log("Got server list!");
    // fs.writeFile("./debug.json", JSON.stringify(JSONdata,null, 2), "utf-8")
  }
}

getServers()
const getServerLoop = setInterval(async()=>{
  getServers();
}, 2 * 60 * 1000);