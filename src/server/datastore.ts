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
        this.client.flushdb()
        this.client.on("error", function (err) {
            console.log("Error " + err);
        });
    }

    updatewallet(type, cur, bal, interest, available_bal) {
        this.client.hset(type, cur, bal)
    }

    updateBid(size, price) {
        this.client.set('BID', JSON.stringify({ size: size, price: price }))
    }
    updateAsk(size, price) {
        this.client.set('ASK', JSON.stringify({ size: size, price: price }))
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