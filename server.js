const express = require('express');
const app = express();

app.get('/ping', (req, res) => {
    res.send("pong")
})

app.listen(3000, function() {
    console.log("listening on Port 3000")
})