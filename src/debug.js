"use strict";
exports.__esModule = true;
var index_1 = require("./index");
var lily = new index_1["default"](function () {
    console.log('Hello World!');
}).then(function (val) { console.log('val :>> ', val); });
lily.then(function (val) { console.log(val); });
