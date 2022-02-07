import mongoose from "mongoose";
const schema = new mongoose.Schema({
  ip: String,
  misc: [String],
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
  maxDrivers: Number,
  connectedDrivers: Number,
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
  isFull: Boolean
},{
  collation: {
    locale : "en",
    strength : 1
  }
});
export default schema;