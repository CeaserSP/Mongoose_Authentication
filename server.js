var express = require("express");
var logger = require("morgan");
var mongoose = require('mongoose')
var User = require('./models/user.js');
// var bodyParser = require('body-parser');
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));
// var MONGODB_URI =  'mongodb://localhost:27017/mon_auth';
// mongoose.connect(MONGODB_URI, {},  function(error) {
//     console.log("$$$$$$$$$$$$$$$$$$$",error)
//   });
var connStr = 'mongodb://localhost:27017/mon_auth';
mongoose.connect(connStr, { useNewUrlParser: true }, function (err) {
  if (err) throw err;
  console.log('Successfully connected to MongoDB');
});

// Route to post our form submission to mongoDB via mongoose
app.post("/signup", function (req, res) {
  // Create a new user using req.body
  User.create(req.body)
    .then(function (dbUser) {
      // If saved successfully, send the the new User document to the client
      res.json(dbUser);
    })
    .catch(function (err) {
      // If an error occurs, send the error to the client
      res.json(err);
    });
});

// Route to post our form submission to mongoDB via mongoose
app.post("/login", function (req, res, next) {
  // attempt to authenticate user
  User.authenticate(req.body.logusername, req.body.logpassword, function (error, user, reason) {
    console.log('server.js', req.body.logusername);
    console.log('server.js', req.body.logpassword);
    if (error || !user) {
      var err = new Error('Wrong username or password.');
      err.status = 401;
      return next(err);
    } else {
      // req.session.userId = user._id;
      return res.sendStatus(200);
    }
  });
}) 

    // otherwise we can determine why we failed
//     var reasons = User.failedLogin;
// switch (reason) {
//   case reasons.NOT_FOUND:
//   case reasons.PASSWORD_INCORRECT:
//     // note: these cases are usually treated the same - don't tell
//     // the user *why* the login failed, only that it did
//     break;
//   case reasons.MAX_ATTEMPTS:
//     // send email or otherwise notify user that account is
//     // temporarily locked
//     break;
// }
//   });
// });

var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});