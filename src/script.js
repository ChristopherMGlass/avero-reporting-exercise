let mergeCheckIntoItem=require("./getAllNodes").mergeCheckIntoItem

let testItems=require("../test/simpleItems.json")
let checks=require("../test/simpleCheks.json")

let result=mergeCheckIntoItem(testItems.data,checks.data)
console.log(result)