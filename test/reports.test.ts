import { buildFCPReport, Interval, buildEGSReport, buildLCPReport } from "../src/reports"
import { businessStore } from "../src/servet";
import { OrderedItem } from "../src/getAllNodes";
import testItems from "./orderedItems";
import 'mocha'
import { expect } from 'chai'
let laborEntries = require("./laborEntries.json");
let employees = require("./employees.json");


describe("report generation", () => {
    let start = "2018-06-02T01:00:00.000Z"
    let end = "2018-06-02T21:31:00.000Z"
    let testBusinessStore: businessStore = {
        id: "b2aeb27b-c85c-4ad8-83d4-d9511063d418",
        orderedItems: testItems,
        employees: employees.data,
        laborEntries: laborEntries.data
    }
    it("should generate EGS report", () => {
       let result= buildEGSReport(Interval.hour, start, end, testBusinessStore.employees,testBusinessStore.orderedItems)
            // expect(result.data.length).to.eql(3)
            console.log(result)

    })
    it("should generate FCP report", () => {
        let result=  buildFCPReport(Interval.day, start, end, testBusinessStore.orderedItems)
            // expect(result.data.length).to.eql(3)
            console.log(result)
    })
    it("should generate LCP report", () => {
        let result= buildLCPReport(Interval.day, start, end, testBusinessStore.laborEntries, testBusinessStore.orderedItems)
            // expect(result.data.length).to.eql(3)
            console.log(result)
    })
})