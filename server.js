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
// create a user a new user
// var testUser = new User({
//     username: 'jmar777',
//     password: 'Password123'
// });
// var newUser = new User({
//     username = req.body.username,
//     password = req.body.password
// });

// newUser.save(function(err) {
//   if (err) throw err;
// }
// app.post('/login', (req, res) => {
// //     const username = req.body.username;
// //   const password = req.body.password;

// //   console.log(username)
// //   console.log("+++++++++++++++++++++++++++++++")
// //   console.log(password)
//     // fetch user and test password verification
//     User.findOne({ username: req.body.username }, (req, res) => {
//         // const username = req.body.username;
//         // const password = req.body.password;
      
//         console.log(username)
//         console.log("+++++++++++++++++++++++++++++++")
//         console.log(req.password)
//         if (err) throw err;

//         // test a matching password
//         user.comparePassword(password, function (err, isMatch) {
//             if (err) throw err;
//             console.log('Password', isMatch); // -> Password123: true
//         });

//         // test a failing password
//         user.comparePassword(passworrd, function (err, isMatch) {
//             if (err) throw err;
//             console.log('Password:', isMatch); // -> 123Password: false
//         });
//     });
// });
// Route to post our form submission to mongoDB via mongoose
app.post("/submit", function(req, res) {
  // Create a new user using req.body
  User.create(req.body)
    .then(function(dbUser) {
      // If saved successfully, send the the new User document to the client
      res.json(dbUser);
    })
    .catch(function(err) {
      // If an error occurs, send the error to the client
      res.json(err);
    });
});
// save user to database
// testUser.post(function(err) {
//     if (err) throw err;

// // fetch user and test password verification
// User.findOne({ username: 'jmar777' }, function(err, user) {
//     if (err) throw err;

//     // test a matching password
//     user.comparePassword('Password123', function(err, isMatch) {
//         if (err) throw err;
//         console.log('Password123:', isMatch); // -> Password123: true
//     });

//     // test a failing password
//     user.comparePassword('123Password', function(err, isMatch) {
//         if (err) throw err;
//         console.log('123Password:', isMatch); // -> 123Password: false
//     });
// });
// });



var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});