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

if(process.env.GOOGLE_VERIFICATION !== undefined){
  router.get(`/${process.env.GOOGLE_VERIFICATION}.html`, (req,res)=>{
    res.send(`google-site-verification: ${process.env.GOOGLE_VERIFICATION}.html`);
  });
};

export default router;