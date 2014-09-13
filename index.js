/*jslint nodejs:true*/

'use strict';

require('dotenv').load();

var express = require('express'),
    cons = require('consolidate'),
    path = require('path'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    LinkedInStrategy = require('passport-linkedin').Strategy,
    mongoose = require('mongoose'),
    app = express();

mongoose.connect(process.env.MONGO_URL);
var models = require('./app/models');

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
    callbackUrl: process.env.host + '/auth/twitter/callback'
}, function (token, tokenSecret, profile, done) {
    models.User.findOne({
        'provider.name': profile.provider,
        'provider.id': profile.id
    }, function (err, user) {
        if (user) {
            return done(null, user);
        }

        user = new models.User({
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

app.get('/login/twitter', passport.authenticate('twitter'));
app.get('/login/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/secure/profile');
    }
);

app.use('/secure', function (req, res, next) {
    if (req.user) {
        return next();
    }
    res.redirect('/login');
});

app.get('/secure/profile', function (req, res) {
    res.render('profile', {
        title: 'Profile',
        user: req.user
    });
});

app.get('/', function (req, res) {
    res.render('index', {
        title: 'WeeMentor'
    });
});

app.listen(process.env.PORT);
