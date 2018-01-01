import * as express from "express"
import { Trade } from './trade'

const trade = new Trade()
trade.connect()
const redis = trade.redis


const port = process.env.PORT || 8000

const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log('Server listening on port 3000!'))