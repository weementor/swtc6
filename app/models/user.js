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
        default: '',
        validate: function (val) {
            return val.length <= 160 && (!this.activated || !!val);
        }
    },
    industry: {
        type: String,
        default: '',
        validate: function (val) {
            return !!val || !this.activated;
        }
    },
    yearsExperience: {
        type: String,
        default: '<3',
    },
    knownTopics: [{
        name: String
    }],
    skills: [{
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
    },
    activated: {
        type: Boolean,
        default: false
    }
});

module.exports = userSchema;
