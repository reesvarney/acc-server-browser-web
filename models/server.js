import mongoose from "mongoose";
const schema = new mongoose.Schema({
  ip: String,
  id: String,
  port: {
    tcp: Number,
    udp: Number
  },
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
  isFull: Boolean,
  extras: {
    provider: String,
    discord: String,
    teamspeak: String,
    homepage: String,
    description: String,
    country: String,
    broadcast: String,
    drivers: [
      {
        name: String,
        carNumber: Number,
        laps: Number,
        raceGap: Number,
        qualiTime: Number,
        car: String,
        team: String,
        steamID: String,
      }
    ],
  }
},{
  collation: {
    locale : "en",
    strength : 1
  }
});
export default schema;