"use strict";
import express from "express";
const router = express.Router();
import fetch from 'node-fetch';
let localIP = "";
try{
  localIP = (await (await fetch('https://api.ipify.org?format=json')).json()).ip
} catch(err){
  console.error("Could not get server IP")
}

const keyMap = {
  "sa" : ["safetyRating", "requirements.safetyRating"],
  "tm" : ["trackMedals","requirements.trackMedals"],
  "cd" : ["connectedDrivers", "connectedDrivers"]
}

export default ({models: {server}, kunosStatus })=>{
  async function queryDb(req, res){
    const queryData = {};
    let favourites = [];
    if(Object.keys(req.query).length > 0 && req.query.show_full == undefined){
      queryData.isFull = false;
    }
  
    if ("search" in req.query) {
      queryData.name =  { "$regex": req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "$options": "i" }
    }
  
    if ("favourites" in req.query) { 
      favourites = req.query.favourites.split(",");
  
    }
  
    if ("favourites_only" in req.query) {
      queryData.id = {$in: favourites};
    }
  
    if(req.query.show_empty == undefined){
      queryData.connectedDrivers = {$ne: 0};
    }
  
    for(const [key, val] of Object.entries(req.query)){
      const split = key.split("_");
      if(key.startsWith("class_")){
        if(queryData.class == undefined){
          queryData.class = {$in: []}
        }
        queryData.class.$in.push(split[1]);
      } else if(key.startsWith("dlc_")){
        if(queryData["track.dlc"] == undefined){
          queryData["track.dlc"] = {$in: []};
        };
        queryData["track.dlc"].$in.push(split[1]);
  
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
    // const data = await server.find(queryData, null, {sort:
    //   {connectedDrivers: -1}
    // });
    const data = await server.aggregate([
      {$match: queryData},
      {$addFields: {
        isFavourite: {
          $in: [
            "$id", 
            favourites
          ]
        }
      }},
      {
        $sort: [
          ["isFavourite", -1],
          ["connectedDrivers", -1],
        ]
      }
    ],
      // Allow it to run better on low-RAM servers
      { allowDiskUse : true }
    );
    res.json(data);
  }

  router.get('/', async(req, res)=>{
    try {
      await queryDb(req, res);
    } catch(err) {
      res.query = {};
      await queryDb(req, res);
    }
  });

  router.get('/status', async(req, res)=> {
    res.send(kunosStatus());
  });

  return router;
};