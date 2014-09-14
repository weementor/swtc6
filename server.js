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
    twilio = require('twilio'),
    phone = require('phone'),
    app = express();

mongoose.connect(process.env.MONGOHQ_URL);
var models = require('./app/models');

var topics = [
    'AngularJS',
    'Career Path',
    'Culture',
    'Difficult Co-workers',
    'Innovation',
    'Leadership',
    'Mentorship',
    'Overcoming Challenges',
    'Personal Development',
    'Salary Negotiation'
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
app.use(require('body-parser').json());
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

    req.body.phoneNumber = phone(req.body.phoneNumber)[0];

    lodash.merge(req.user, req.body);
    req.user.activated = true;
    req.user.save(function (err) {
        if (err && err.name === 'ValidationError') {
            res.render('profile', {
                title: 'Profile',
                user: req.user,
                validationErrors: lodash.toArray(err.errors),
                pageClass: 'profile-page',
                topics: topics
            });
            return;
        } else if (err) {
            res.status(500).send(err);
            return;
        }
        res.redirect('/secure');
    });
});

app.get('/secure/mentors/:questionId', function (req, res) {
    var questionId = req.param('questionId');
    models.Question.findOne({_id: questionId}).populate('_asker').exec(function (err, question) {
        models.MentorSession.find().where('topics').in([
            question.topic
        ]).where('_mentor').ne(req.user._id).populate('_mentor').exec(function (err, mentors) {
            res.json(lodash.uniq(mentors, function (mentor) {
                return mentor._mentor._id;
            }));
        });
    });
});

app.post('/secure/mentors', function (req, res) {
    var mentorSession = new models.MentorSession(req.body);
    mentorSession._mentor = req.user._id;
    mentorSession.save(function (err) {
        if (err) {
            return res.status(407).json(err);
        }

        res.json(mentorSession);
    });
});

app.get('/secure/user/questions', function (req, res) {
    models.Question.find({_asker: req.user.id}).populate('_asker').exec(function (err, questions) {
        res.json(questions);
    });
});

app.get('/secure/users/:userId', function (req, res) {
    var userId = req.param('userId');
    models.User.findOne({_id: userId}).exec(function (err, user) {
        res.json(user);
    });
});

app.get('/secure/questions/:mentorSessionId', function (req, res) {
    var mentorSessionId = req.param('mentorSessionId');
    models.MentorSession.findOne({_id: mentorSessionId}).populate('_mentor').exec(function (err, mentorSession) {
        models.Question.find({
            'topic': {
                '$in': mentorSession.topics
            }
        }).sort({
            created: 'desc'
        }).where('_asker').ne(req.user._id).populate('_asker').exec(function (err, questions) {
            res.json(questions);
        });
    });
});

app.post('/secure/user/questions', function (req, res) {
    var question = new models.Question(req.body);
    question._asker = req.user._id;
    question.save(function (err) {
        if (err) {
            return res.status(407).json(err);
        }

        res.json(question);
    });
});

app.post('/secure/conversations', function (req, res) {
    var fromUser = req.user;
    models.User.findOne({
        _id: req.body.toUser
    }).exec(function (err, toUser) {
        var conversation = new models.Conversation({
            _users: [
                fromUser._id,
                toUser._id
            ],
            phoneNumber: process.env.PHONE_NUMBER
        });
        conversation.save(function (err) {
            if (err) {
                console.log(err);
            }
            fromUser.conversation = conversation._id;
            toUser.conversation = conversation._id;
            fromUser.save(function () {
                toUser.save(function () {
                    res.json(conversation);
                });
            });
        });
    });
});

app.post('/sms/entry', function (req, res) {
    var fromNumber = phone(req.body.From)[0];

    models.User.findOne({phoneNumber: fromNumber}).populate('conversation').exec(function (err, user) {
        if (!user.conversation) {
            return res.end();
        }

        var conversation = user.conversation;

        models.User.findOne({
            conversation: conversation._id
        }).ne('_id', user._id).exec(function (err, toUser) {
            if (err) {
                return res.send();
            }

            var twiml = new twilio.TwimlResponse();
            twiml.message({
                to: toUser.phoneNumber
            }, function () {
                this.body('' + user.displayName + ': ' + req.body.Body);
            });

            res.send(twiml.toString());
        });
    });
});

app.get('/secure/qmunnity', function (req, res) {
    res.render('qmunnity', {
        title: 'Q-munnity',
        pageClass: 'qmunnity'
    });
});

app.get('/', function (req, res) {
    res.render('index', {
        title: 'WeeMentor',
        pageClass: 'logged-out'
    });
});

app.listen(process.env.PORT);
