# ACC Community Server Browser Project
View Assetto Corsa Competizione servers without opening the game.

## How it works
Using captured websocket messages, the server "replays" them in order to get a list of servers from Kunos directly. The response from Kunos' server is in a (what seems to be) propriety format which I've been able to extract some of the data from however a large chunk of it is still unknown (see datanotes.txt for more information). The data is converted into JSON which is then stored in a database and served to the html client.

Currently the app updates its server data every 2 minutes to avoid potentially being rate-limited or blocked by the kunos servers. This should be frequent enough to provide roughly accurate data but you can change the value in `./getServers.js` if you need.
## Setup
### Obtaining request strings
To obtain the request strings it is a fairly involved process. I would not recommend sharing your individual request strings with other people as they may contain sensitive authentication data in relation to your Steam account. Also, the server's that appear will depend on what DLC is associated with the steam account you use to get the request strings so it is ideal to have the British GT and Intercontinental GT packs installed (this doesn't seem to apply to Imola so the 2020 GTWC pack shouldn't be necessary).
1. Install wireshark https://www.wireshark.org/ (Other programs may work but this is what I have used)
2. Open wireshark and select your main network adapter, the graphs for activity next to the options should give a clue as to which it is
3. Set the filter to only be requests to Kunos's ACC server ip and press Enter to apply it.
``` 
ip.dst == 144.76.81.131
```
4. Start ACC, go to the server list and then close the game.

5. The "auth string" is fairly easy to identify, it should be in a `WebSocket Text [FIN] [MASKED]` request after the HTTP `GET /kson809/` and the data will start with hex values separated by vertical lines. Select it and right click the "Data" section and copy it as printable text.

6. The "query string" can be found in a `WebSocket Binary [FIN] [MASKED]` request. It will contain some IP addresses in the ASCII preview below, however there are a few like this and the one that you need specifically will be different as when you select it, the whole preview will be highlighted as data. For this, right click on the data and copy it as a hex stream.

### Enhanced Data API
The enhanced data API is a (WIP) feature that allows server operators to provide extra information to the server browser on top of what is available through Kunos. 

When retrieving the servers from kunos, the browser server makes an additional POST request to `[ACC SERVER IP]:8953/enhanced_data` with the JSON data ``` {port: [BROWSER SERVER PORT]}``` to allow the server operator to make a request to the enhanced data API through POST to `[BROWSER SERVER IP]:[BROWSER SERVER PORT]/servers/enhanced_data` with JSON data in the request body.

Currently the following data is supported to be included in the request body (though it may not currently all be displayed):
```js
{
    provider: String, // Server provider e.g. ACCWEB
    discord: String, // Discord invite
    teamspeak: String, // Teamspeak connect URL
    homepage: String, // URL to the homepage of your server
    description: String, // Description of your server
    country: String, // 2 Letter ISO code + EU/ UN
    broadcast: String, // Link to twitch/ youtube stream
    liveries: [
      String // List of URLs to liveries that are used on the server
    ],
    leaderboard: [
      {
        name: String, // Driver name
        time: Number, // Driver time in miliseconds
        car: String, // Driver car
      }
    ],
    connectedDrivers: [
      {
        name: String, // Driver name
        carNumber: Number, // Driver car number
        laps: Number, // Driver laps completed
        raceGap: Number, // Gap to driver ahead (if in a race / not first) in miliseconds
        qualiTime: Number, // Currently Qualy time (if in qualifying) in miliseconds
        car: String, // Driver car
      }
    ],
  }
```
After receiving the data, the browser server should issue a HTTP `200` status response to indicate the enhanced data has been received (unless there has been any issues). You can then continue to send POST requests to the browser server when the enhanced data needs to be updated.

Note: Links MUST include the protocol e.g. `https://`.

### Deployment
1. Install MongoDB
There are multiple ways to do this, I recommend using the docker image with docker desktop. You could also use MongoDB Atlas for free cloud hosting.
2. Install nodejs/ npm
3. Install the dependencies
```
npm install
```
4. Set up the env. This can either be done by setting the environment variables directly or by creating a .env file in the server's root folder.
```
DB_URL="mongodb://<The URL of your mongoDB database, including any needed authentication. This will most likely be "localhost:27017" if you are running it locally>"
QUERYSTRING="<The query request string you got earlier>"
AUTHSTRING="<The auth request string you got earlier>"
```
5. Run the server
```
npm start
```

You can also easily use Heroku or CapRover to deploy it by using the repository as a source for your app. You will still need to set up a MongoDB server (in CapRover you can use the MongoDB one click app).

Note: In heroku the dyno will not automatically go into sleep as the requests for server data count as network activity.