/*jslint nodejs:true*/
'use strict';

var mongoose = require('mongoose'),
    userSchema = require('./user'),
    questionSchema = require('./question'),
    mentorSessionSchema = require('./mentorSession');

module.exports = {
    User: mongoose.model('User', userSchema),
    Question: mongoose.model('Question', questionSchema),
    MentorSession: mongoose.model('MentorSession', mentorSessionSchema)
};
