import * as redis from 'redis'
import * as bluebird from 'bluebird'
import { resolve } from 'path';
import { json } from 'express';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export class RedisStore {

    options = {}
    client = null;
    constructor(opts) {
        this.options = opts;
    }

    connect() {
        this.client = redis.createClient(this.options)
        this.clean()
        this.client.on("error", function (err) {
            console.log("Error " + err);
        });
    }

    clean() {
        this.client.del(['BIDS', 'ASKS', 'SELLS', 'BUYS', 'LAST'], (err, o) => {
            if (err) {
                console.log(err)
            }
        });

        setInterval(()=>{
            this.client.multi()
            .zremrangebyrank ('BIDS', 25, -1)
            .zremrangebyrank ('ASKS', 25, -1)
            .exec()
        }, 10000)
    }

    updatewallet(wallet) {
        this.client.hset(wallet.type, wallet.currency, wallet.balance)
    }

    addtrade(mts, price, size) {
        let multi = this.client.multi();
        multi.set('LAST', price)
        if (size < 0)
            multi.zadd('SELLS', mts, JSON.stringify({ size: -size, price: price }))
        else if (size > 0)
            multi.zadd('BUYS', mts, JSON.stringify({ size: size, price: price }))
        multi.exec()
    }

    updateBid(price, count, amount) {
        if (count == 0) {
            this.client.zremrangebyscore('BIDS', price, price)
        } else {
            this.client.zadd('BIDS', price, JSON.stringify({ price, count, amount }))
        }
        //this.client.set('BID', JSON.stringify({ size: size, price: price }))
    }
    updateAsk(price, count, amount) {
        if (count == 0) {
            this.client.zremrangebyscore('ASKS', price, price)
        } else {
            this.client.zadd('ASKS', price, JSON.stringify({ price, count, amount: -amount }))
        }
    }

    getBid() {
        return new Promise((resolve, reject) => {
            this.client.getAsync('BID').then(val => {
                if (val != null)
                    resolve(JSON.parse(val));
                else
                    reject()
            })
        })
    }
    getAsk() {
        return new Promise((resolve, reject) => {
            this.client.getAsync('ASK').then(val => {
                if (val != null)
                    resolve(JSON.parse(val));
                else
                    reject()
            })
        })
    }
}