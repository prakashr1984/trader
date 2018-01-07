import { expect } from 'chai';
import 'mocha';
import { Api } from './api'
import { config } from './config'
import * as redis from 'redis'

describe('App', function() {
    it('should return volume', () => {
        const redisClient: any = redis.createClient({...config.redisOpts, db: 1})
        let api = new Api(redisClient)
        
        redisClient.zadd('TEST_BUYS', 1, JSON.stringify({ mts: 1, price: 10, amount: 100 }))
        redisClient.zadd('TEST_BUYS', 2, JSON.stringify({ mts: 2, price: 20, amount: 200 }))
        redisClient.zadd('TEST_BUYS', 3, JSON.stringify({ mts: 3, price: 30, amount: 300 }))
        redisClient.zadd('TEST_BUYS', 4, JSON.stringify({ mts: 4, price: 40, amount: 400 }))
        redisClient.zadd('TEST_BUYS', 5, JSON.stringify({ mts: 5, price: 50, amount: 500 }))

        redisClient.zadd('TEST_SELLS', 1, JSON.stringify({ mts: 1, price: 15, amount: -150 }))
        redisClient.zadd('TEST_SELLS', 2, JSON.stringify({ mts: 2, price: 25, amount: -250 }))
        redisClient.zadd('TEST_SELLS', 3, JSON.stringify({ mts: 3, price: 35, amount: -350 }))
        redisClient.zadd('TEST_SELLS', 4, JSON.stringify({ mts: 4, price: 45, amount: -450 }))
        redisClient.zadd('TEST_SELLS', 5, JSON.stringify({ mts: 5, price: 55, amount: -550 }))

        redisClient.eval(api.getScript_Volume(), 1, 'TEST', 5, 3, (err, result) => {
               expect(parseFloat(result[0])).to.be.equal(1200)
               expect(parseFloat(result[1])).to.be.equal(1350)
        })

        redisClient.del(['TEST_BUYS', 'TEST_SELLS'])
        redisClient.quit();
    });

})