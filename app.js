'use strict';

const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path'),
    // secure = require('express-force-https'),
    jsonParser = bodyParser.json(),
    urlencodedParser = bodyParser.urlencoded({ extended: false }),
    session = require('express-session'),
    passport = require('passport'),
    con = require('./db/mySqlConnection');

con.connect(function (err) {
    if (err) {
        console.error('error', err);
        throw err;
    }
    console.log("Connected!");
});


app.use(jsonParser);
app.use(urlencodedParser);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7200000 } // 2 hours
}));

app.use(passport.initialize());
app.use(passport.session());

let user = require('./routes/users');
let admin = require('./routes/admin');


app.use('/admin', admin);
app.use('/', user);

// app.use(secure);
app.listen(3001, () => console.log('server is running on port 3001'));