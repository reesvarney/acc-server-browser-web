import "dotenv/config";
const port = process.env.PORT || 80; 
import express from "express";
import path from "path";
import mongoose from "mongoose";
if(process.env.LOCALDB == "true"){
  await mongoose.connect('mongodb://localhost:27017/');
} else {
  await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_ADDRESS}/${process.env.DB_NAME}?retryWrites=true&w=majority`);
}

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
}
(async()=>{
  getServers()
})();
const getServerLoop = setInterval(async()=>{
  getServers();
}, 2 * 60 * 1000);