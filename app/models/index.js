/*jslint nodejs:true*/
'use strict';

var mongoose = require('mongoose'),
    userSchema = require('./user');

module.exports = {
    User: mongoose.model('User', userSchema)
};
