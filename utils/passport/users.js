'use strict';

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt'),
    login = require('../../models/login'),
    con = require('../../db/mySqlConnection');

passport.serializeUser(function (user, done) {
    console.log('in the serialize user function', user);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    console.log('in the deserialize user function', id);
    let sql = 'SELECT * FROM contributor_info WHERE id = ' + id;
    con.query(sql, function (err, user) {
        done(err, user[0]);
    });
});

// passport.use(
//     'local-signup',
//     new LocalStrategy({
//         usernameField: 'userName',
//         passwordField: 'password',
//         passReqToCallback: true
//     },
//         function (req, userName, password, done) {
//             login.passportSignup(userName, (err, user, insertCallback) => {

//                 if (err) {
//                     return done(err);
//                 }
//                 if (user.length) {
//                     return done(null, false);
//                 } else {
//                     var newUserMysql = {
//                         username: userName,
//                         password: bcrypt.hashSync(password, 10)
//                     };
//                     insertCallback(newUserMysql, done);
//                 }
//             });
//         })
// );

passport.use('user-login', new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
    passReqToCallback: true
}, (req, userName, password, done) => {
    login.passportUsersLogin(userName, (err, user) => {
        console.log('in the passport user local strategy function');
        if (err) {
            return done(err);
        }
        if (!user.length) {
            console.log('no user found');
            return done(null, false);
        }
        bcrypt.compare(password, user[0].password, (err, isCorrectPassword) => {
            if (!isCorrectPassword) {
                console.log("password doesn't match");
                return done(null, false);
            } else {
                console.log('correct user and password');
                return done(null, user[0]);
            }
        });
    });
}));

module.exports = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
};