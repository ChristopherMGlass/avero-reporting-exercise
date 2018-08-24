"use strict";
var mergeCheckIntoItem = require("./getAllNodes").mergeCheckIntoItem;
var testItems = require("../test/simpleItems.json");
var checks = require("../test/simpleChecks.json");
var result = mergeCheckIntoItem(testItems.data, checks.data);
console.log(result);
//# sourceMappingURL=script.js.map