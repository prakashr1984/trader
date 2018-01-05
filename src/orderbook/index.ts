import { OrderBook } from './orderbook'
import { config } from './config'

const command = process.argv[2] || 'run'
const pair = process.argv[3] || 'BTCUSD'
const len = process.argv[4] || 100
const prec = process.argv[5] || 'P0'


const t = new OrderBook({
    bfx: {
        apiKey: config.API_KEY,
        apiSecret: config.API_SECRET,
        transform: true
    },
    redis: config.redisOpts,
    length: len,
    precision: prec
}, pair)

if(command == 'run') {
    console.log(`Running Orderbook Capture: ${pair}`)
    console.log(`Arguments - Precision: ${prec}, Length: ${len}`)
    t.start()
} else if(command == 'clean'){
    console.log(`Cleaning Orderbook: ${pair}`)
    t.clean()
} else {
    console.log("Invalid command")
}