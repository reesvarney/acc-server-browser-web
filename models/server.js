import mongoose from "mongoose";
export default new mongoose.Schema({
  ip: String,
  misc: [String],
  track: String,
  name: String,
  class: String,
  hotjoin: Boolean,
  numOfSessions: Number,
  sessions: [
    {
      type: {type: String},
      time: Number
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
  currentSession: Number
});