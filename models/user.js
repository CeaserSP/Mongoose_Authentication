var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10,
    // max of 5 attempts, resulting in a 2 hour lock
    MAX_LOGIN_ATTEMPTS = 5,
    LOCK_TIME = 2 * 60 * 60 * 1000;

var UserSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number }
});

UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});
// TO DO: Figure out why compare always returns false
// canidatePassword is the password to be compared against the db password
// user.password is hashed password
// UserSchema.methods.comparePassword = function(candidatePassword, cb) {
//     // var user = this;
//     bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//         console.log('canidate password',candidatePassword);
//         console.log('user password', user.password);
//         if (err) return cb(err);
//         cb(null, isMatch);
//     });
// };

UserSchema.methods.incLoginAttempts = function (cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.update(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference 
var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

//authenticate input against database
UserSchema.statics.authenticate = function (username, password, callback) {
    this.findOne({ username: username })
      .exec(function (err, user) {
        if (err) {
            console.log("^^^^^^^^^^^^^^^^")
          return callback(err)
        } else if (!user) {
            console.log("***************")
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        console.log("!!!!!!!!!!!!!!!!!")
        bcrypt.compare(password, user.password, function (err, result) {
          if (result === true) {
            console.log("login success")
            return callback(null, user);
          } else {
            console.log("incorrect password")
            return callback();
          }
        })
      });
  }
// UserSchema.statics.getAuthenticated = function (username, password, cb) {
//     this.findOne({ username: username })
//         .exec(function (err, user) {
//             if (err) {
//                 return cb(err)
//             } else if (!user) {
//                 var err = new Error('User not found.');
//                 err.status = 401;
//                 return cb(err);
//             }
//             bcrypt.compare(password, user.password, function (err, result) {
//                 if (result === true) {
//                     console.log('is true')
//                     return cb(null, user);
//                 } else {
//                     console.log('is false')
//                     return cb();
//                 }
//                 // if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
//                 // // reset attempts and lock info
//                 // var updates = {
//                 //     $set: { loginAttempts: 0 },
//                 //     $unset: { lockUntil: 1 }
//                 // };
//                 // return user.update(updates, function(err) {
//                 //     if (err) return cb(err);
//                 //     return cb(null, user);
//                 // });
//                 // }

//                 // password is incorrect, so increment login attempts before responding
//                 // user.incLoginAttempts(function(err) {
//                 //     console.log("incorrect password")
//                 //     if (err) return cb(err);
//                 //     return cb(null, null, reasons.PASSWORD_INCORRECT);
//                 // });
//             });

//             // check if the account is currently locked
//             // if (user.isLocked) {
//             //     // just increment login attempts if account is already locked
//             //     console.log("user locked")
//             //     return user.incLoginAttempts(function(err) {
//             //         if (err) return cb(err);
//             //         return cb(null, null, reasons.MAX_ATTEMPTS);
//             //     });
//             // }

//             // test for a matching password
//             // user.comparePassword(password, function(err, isMatch) {
//             //     console.log("testing password");
//             //     console.log(password);
//             //     console.log(isMatch);
//             //     if (err) return cb(err);

//             //     // check if the password was a match
//             //     if (isMatch) {
//             //         // if there's no lock or failed attempts, just return the user
//             //         console.log("isMatch")
//             //         if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
//             //         // reset attempts and lock info
//             //         var updates = {
//             //             $set: { loginAttempts: 0 },
//             //             $unset: { lockUntil: 1 }
//             //         };
//             //         return user.update(updates, function(err) {
//             //             if (err) return cb(err);
//             //             return cb(null, user);
//             //         });
//             //     }

//             //     // password is incorrect, so increment login attempts before responding
//             //     user.incLoginAttempts(function(err) {
//             //         console.log("incorrect password")
//             //         if (err) return cb(err);
//             //         return cb(null, null, reasons.PASSWORD_INCORRECT);
//             //     });
//             // });
//         });
// };

module.exports = mongoose.model('User', UserSchema);