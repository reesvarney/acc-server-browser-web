# ACC Community Server Browser Project
View Assetto Corsa Competizione servers without opening the game.

## How it works
Using captured websocket messages, the server "replays" them in order to get a list of servers from Kunos directly. The response from Kunos' server is in a (what seems to be) propriety format which I've been able to extract some of the data from however a large chunk of it is still unknown (see datanotes.txt for more information). The data is converted into JSON which is then stored in a database and served to the html client.

Currently the app updates its server data every 2 minutes to avoid potentially being rate-limited or blocked by the kunos servers. This should be frequent enough to provide roughly accurate data but you can change the value in `./getServers.js` if you need.
## Setup
### Obtaining request strings
To obtain the request strings it is a fairly involved process. I would not recommend sharing your individual request strings with other people as they may contain sensitive authentication data in relation to your Steam account. Also, the server's that appear will depend on what DLC is associated with the steam account you use to get the request strings so it is ideal to have the British GT and Intercontinental GT packs installed (though this doesn't seem to happen with the other DLCs).
1. Install wireshark https://www.wireshark.org/ (Other programs may work but this is what I have used)
2. Open wireshark and select your main network adapter, the graphs for activity next to the options should give a clue as to which it is
3. Set the filter to only be requests to Kunos's ACC server ip and press Enter to apply it.
``` 
ip.dst == 144.76.81.131
```
4. Start ACC, go to the server list and then close the game.

5. The "auth string" is fairly easy to identify, it should be in a `WebSocket Text [FIN] [MASKED]` request after the HTTP `GET /kson809/` and the data will start with hex values separated by vertical lines. Select it and right click the "Data" section and copy it as printable text.

6. The "query string" can be found in a `WebSocket Binary [FIN] [MASKED]` request. It will contain some IP addresses in the ASCII preview below, however there are a few like this and the one that you need specifically will be different as when you select it, the whole preview will be highlighted as data. For this, right click on the data and copy it as a hex stream.

### Run the development server
1. Install MongoDB
There are multiple ways to do this, I recommend using the docker image with docker desktop. You could also use MongoDB Atlas for free cloud hosting.
2. Install nodejs/ npm
3. Install the dependencies
```
npm install --dev
```
4. Set up the env. This can either be done by setting the environment variables directly or by creating a .env file in the server's root folder.
```
DB_URL="mongodb://<The URL of your mongoDB database, including any needed authentication. This will most likely be "localhost:27017" if you are running it locally>"
QUERYSTRING="<The query request string you got earlier>"
AUTHSTRING="<The auth request string you got earlier>"
```
5. Run the server
```
npm run dev
```

### Deployment
As this is  a Next.js app, one of the easiest ways to deploy is by using [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) although it should be compatible with most serverless providers. You can then just provide it the same environment variables used for development and it should work (although the Mongo Atlas integration is natively supported on Vercel).