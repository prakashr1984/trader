import * as express from "express"

const app = express()

const port = process.env.PORT || 8000

app.listen(port, () => console.log("Server running on " + port))

app.get("/", (req, res) => {
    res.send("Awesome!")
})