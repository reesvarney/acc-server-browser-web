"use strict";
import express from "express";
const router = express.Router();

export default ({server})=>{
  router.get('/', async(req, res)=>{
    const data = await server.find();
    res.json(data);
  })
  return router;
};