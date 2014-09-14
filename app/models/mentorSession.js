/*jslint nodejs:true*/
'use strict';

var mongoose = require('mongoose');

var mentorSessionSchema = mongoose.Schema({
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    topics: {
        type: [String],
        required: true
    },
    _mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mentorSessionSchema;
