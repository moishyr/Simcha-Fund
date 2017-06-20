'use strict';

const express = require('express'),
    router = express.Router(),
    session = require('express-session'),
    passport = require('passport'),
    isLoggedIn = require('../utils/passport/admin'),
    login = require('../models/login'),
    homePage = require('../models/homePage'),
    contributorsRequest = require('../models/contributors'),
    simchaRequests = require('../models/simcha');

router.get('/signup', (req, res) => {
    res.render('template', { content: 'signup', user: 'admin', styleSheet: 'styleSheets/login.css' });
});

router.post('/signup', passport.authenticate('local-signup', {
    // for now we only have one admin so in the form we will redirect to the login
    successRedirect: '/admin/',
    failureRedirect: '/admin/signup'
}));

router.get('/login', (req, res) => {
    res.render('template', { content: 'login', inputType: 'text', styleSheet: 'styleSheets/login.css' });
    return;
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/admin/',
    failureRedirect: '/admin/login'/*,
    failureFlash: true*/
}));

router.get('/', isLoggedIn, (req, res) => {
    homePage.createMainAdminTable(req.query, (err, displayTableResult, contributorsResult, simchasResult) => {
        if (err) {
            throw err;
        }

        res.render('template', {
            displayTableResult: displayTableResult,
            contributorsResult: contributorsResult,
            simchasResult: simchasResult,
            content: 'adminHome',
            styleSheet: 'styleSheets/adminHome.css'
        });
    });
});

router.get('/viewContributors', isLoggedIn, (req, res) => {
    contributorsRequest.viewContributors((err, result) => {
        if (err) {
            throw err;
        }
        res.render('template', {
            data: result,
            content: 'viewContributors',
            styleSheet: ''
        });
    });
});

router.get('/addOrRemoveContributor', isLoggedIn, (req, res) => {
    res.render('template', {
        id: req.query.id,
        fname: req.query.fname,
        lname: req.query.lname,
        balance: req.query.balance,
        content: 'editContributor',
        styleSheet: ''
    });
});

router.post('/editcontributor', isLoggedIn, (req, res) => {
    contributorsRequest.editContributor(req.body.fname, req.body.lname, req.body.addMoney, req.body.id, (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('/admin/');
    });
});

router.post('/removeContributor', isLoggedIn, (req, res) => {
    contributorsRequest.removeContributor([req.body.id], (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('/admin/');
    });

});

router.get('/viewSimchas', isLoggedIn, (req, res) => {
    simchaRequests.viewSimchas((err, result) => {
        if (err) {
            throw err;
        }
        res.render('template', {
            data: result,
            content: 'viewSimchas',
            styleSheet: ''
        });
    });
});

router.get('/addOrRemoveSimcha', isLoggedIn, (req, res) => {
    res.render('template', {
        id: req.query.id,
        name: req.query.name,
        simchaType: req.query.simchaType,
        content: 'editSimcha',
        styleSheet: ''
    });
});

router.post('/editSimcha', isLoggedIn, (req, res) => {
    simchaRequests.editSimcha(req.body.name, req.body.simchaType, req.body.id, (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('/admin/');
    });
});

router.post('/removeSimcha', isLoggedIn, (req, res) => {
    simchaRequests.removeSimcha(req.body.id, (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('/admin/');
    });
});

router.get('/addContributor', isLoggedIn, (req, res) => {
    res.render('template', { content: 'addContributor', styleSheet: '' });
});

router.post('/addContributor', (req, res) => {
    contributorsRequest.addContributor(req.body.firstName, req.body.lastName, req.body.startingAmount, (err, result) => {
        if (err) {
            return res.json({ err });
        }
        res.redirect('/admin/');
    });
});

router.get('/addSimcha', isLoggedIn, (req, res) => {
    res.render('template', { content: 'addSimcha', styleSheet: '' });
});

router.post('/addSimcha', isLoggedIn, (req, res) => {
    simchaRequests.addSimcha(req.body.name, req.body.simchaType, (error, result) => {
        if (error) {
            return res.json({ error });
        }
        res.redirect('/admin/');
    });
});

router.get('/contribute', isLoggedIn, (req, res) => {
    contributorsRequest.contributionPageSetup((err, firstResult, secondResult) => {
        if (err) {
            throw err;
        }

        res.render('template', {
            firstResult: firstResult,
            secondResult: secondResult,
            content: 'contribute',
            styleSheet: ''
        });
    });
});

router.post('/contribute', isLoggedIn, (req, res) => {
    contributorsRequest.contribute(req.body.contributorName, req.body.baalSimcha, req.body.contributionAmount, (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('/admin/');
    });
});

router.get('/changePassword', isLoggedIn, (req, res) => {
    res.render('template', { content: 'changePassword', styleSheet: '' });
});

router.post('/changePassword', isLoggedIn, (req, res) => {
    if (req.body.oldPassword && req.body.newPassword) {
        login.changeAdminPassword(req.body.oldPassword, req.body.newPassword, (err, result, isCorrectPassword) => {
            if (err) {
                throw err;
            }
            if (!isCorrectPassword) {
                return res.redirect('/admin/changePassword');
            }
            res.redirect('/admin');
        });
    } else {
        res.redirect('/admin/changePassword');
    }
});

router.get('/logOut', isLoggedIn, (req, res) => {
    req.logout();
    res.redirect('/admin/login');
});

module.exports = router;