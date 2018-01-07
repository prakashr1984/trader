import * as express from "express"
import * as path from "path"
import { Router } from "express"
import * as redis from 'redis'
import * as bluebird from 'bluebird'
import {Api} from './api'
import { config } from './config'
import * as cors from "cors"

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const port = process.env.PORT || 8000



let redisClient = redis.createClient(config.redisOpts)
redisClient.on("error", (err) => { 
    //client = redis.createClient(config.redisOpts) 
    console.log("Redis connection error");
});

setInterval(()=>{
    redisClient.pingAsync().then((pong)=>{})
}, 5000)


const app = express()
const api = new Api(redisClient)

app.use(cors())
app.use('/api', api.api);
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"))    
});


app.listen(port, () => console.log(`Server listening on port ${port}`))