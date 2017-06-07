'use strict';

const con = require('../db/mySqlConnection');

let simchaRequests = {};

function viewSimchas(callback) {
    var sql = "SELECT active, id, name, simcha_type 'Simcha Type', total_collected 'Total Collected'" +
        "FROM simcha " +
        "ORDER BY name";
    con.query(sql, function (err, result) {
        callback(err, result);
    });
}

function editSimcha(name, simchaType, id, callback) {
    let sql = "UPDATE simcha SET name = ?, simcha_type = ? WHERE id = ?";
    con.query(sql, [name, simchaType, id], function (err, result) {
        callback(err, result);
    });
}

function removeSimcha(id, callback) {
    let sql = "UPDATE simcha SET active = false WHERE id = ?"; //"DELETE FROM contributor_info WHERE id = ?";
    con.query(sql, [id], function (err, result) {
        callback(err, result);
    });
}

function addSimcha(name, simchaType, callback) {
    var sql = "INSERT INTO simcha(id, name, simcha_type, total_collected, active) VALUES (null,?,?,0, true)";
    con.query(sql, [name, simchaType], (error, result) => {
        callback(error, result);
    });
}

simchaRequests.viewSimchas = viewSimchas;
simchaRequests.editSimcha = editSimcha;
simchaRequests.removeSimcha = removeSimcha;
simchaRequests.addSimcha = addSimcha;

module.exports = simchaRequests;