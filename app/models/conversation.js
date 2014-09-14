/*jslint nodejs:true*/
'use strict';

var mongoose = require('mongoose');

var conversationSchema = mongoose.Schema({
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    _users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    phoneNumber: {
        type: String,
        required: true
    }
});

module.exports = conversationSchema;
