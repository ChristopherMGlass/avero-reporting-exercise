"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var getAllNodes_1 = require("./getAllNodes");
var reports_1 = require("./reports");
var server = express();
server.get('/reporting', reportingController);
var DataStorage = { count: 0, data: {} };
function reportingController(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var requestParams, params, businessData, intervalString, interval, report;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestParams = req.query;
                    try {
                        validateParamsOrFail(requestParams);
                    }
                    catch (e) {
                        console.error(e);
                        res.status(400).send(e);
                        res.end();
                        return [2 /*return*/];
                        //TODO build error response
                    }
                    params = requestParams;
                    intervalString = params.timeInterval;
                    interval = reports_1.Interval[intervalString];
                    if (!DataStorage.data[params.business_id]) return [3 /*break*/, 1];
                    businessData = DataStorage.data[params.business_id];
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, getAllNodes_1.getAllData(params.business_id)];
                case 2:
                    businessData = _a.sent();
                    DataStorage.data[businessData.id] = businessData;
                    DataStorage.count++;
                    _a.label = 3;
                case 3:
                    try {
                        switch (params.report) {
                            case "FCP":
                                report = reports_1.buildFCPReport(interval, params.start, params.end, businessData.orderedItems);
                                break;
                            case "LCP":
                                report = reports_1.buildLCPReport(interval, params.start, params.end, businessData.laborEntries, businessData.orderedItems);
                                break;
                            case "EGS":
                                report = reports_1.buildEGSReport(interval, params.start, params.end, businessData.employees, businessData.orderedItems);
                                break;
                            default:
                                //ToDO return error
                                console.error("Malformed Request: invalid report type");
                                res.sendStatus(400);
                                res.send("Malformed Request: invalid report type");
                                res.end();
                                return [2 /*return*/];
                        }
                    }
                    catch (e) {
                        console.error(e);
                        res.sendStatus(500);
                        res.end();
                        return [2 /*return*/];
                    }
                    res.status(200).json(report);
                    return [2 /*return*/];
            }
        });
    });
}
function validateParamsOrFail(params) {
    var keys = ["business_id", "report",
        "start",
        "end",
        "timeInterval"];
    for (var idx in keys) {
        if (!params.hasOwnProperty(keys[idx])) {
            throw "Malformed Request: request is missing necessary paramters";
        }
    }
    try {
        new Date(params.start).toISOString();
        new Date(params.end).toISOString();
    }
    catch (e) {
        console.error(e);
        throw "Malformed Request: start and end times are expected to be ISO-8601 strings";
    }
    reports_1.Interval;
}
exports.default = server;
server.get('*', function (req, res) {
    console.log("404'd request");
    res.sendStatus(404);
    res.end();
});
//# sourceMappingURL=servet.js.map