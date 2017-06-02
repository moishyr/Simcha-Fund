'use strict';
const express = require('express'),
    router = express.Router(),
    con = require('../mySqlConnection'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');



// router.use(express.static(path.join(__dirname, '../public')));

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));

// router.post('/login',
//   passport.authenticate('local', { successRedirect: '/',
//                                    failureRedirect: '/login',
//                                    failureFlash: true })
// );

router.use(session({
    secret: 'admin user name',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7200000 } // 2 hours
}));

router.post('/login', (req, res, next) => {
    var sql = "SELECT user_name, password FROM admin";
    con.query(sql, function (err, loginInfo) {
        if (err) {
            throw err;
        }
        bcrypt.compare(req.body.password, loginInfo[0].password, function (err, isLogged) {
            if (isLogged) {
                if (req.body.userName === loginInfo[0].user_name) {
                    req.session.adminLoggedIn = 'successfully logged in';
                    res.redirect('./');
                }
            } else {
                next();
            }
        });
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
    let sqlDisplayTable,
        displayTableResult,
        contributorsResult;
    if (Object.keys(req.query).length === 0) {
        sqlDisplayTable = "SELECT s.active, s.name 'Baal Simcha', s.simcha_type 'Simcha Type', CONCAT(ci.first_name, ' ', ci.last_name) Contributor, cd.amout_contributed 'Contribution Amount', s.total_collected 'Total Collected', cd.date_contributed 'Contribution Date', ci.balance 'Contributors Balance' " +
            "FROM simcha s " +
            "LEFT JOIN contributor_details cd " +
            "ON cd.simcha_id = s.id " +
            "LEFT JOIN contributor_info ci " +
            "ON ci.id = cd.contributor_id " +
            "ORDER BY 'Simcha Type', 'Baal Simcha'";
    } else {

        if (Object.keys(req.query)[0] === 'contributor_info') {
            // still need to check for sql injections
            sqlDisplayTable = "SELECT ci.active, CONCAT(ci.first_name, ' ', ci.last_name) Contributor, s.name 'Baal Simcha', s.simcha_type 'Simcha Type', cd.amout_contributed 'Contribution Amount', cd.date_contributed 'Contribution Date', ci.balance Balance " +
                "FROM contributor_info ci " +
                "LEFT JOIN contributor_details cd " +
                "ON cd.contributor_id = ci.id " +
                "LEFT JOIN simcha s " +
                "ON s.id = cd.simcha_id " +
                "WHERE ci.id = " + req.query.contributor_info +
                " ORDER BY Contributor";
        } else if (Object.keys(req.query)[0] === 'simcha') {
            sqlDisplayTable = "SELECT s.active, s.name 'Baal Simcha', s.simcha_type 'Simcha Type', s.total_collected 'Total Collected', CONCAT(ci.first_name, ' ', ci.last_name) Contributer, cd.amout_contributed 'Contribution Amount', cd.date_contributed 'Contribution Date'" +
                "FROM simcha s " +
                "LEFT JOIN contributor_details cd " +
                "ON cd.simcha_id = s.id " +
                "LEFT JOIN contributor_info ci " +
                "ON ci.id = cd.contributor_id " +
                "WHERE s.id = " + req.query.simcha +
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

// router.get('/home/:contributer_info', (req, res) => {
//     let sqlDisplayTable = "SELECT CONCAT(di.first_name, ' ', di.last_name) contributer, s.name 'Baal Simcha', s.simcha_type 'Simcha Type', dd.amout_contributed 'Contribution Amount', dd.date_contributed 'Contribution Date', di.balance Balance " +
//                                 "FROM contributer_info di " +
//                                 "LEFT JOIN contributer_details dd " +
//                                 "ON dd.contributer_id = di.id " +
//                                 "LEFT JOIN simcha s " +
//                                 "ON s.id = dd.simcha_id " +
//                                 "WHERE di.id = " + req.params.contributer_info +
//                                 " ORDER BY contributer";
// });

router.get('/viewContributors', (req, res) => {
    var sql = "SELECT active, id, first_name 'First Name', last_name 'Last Name', balance Balance " +
        "FROM contributor_info " +
        "ORDER BY 'First Name', 'Last Name'";
    con.query(sql, function (err, result) {
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
    let sql = "UPDATE contributor_info SET first_name = ?, last_name = ?, balance = balance + ? WHERE id = ?";
    con.query(sql, [req.body.fname, req.body.lname, req.body.addMoney, req.body.id], function (err, result) {
        if (err) {
            throw err;
        }
        res.redirect('./');
    });
});

router.post('/removeContributor', (req, res) => {
    let sql = "UPDATE contributor_info SET active = false WHERE id = ?"; //"DELETE FROM contributor_info WHERE id = ?";
    con.query(sql, [req.body.id], function (err, result) {
        if (err) {
            throw err;
        }
        res.redirect('./');
    });
});

router.get('/viewSimchas', (req, res) => {
    var sql = "SELECT active, id, name Name, simcha_type 'Simcha Type', total_collected 'Total Collected'" +
        "FROM simcha " +
        "ORDER BY Name";
    con.query(sql, function (err, result) {
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
    let sql = "UPDATE simcha SET name = ?, simcha_type = ? WHERE id = ?";
    con.query(sql, [req.body.name, req.body.simchaType, req.body.id], function (err, result) {
        if (err) {
            throw err;
        }
        res.redirect('./');
    });
});

router.post('/removeSimcha', (req, res) => {
    let sql = "UPDATE simcha SET active = false WHERE id = ?"; //"DELETE FROM contributor_info WHERE id = ?";
    con.query(sql, [req.body.id], function (err, result) {
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
    // may want to make a password field - prob not
    var sql = "INSERT INTO contributor_info(id, first_name, last_name, balance, password, active) VALUES (null,?,?,?,null, true)";
    let { firstName, lastName, startingAmount } = req.body;
    con.query(sql, [firstName, lastName, startingAmount], (error, result) => {
        if (error) {
            return res.json({ error });
        }
        res.redirect('./');
    });
});

router.get('/addSimcha', (req, res) => {
    res.render('template', { content: 'addSimcha', styleSheet: '' });
});

router.post('/addSimcha', (req, res) => {
    var sql = "INSERT INTO simcha(id, name, simcha_type, total_collected, active) VALUES (null,?,?,0, true)";
    con.query(sql, [req.body.name, req.body.simchaType], (error, result) => {
        if (error) {
            return res.json({ error });
        }
        res.redirect('./');
    });
});

router.get('/contribute', (req, res) => {
    var sql = "SELECT id, CONCAT(first_name, ' ', last_name) name, active " +
        "FROM contributor_info";
    con.query(sql, function (err, firstResult) {
        if (err) {
            throw err;
        }

        sql = "SELECT id, name name, simcha_type, active " +
            "FROM simcha";
        con.query(sql, function (err, secondResult) {
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
});

router.post('/contribute', (req, res) => {
    con.beginTransaction(function (err) {
        let updateContributorInfo = 'UPDATE contributor_info Set balance = balance - ' + req.body.contributionAmount + ' WHERE id = ?';
        con.query(updateContributorInfo, [req.body.contributorName], function (error, results, fields) {
            if (error) {
                con.rollback(function () {
                    throw error;
                });
                return res.json({ error });
            }
        });
        let updateSimcha = 'UPDATE simcha Set total_collected = total_collecte + ' + req.body.contributionAmount + ' WHERE id = ?';
        con.query(updateSimcha, [req.body.baalSimcha], function (error, results, fields) {
            if (error) {
                con.rollback(function () {
                    throw error;
                });
                return res.json({ error });
            }
        });
        var sql = "INSERT INTO contributor_details(contributor_id, simcha_id, amout_contributed, date_contributed) VALUES (?,?,?,now())";
        con.query(sql, [req.body.contributorName, req.body.baalSimcha, req.body.contributionAmount], (error, result) => {
            if (error) {
                con.rollback(function () {
                    throw err;
                });
                return res.json({ error });
            }
            res.redirect('./');
        });
        con.commit(function (err) {
            if (err) {
                con.rollback(function () {
                    throw err;
                });
            }
        });
    });
});

router.get('/changePassword', (req, res) => {
    res.render('template', { content: 'changePassword', styleSheet: '' });
});

router.post('/changePassword', (req, res) => {
    function hashPassword(newPassword) {
        bcrypt.hash(newPassword, 6, function (err, hash) {
            console.log('Admin newPassword', newPassword, 'Admin hash', hash);
            con.query("UPDATE admin SET password = ?", [hash], (err, results) => {
                res.redirect('./');
            });
        });
    }

    if (req.body.newPassword) {
        let oldPassword = req.body.oldPassword,
            newPassword = req.body.newPassword;

        var sql = "SELECT password FROM admin";
        con.query(sql, function (err, loginInfo) {
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
    req.session.req.session.adminLoggedIn = null;
    res.redirect('./');
});

module.exports = router;