
import { Request, Response } from 'express-serve-static-core';
import { getAllData } from './posAPI';
import { buildFCPReport, buildLCPReport, buildEGSReport} from './reports';
import { Interval, Report } from './reportingInterfaces';
import { Employee, LaborEntry, OrderedItem } from './posInterfaces';



interface URLParams {
    business_id: string,
    report: string,
    start: string,
    end: string,
    timeInterval: keyof typeof Interval
}

let DataStorage: DataStorage = { count: 0, data: {} }

export async function reportingController(req: Request, res: Response) {
    let requestParams = req.query

    try {
        validateParamsOrFail(requestParams)
    } catch (e) {
        console.error(e)
        res.status(400).send(e)
        res.end()
        return
    }
    let params: URLParams = requestParams
    let businessData: businessStore
    let intervalString: keyof typeof Interval = params.timeInterval
    let interval: Interval = Interval[intervalString]
    if (DataStorage.data[params.business_id]) {
        businessData = DataStorage.data[params.business_id]
    } else {
        businessData = await getAllData(params.business_id)
        DataStorage.data[businessData.id] = businessData
        DataStorage.count++
    }
    let report: Report
    try {
        switch (params.report) {
            case "FCP":
                report = buildFCPReport(interval, params.start, params.end, businessData.orderedItems)
                break;
            case "LCP":
                report = buildLCPReport(interval, params.start, params.end, businessData.laborEntries, businessData.orderedItems)
                break;
            case "EGS":
                report = buildEGSReport(interval, params.start, params.end, businessData.employees, businessData.orderedItems)
                break;
            default:
                console.error("Malformed Request: invalid report type")
                res.sendStatus(400)
                res.send("Malformed Request: invalid report type")
                res.end()
                return
        }
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
        res.end()
        return
    }
    res.status(200).json(report)

}

interface DataStorage {
    count: number,
    data: { [key: string]: businessStore }//key:value store
}

export interface businessStore {
    id: string,
    orderedItems: OrderedItem[],
    laborEntries: LaborEntry[],
    employees: Employee[]
}


function validateParamsOrFail(params: any) {
    let keys: string[] = ["business_id", "report",
        "start",
        "end",
        "timeInterval"]
    for (let idx in keys) {
        if (!params.hasOwnProperty(keys[idx])) {
            throw "Malformed Request: request is missing necessary paramters"
        }
    }
    try {
        new Date(params.start).toISOString()
        new Date(params.end).toISOString()
    } catch (e) {
        console.error(e)
        throw "Malformed Request: start and end times are expected to be ISO-8601 strings"
    }

    
}
