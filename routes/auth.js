// 建立auth router
var express = require('express');
var router = express.Router();

var firebaseClient = require('../connections/firebase_client');

router.get('/signup', function(req, res) {
    let messages = req.flash('error');
    res.render('dashboard/signup', { messages, hasErrors: messages.length > 0});
})

router.post('/signup', function(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let confirmPassword = req.body.confirm_password;
    if( password !== confirmPassword) {
        req.flash('error', '確認密碼不相符')
        res.redirect('/auth/signup');
    }
    firebaseClient.auth().createUserWithEmailAndPassword(email, password)
        .then(function() {
            res.redirect('/auth/signin');
        })
        .catch(function(error) {
            console.log(error);
            req.flash('error', error.message);
            res.redirect('/auth/signup');
        })
})

router.get('/signin', function(req, res) {
    let messages = req.flash('error')
    res.render('dashboard/signin', { messages, hasErrors: messages.length > 0})
});

router.post('/signin', function(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    firebaseClient.auth().signInWithEmailAndPassword(email, password)
        .then(function(user) {
            // console.log(user);
            req.session.uid = user.user.uid;
            req.session.email = user.user.email;
            console.log(req.session.uid);
            res.redirect('/dashboard');
        })
        .catch(function(error) {
            req.flash('error', error.message);
            res.redirect('/auth/signin');
        })
});

router.get('/signout', function(req, res) {
    req.session.uid = '';
    req.session.email = '';
    res.redirect('/auth/signin');
})

module.exports = router;