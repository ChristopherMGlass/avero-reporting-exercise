import { OrderedItem, LaborEntry, Employee } from "./getAllNodes";
import { businessStore } from "./servet";
import { MS_IN_HOUR } from "./appConstants";

interface TimeFrame {
    start: string,
    end: string
}
export interface Report {
    timeInterval: string,
    report: string,
    data: ReportEntry[]
}
interface ReportEntry {
    timeFrame: TimeFrame,
}
interface EGSReportEntry extends ReportEntry {
    employee: string
    value: number
}
interface FCPEntry extends ReportEntry {
    value: number
}
interface LCPEntry extends ReportEntry {
    value: number
}

export enum Interval {
    hour = "hour", day = "day", month = "month"  //Week??
}
enum ReportType {
    LCP, FCP, EGS
}

function calcEGS(start: number, end: number, orderdItems: OrderedItem[], employees: Employee[]): EGSReportEntry[] {
    let EgsEntries: EGSReportEntry[] = []
    employees.forEach((entry: Employee) => {

        let employee_data = employees.find(it => {
            return it.id == entry.id
        })
        if (!employee_data) {
            throw "employee with id " + entry.id + " could not be found"
        }
        let employeeItems: OrderedItem[] = orderdItems.filter((item: OrderedItem) => {
            return item.employee_id == entry.id
        })
        let employeeSales = calcSales(start, end, employeeItems)
        EgsEntries.push(
            {
                timeFrame: {
                    start: new Date(start).toISOString(),
                    end: new Date(end).toISOString()
                },
                employee: employee_data.first_name + ' ' + employee_data.last_name,
                value: employeeSales

            }
        )
    })
    return EgsEntries

}

export function buildEGSReport(interval: Interval, start: string, end: string, employees: Employee[], orderdItems: OrderedItem[]): Report {
    let startDate = new Date(start)
    let endDate = new Date(end)
    let data: EGSReportEntry[] = []
    while (startDate.getTime() < endDate.getTime()) {
        let next: Date = new Date(startDate)
        switch (interval) {
            case Interval.hour:
                next.setHours(startDate.getHours() + 1)
                break;
            case Interval.day:
                next.setDate(startDate.getDate() + 1)
                break;
            case Interval.month:
                next.setDate(startDate.getDate() + 1)
                break;
        }
        data = data.concat(calcEGS(startDate.getTime(), next.getTime(), orderdItems, employees))
        startDate = new Date(next)
    }
    let report: Report = {
        report: "EGS",
        timeInterval: interval,
        data: data
    }
    return report
}
export function buildLCPReport(interval: Interval, start: string, end: string, laborData: LaborEntry[], salesData: OrderedItem[]): Report {
    let startDate = new Date(start)
    let endDate = new Date(end)
    let data: LCPEntry[] = []
    console.log("building lcp report")
    while (startDate.getTime() < endDate.getTime()) {
        let next: Date = new Date(startDate)
        switch (interval) {
            case Interval.hour:
                next.setHours(startDate.getHours() + 1)
                break;
            case Interval.day:
                next.setDate(startDate.getDate() + 1)
                break;
            case Interval.month:
                next.setMonth(startDate.getMonth() + 1)
                break;
            default:
                throw "invalid interval" +interval
        }
        data.push({
            timeFrame: {
                start: startDate.toISOString(),
                end: next.toISOString()
            },
            value: getLCP(startDate.getTime(), next.getTime(), laborData, salesData)
        }
        )
        startDate = next
    }
    return ({
        report: "LCP",
        timeInterval: interval,
        data: data
    }

    )
}
export function getLCP(start: number, end: number, laborEntries: LaborEntry[], orderedItems: OrderedItem[]): number {
    let laborCost: number = 0
    let sales: number = 0
    laborEntries.forEach((entry: LaborEntry) => {
        let clock_in: number = new Date(entry.clock_in).getTime()
        let clock_out: number = new Date(entry.clock_out).getTime()
        if (clock_out >= start && clock_in <= end) {
            laborCost += entry.pay_rate * (Math.min(clock_out, end) - Math.max(start, clock_in)) / MS_IN_HOUR

        }
    })

    sales=calcSales(start,end,orderedItems)
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
    console.log(laborCost,sales)
    return laborCost / sales * 100
}
export function buildFCPReport(interval: Interval, start: string, end: string, itemsStore: OrderedItem[]) {
    let startDate = new Date(start)
    let endDate = new Date(end)
    let data: FCPEntry[] = []
    while (startDate.getTime() < endDate.getTime()) {
        let next: Date = new Date(startDate)
        switch (interval) {
            case Interval.hour:
                next.setHours(startDate.getHours() + 1)
                break;
            case Interval.day:
                next.setDate(startDate.getDate() + 1)
                break;
            case Interval.month:
                next.setDate(startDate.getDate() + 1)
                break;
        }
        data.push({
            timeFrame: {
                start: startDate.toISOString(),
                end: next.toISOString()
            },
            value: getFCP(startDate.getTime(), next.getTime(), itemsStore)
        }
        )
        startDate = next
    }
    return ({
        report: "FCP",
        timeInterval: interval,
        data: data
    })
}
function getFCP(start: number, end: number, orderdItems: OrderedItem[]) {
    let cost: number = 0
    let sales: number = 0
    orderdItems.forEach((item: OrderedItem) => {
        if (!item.time) {
            console.error("an item without a time is present in collected data")
            return
        }
        let itemTime: number = new Date(item.time).getTime()
        if (itemTime > start && itemTime < end) {
            cost += item.cost
            if (!item.voided) {
                sales += item.price
            }
        }
    })

    return cost / sales * 100  // units are in percentages
}

function calcSales(start: number, end: number, items: OrderedItem[]): number {
    let sum: number = 0
    items.forEach((item: OrderedItem) => {
        // console.log("eveluating Item")
        if (item.time && !item.voided && Date.parse(item.time) >= start && Date.parse(item.time) <= end) {
            sum += item.price
            console.log("item added")
        }
    })
    return sum
}


//todo make generic
function calcFoodCost(start: number, end: number, items: OrderedItem[]) {
    let sum: number = 0
    items.forEach((item: OrderedItem) => {
        if (item.time && Date.parse(item.time) >= start && Date.parse(item.time) <= end) {
            sum += item.cost
        }
    })
    return sum
}
