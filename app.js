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
PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(session({
    secret: 'abcdefg',//process.env.SESSION_SECRET, 
    resave: true, 
    saveUninitialized: true }));

//Begin Passport 
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
 },
 function(accessToken, refreshToken, profile, done) {
    console.log(profile.emails[0].value);
    console.log(profile.name.givenName);
    //return done(null, profile); 
     db.user.findOrCreate({  //This works as long as the user does not update their name on their Google account later on.. If their name changes, a new account is created...
         where: {email: profile.emails[0].value, firstname: profile.name.givenName, lastname: profile.name.familyName}})
         .then(user => {
             return done(null, user)
         })
         .catch(e => {
             return done(e)
         })
         /* , function (err, user) {return done(err,user);}  
        }); */
 } 
));

app.use(passport.initialize());
app.use(passport.session());



passport.serializeUser((user, done) => {
    //console.log(user);
    done(null, user[0].id);
});

passport.deserializeUser((user, done) => {
    console.log('The user is ' + user);
    db.user.findByPk(user)
    .then(function(user){
        done(null, user);
    })
    .catch(e => {
        return done(e)
    })
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
        console.log(req.body)
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
/* app.post('/bills', function(req, res, next) {
    res.render('bills');
}); */

app.get('/bills', function(req, res, next) {
    console.log(req.user)
    res.render('bills', {
        name: req.user.firstname
    });
    // console.log(req.user.emails[0].value);
    /* console.log(req.sessionID);
    console.log(req.session); */
     //console.log(req.user.firstname)
});

//route for expenses
app.get('/expenses', function(req, res, next) {
    res.render('expenses');
});

//route for displaying data
app.get('/user/:id', function(req, res, next) {
    res.send('user' + req.params.id);
});



// Route for registering users?



app.listen(PORT, function(){
    console.log(`'This server is listening on ${PORT}..'`)
});