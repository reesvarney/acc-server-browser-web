import "dotenv/config";
const port = process.env.PORT || 80; 
import express from "express";
import path from "path";
import mongoose from "mongoose";
if(process.env.LOCALDB == "true"){
  await mongoose.connect(process.env.DB_URL, {userMongoClient: true});
}

console.log("Connecting to DB")
import serverSchema from "./models/server.js";
const models = {
  server: mongoose.model("Server", serverSchema)
};

console.log("Creating Compiler")
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

console.log("Initialising controllers");

const app = express();
app.use(express.static("./client"));
app.get('/coffee',(req, res)=>{res.sendStatus(418)});

import api from "./controllers/api.js";
app.use('/servers', api(models));

import client from "./controllers/client.js";
app.use('/', client);

const server = app.listen(port, ()=>{
  console.log(`Listening on port: ${server.address().port}`)
});

import childProcess from "child_process";
function getServers(){
  const child = childProcess.spawn("node", ["./getServers.js"], {env: process.env});

  child.stdout.on('data',function (data) {
    console.log(data.toString());
  });
  child.on('error',function (data) {
    console.log(data.toString());
  });
}
(async()=>{
  getServers()
})();