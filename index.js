/*jslint nodejs:true*/

'use strict';

require('dotenv').load();

var express = require('express'),
    cons = require('consolidate'),
    path = require('path'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    LinkedInStrategy = require('passport-linkedin').Strategy,
    app = express();

app.engine('ejs', cons.ejs);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app', 'views'));
app.use(require('connect-assets')({
    paths: [
        'public/js',
        'public/css'
    ],
    servePath: 'assets'
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackUrl: process.env.host + '/auth/twitter/callback'
}, function (token, tokenSecret, profile, done) {
    return done(null, profile);
}));

app.get('/login/twitter', passport.authenticate('twitter'));
app.get('/login/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login'}),
    function (req, res) {
        res.json(req.user);
    }
);

app.get('/', function (req, res) {
    res.render('index', {
        title: 'WeeMentor'
    });
});

app.listen(process.env.PORT);
