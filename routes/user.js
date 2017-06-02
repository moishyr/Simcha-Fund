'use strict';

const express = require('express'),
  router = express.Router(),
  con = require('../mySqlConnection'),
  session = require('express-session'),
  bcrypt = require('bcrypt');

router.use(session({
  secret: 'user user name',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7200000 } // 2 hours
}));

router.post('/login', (req, res, next) => {
  var sql = "SELECT CONCAT(first_name, ' ', last_name) contributor, password FROM contributor_info WHERE id = ?";
  con.query(sql, [req.body.userName], function (err, loginInfo) {
    if (err) {
      throw err;
    }
    if (loginInfo[0].password === null) {
      req.session.userLoggedIn = req.body.userName;
      res.redirect('./');
      // next();
    }
    bcrypt.compare(req.body.password, loginInfo[0].password, function (err, isLogged) {
      if (isLogged) {
        // if (req.body.userName === loginInfo[0].user_name) {
        req.session.userLoggedIn = req.body.userName;
        res.redirect('./');
        // }
      } else {
        next();
      }
    });
  });

});

router.use(function (req, res, next) {
  if (!req.session.userLoggedIn) {
    let sqlContributorsList = "SELECT id, CONCAT(first_name, ' ', last_name) contributor, active " +
      "FROM contributor_info " +
      "ORDER BY contributor";
    con.query(sqlContributorsList, function (err, contributors) {
      if (err) {
        throw err;
      }
      res.render('template', { content: 'login', contributorsResult: contributors, inputType: 'select', styleSheet: 'styleSheets/login.css' });
    });
  } else {
    next();
  }
});

router.get('/', (req, res) => {

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
  con.query(sqlUserInfo, [req.session.userLoggedIn], function (err, contributor) {
    if (err) {
      throw err;
    }
    res.render('template', { content: 'userHome', contributor: contributor, baaleiSimcha: baaleiSimcha, styleSheet: '' });
  });
});

router.post('/submitContribution', (req, res) => {
  // con.beginTransaction(function (err) {
  let updateContributorInfo = 'UPDATE contributor_info Set balance = balance - ' + req.body.amount + ' WHERE id = ' + req.body.contributor;
  con.query(updateContributorInfo, function (error, results, fields) {
    if (error) {
      // con.rollback(function () {
      //     throw error;
      // });
      return res.json({ error });
    }

  });
  let updateSimcha = 'UPDATE simcha Set total_collected = total_collected + ' + req.body.amount + ' WHERE id = ' + req.body.contributeTo;
  con.query(updateSimcha, function (error, results, fields) {
    if (error) {
      // con.rollback(function () {
      //     throw error;
      // });
      return res.json({ error });
    }

  });
  var sqlInsert = "INSERT INTO contributor_details(contributor_id, simcha_id, amout_contributed, date_contributed) VALUES (?,?,?,now())";
  con.query(sqlInsert, [req.body.contributor, req.body.contributeTo, req.body.amount], (error, result) => {
    if (error) {
      // con.rollback(function () {
      //     throw err;
      // });
      return res.json({ error });
    }
    res.redirect('./');
  });
  // });
});

router.get('/changePassword', (req, res) => {
  res.render('template', { content: 'changePassword', styleSheet: '' });
});

router.post('/changePassword', (req, res) => {
  function hashPassword(newPassword) {
    bcrypt.hash(newPassword, 6, function (err, hash) {
      console.log('newPassword', newPassword, 'hash', hash);
      con.query("UPDATE contributor_info SET password = ? WHERE id = ?", [hash, req.session.userLoggedIn], (err, results) => {
        res.redirect('./');
      });
    });
  }

  if (req.body.newPassword) {
    let oldPassword = req.body.oldPassword,
      newPassword = req.body.newPassword;

    var sql = "SELECT password FROM contributor_info WHERE id = ?";
    con.query(sql, [req.session.userLoggedIn], function (err, loginInfo) {
      if (err) {
        throw err;
      }
      if (loginInfo[0].password === null) {
        hashPassword(newPassword);
      } else {
        bcrypt.compare(oldPassword, loginInfo[0].password, function (err, isLogged) {
          if (isLogged) {
            hashPassword(newPassword);
          } else {
            res.redirect('./changePassword');
          }
        });
      }
    });
  } else {
    res.redirect('./changePassword');
  }
});

router.get('/logOut', (req, res) => {
  req.session.userLoggedIn = null;
  res.redirect('./');
});

module.exports = router;