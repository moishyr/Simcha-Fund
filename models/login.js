'use strict';

const con = require('../db/mySqlConnection'),
    bcrypt = require('bcrypt');


let login = {};

function passportAdminLogin(username, callback) {
    let sql = 'SELECT * from users WHERE username = ?';
    con.query(sql, [username], (err, result) => {
        callback(err, result);
    });
}

function passportUsersLogin(username, callback) {
    let sql = 'SELECT * from contributor_info WHERE id = ?';
    con.query(sql, [username], (err, result) => {
        callback(err, result);
    });
}

function passportSignup(username, callback) {
    con.query("SELECT * FROM users WHERE username = ?", [username], function (err, result) {
        callback(err, result, (user, done) => {
            var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";
            con.query(insertQuery, [user.username, user.password], function (err, rows) {
                user.id = rows.insertId;

                return done(null, user);
            });
        });
    });
}

function changeAdminPassword(oldPassword, newPassword, callback) {
    function hashPassword(newPassword) {
        bcrypt.hash(newPassword, 6, function (err, hash) {
            con.query("UPDATE users SET password = ?", [hash], (err, result) => {
                callback(err, result, true);
            });
        });
    }

    var sql = "SELECT password FROM users";
    con.query(sql, function (err, result) {
        if (err) {
            throw err;
        }
        if (result[0].password === null) {
            hashPassword(newPassword);
        } else {
            bcrypt.compare(oldPassword, result[0].password, function (err, isLogged) {
                if (isLogged) {
                    hashPassword(newPassword);
                } else {
                    callback(err, result, false);
                }
            });
        }
    });
}

function getUsers(callback) {
    let sqlContributorsList = "SELECT id, CONCAT(first_name, ' ', last_name) contributor, active " +
        "FROM contributor_info " +
        "ORDER BY contributor";
    con.query(sqlContributorsList, function (err, contributors) {
        callback(err, contributors);
    });
}

function verifyUserInfo(userName, password, callback) {
    let sql = "SELECT CONCAT(first_name, ' ', last_name) contributor, password FROM contributor_info WHERE id = ?";
    con.query(sql, [userName], function (err, loginInfo) {
        if (err) {
            throw err;
        }
        if (loginInfo[0].password === null) {
            callback(true);
        }
        bcrypt.compare(password, loginInfo[0].password, function (err, isLogged) {
            if (isLogged) {
                callback(true);
            } else {
                callback(false);
            }
        });
    });
}

function changeUserPassword(oldPassword, newPassword, id, callback) {
    function hashPassword(newPassword) {
        bcrypt.hash(newPassword, 6, function (err, hash) {
            con.query("UPDATE contributor_info SET password = ? WHERE id = ?", [hash, id], (err, result) => {
                callback(err, result, true);
            });
        });
    }

    var sql = "SELECT password FROM contributor_info WHERE id = ?";
    con.query(sql, [id], function (err, result) {
        if (err) {
            throw err;
        }
        if (result[0].password === null) {
            hashPassword(newPassword);
        } else {
            bcrypt.compare(oldPassword, result[0].password, function (err, isLogged) {
                if (isLogged) {
                    hashPassword(newPassword);
                } else {
                    callback(err, result, false);
                }
            });
        }
    });
}

login.passportAdminLogin = passportAdminLogin;
login.passportUsersLogin = passportUsersLogin;
login.passportSignup = passportSignup;
login.changeAdminPassword = changeAdminPassword;
login.getUsers = getUsers;
login.verifyUserInfo = verifyUserInfo;
login.changeUserPassword = changeUserPassword;

module.exports = login;