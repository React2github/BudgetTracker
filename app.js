const express = require('express');
const session = require('express-session');
PORT = process.env.PORT || 3020;


const app = express();
app.use(session({
    secret: 'keyboard cat', 
    resave: true, 
    saveUninitialized: true }));



//tasting as I go
app.get('/', (req,res) => {
    res.send('Hello World!')
})

app.get('/ping', (req, res, next) => {
    res.send('PONG!');
});
var Users = [];

//route for logins
app.get('/dashboard/login', function(req, res, next) {
    res.render('login');
});
app.post('dashboard/login', function(req, res){
    if(!req.body.id || !req.body.password){
       res.status("400");
       res.send("Invalid details!");
    } else {
       Users.filter(function(user){
          if(user.id === req.body.id){
             res.render('login', {
                message: "User Already Exists! Login or choose another user id"});
          }
       });
       var newUser = {id: req.body.id, password: req.body.password};
       Users.push(newUser);
       req.session.user = newUser;
       res.redirect('/protected_page');
    }
 });
//route for logout
app.get('logout', function(req, res, next) {
    req.session.destroy(function() {
        console.log("You are now logged out.")
    })
    res.redirect('/login');
});
//route for user



//route for bills
app.post('/bills', function(req, res, next) {
    res.render('bills');
});

//route for expenses
app.post('/expenses', function(req, res, next) {
    res.render('expenses');
});

//route for display data




app.listen(PORT, function(){
    console.log(`'This server is listening on ${PORT}..'`)
})