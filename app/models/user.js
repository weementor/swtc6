/*jslint nodejs:true*/
'use strict';

var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    displayName: {
        type: String,
        unique: true
    },
    about: {
        type: String,
        required: true,
        validate: function (val) {
            return val.length <= 160;
        }
    },
    industry: String,
    yearsExperience: Number,
    knownTopics: [{
        name: String
    }],
    provider: {
        name: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },

    }
});

module.exports = userSchema;
