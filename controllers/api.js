"use strict";
import express from "express";
const router = express.Router();
import fetch from 'node-fetch';
const localIP = (await (await fetch('https://api.ipify.org?format=json')).json()).ip;

const keyMap = {
  "sa" : ["safetyRating", "requirements.safetyRating"],
  "tm" : ["trackMedals","requirements.trackMedals"]
}

export default ({server})=>{
  router.get('/', async(req, res)=>{
    const queryData = {};
    if(Object.keys(req.query).length > 0 && req.query.show_full == undefined){
      queryData.isFull = false;
    }

    if ("search" in req.query) {
      queryData.name =  { "$regex": req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "$options": "i" }
    }

    if ("favourites" in req.query) {
      const favourites = req.query.favourites.split(",").map(a=>a.split(":"));
      queryData.ip = favourites.map(a=>a[0]);
      queryData["port.tcp"] = favourites.map(a=>a[1]);
    }

    if(req.query.show_empty == undefined){
      queryData.connectedDrivers = {$ne: 0};
    }

    for(const [key, val] of Object.entries(req.query)){
      const split = key.split("_");
      if(key.startsWith("class_")){
        if(queryData.class == undefined){
          queryData.class = []
        }
        queryData.class.push(split[1]);
      } else if(key.startsWith("dlc_")){
        if(queryData["track.dlc"] == undefined){
          queryData["track.dlc"] = [];
        };
        queryData["track.dlc"].push(split[1]);

      } else if(key.startsWith("session_")){
        if(queryData.sessions == undefined){
          queryData.sessions = { 
            $elemMatch: {
              type: {
                $in: []
              },
              active: true
            }
          }
        }
        queryData.sessions.$elemMatch.type.$in.push(split[1]);
      } else if(["min", "max"].includes(split[0])){
        if(queryData[keyMap[split[1]][1]] == undefined){
          queryData[keyMap[split[1]][1]] = {};
        }
        if(split[0] == "min"){
          queryData[keyMap[split[1]][1]].$gte = Number(val);
        } else {
          queryData[keyMap[split[1]][1]].$lte = Number(val);
        }
      }
    } 

    const data = await server.find(queryData, null,
      {
        sort: {
          connectedDrivers: -1
        }
      }
    );
    res.json(data);
  });

  router.post('/enhanced_data/', async(req, res)=> {
    try{
      let ip = req.socket.remoteAddress;
      if(ip === "::1"){
        ip = localIP;
      }
      const id = `${ip}:${req.body.port}`;
      const data = {
        extras: {
          discord: req.body.discord,
          teamspeak: req.body.teamspeak,
          homepage: req.body.homepage,
          description: req.body.description,
          country: req.body.country,
          broadcast: req.body.broadcast,
          drivers: req.body.drivers
        }
      };
      await server.updateOne({
        id: {
          $eq: id
        }
      }, {
        $set: data
      });
      res.status(200).send("OK");
    } catch(err){
      res.status(400).json({error: err.msg});
    };
  });

  return router;
};