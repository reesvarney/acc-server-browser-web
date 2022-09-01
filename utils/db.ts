import mongoose from "mongoose";
let connected = false;
if(!process.env.DB_URL){
  if(process.env.MONGODB_URI){
    process.env.DB_URL = process.env.MONGODB_URI
  } else {
  console.log("Creating memory db");
  const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    process.env.DB_URL = mongod.getUri();
  }
}
console.log("Connecting to DB: " + process.env.DB_URL);
if(!connected){
  connected= true;
  await mongoose.connect(process.env.DB_URL, { dbName: "acc" });
}
import serverSchema from "./models/server";
if(!mongoose.models.Server) mongoose.model("Server", serverSchema);
export default mongoose.models;
export type ServerType = mongoose.InferSchemaType<typeof serverSchema> & {
  isFavourite : boolean
};