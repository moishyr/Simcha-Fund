'use strict';

const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt'),
    login = require('../../models/login'),
    con = require('../../db/mySqlConnection');

passport.serializeUser(function (user, done) {
    // console.log('in the serialize admin function', user);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    // console.log('in the deserialize admin function', id);
    let sql = 'SELECT * FROM users WHERE id = ' + id;
    con.query(sql, function (err, user) {
        done(err, user[0]);
    });
});

passport.use(
    'local-signup',
    new LocalStrategy({
        usernameField: 'userName',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, userName, password, done) {
            login.passportSignup(userName, (err, user, insertCallback) => {
                if (err) {
                    return done(err);
                }
                if (user.length) {
                    return done(null, false);
                } else {
                    var newUserMysql = {
                        username: userName,
                        password: bcrypt.hashSync(password, 10)
                    };
                    insertCallback(newUserMysql, done);
                }
            });
        })
);

passport.use('local-login', new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
    passReqToCallback: true
}, (req, userName, password, done) => {
    login.passportAdminLogin(userName, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user.length) {
            return done(null, false);
        }
        bcrypt.compare(password, user[0].password, (err, isCorrectPassword) => {
            if (!isCorrectPassword) {
                return done(null, false);
            } else {
                return done(null, user[0]);
            }

        });
    });
}));

module.exports = function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }

    res.redirect('/admin/login');
};