# Full-Stack-Financial-Tracker

Budget Tracker is a web app designed to help the user track and manage their expenses and bills by displaying their weekly and monthly spending habits.

## Goal
To build a web app utilizing backend development skills.

## Built With
* [Express](https://github.com/expressjs/express)
* [PassportJS](https://github.com/jaredhanson/passport)
* [PostgreSQL](https://www.postgresql.org/)
* [Sequelize](https://github.com/sequelize/sequelize)
* [EJS](https://github.com/mde/ejs)
* [dotenv](https://github.com/motdotla/dotenv)
* [Chartist.js](https://gionkunz.github.io/chartist-js/)

## How it Works

Users can create an account and login to their dashboard. They will be able to enter their weekly expenses and monthly bills. <br>
The app will create a pie graph breakdown of their spending habits and they will get a visual display of their budget. 

## Problems During Development

Conflicts can occur often when code reviewing pull requests. It's important for all contributers to be current with master so when local changes are pushed into the repo, manual corrections can be kept to a minimium. 

* After merging Passport Google code, we were receiving a "user" is not defined error.  We were unsure as to how to access the user's info once they are logged in.

* * Solution:
We updated our findOrCreate method in our Google Strategy to return a promise rather than using a callback function.  We then used the serializeUser and deserializeUser methods to get the logged-in user's id from the database, allowing it to be accessed on any route, removing the need to query the database for the user's info each time.


## Deployment
* [Heroku](https://www.heroku.com/)


## Authors
 * [React2github](https://github.com/React2github)
 * [c-champagne](https://github.com/c-champagne)
 * [turnermillsaps](https://github.com/turnermillsaps)
 * [CherisC](https://github.com/CherisC)
 * [deannalenore](https://github.com/deannalenore)
 * [ChaseOwens](https://github.com/ChaseOwens)

