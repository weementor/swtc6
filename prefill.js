/*jslint nodejs:true*/

'use strict';

require('dotenv').load();
var express = require('express'),
    mongoose = require('mongoose');

mongoose.connect(process.env.MONGOHQ_URL);
var models = require('./app/models');

models.User.findOne({displayName: 'Josh Kaplan'}).exec(function (err, fromUser) {
    console.log(err, fromUser);
    models.User.findOne({displayName: 'nrmlc'}).exec(function (err, toUser) {
        console.log(err, toUser);
        var conversation = new models.Conversation({
            _users: [
                fromUser._id,
                toUser._id
            ]
        });
        conversation.save(function (err) {
            fromUser.conversations.push(conversation._id);
            fromUser.save(function () {
                toUser.conversations.push(conversation._id);
                toUser.save(function () {
                    console.log('done');
                });
            });
        });
    });
});
