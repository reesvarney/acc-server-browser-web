"use strict";
import express from "express";
const router = express.Router();

const keyMap = {
  "sa" : ["safetyRating", "requirements.safetyRating"],
  "tm" : ["trackMedals","requirements.trackMedals"]
}

export default ({server})=>{
  router.get('/', async(req, res)=>{
    const queryData = {};
    if(req.query != {} && req.query.show_full == undefined){
      queryData.isFull = false;
    }

    if ("search" in req.query) {
      queryData.name =  { "$regex": req.query.search, "$options": "i" }
    }

    if ("favourites" in req.query) {
      const favourites = req.query.favourites.split(",").map(a=>a.split(":"));
      console.log(req.query.favourites)
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

  return router;
};