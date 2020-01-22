var express = require("express");
var logger = require("morgan");
var mongoose = require('mongoose')
var User = require('./models/user.js');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
// var bodyParser = require('body-parser');
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));

// var MONGODB_URI =  'mongodb://localhost:27017/mon_auth';
// mongoose.connect(MONGODB_URI, {},  function(error) {
//     console.log("$$$$$$$$$$$$$$$$$$$",error)
//   });
var connStr = 'mongodb://localhost:27017/mon_auth';
mongoose.connect(connStr, { useNewUrlParser: true }, function (err) {
  if (err) throw err;
  console.log('Successfully connected to MongoDB');
});
// var db = mongoose.connection;
// console.log(db);
//handle mongo error
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//   // we're connected!
// });

//use sessions for tracking logins
// app.use(session({
//   secret: 'work hard',
//   resave: true,
//   saveUninitialized: false,
//   store: new MongoStore({
//     mongooseConnection: db
//   })
// }));
// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));
app.use(express.static(__dirname + "/public/profile.html"));

// ----------------- ROUTES --------------------

// Signup Route to post our form submission to mongoDB via mongoose
app.post("/signup", function (req, res, next) {
  console.log(req.body)
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }
  // Create a new user using req.body
  User.create(req.body)
  // empty function param when doing redirecct
    .then(function (dbUser) {
      // If saved successfully, send the the new User document to the client
      res.json(dbUser);
      // Redirect to html page
      // res.redirect("/profile");
    })
    .catch(function (err) {
      // If an error occurs, send the error to the client
      res.json(err);
    });
});

// Login Route to post our form submission to mongoDB via mongoose
app.post("/login", function (req, res, next) {
  // attempt to authenticate user
  User.authenticate(req.body.logusername, req.body.logpassword, function (error, user, reason) {
    console.log('server.js', req.body.logusername);
    console.log('server.js', req.body.logpassword);
    if (error || !user) {
      var reasons = User.failedLogin;
        switch (reason) {
            case reasons.NOT_FOUND:
              console.log("not found");
              res.sendStatus(404);
              break;
            case reasons.PASSWORD_INCORRECT:
              console.log("incorrect password");
              res.sendStatus(400);
                // note: these cases are usually treated the same - don't tell
                // the user *why* the login failed, only that it did
                break;
            case reasons.MAX_ATTEMPTS:
              console.log("too many attempts");
              res.sendStatus(429);
                // send email or otherwise notify user that account is
                // temporarily locked
                break;
        }
      // return next(error);
    } else {
      console.log('login success');
      return res.sendStatus(200);
    }
  });
}); 

// GET route after registering
// app.get('/profile', function (req, res, next) {
//   User.findById(req.session.userId)
//     .exec(function (error, user) {
//       if (error) {
//         return next(error);
//       } else {
//         if (user === null) {
//           var err = new Error('Not authorized! Go back!');
//           err.status = 400;
//           return next(err);
//         } else {
//           return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
//         }
//       }
//     });
// });


// // GET for logout logout
// app.get('/logout', function (req, res, next) {
//   if (req.session) {
//     // delete session object
//     req.session.destroy(function (err) {
//       if (err) {
//         return next(err);
//       } else {
//         return res.redirect('/');
//       }
//     });
//   }
// });

var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});