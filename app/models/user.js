/*jslint nodejs:true*/
'use strict';

var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    twitterUsername: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        default: '',
        validate: function (val) {
            return !!val || !this.activated;
        }
    },
    otherGender: {
        type: String,
        default: ''
    },
    displayName: {
        type: String,
        unique: true,
        required: true
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
    knownTopics: [String],
    skills: {
        type: String,
        default: '',
        validate: function (val) {
            return !!val || !this.activated;
        }
    },
    provider: {
        name: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true,
            unique: true
        },
    },
    activated: {
        type: Boolean,
        default: false
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]
});

userSchema.virtual('displayableName').get(function () {
    return this.shouldShowScreenName ? this.displayName : this.name;
});

module.exports = userSchema;
