if(process.env.Node_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./models');
const { pool } = require('./dbConfig');
const app = express();

PORT = process.env.PORT || 3020;
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: true, 
    saveUninitialized: true }));

app.use(passport.initialize())
app.use(passport.session())

// Testing

app.get('/', (req,res) => {
    res.send('Hello World!')
})

var Users = [];

// Route for Registering Users (Local Strategy)

app.get('/register', (req, res) => {
    res.render('register.ejs')
})

app.post('/register', async (req, res) => {
    let { name, email, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
       pool.query(`INSERT INTO public.accounts (name, email, password) 
       VALUES ($1, $2, $3)
       RETURNING id, password`, [name, email, hashedPassword],  
       (err, results) => {
               if (err) {
                throw err;
               }
               req.flash('success_msg', "You are now registered. Please log in");
               res.redirect('/login');
           })
       
        });
       

// Route for Login (Local Strategy)
app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
})); 


//route for logins 
// (Do we need this? - Ab) 

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


//route for bills
app.post('/bills', function(req, res, next) {
    res.render('bills');
});

//route for expenses
app.post('/expenses', function(req, res, next) {
    res.render('expenses');
});

//route for displaying data
app.get('/user/:id', function(req, res, next) {
    res.send('user' + req.params.id);
});



// Route for registering users?



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

app.listen(PORT, function(){
    console.log(`'This server is listening on ${PORT}..'`)
})