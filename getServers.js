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

let JSONdata = [];

function getServers(){
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
    ws.send(authString);
    const hex = Buffer.from(queryString, "hex");
    ws.send(hex);
  })
  
  ws.on("message", (data)=>{
    const hexString = data.toString('hex');
    cleanData(hexString);
  })
  
  function cleanData(data){
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
        record.sessions.push(sessionData);
      }
      record.maxDrivers = parseInt(clone.splice(0, 2).join(""), 16);
      record.connectedDrivers = parseInt(clone.splice(0, 2).join(""), 16);
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
  
      return record
    }
  
    function getMetaSmall(){
      return clone.splice(0,10);
    }
  
    JSONdata = [];
    while(clone.length > 3){
      let record = {};
      // ip
      record.ip = getDynamic();
      // unknown?
      record.misc = [];
      record.misc.push(getMetaSmall(5).join(""));
      // track
      record.track = getDynamic();
      // server name
      record.name = getDynamic();
      // record
      record = getMetaLarge(record);
      JSONdata.push(record);
    }
  
    // TODO: Properly detect the last server, for now this should work though
    JSONdata.pop();
  }
}
export {getServers, JSONdata as servers}