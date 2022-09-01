import mongoose from "mongoose";
const schema = new mongoose.Schema({
  ip: String,
  id: String,
  port: {
    tcp: Number,
    udp: Number
  },
  track: {
    name: String,
    id: String,
    dlc: String
  },
  name: String,
  class: String,
  hotjoin: Boolean,
  numOfSessions: Number,
  sessions: [
    {
      type: {type: String},
      time: Number,
      active: Boolean
    }
  ],
  drivers: {
    max: Number,
    connected: Number
  },
  conditions: {
    rain: Boolean,
    night: Boolean,
    variability: Number
  },
  requirements: {
    trackMedals: Number,
    safetyRating: Number
  },
  currentSession: Number,
  isFull: Boolean,
  country_code: { type: String, default: '' }
},{
  collation: {
    locale : "en",
    strength : 1
  }
});
export default schema;