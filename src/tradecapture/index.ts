import { TradeCapture } from './tradecapture'
import { config } from './config'

const command = process.argv[2] || 'run'
const pair = process.argv[3] || 'BTCUSD'


const t = new TradeCapture({
    bfx: {
        apiKey: config.API_KEY,
        apiSecret: config.API_SECRET,
        transform: true,
        ws: {
            autoReconnect: false,
        }
    },
    redis: config.redisOpts
}, pair)

if(command == 'run') {
    console.log(`Running TradeCapture: ${pair}`)
    t.start()
} else if(command == 'clean'){
    console.log(`Cleaning TradeCapture: ${pair}`)
    t.clean()
} else {
    console.log("Invalid command")
}