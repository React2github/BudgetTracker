if(process.env.Node_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./models');
const { pool } = require('./dbConfig');
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');


//Begin Passport 
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3005/auth/google/callback'
 },
 function(accessToken, refreshToken, profile, done) {
    console.log(profile.emails[0].value);
    //return done(null, profile); 
    
    var values = {email: profile.emails[0].value};
   /*  db.user.findOrCreate({where: {email: profile.emails[0].value}}, values)
        .then(function() {
            return done(err, user);
        }); */
      db.user.findOrCreate({email: profile.emails[0].value}, function (err, user) {
         return done(err, user); 
     });
 } 
));

app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: true, 
    saveUninitialized: true }));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
//END Passport Code

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(flash())


// Homepage

app.get('/', (req,res) => {
    res.redirect('/login');
})

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

//***********Google log-in route***********
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
    }
));

//***********Google callback URL***********
app.get('/auth/google/callback', 
passport.authenticate('google', {failureRedirect: '/login'}),
    (req, res) => {
        return res.redirect("/bills")
    }
)




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

app.get('/bills', function(req, res, next) {
    res.render('bills', {
        name: req.user.displayName
    });
    // console.log(req.user.emails[0].value);
    /* console.log(req.sessionID);
    console.log(req.session); */
});

//route for expenses
app.post('/expenses', function(req, res, next) {
    res.render('expenses');
});

//route for displaying data

// Route for registering users?



app.listen(PORT, function(){
    console.log(`'This server is listening on ${PORT}..'`)
});