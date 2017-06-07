'use strict';

const con = require('../db/mySqlConnection'),
    bcrypt = require('bcrypt');


let login = {};

function verifyAdminInfo(userName, password, callback) {
    var sql = "SELECT user_name, password FROM admin";
    con.query(sql, function (err, loginInfo) {
        if (err) {
            throw err;
        }
        bcrypt.compare(password, loginInfo[0].password, function (err, isCorrectPassword) {
            callback(err, userName === loginInfo[0].user_name, isCorrectPassword);
        });
    });
}

function changeAdminPassword(oldPassword, newPassword, callback) {
    function hashPassword(newPassword) {
        bcrypt.hash(newPassword, 6, function (err, hash) {
            con.query("UPDATE admin SET password = ?", [hash], (err, result) => {
                callback(err, result, true);
            });
        });
    }

    var sql = "SELECT password FROM admin";
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

login.verifyAdminInfo = verifyAdminInfo;
login.changeAdminPassword = changeAdminPassword;
login.getUsers = getUsers;
login.verifyUserInfo = verifyUserInfo;
login.changeUserPassword = changeUserPassword;

module.exports = login;