"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var appConstants_1 = require("./appConstants");
var Interval;
(function (Interval) {
    Interval["hour"] = "hour";
    Interval["day"] = "day";
    Interval["month"] = "month"; //Week??
})(Interval = exports.Interval || (exports.Interval = {}));
var ReportType;
(function (ReportType) {
    ReportType[ReportType["LCP"] = 0] = "LCP";
    ReportType[ReportType["FCP"] = 1] = "FCP";
    ReportType[ReportType["EGS"] = 2] = "EGS";
})(ReportType || (ReportType = {}));
function calcEGS(start, end, orderdItems, employees) {
    var EgsEntries = [];
    employees.forEach(function (entry) {
        var employee_data = employees.find(function (it) {
            return it.id == entry.id;
        });
        if (!employee_data) {
            throw "employee with id " + entry.id + " could not be found";
        }
        var employeeItems = orderdItems.filter(function (item) {
            return item.employee_id == entry.id;
        });
        var employeeSales = calcSales(start, end, employeeItems);
        EgsEntries.push({
            timeFrame: {
                start: new Date(start).toISOString(),
                end: new Date(end).toISOString()
            },
            employee: employee_data.first_name + ' ' + employee_data.last_name,
            value: employeeSales
        });
    });
    return EgsEntries;
}
function buildEGSReport(interval, start, end, employees, orderdItems) {
    var startDate = new Date(start);
    var endDate = new Date(end);
    var data = [];
    while (startDate.getTime() < endDate.getTime()) {
        var next = new Date(startDate);
        switch (interval) {
            case Interval.hour:
                next.setHours(startDate.getHours() + 1);
                break;
            case Interval.day:
                next.setDate(startDate.getDate() + 1);
                break;
            case Interval.month:
                next.setDate(startDate.getDate() + 1);
                break;
        }
        data = data.concat(calcEGS(startDate.getTime(), next.getTime(), orderdItems, employees));
        startDate = new Date(next);
    }
    var report = {
        report: "EGS",
        timeInterval: interval,
        data: data
    };
    return report;
}
exports.buildEGSReport = buildEGSReport;
function buildLCPReport(interval, start, end, laborData, salesData) {
    var startDate = new Date(start);
    var endDate = new Date(end);
    var data = [];
    console.log("building lcp report");
    while (startDate.getTime() < endDate.getTime()) {
        var next = new Date(startDate);
        switch (interval) {
            case Interval.hour:
                next.setHours(startDate.getHours() + 1);
                break;
            case Interval.day:
                next.setDate(startDate.getDate() + 1);
                break;
            case Interval.month:
                next.setMonth(startDate.getMonth() + 1);
                break;
            default:
                throw "invalid interval" + interval;
        }
        data.push({
            timeFrame: {
                start: startDate.toISOString(),
                end: next.toISOString()
            },
            value: getLCP(startDate.getTime(), next.getTime(), laborData, salesData)
        });
        startDate = next;
    }
    return ({
        report: "LCP",
        timeInterval: interval,
        data: data
    });
}
exports.buildLCPReport = buildLCPReport;
function getLCP(start, end, laborEntries, orderedItems) {
    var laborCost = 0;
    var sales = 0;
    laborEntries.forEach(function (entry) {
        var clock_in = new Date(entry.clock_in).getTime();
        var clock_out = new Date(entry.clock_out).getTime();
        if (clock_out >= start && clock_in <= end) {
            laborCost += entry.pay_rate * (Math.min(clock_out, end) - Math.max(start, clock_in)) / appConstants_1.MS_IN_HOUR;
        }
    });
    sales = calcSales(start, end, orderedItems);
    // there might be a way to leverage past calculations of sales revene but I don't see a clean/easy way atm
    // orderedItems.forEach((item: OrderedItem) => {
    //     if (!item.time) {
    //         // console.error("an item without a time is present in collected data")
    //         // console.log(item)
    //         return
    //     }
    //     let itemTime: number = new Date(item.time).getTime()
    //     if (!item.voided && itemTime > start && itemTime < end) {
    //         console.log("item added to sales")
    //         sales += item.price
    //     }
    // })
    console.log(laborCost, sales);
    return laborCost / sales * 100;
}
exports.getLCP = getLCP;
function buildFCPReport(interval, start, end, itemsStore) {
    var startDate = new Date(start);
    var endDate = new Date(end);
    var data = [];
    while (startDate.getTime() < endDate.getTime()) {
        var next = new Date(startDate);
        switch (interval) {
            case Interval.hour:
                next.setHours(startDate.getHours() + 1);
                break;
            case Interval.day:
                next.setDate(startDate.getDate() + 1);
                break;
            case Interval.month:
                next.setDate(startDate.getDate() + 1);
                break;
        }
        data.push({
            timeFrame: {
                start: startDate.toISOString(),
                end: next.toISOString()
            },
            value: getFCP(startDate.getTime(), next.getTime(), itemsStore)
        });
        startDate = next;
    }
    return ({
        report: "FCP",
        timeInterval: interval,
        data: data
    });
}
exports.buildFCPReport = buildFCPReport;
function getFCP(start, end, orderdItems) {
    var cost = 0;
    var sales = 0;
    orderdItems.forEach(function (item) {
        if (!item.time) {
            console.error("an item without a time is present in collected data");
            return;
        }
        var itemTime = new Date(item.time).getTime();
        if (itemTime > start && itemTime < end) {
            cost += item.cost;
            if (!item.voided) {
                sales += item.price;
            }
        }
    });
    return cost / sales * 100; // units are in percentages
}
function calcSales(start, end, items) {
    var sum = 0;
    items.forEach(function (item) {
        // console.log("eveluating Item")
        if (item.time && !item.voided && Date.parse(item.time) >= start && Date.parse(item.time) <= end) {
            sum += item.price;
            console.log("item added");
        }
    });
    return sum;
}
//todo make generic
function calcFoodCost(start, end, items) {
    var sum = 0;
    items.forEach(function (item) {
        if (item.time && Date.parse(item.time) >= start && Date.parse(item.time) <= end) {
            sum += item.cost;
        }
    });
    return sum;
}
//# sourceMappingURL=reports.js.map