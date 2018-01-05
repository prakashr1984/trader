import * as redis from 'redis'
import * as bluebird from 'bluebird'
import * as BFX from 'bitfinex-api-node'
import * as _ from 'lodash'
import { setInterval } from 'timers';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export class OrderBook {

    redisOptions = null;
    bfxOptions = null;
    client = null;
    bws = null;
    keys = ['BIDS','ASKS','BESTBID','BESTASK']
    length: number;
    precision: string;
    cleanupInterval: number;

    constructor(opts, private pair = 'BTCUSD') {
        this.bfxOptions = opts.bfx
        this.redisOptions = opts.redis
        this.length = opts.length || 100;
        this.precision = opts.precision || 'P0';
        this.cleanupInterval = opts.cleanupInterval || (30 * 1000) // default 30 sec

        this.keys.forEach((k) => {
             this[k] = `${this.pair}_${k}`
        })
    }

    connect() {
        this.bws = new BFX(this.bfxOptions).ws()
        this.bws.on('open', () => {
            console.log("Connection Open");
            this.delete()
            this.listen()
        })
        this.bws.on('error', (err) => {
            console.log("Connection Error: Reconnecting...");
            setTimeout(() => this.connect(), 1000)
        })
        this.bws.on('close', (err) => {
            console.log("Connection Closed: Reconnecting...");
            setTimeout(() => this.connect(), 1000)
        })
        this.bws.open()
    }

    listen() {
        this.bws.subscribeOrderBook(this.pair,this.precision,this.length.toString())
        this.bws.onOrderBook({ pair: this.pair }, this.onOrderBook.bind(this))
    }

    onOrderBook(book) {
        const key : any =  this
        var price, count, amount;
        if (book.bids.length > 0) {
            for(let i = 0; i< book.bids.length; i++) {
                [price, count, amount] = book.bids[i]
                if (count == 0) {
                    this.client.zremrangebyscore(key.BIDS, price, price)
                } else {
                    this.client.zadd(key.BIDS, price, JSON.stringify({ price, count, amount }))
                }
            }
        }
        if (book.asks.length > 0) {
            
            for(let i = 0; i< book.asks.length; i++) {
                [price, count, amount] = book.asks[i]
                if (count == 0) {
                    this.client.zremrangebyscore(key.ASKS, price, price)
                } else {
                    this.client.zadd(key.ASKS, price, JSON.stringify({ price, count, amount: -amount }))
                }
            }
        }
    }

    start() {
        const key : any =  this
        this.client = redis.createClient(this.redisOptions)
        this.client.on("error", function (err) {
            console.log("Error " + err);
        });

        this.connect()

        process.on("exit", () => {
            this.client.quit();
        });

        setInterval(()=> {
            const key: any = this
            this.client.multi()
            .zremrangebyrank (key.BIDS, this.length.toString(), -1)
            .zremrangebyrank (key.ASKS, this.length.toString(), -1)
            .exec()
        }, this.cleanupInterval)
    }

    clean() {
        this.client = redis.createClient(this.redisOptions)
        this.client.on("error", function (err) {
            console.log("Error " + err);
        });

        this.delete()

        this.client.quit();
    }

    delete() {
        const delKeys = _.map(this.keys, k => this[k])
        this.client.del(delKeys)
    }
}