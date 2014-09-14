/*jslint nodejs:true*/
'use strict';

var mongoose = require('mongoose');

var questionSchema = mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    _asker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = questionSchema;
