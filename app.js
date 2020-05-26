if(process.env.Node_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const methodOverride = require('method-override');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./models');
const app = express();
PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(session({
    secret: 'abcdefg',//process.env.SESSION_SECRET, 
    resave: true, 
    saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(methodOverride('_method'))


//Begin Passport 
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LocalStrategy = require('passport-local').Strategy;


// Begin local strategy 

passport.use(
	new LocalStrategy(
		{
			usernameField: 'email',
		},
		function (email, password, done) {
			db.user
				.findOne({ where: { email } })
				.then((user) => {
					if (user) {
						//If the user if found with that email, we run the password provided through bcrypt.
						bcrypt.compare(password, user.password).then((res) => {
							if (res) {
                                
								return done(null, user);
							} else {
								return done(null, false, { message: 'Incorrect password.' });
							}
						});
					}
					if (!user) {
						return done(null, false, { message: 'Incorrect details.' });
					}
				})
				.catch((err) => done(err));
		}
	)
);


// Begin Google Strategy 


passport.use(new GoogleStrategy({
 clientID: process.env.GOOGLE_CLIENT_ID,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // callbackURL: 'http://localhost:3000/auth/google/callback',
    callbackURL: "/auth/google/callback",
    proxy: true 
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
    let localUser = [user]
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
    let { firstname, email, password } = req.body;
    
    bcrypt.hash(password, 10)
    .then(function (hash) {
        db.user.create({firstname:firstname, email:email, password: hash})
        .then( res.redirect('/login'))
    })  
        });
       

// Route for Login (Local Strategy)

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/bills',
    failureRedirect: '/register',
    failureFlash: "Login failed"
})); 

//***********Google log-in route***********
app.get('/auth/google', checkNotAuthenticated,passport.authenticate('google', {
    scope: ['profile', 'email']
    }
    
));

//Google callback URL
app.get('/auth/google/callback', checkNotAuthenticated, 
passport.authenticate('google', {failureRedirect: '/login'}),
    (req, res) => {
        console.log(req.body)
        return res.redirect("/submission")
    }
)
//***********end Google routes***********



// //route for logout
// app.get('logout', function(req, res, next) {
//     req.session.destroy(function() {
//         console.log("You are now logged out.")
//     })
//     res.redirect('/login');
// });


//route for bills
/* app.post('/bills', function(req, res, next) {
    res.render('bills');
}); */
app.get('/submission', checkAuthenticated, function(req, res) {
    res.render('submission', {
        name: req.user.firstname,
        budgetAmount: req.user.budget
                 
    })
})


app.get('/bills', checkAuthenticated,function(req, res, next) {
    console.log(req.user)
    db.expenses.findOne({
        where: {
            userId: req.user.id
        }
    }).then(function(results){
        console.log(results)
        if(results == null){
            res.redirect('/submission')
        }else{
            //let { gas, groceries, dining, other } = 0;
            //db.expenses.findByPk(req.user.id)
            db.expenses.findOne({
                where: {
                    userId: req.user.id
                }
            }).then((results) => {
                    console.log(req.user.id)
                    console.log('This is bills ' + results)
                    res.render('bills.ejs', {
                        name: req.user.firstname,
                        budgetAmount: req.user.budget,
                        gas: results.gas,
                        groceries: results.groceries,
                        dining: results.dining,
                        water: results.water,
                        other: results.other
                    })
                })
        }

    })
   // res.render('bills', {
     //  name: req.user.firstname,
       // budgetAmount: req.user.budget
   // });
    
});

//route for submit budget
app.post('/submitBudget', function (req, res) {
    console.log(req.body.budget)
    let setBudget = parseInt(req.body.budget);
    db.user.update(
        {budget: setBudget },
        {where: {id: req.user.id}})
        .then(() => res.redirect("/submission"))
    })


//route for expenses
/* app.get('/expenses', function(req, res, next) {
    res.render('expenses');
}); */

//route for displaying data
app.get('/user/:id', function(req, res, next) {
    res.send('user' + req.params.id);
});



// Route for registering users?



app.listen(PORT, function(){
    console.log(`'This server is listening on ${PORT}..'`)
});

// Route to view expenses

app.get('/index', checkAuthenticated, function(req, res, next) {
    res.render('index.ejs')
});

// Route to display existing expenses

app.get('/expenses', function(req, res, next) {
    let { gas, groceries, dining, water, other } = 0;
   
    db.expenses.findByPk(req.user.id)
        .then((results) => {
            console.log(results)
            res.render('bills.ejs', {
                gas: results.gas,
                water: results.water,
                groceries: results.groceries,
                dining: results.dining,
                other: results.other
            })
        })
})

// route to view monthly bills 

// app.get('/monthlyBills', function(req, res, next) {
//     let { water, rent_mort, electricity, gas } = 0;
   
//     db.bills.findByPk(req.user.id)
//         .then((results) => {
//             console.log(results)
//             res.render('bills.ejs', {
//                 water: results.water,
//                 gas: results.gas,
//                 electricity: results.electricity,
//                 rent_mort: results.rent_mort
//             })
//         })
// })

// Route to view bills


/* app.get('/bills', function(req, res, next) {
    res.render('bills-initial')
}); */

// Routes to submit data
app.post('/submitExpense', function(req, res, next) {
    console.log(req.body)
    console.log(req.user.id)
    let updateColumn = req.body.expenses;
    let newAmount = parseInt(req.body.amount);
        if (updateColumn == 'dining') {
            db.expenses.findOrCreate({where: {userId:req.user.id}})
            .then(user => {
                db.expenses.update(
                    { dining: newAmount },
                    { where: { userId: req.user.id }}
                ).then(() => { res.redirect("/bills") })})
        } else if (updateColumn == 'gas') {
            db.expenses.findOrCreate({where: {userId:req.user.id}})
            .then(user => {
                db.expenses.update(
                    { gas: newAmount },
                    { where: { userId: req.user.id }}
                ).then(() => { res.redirect("/bills") })})
        } else if (updateColumn == 'groceries') {
            db.expenses.findOrCreate({where: {userId:req.user.id}})
            .then(user => {
                db.expenses.update(
                    { groceries: newAmount },
                    { where: { userId: req.user.id }}
                ).then(() => { res.redirect("/bills") })})
        } else if (updateColumn == 'other') {
            db.expenses.findOrCreate({where: {userId:req.user.id}})
            .then(user => {
                db.expenses.update(
                    { other: newAmount },
                    { where: { userId: req.user.id }}
                ).then(() => { res.redirect("/bills") })})
            } else if (updateColumn == 'water') {
                db.expenses.findOrCreate({where: {userId:req.user.id}})
                .then(user => {
                    db.expenses.update(
                        { water: newAmount },
                        { where: { userId: req.user.id }},

                    ).then(() => { res.redirect("/bills") })})
        }})
        

app.post('/submitBill', function(req, res, next) {
    let updateColumn = req.body.bills;
    let newAmount = parseInt(req.body.amount);
    if (updateColumn == 'water') {
        db.bills.findOrCreate({ where: { userId: req.user.id}})
        .then(user => {
            db.bills.update(
                { water: newAmount },
                { where: { userId: req.user.id }}
            ).then(() => { res.redirect("/bills") })})
    } else if (updateColumn == 'rent_mort') {
        db.bills.findOrCreate({
            where: { userId: req.user.id}
        })
        .then(user => {
            db.bills.update(
                { rent_mort: newAmount },
                { where: { userId: req.user.id }}
            ).then(() => { res.redirect("/bills") })
        })
    } else if (updateColumn == 'electricity') {
        db.bills.findOrCreate({
            where: { userId: req.user.id}
        })
        .then(user => {
            db.bills.update(
                { electricity: newAmount },
                { where: { userId: req.user.id }}
            ).then(() => { res.redirect("/bills") })
        })
    } else if (updateColumn == 'gas') {
        db.bills.findOrCreate({
            where: { userId: req.user.id}
        })
        .then(user => {
            db.bills.update(
                { gas: newAmount },
                { where: { userId: req.user.id }}
            ).then(() => { res.redirect("/bills") })
        })
    } else if (updateColumn == 'other') {
        db.bills.findOrCreate({
            where: { userId: req.user.id}
        })
        .then(user => {
            db.bills.update(
                { other: newAmount },
                { where: { userId: req.user.id }}
            ).then(() => { res.redirect("/bills") })
        })
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
       return res.redirect('/submission')
    }
    next()
}
