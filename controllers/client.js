"use strict";
import express from "express";
const router = express.Router();
import path from 'path';

router.get('/', (req,res)=>{
  res.sendFile("./dist/index.html", {root: path.resolve()});
});

export default router;