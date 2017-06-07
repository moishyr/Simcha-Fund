'use strict';

const con = require('../db/mySqlConnection');

let pageSetup = {};

function createMainAdminTable(query, callback) {
    let sqlDisplayTable,
        displayTableResult,
        contributorsResult;
    if (Object.keys(query).length === 0) {
        sqlDisplayTable = "SELECT s.active, s.name 'Baal Simcha', s.simcha_type 'Simcha Type', CONCAT(ci.first_name, ' ', ci.last_name) Contributor, cd.amout_contributed 'Contribution Amount', s.total_collected 'Total Collected', cd.date_contributed 'Contribution Date', ci.balance 'Contributors Balance' " +
            "FROM simcha s " +
            "LEFT JOIN contributor_details cd " +
            "ON cd.simcha_id = s.id " +
            "LEFT JOIN contributor_info ci " +
            "ON ci.id = cd.contributor_id " +
            "ORDER BY 'Simcha Type', 'Baal Simcha'";
    } else {

        if (Object.keys(query)[0] === 'contributor_info') {
            // still need to check for sql injections
            sqlDisplayTable = "SELECT ci.active, CONCAT(ci.first_name, ' ', ci.last_name) Contributor, s.name 'Baal Simcha', s.simcha_type 'Simcha Type', cd.amout_contributed 'Contribution Amount', cd.date_contributed 'Contribution Date', ci.balance Balance " +
                "FROM contributor_info ci " +
                "LEFT JOIN contributor_details cd " +
                "ON cd.contributor_id = ci.id " +
                "LEFT JOIN simcha s " +
                "ON s.id = cd.simcha_id " +
                "WHERE ci.id = " + query.contributor_info +
                " ORDER BY Contributor";
        } else if (Object.keys(query)[0] === 'simcha') {
            sqlDisplayTable = "SELECT s.active, s.name 'Baal Simcha', s.simcha_type 'Simcha Type', s.total_collected 'Total Collected', CONCAT(ci.first_name, ' ', ci.last_name) Contributer, cd.amout_contributed 'Contribution Amount', cd.date_contributed 'Contribution Date'" +
                "FROM simcha s " +
                "LEFT JOIN contributor_details cd " +
                "ON cd.simcha_id = s.id " +
                "LEFT JOIN contributor_info ci " +
                "ON ci.id = cd.contributor_id " +
                "WHERE s.id = " + query.simcha +
                " ORDER BY 'Baal Simcha'";
        }

    }
    con.query(sqlDisplayTable, function (err, tableResult) {
        if (err) {
            throw err;
        }
        displayTableResult = tableResult;
    });

    let sqlContributorsList = "SELECT id, CONCAT(di.first_name, ' ', di.last_name) contributor, active " +
        "FROM contributor_info di " +
        "ORDER BY contributor";
    con.query(sqlContributorsList, function (err, contributors) {
        if (err) {
            throw err;
        }
        contributorsResult = contributors;

    });

    let sqlSimchasList = "SELECT id, name, simcha_type, active FROM simcha ORDER BY name";

    con.query(sqlSimchasList, function (err, simchasResult) {
        callback(err, displayTableResult, contributorsResult, simchasResult);
    });
}

function createMainUserTable(userLoggedIn, callback) {
    let sqlContribute = "SELECT id, name, simcha_type, active FROM simcha",
        baaleiSimcha = '';

    con.query(sqlContribute, function (err, results) {
        if (err) {
            throw err;
        }

        baaleiSimcha = results;
    });

    // At this point I'm not not displaying the baali simcha that are not active (even though it is part of the sql select) because I think that the user might want to see all the people that he has contributed to in the past even though now they are not currently active
    let sqlUserInfo = "SELECT ci.id, CONCAT(ci.first_name, ' ', ci.last_name) name, s.name 'Baal Simcha', s.simcha_type 'Simcha Type', cd.amout_contributed 'Contribution Amount', cd.date_contributed 'Contribution Date', ci.balance Balance, s.active " +
        "FROM contributor_info ci " +
        "LEFT JOIN contributor_details cd " +
        "ON cd.contributor_id = ci.id " +
        "LEFT JOIN simcha s " +
        "ON s.id = cd.simcha_id " +
        " WHERE ci.id = ? " +
        "ORDER BY 'Simcha Type', 'Baal Simcha'";
    con.query(sqlUserInfo, [userLoggedIn], function (err, contributor) {
        callback(err, contributor, baaleiSimcha);
    });
}

pageSetup.createMainAdminTable = createMainAdminTable;
pageSetup.createMainUserTable = createMainUserTable;

module.exports = pageSetup;