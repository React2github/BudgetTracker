const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const db = require('./models');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hello World!")
})

app.get('/ping', (req, res) => {
    res.send("pong")
})

app.post('/api/createuser', (req, res) => {
    // Take in request params and create new user, return response
    console.log(req.body);
    const user = req.body;
    const password = req.body.password;
    bcrypt.hash(password, 10)
        .then((hash) => {
            user.password = hash;
            db.user.create(user)
                .then((results) => {
                    res.json(results);
                })
                .catch((err) => {
                    console.error(err);
                })
        })
})

app.listen(process.env.PORT, function() {
    console.log(`"listening on Port ${process.env.PORT}"`)
})