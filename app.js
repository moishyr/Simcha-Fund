'use strict';

const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path'),
    secure = require('express-force-https'),
    // mySql = require('mysql'),
    jsonParser = bodyParser.json(),
    urlencodedParser = bodyParser.urlencoded({ extended: false }),
    con = require('./mySqlConnection');
    // con = mySql.createConnection({
    //     host: "localhost",
    //     user: "test",
    //     password: "p@$$w0rd",
    //     database: "simcha_fund"
    // });

con.connect(function (err) {
    if (err) {
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

let user = require('./routes/user');
let admin = require('./routes/admin');


app.use('/admin', admin);
app.use('/', user);

app.use(secure);
app.listen(3000, () => console.log('server is running on port 3000'));