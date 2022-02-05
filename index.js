import "dotenv/config";
const port = process.env.PORT || 80; 
import express from "express";
import path from "path";

import mongoose from "mongoose";
await mongoose.connect('mongodb://localhost:27017/');

import serverSchema from "./models/server.js";
const models = {
  server: mongoose.model("Server", serverSchema)
};

import webpack from 'webpack';
import {VueLoaderPlugin} from 'vue-loader';
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const jsCompiler = webpack({
  entry: "./src/main.js",
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          type: "css/mini-extract",
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
  output: {
    filename: './js/main.js',
    path: path.resolve('./dist/')
  },
  experiments: {
    topLevelAwait: true
  },
  module: {
    rules: [
      { test: /\.vue$/, use: 'vue-loader' },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
        exclude: /node_modules/ 
      },
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devtool: 'source-map',
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: "./css/app.css",
    }),
  ]
});
jsCompiler.watch({
  aggregateTimeout: 300,
  poll: undefined
}, (err, stats) => {
  console.log(stats.compilation.errors)
});

const app = express();
app.use(express.static("./dist"));
app.get('/coffee',(req, res)=>{res.sendStatus(418)});

import api from "./controllers/api.js";
app.use('/servers', api(models));

import client from "./controllers/client.js";
app.use('/', client);

const server = app.listen(port, ()=>{
  console.log(`Listening on port: ${server.address().port}`)
});

import getServers from "./controllers/getServers.js";
getServers(models);
// const getServerLoop = setInterval(()=>{
//   getServers(models)
// }, 2 * 60 * 1000);