'use strict';

const mySql = require('mysql'),
    con = mySql.createConnection({
        host: "localhost",
        user: "test",
        password: "p@$$w0rd",
        database: "simcha_fund"
    });
    
    module.exports = con;