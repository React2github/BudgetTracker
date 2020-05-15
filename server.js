const express = require('express');
const app = express();

app.get('/ping', (req, res) => {
    res.send("pong")
})

app.listen(process.env.PORT, function() {
    console.log(`"listening on Port ${process.env.PORT}"`)
})