'use strict';

const express = require('express'),
  router = express.Router(),
  session = require('express-session'),
  login = require('../models/login'),
  homePage = require('../models/homePage'),
  contributorsRequest = require('../models/contributors');

router.use(session({
  secret: 'user user name',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7200000 } // 2 hours
}));

router.post('/login', (req, res, next) => {
  login.verifyUserInfo(req.body.userName, req.body.password, (isCorrectPassword) => {
    if (isCorrectPassword) {
      req.session.userLoggedIn = req.body.userName;
      res.redirect('./');
    } else {
      next();
    }
  });
});

router.use(function (req, res, next) {
  if (!req.session.userLoggedIn) {
    login.getUsers((err, results) => {
      if (err) {
        throw err;
      }
      res.render('template', { content: 'login', contributorsResult: results, inputType: 'select', styleSheet: 'styleSheets/login.css' });
    });
  } else {
    next();
  }
});

router.get('/', (req, res) => {
  homePage.createMainUserTable(req.session.userLoggedIn, (err, contributor, baaleiSimcha) => {
    if (err) {
      throw err;
    }
    res.render('template', { content: 'userHome', contributor: contributor, baaleiSimcha: baaleiSimcha, styleSheet: '' });
  });
});

router.post('/submitContribution', (req, res) => {
  contributorsRequest.contribute(req.body.contributor, req.body.contributeTo, req.body.amount, (err, result) => {
    if (err) {
      throw err;
    }
    res.redirect('./');
  });
});

router.get('/changePassword', (req, res) => {
  res.render('template', { content: 'changePassword', styleSheet: '' });
});

router.post('/changePassword', (req, res) => {
  if (req.body.oldPassword  && req.body.newPassword) {
        login.changeUserPassword(req.body.oldPassword, req.body.newPassword, req.session.userLoggedIn , (err, result, isCorrectPassword) => {
            if(err) {
                throw err;
            }
            if(!isCorrectPassword) {
                return res.redirect('./changePassword');
            }
            res.redirect('./');
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