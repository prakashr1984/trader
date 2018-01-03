import { RedisStore } from './datastore'
import { config } from './config'
import * as bluebird from 'bluebird'
import * as BFX from 'bitfinex-api-node'



export class Trade {

    bws: any;
    redis: RedisStore;
    constructor() {

    }


    connect() {
        this.bws = new BFX({
            apiKey: config.API_KEY,
            apiSecret: config.API_SECRET,
            transform: true,
            ws: {
                autoReconnect: true,
            }
        }).ws()
        this.bws.on('open', this.onopen.bind(this))
        this.bws.on('error', (err) => console.log(err))
        this.bws.open()


        this.redis = new RedisStore(config.redisOpts)
        this.redis.connect()

        setInterval(()=> {
            this.redis.client.zrevrangeAsync('BIDS', 0, 0).then((b) => {
                if (b[0] != null) {
                    const obj = JSON.parse(b[0])
                    console.log(`BID: ${obj.price}`)
                }
            });
            this.redis.client.zrangeAsync('ASKS', 0, 0).then((b) => {
                if (b[0] != null) {
                    const obj = JSON.parse(b[0])
                    console.log(`ASK: ${obj.price}`)
                }
            });
            //this.redis.client.zcountAsync('ASKS', '-inf','+inf').then((b) => console.log(b))
        }, 1000)
    }



    onopen() {
        this.bws.subscribeOrderBook('BTCUSD','P0','25')
        this.bws.subscribeTrades('BTCUSD')
        
        this.bws.onWalletSnapshot({}, this.onWalletUpdate.bind(this))
        this.bws.onWalletUpdate({}, this.onWalletUpdate.bind(this))
        this.bws.onTradeEntry({}, this.onTradeEntry.bind(this))
        this.bws.onOrderBook({}, this.onOrderBook.bind(this))

        this.bws.auth()
    }
    onWalletUpdate(wallet) {
        if (Array.isArray(wallet)) {
            wallet.forEach(w => this.onWalletUpdate(w) );
        } else {
            this.redis.updatewallet(wallet)
        }
    }

    onTradeEntry(trade) {
        if (Array.isArray(trade)) {
            trade.forEach(t => this.onTradeEntry(t) );
        } else {
            this.redis.addtrade(trade.mts, trade.price, trade.amount)
        }
    }    
    onOrderBook(book) {
        var price, count, amount;
        if (book.bids.length > 0) {
            for(let i = 0; i< book.bids.length; i++) {
                [price, count, amount] = book.bids[i]
                this.redis.updateBid(price, count, amount)
            }
        }
        if (book.asks.length > 0) {
            
            for(let i = 0; i< book.asks.length; i++) {
                [price, count, amount] = book.asks[i]
                this.redis.updateAsk(price, count, amount)
            }
        }

        // if (book.COUNT > 0) {
        //     if (book.AMOUNT > 0) {
        //         this.redis.updateBid(book.AMOUNT, book.PRICE)
        //     } else {
        //         this.redis.updateAsk(-book.AMOUNT, book.PRICE)
        //     }
        // } else if (book.COUNT == 0) {
        //     if (book.AMOUNT == 1) {
        //         this.redis.updateBid(0, 0)
        //     } else if (book.AMOUNT == -1) {
        //         this.redis.updateAsk(0, 0)
        //     }
        // }
    }

    

    notification(msg) {

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