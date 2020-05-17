const express = require('express');
const session = require('express-session');

const app = express();
app.use(session({secret}));

app.set('view engine', 'ejs');
app.set('views', 'views');

const db = require('./models');

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
    console.log(profile.name.givenName);
    //return done(null, profile); 
     db.user.findOrCreate({  //This works as long as the user does not update their name on their Google account later on.. If their name changes, a new account is created...
         where: {email: profile.emails[0].value, firstname: profile.name.givenName, lastname: profile.name.familyName}, function (err, user) {
                return done(err,user);}  
        });
        return done(null, profile);
 } 
));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
//END Passport Code



//tasting as I go
app.get('/ping', (req, res, next) => {
    res.send('PONG!');
});
var Users = [];

//route for logins
app.get('/dashboard/login', function(req, res, next) {
    res.render('login');
    /* db.user.create({firstname: 'Tess', lastname: 'McTest', email: 'test@mail.com', password: 'mypw', budget: 200})
        .then(function(user) {
            console.log(user);
        }) */
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
//route for user



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

//route for display data



app.listen(3005, function(){
    console.log('This server is listening..')
})