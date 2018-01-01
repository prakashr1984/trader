import { RedisStore } from './datastore'
import {config} from './config'
const BFX = require('bitfinex-api-node')

export class Trade {

    bws: any;
    redis: RedisStore;
    constructor() {

    }


    connect() {
        this.bws = new BFX(config.API_KEY, config.API_SECRET, {
            version: 2,
            transform: true
        }).ws
        this.bws.on('open', this.onopen.bind(this))
        this.bws.on('ws', this.wallet.bind(this));
        this.bws.on('wu', this.wallet.bind(this));
        this.bws.on('orderbook', this.orderbook.bind(this));

        this.redis = new RedisStore(config.redisOpts)
        this.redis.connect()

        setInterval(()=>{
            this.redis.getBid().then((val: any) => console.log('BID: ' + val.price))
            this.redis.getAsk().then((val: any) => console.log('ASK: ' + val.price))
        }, 2000)
    }
    onopen() {
        // bws.subscribeTicker('BTCUSD')
        this.bws.subscribeOrderBook('BTCUSD','P0','1')
        //bws.subscribeTrades('BTCUSD')    
        this.bws.auth()
    }
    wallet(msg) {
        if(Array.isArray(msg)) {
            msg.forEach(w => {
                this.redis.updatewallet.apply(this.redis, w)
            });
        } else {
            this.redis.updatewallet.apply(this.redis, msg)
        }
    }

    orderbook(pair, book) {
        if (book.COUNT > 0) {
            if(book.AMOUNT > 0) {
                 this.redis.updateBid(book.AMOUNT, book.PRICE)
            } else {
                this.redis.updateAsk(-book.AMOUNT, book.PRICE)
            }
         } else if(book.COUNT == 0) {
             if (book.AMOUNT == 1) {
                this.redis.updateBid(0,0)
             } else if (book.AMOUNT == -1){
                this.redis.updateAsk(0,0)
             }
         }
    }

    disconnect() {

    }

    instantorder(type, size) {

    }

    limitorder(type, size, price) {

    }

    updateorder(id, size, price) {
        
    }
    cancelorder(id) {

    }
}