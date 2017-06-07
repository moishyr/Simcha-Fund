'use strict';

const express = require('express'),
    router = express.Router(),
    session = require('express-session'),
    login = require('../models/login'),
    homePage = require('../models/homePage'),
    contributorsRequest = require('../models/contributors'),
    simchaRequests = require('../models/simcha');

router.use(session({
    secret: 'admin user name',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7200000 } // 2 hours
}));

router.post('/login', (req, res, next) => {
    login.verifyAdminInfo(req.body.userName, req.body.password, (err, isCorrectUserName, isCorrectPassword) => {
        if (isCorrectUserName && isCorrectPassword) {
            req.session.adminLoggedIn = 'successfully logged in';
            res.redirect('./');
        } else {
            next();
        }
    });
});

router.use(function (req, res, next) {
    if (!req.session.adminLoggedIn) {
        res.render('template', { content: 'login', inputType: 'text', styleSheet: 'styleSheets/login.css' });
        return;
    } else {
        next();
    }
});



router.get('/', (req, res) => {
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

router.get('/viewContributors', (req, res) => {
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

router.get('/addOrRemoveContributor', (req, res) => {
    res.render('template', {
        id: req.query.id,
        fname: req.query.fname,
        lname: req.query.lname,
        balance: req.query.balance,
        content: 'editContributor',
        styleSheet: ''
    });
});

router.post('/editcontributor', (req, res) => {
    contributorsRequest.editContributor(req.body.fname, req.body.lname, req.body.addMoney, req.body.id, (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('./');
    });
});

router.post('/removeContributor', (req, res) => {
    contributorsRequest.removeContributor([req.body.id], (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('./');
    });

});

router.get('/viewSimchas', (req, res) => {
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

router.get('/addOrRemoveSimcha', (req, res) => {
    res.render('template', {
        id: req.query.id,
        name: req.query.name,
        simchaType: req.query.simchaType,
        content: 'editSimcha',
        styleSheet: ''
    });
});

router.post('/editSimcha', (req, res) => {
    simchaRequests.editSimcha(req.body.name, req.body.simchaType, req.body.id, (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('./');
    });
});

router.post('/removeSimcha', (req, res) => {
    simchaRequests.removeSimcha(req.body.id, (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('./');
    });
});

router.get('/addContributor', (req, res) => {
    res.render('template', { content: 'addContributor', styleSheet: '' });
});

router.post('/addContributor', (req, res) => {
    contributorsRequest.addContributor(req.body.firstName, req.body.lastName, req.body.startingAmount, (err, result) => {
        if (err) {
            return res.json({ err });
        }
        res.redirect('./');
    });
});

router.get('/addSimcha', (req, res) => {
    res.render('template', { content: 'addSimcha', styleSheet: '' });
});

router.post('/addSimcha', (req, res) => {
    simchaRequests.addSimcha(req.body.name, req.body.simchaType, (error, result) => {
        if (error) {
            return res.json({ error });
        }
        res.redirect('./');
    });
});

router.get('/contribute', (req, res) => {
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

router.post('/contribute', (req, res) => {
    contributorsRequest.contribute(req.body.contributorName, req.body.baalSimcha, req.body.contributionAmount, (err, result) => {
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
        login.changeAdminPassword(req.body.oldPassword, req.body.newPassword, (err, result, isCorrectPassword) => {
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
    req.session.req.session.adminLoggedIn = null;
    res.redirect('./');
});

module.exports = router;