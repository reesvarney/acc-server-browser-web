import "dotenv/config";
const port = process.env.PORT || 80; 
import express from "express";
import path from "path";
import mongoose from "mongoose";
import bodyParser from "body-parser";
console.log("connecting to db: " + process.env.DB_URL)
await mongoose.connect(process.env.DB_URL);

import serverSchema from "./models/server.js";
const models = {
  server: mongoose.model("Server", serverSchema)
};

import webpack from 'webpack';
const compiler = webpack({
  entry: "./client/src/main.js",
  output: {
    filename: './js/main.js',
    path: path.resolve('./client/')
  },
  devtool: 'source-map',
  experiments: {
    topLevelAwait: true
  },
});

compiler.watch({
  aggregateTimeout: 300,
  poll: undefined
}, (err, stats) => {
  if(stats.hasErrors()) console.log(stats.compilation.errors);
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("./client"));
app.get('/coffee',(req, res)=>{res.sendStatus(418)});

const controllerData = {
  models,
  kunosStatus: getStatus
}

import api from "./controllers/api.js";
app.use('/servers', api(controllerData));

import client from "./controllers/client.js";
app.use('/', client);

const server = app.listen(port, ()=>{
  console.log(`Listening on port: ${server.address().port}`)
});

let status = "online";

function getStatus(){
  return status
}

import childProcess from "child_process";
function getServers(){
  const child = childProcess.spawn("node", ["./getServers.js"], {env: process.env});
  child.stdout.on('data',function (data) {
    const matches = data.toString().match(/status=(online|offline)/);
    if(matches !== null) {
      status = matches[1]
    }
    console.log(data.toString());
  });
  child.on('error',function (data) {
    console.error(data.toString());
  });
}
(async()=>{
  getServers()

})()
