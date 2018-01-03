import * as redis from 'redis'
import * as bluebird from 'bluebird'
import * as BFX from 'bitfinex-api-node'
import * as _ from 'lodash'
import { setInterval } from 'timers';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export class TradeCapture {

    redisOptions = null;
    bfxOptions = null;
    client = null;
    bws = null;
    keys = ['BUYS','SELLS','LAST']
    timeOffset: number;
    cleanupInterval: number;
    constructor(opts, private pair = 'BTCUSD') {
        this.bfxOptions = opts.bfx
        this.redisOptions = opts.redis

        this.timeOffset = opts.timeOffset || (24*60*60*1000) * 3 // default 3 days
        this.cleanupInterval = opts.cleanupInterval || (10 * 60 * 1000) // default 10 mins

        this.keys.forEach((k) => {
             this[k] = `${this.pair}_${k}`
        })
    }

    start() {
        this.client = redis.createClient(this.redisOptions)
        this.client.on("error", function (err) {
            console.log("Error " + err);
        });

        this.bws = new BFX(this.bfxOptions).ws()
        this.bws.on('open', () => {
            this.bws.subscribeTrades(this.pair)
            this.bws.onTradeEntry({ pair: this.pair }, this.onTradeEntry.bind(this))
            console.log("Bfx Connection Open");
        })
        this.bws.on('error', (err) => console.log(err))
        this.bws.open()

        process.on("exit", () => {
            this.client.quit();
        });

        //every 10 mins
        setInterval(()=> {
            const key: any = this
            
            var offset =  this.timeOffset;
            var max = new Date();
            max.setTime(max.getTime()-offset);

            let multi = this.client.multi();
            multi.zremrangebyscore(key.BUYS, 0, max.getTime())
            multi.zremrangebyscore(key.SELLS, 0, max.getTime())
            multi.exec()
        }, this.cleanupInterval)
    }

    clean() {
        this.client = redis.createClient(this.redisOptions)
        this.client.on("error", function (err) {
            console.log("Error " + err);
        });

        const delKeys = _.map(this.keys, k => this[k])
        this.client.del(delKeys)

        this.client.quit();
    }

    onTradeEntry(trade) {
        const key : any =  this
        if (Array.isArray(trade)) {
            trade.forEach(t => this.onTradeEntry(t));
        } else {
            let multi = this.client.multi();
            multi.set(key.LAST, trade.price)
            if (trade.amount < 0)
                multi.zadd(key.SELLS, trade.mts, JSON.stringify(trade))
            else if (trade.amount > 0)
                multi.zadd(key.BUYS, trade.mts, JSON.stringify(trade))
            multi.exec()
        }
    }
}