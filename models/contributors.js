'use strict';

const con = require('../db/mySqlConnection');

let contributorsRequest = {};

function viewContributors(callback) {
    var sql = "SELECT active, id, first_name 'First Name', last_name 'Last Name', balance Balance " +
        "FROM contributor_info " +
        "ORDER BY 'First Name', 'Last Name'";
    con.query(sql, function (err, result) {
        callback(err, result);
    });
}

function editContributor(firstName, lastName, addMoney, id, callback) {
    let sql = "UPDATE contributor_info SET first_name = ?, last_name = ?, balance = balance + ? WHERE id = ?";
    con.query(sql, [firstName, lastName, addMoney, id], function (err, result) {
        callback(err, result);
    });
}

function removeContributor(id, callback) {
    let sql = "UPDATE contributor_info SET active = false WHERE id = ?";
    con.query(sql, id, function (err, result) {
        callback(err, result);
    });
}

function addContributor(firstName, lastName, startingAmount, callback) {
    // may want to make a password field - prob not
    var sql = "INSERT INTO contributor_info(id, first_name, last_name, balance, password, active) VALUES (null,?,?,?,null, true)";
    con.query(sql, [firstName, lastName, startingAmount], (err, result) => {
        callback(err, result);
    });
}

function contributionPageSetup(callback) {
    var sql = "SELECT id, CONCAT(first_name, ' ', last_name) name, active " +
        "FROM contributor_info";
    con.query(sql, function (err, firstResult) {
        if (err) {
            throw err;
        }

        sql = "SELECT id, name name, simcha_type, active " +
            "FROM simcha";
        con.query(sql, function (err, secondResult) {
            callback(err, firstResult, secondResult);
        });
    });
}

function contribute(contributorName, baalSimcha, contributionAmount, callback) {
    function executeQuery(sql, values, shouldCallback, rollbackQueryArray, rollbackQueryParams) {
        con.query(sql, values, function (error, result) {
            if (error) {
                if (rollbackQueryArray) {
                    rollbackQueryArray.forEach(function (query, index) {
                        executeQuery(query, rollbackQueryParams[index], index === rollbackQueryArray.length - 1);
                    });
                }
                // con.rollback(function () {
                //     throw err;
                // });
                console.error(error);
            }
            if (shouldCallback) {
                callback(error, result);
            }
        });
    }

    // con.beginTransaction(function (err) {
    let updateContributorInfo = 'UPDATE contributor_info Set balance = balance - ' + contributionAmount + ' WHERE id = ?';
    executeQuery(updateContributorInfo, [contributorName], false);

    let updateSimcha = 'UPDATE simcha Set total_collected = total_collected + ' + contributionAmount + ' WHERE id = ?',
        undoUpdatedContributorInfo = 'UPDATE contributor_info Set balance = balance + ' + contributionAmount + ' WHERE id = ?';
    executeQuery(updateSimcha, [baalSimcha], false, [undoUpdatedContributorInfo], [[contributorName]]);

    let sql = "INSERT INTO contributor_details(contributor_id, simcha_id, amout_contributed, date_contributed) VALUES (?,?,?,now())",
        undoUpdatedSimcha = 'UPDATE simcha Set total_collected = total_collected - ' + contributionAmount + ' WHERE id = ?';
    executeQuery(sql, [contributorName, baalSimcha, contributionAmount], true, [undoUpdatedContributorInfo, undoUpdatedSimcha], [[contributorName], [baalSimcha]]);

    //     con.commit(function (err) {
    //         if (err) {
    //             // con.rollback(function () {
    //             //     throw err;
    //             // });
    //         }
    //         res.redirect('./');
    //     });
    // });
}

contributorsRequest.viewContributors = viewContributors;
contributorsRequest.editContributor = editContributor;
contributorsRequest.removeContributor = removeContributor;
contributorsRequest.addContributor = addContributor;
contributorsRequest.contributionPageSetup = contributionPageSetup;
contributorsRequest.contribute = contribute;

module.exports = contributorsRequest;