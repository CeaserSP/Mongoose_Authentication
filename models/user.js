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

UserSchema.methods.incLoginAttempts = function (callback) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, callback);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.update(updates, callback);
};

// expose enum on the model, and provide an internal convenience reference 
var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

//authenticate input against database
UserSchema.statics.authenticate = function (username, password, callback) {
    this.findOne({ username: username }).exec(function (err, user) {
        if (err) {
            console.log("^^^^^^^^^^^^^^^^")
            return callback(err);
        } 
       
        // make sure the user exists
        else if (!user) {
            return callback(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function (err) {
                if (err) return callback(err);
                return callback(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        console.log("!!!!!!!!!!!!!!!!!")
        bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
                console.log("login success")
                // return callback(null, user);
                if (!user.loginAttempts && !user.lockUntil) {
                    return callback(null, user);
                }
                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function (err) {
                    if (err) return callback(err);
                    return callback(null, user);
                });
            } else {
                console.log("incorrect password")
                user.incLoginAttempts(function (err) {
                    if (err) return callback(err);
                    return callback(null, null, reasons.PASSWORD_INCORRECT);
                });
            };
        });
    });
};

module.exports = mongoose.model('User', UserSchema);