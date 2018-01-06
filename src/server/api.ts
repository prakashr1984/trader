
import * as express from "express"
import { Router, Request, Response } from 'express';


export class Api {

    api: Router
    
    constructor(private redis) {
        this.api = Router()
        this.api.get('/price/:pair', this.price.bind(this))

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
                return
            }
            const bid= JSON.parse(replies[0])
            const ask= JSON.parse(replies[1])
            const last= parseFloat(replies[2])
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
}