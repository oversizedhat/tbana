'use strict'
const lambda = require("./index.js");

lambda.handler({})
    .catch(err => {
        console.log("error=" + err);
    })
    .then(res => {
        console.log(res);
    });