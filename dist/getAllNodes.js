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
var axios_1 = require("axios");
var appConstants_1 = require("./appConstants");
/**
 * takes in a function that returns a count and last entry
 */
function getAllEntries(requestconfig) {
    return __awaiter(this, void 0, void 0, function () {
        var offset, count, response, fullEntryList, tempDataStore, i, _a, _b, fullResponse, pending;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    offset = 0;
                    count = 1;
                    response = { data: [], count: -1 };
                    fullEntryList = { data: [], count: -1 };
                    tempDataStore = [];
                    tempDataStore[0] = callService(offset, requestconfig)
                        .then(handleResponse, handleError)
                        .then(function (response) {
                        // console.log(response)
                        count = response.count;
                        return (response.data);
                    });
                    return [4 /*yield*/, tempDataStore[0]];
                case 1:
                    _c.sent();
                    offset += 500;
                    i = 1;
                    _c.label = 2;
                case 2:
                    if (!(offset < count)) return [3 /*break*/, 5];
                    // console.log("config",requestconfig.params)
                    tempDataStore[i] = callService(offset, requestconfig).then(handleResponse, handleError)
                        .then(function (callResponse) {
                        console.log("reponse data len", callResponse.data.length);
                        // console.log(callResponse.data[0])
                        return (callResponse.data);
                    });
                    _b = (_a = console).log;
                    return [4 /*yield*/, tempDataStore.length];
                case 3:
                    _b.apply(_a, [_c.sent()]);
                    i++;
                    _c.label = 4;
                case 4:
                    offset += 500;
                    return [3 /*break*/, 2];
                case 5:
                    fullResponse = { count: count, data: [] };
                    pending = Promise.all(tempDataStore).then(function (values) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _b, _i, idx, index, retryoffset;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = [];
                                    for (_b in values)
                                        _a.push(_b);
                                    _i = 0;
                                    _c.label = 1;
                                case 1:
                                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                                    idx = _a[_i];
                                    console.log(idx);
                                    if (!(values[idx] == [])) return [3 /*break*/, 3];
                                    console.log("an error occured retrying");
                                    index = idx;
                                    retryoffset = index * 500;
                                    return [4 /*yield*/, callService(retryoffset, requestconfig).then(handleResponse, handleError).then(function (response) {
                                            fullResponse.data = fullResponse.data.concat(response.data);
                                        })];
                                case 2:
                                    _c.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    console.log(values[idx].length);
                                    fullResponse.data = fullResponse.data.concat(values[idx]);
                                    _c.label = 4;
                                case 4:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, pending];
                case 6:
                    _c.sent();
                    return [2 /*return*/, fullResponse
                        // while (offset < count) {
                        //     console.log(count, offset)
                        //     requestconfig.params.offset = offset
                        //     try {
                        //         response = await callService<T>(requestconfig).then<Response<T>, Response<T>>(handleResponse, handleError)
                        //         offset += 500
                        //         count = response.count
                        //         fullEntryList.data = fullEntryList.data.concat(response.data)
                        //         fullEntryList.count = count
                        //     } catch (e) {
                        //         console.error(e)
                        //         // throw "error connecting to api endpoint"
                        //     }
                        // }
                    ];
            }
        });
    });
}
exports.getAllEntries = getAllEntries;
function buildConfig(path, requestParams) {
    var requestConfig = {
        method: 'get',
        baseURL: appConstants_1.API_URL,
        timeout: appConstants_1.CONNECTION_TIMEOUT_LENGTH,
        url: path,
        headers: { "Authorization": appConstants_1.AUTH_TOKEN },
        params: requestParams
    };
    return requestConfig;
}
exports.buildConfig = buildConfig;
function handleResponse(rawResponse) {
    if (rawResponse.status !== 200) {
        throw "HTTP Error:" + rawResponse.status + ' ' + rawResponse.statusText;
    }
    console.log("params:", rawResponse.config.params, rawResponse.data.data.length);
    var response = {
        data: rawResponse.data.data,
        count: rawResponse.data.count
    };
    return response;
}
exports.handleResponse = handleResponse;
function handleError(rawResponse) {
    console.error("response error", rawResponse.code, rawResponse.config.params);
    // console.log(rawResponse)
    var result = { data: [], count: -1 };
    return result;
}
exports.handleError = handleError;
function callService(offset, requestConfig) {
    requestConfig.params.offset = offset;
    console.log("call params", requestConfig.params);
    return axios_1.default(Object.assign({}, requestConfig));
}
exports.callService = callService;
function getAllChecks(bid) {
    return __awaiter(this, void 0, void 0, function () {
        var path, requestParams, checkConfig;
        return __generator(this, function (_a) {
            path = appConstants_1.CHECK_PATH;
            requestParams = {
                limit: 500,
                businiess_id: bid
            };
            checkConfig = buildConfig(path, requestParams);
            return [2 /*return*/, getAllEntries(checkConfig).then(function (response) {
                    return response.data;
                })];
        });
    });
}
exports.getAllChecks = getAllChecks;
function buildLaborEntries(bid) {
    return __awaiter(this, void 0, void 0, function () {
        var path, requestParams, laborConfig;
        return __generator(this, function (_a) {
            path = appConstants_1.LABOR_PATH;
            requestParams = {
                limit: 500,
                businiess_id: bid
            };
            laborConfig = buildConfig(path, requestParams);
            return [2 /*return*/, getAllEntries(laborConfig).then(function (response) {
                    return response.data;
                })];
        });
    });
}
exports.buildLaborEntries = buildLaborEntries;
function buildItems(bid) {
    return __awaiter(this, void 0, void 0, function () {
        var requestParams, itemConfig, orderItems;
        var _this = this;
        return __generator(this, function (_a) {
            requestParams = {
                limit: 500,
                businiess_id: bid
            };
            itemConfig = buildConfig(appConstants_1.ORDERED_ITEMS_PATH, requestParams);
            orderItems = getAllEntries(itemConfig).then(function (response) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    //return  mergeCheckIntoItem(response.data, await checks)
                    return [2 /*return*/, response.data];
                });
            }); });
            return [2 /*return*/, orderItems];
        });
    });
}
exports.buildItems = buildItems;
function mergeCheckIntoItem(orderdItems, checks) {
    console.log(orderdItems.length);
    var items = orderdItems.map(function (item) {
        if (!item) {
            console.log(items);
            console.log("length", items.length);
        }
        // console.log(item.check_id)
        var itemCheck = checks.find(function (check) {
            return item.check_id == check.id && check.closed;
        });
        if (itemCheck) {
            item.time = itemCheck.closed_at;
        }
        else {
            // console.log("check not found")
        }
        return item;
    });
    return items;
}
exports.mergeCheckIntoItem = mergeCheckIntoItem;
function getAllEmployees(bid) {
    return __awaiter(this, void 0, void 0, function () {
        var requestParams, laborConfig;
        return __generator(this, function (_a) {
            requestParams = {
                limit: 500,
                businiess_id: bid
            };
            laborConfig = buildConfig(appConstants_1.EMPLOYEE_PATH, requestParams);
            return [2 /*return*/, getAllEntries(laborConfig).then(function (response) {
                    return response.data;
                })];
        });
    });
}
function buildBusinessList() {
    return __awaiter(this, void 0, void 0, function () {
        var requestParams, laborConfig;
        return __generator(this, function (_a) {
            requestParams = {
                limit: 500
            };
            laborConfig = buildConfig(appConstants_1.BUSINESS_PATH, requestParams);
            return [2 /*return*/, getAllEntries(laborConfig).then(function (response) {
                    return response.data;
                })];
        });
    });
}
exports.buildBusinessList = buildBusinessList;
function getAllOrderedItems() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
exports.getAllOrderedItems = getAllOrderedItems;
// async function buildFCPReport(interval: Interval, business: string, start: string, end: string, DataStruct: APIData) {
//     let orderdItems: OrderedItem[] = await DataStruct.ItemData
//     let cost =
//         orderdItems.forEach(item => {
//             item.cost
//         });
// }
// function breakIntoTimeWindows(interval:Interval,start:string,end:string):number{
//     switch(interval){
//         case Interval.hour:
//             let numberWindows=Math.ceil((Date.parse(end)-Date.parse(start))/MS_IN_HOUR)
//         break;
//         case Interval.day:
//         case Interval.month:
//     }
// }
function getAllData(bid) {
    return __awaiter(this, void 0, void 0, function () {
        var items, labor, checks, employees, mergedItems;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, buildItems(bid)];
                case 1:
                    items = _a.sent();
                    return [4 /*yield*/, buildLaborEntries(bid)];
                case 2:
                    labor = _a.sent();
                    return [4 /*yield*/, getAllChecks(bid)];
                case 3:
                    checks = _a.sent();
                    return [4 /*yield*/, getAllEmployees(bid)];
                case 4:
                    employees = _a.sent();
                    mergedItems = mergeCheckIntoItem(items, checks);
                    console.log(mergedItems[0]);
                    return [2 /*return*/, ({
                            id: bid,
                            orderedItems: mergedItems,
                            laborEntries: labor,
                            employees: employees
                        })];
            }
        });
    });
}
exports.getAllData = getAllData;
//# sourceMappingURL=getAllNodes.js.map