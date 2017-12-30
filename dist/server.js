"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
var port = process.env.PORT || 8000;
app.listen(port, function () { return console.log("Server running on " + port); });
app.get("/", function (req, res) {
    res.send("Awesome!");
});
//# sourceMappingURL=server.js.map