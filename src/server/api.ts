
import * as express from "express"
import { Router, Request, Response } from 'express';


export class Api {

    api: Router
    constructor(private redis) {
        this.api = Router()
        this.api.get('/price/:pair', this.price.bind(this))
        this.api.get('/volume/:pair/:mins', this.volume.bind(this))
    }
    volume(req: Request, res: Response) {
        let {pair,mins} = req.params

        var offset =  mins * 60 * 1000;
        let time = new Date();
        let start = time.getTime()
        time.setTime(time.getTime()-offset);
        let end  = time.getTime()
        
        this.redis.eval(this.getScript_Volume(), 1, pair.toUpperCase(), start, end, (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send(err);
                return
            }
            res.json({
                buy: parseFloat(result[0]),
                sell: parseFloat(result[1])
            })
        });
    }
    
    price(req: Request, res: Response) {
        let {pair} = req.params

        this.redis.multi()
        .zrevrange(this.getKey(pair, "BIDS"), 0,0)
        .zrange(this.getKey(pair, "ASKS"), 0,0)
        .get(this.getKey(pair, "LAST"))
        .exec((err, replies) => {
            if (err) {
                console.log(err)
                res.status(400).send(err);
                return
            }
            const bid= JSON.parse(replies[0][0] || '{}')
            const ask= JSON.parse(replies[1][0] || '{}')
            const last= parseFloat(replies[2] || 0)
            res.json({
                pair: pair,
                bid,
                ask,
                last,
                spread: ask.price - bid.price,
                mid: (ask.price + bid.price)/2
            })
        })
    }

    private getKey(pair, key) {
        return `${pair.toUpperCase()}_${key}`
    }

    getScript_Volume() {
        return `
            local buys = redis.call('zrevrangebyscore', KEYS[1]..'_BUYS', ARGV[1], ARGV[2])
            local sells = redis.call('zrevrangebyscore', KEYS[1]..'_SELLS', ARGV[1], ARGV[2])
            
            local b=0
            for i, trade in ipairs( buys ) do
                b = b + cjson.decode(trade)['amount']
            end
            local s=0
            for i, trade in ipairs( sells ) do
                s = s + -(cjson.decode(trade)['amount'])
            end
            local ret = {}
            ret[1] = tostring(b)
            ret[2] = tostring(s)
            return ret
        `
    }
}