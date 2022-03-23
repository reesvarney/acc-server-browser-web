"use strict";
import express from "express";
const router = express.Router();
import path from 'path';

router.get('/', (req,res)=>{
  res.sendFile("./client/index.html", {root: path.resolve()});
});

router.get('/ga_id', (req,res)=>{
  res.send(process.env.GA_ID || "");
});

export default router;