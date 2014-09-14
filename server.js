/*jslint nodejs:true*/

'use strict';

require('dotenv').load();

var express = require('express'),
    cons = require('consolidate'),
    path = require('path'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    mongoose = require('mongoose'),
    lodash = require('lodash'),
    app = express();

mongoose.connect(process.env.MONGOHQ_URL);
var models = require('./app/models');

var topics = [
    'Monkeys',
    'Bananas',
    'Trees'
];

app.engine('ejs', cons.ejs);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app', 'views'));
app.use(require('morgan')('dev'));
app.use(require('connect-assets')({
    paths: [
        'public/js',
        'public/css'
    ],
    servePath: 'assets'
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('cookie-session')({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: true
}));
app.use(require('body-parser').urlencoded());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    models.User.findOne({
        '_id': id
    }, function (err, user) {
        done(err, user);
    });
});

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackUrl: process.env.host + '/login/twitter/callback'
}, function (token, tokenSecret, profile, done) {
    models.User.findOne({
        'provider.name': profile.provider,
        'provider.id': profile.id
    }, function (err, user) {
        if (user) {
            return done(null, user);
        }

        user = new models.User({
            twitterUsername: profile.username,
            displayName: profile.displayName,
            about: profile._json.description,
            provider: {
                name: profile.provider,
                id: profile.id
            }
        });
        user.save(function (err) {
            return done(err, user);
        });
    });
}));

app.locals.pageClass = '';

app.get('/login/twitter', passport.authenticate('twitter'));
app.get('/login/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/secure/profile');
    }
);

app.use('/secure', function (req, res, next) {
    if (req.user) {
        return next();
    }
    res.redirect('/login/twitter');
});

app.get('/secure', function (req, res) {
    res.render('mentorSwitch', {
        title: 'Pick a side',
        pageClass: 'mentor-switch',
        user: req.user,
        topics: topics
    });
});

app.get('/secure/profile', function (req, res) {
    res.render('profile', {
        title: 'Profile',
        user: req.user,
        pageClass: 'profile-page',
        topics: topics
    });
});

app.post('/secure/profile', function (req, res) {
    if (req.body.gender !== req.user.gender) {
        if (req.body.gender === 'male' || req.body.gender === 'female') {
            req.body.otherGender = '';
        }
    }

    if (req.body.joinedKnownTopics) {
        req.user.knownTopics = req.body.joinedKnownTopics.split(',');
    }

    lodash.merge(req.user, req.body);
    req.user.activated = true;
    req.user.save(function (err) {
        if (err && err.name === 'ValidationError') {
            res.render('profile', {
                title: 'Profile',
                user: req.user,
                validationErrors: lodash.toArray(err.errors),
                pageClass: 'profile-page'
            });
            return;
        } else if (err) {
            res.status(500).send(err);
            return;
        }
        res.redirect('/secure/profile');
    });
});

app.get('/', function (req, res) {
    res.render('index', {
        title: 'WeeMentor',
        pageClass: 'logged-out'
    });
});

app.listen(process.env.PORT);
