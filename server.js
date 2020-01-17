var express = require("express");
var mongoose = require('mongoose')
var User = require('./models/user.js');
// var bodyParser = require('body-parser');
var app = express();
// var MONGODB_URI =  'mongodb://localhost:27017/mon_auth';
// mongoose.connect(MONGODB_URI, {},  function(error) {
//     console.log("$$$$$$$$$$$$$$$$$$$",error)
//   });
var connStr = 'mongodb://localhost:27017/mon_auth';
mongoose.connect(connStr, function (err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});