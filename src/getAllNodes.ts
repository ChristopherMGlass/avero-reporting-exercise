import axios, { AxiosPromise, AxiosResponse, AxiosRequestConfig } from 'axios'
import { API_URL, AUTH_TOKEN, CHECK_PATH, LABOR_PATH, BUSINESS_PATH, MS_IN_HOUR } from "./appConstants"

/**
 * takes in a function that returns a count and last entry
 */
export async function getAllEntries<T>(requestconfig: AxiosRequestConfig): Promise<Response<T>> {
    let offset: number = 0
    let count: number = 1
    let response: Response<T> = { data: [], count: -1 }
    let fullEntryList: Response<T> = { data: [], count: -1 }
    while (offset < count) {
        requestconfig.params.offset = offset
        try {
            response = await callService<T>(requestconfig).then<Response<T>, Response<T>>(handleResponse, handleError)
        } catch (e) {
            console.error(e)
            return { data: [], count: -1 }
        }
        offset = response.data.length
        count = response.count
        fullEntryList.data = fullEntryList.data.concat(response.data)
        fullEntryList.count = count
    }
    return fullEntryList
}

export interface Response<T= any> {
    count: number,
    data: T[],
}
interface ServerData {
    id: string,
    created_at: string
    updated_at: string
}

export interface RequestParams {
    limit: number,
    businiess_id?: string,
    offset?: number,
    employee_id?: string,
}
interface OrderedItem extends ServerData {
    business_id: string,
    employee_id: string
    check_id: string
    item_id: string
    name: string,
    cost: number
    price: number,
    voided: boolean,
    time?: string
}

interface LaborEntry extends ServerData {
    business_id: string,
    employee_id: string
    clock_in: string
    clock_out: string
    pay_rate: number
    price: number,
    voided: boolean
}
interface Check extends ServerData {
    business_id: string,
    employee_id: string
    name: string
    closed: boolean
    closed_at: string
    price: number,
    voided: boolean
}
interface Business extends ServerData {
    name: string,
    hours: number[]
}
interface Employee extends ServerData {
    business_id: string,
    first_name: string,
    last_name: string,
    pay_rate: number
}

interface APIData {
    EmplyeeData: Promise<Employee[]>
    BusinesData: Promise<Business[]>
    CheckData: Promise<Check[]>
    LaborData: Promise<LaborEntry[]>
    ItemData: Promise<OrderedItem[]>
}

interface TimeFrame {
    start: string,
    end: string
}
interface Report {
    timeFrame: TimeFrame,
}
interface EGSReportEntry extends Report {
    employee: string
    value: number
}
interface FCPEntry extends Report {
    value: number
}
interface LCPEntry extends Report {
    value: number
}
enum Interval {
    hour = "hour", day = "day", month = "month"  //Week??
}
enum ReportType {
    LCP, FCP, EGS
}
export function buildConfig(path: string, requestParams: RequestParams): AxiosRequestConfig {
    let requestConfig: AxiosRequestConfig = {
        method: 'get',
        baseURL: API_URL,
        url: path,
        headers: { "Authorization": AUTH_TOKEN },
        params: requestParams
    }
    return requestConfig
}



export function handleResponse<T>(rawResponse: AxiosResponse): Response<T> {
    if (rawResponse.status !== 200) {
        throw "HTTP Error:" + rawResponse.status + ' ' + rawResponse.statusText
    }
    let response: Response<T> = {
        data: rawResponse.data.data,
        count: rawResponse.data.count
    }
    return response

}

export function handleError(rawResponse: AxiosResponse): Response {
    console.log(rawResponse)
    console.error("response error")
    let result: Response = { data: [], count: -1 }
    return result
}
type ServiceCall = (arg: AxiosRequestConfig) => AxiosPromise

export function callService<T>(requestConfig: AxiosRequestConfig): AxiosPromise<Response<T>> {
    return axios(requestConfig)

}


export async function getAllChecks(bid: string) {
    let path: string = CHECK_PATH
    let requestParams: RequestParams = {
        limit: 500,
        businiess_id: bid
    }
    let checkConfig = buildConfig(path, requestParams)
    // getAllEntries(checkConfig)
}

export async function buildLaborEntries(bid: string): Promise<LaborEntry[]> {
    let path: string = LABOR_PATH
    let requestParams: RequestParams = {
        limit: 500,
        businiess_id: bid
    }
    let laborConfig = buildConfig(path, requestParams)
    return getAllEntries<LaborEntry>(laborConfig).then((response: Response<LaborEntry>) => {
        return response.data
    })
}

export async function buildItems(bid: string): Promise<OrderedItem[]> {
    let requestParams: RequestParams = {
        limit: 500,
        businiess_id: bid
    }
    let checkConfig = buildConfig(CHECK_PATH, requestParams)
    let checks = getAllEntries<Check>(checkConfig).then(response => {
        return response.data
    })

    let itemConfig: AxiosRequestConfig = buildConfig(LABOR_PATH, requestParams)
    let orderItems = getAllEntries<OrderedItem>(itemConfig).then((response: Response<OrderedItem>) => {
        let items: OrderedItem[] = response.data.map((item: OrderedItem) => {

            checks.then((checksList: Check[]) => {
                const itemCheck: Check | undefined = checksList.find((check) => {
                    return item.check_id == check.id && check.closed
                })
                if (itemCheck) {
                    item.time = itemCheck.closed_at
                }
            })
            return item
        });
        return items
    })
    return orderItems

}

export async function buildBusinessList() {
    let requestParams: RequestParams = {
        limit: 500
    }
    let laborConfig = buildConfig(BUSINESS_PATH, requestParams)
    return getAllEntries<Business>(laborConfig).then((response: Response<Business>) => {
        return response.data
    })
}

export async function getAllOrderedItems() {

}

function calcSales(start: number, end: number, items: OrderedItem[]) {
    let sum: number = 0
    items.forEach((item: OrderedItem) => {
        if (item.time && Date.parse(item.time) >= start && Date.parse(item.time) <= end) {
            sum += item.price
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

function calcEGS(start: number, end: number, laborEntries: LaborEntry[], orderdItems: OrderedItem[], employees: Employee[]): EGSReportEntry[] {
    let EgsEntries: EGSReportEntry[] = []
    laborEntries.forEach((entry: LaborEntry) => {
        if (Date.parse(entry.clock_out) >= start && Date.parse(entry.clock_in) <= end) {
            let employee_data = employees.find(it => {
                return it.id == entry.employee_id
            })
            if (!employee_data) {
                throw "employee with id " + entry.employee_id + " could not be found"
            }
            let employeeItems: OrderedItem[] = orderdItems.filter((item: OrderedItem) => {
                item.employee_id == entry.employee_id
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
        }
    })
    return EgsEntries

}
// async function buildFCPReport(interval: Interval, business: string, start: string, end: string, DataStruct: APIData) {
//     let orderdItems: OrderedItem[] = await DataStruct.ItemData
//     let cost =
//         orderdItems.forEach(item => {
//             item.cost
//         });
// }

async function buildEGSReport(interval: Interval, business: string, start: string, end: string, DataStruct: APIData) {
    let laborEntries: LaborEntry[] = await DataStruct.LaborData
    let orderdItems: OrderedItem[] = await DataStruct.ItemData
    let employees: Employee[] = await DataStruct.EmplyeeData

    let startDate = new Date(start)
    let endDate = new Date(end)
    let data: EGSReportEntry[] = []
    while (startDate.getTime() < endDate.getTime()) {
        let next: Date = startDate
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
        data = data.concat(calcEGS(startDate.getTime(), endDate.getTime(), laborEntries, orderdItems, employees))
        startDate = next
    }
    let report = {
        report: "EGS",
        timeInterval: interval,
        data: data
    }
    return report
}
function buildLCPReport(interval: Interval, start: string, end: string) {
    let startDate = new Date(start)
    let endDate = new Date(end)
    let data: LCPEntry[] = []
    while (startDate.getTime() < endDate.getTime()) {
        let next: Date = startDate
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
        data = data.concat({
            timeFrame: {
                start: startDate.toISOString(),
                end: next.toISOString()
            },
            value: getLCP(startDate.getTime(), endDate.getTime())
        }
        )
        startDate = next
    }
}
function getLCP(start: number, end: number): number {
    let laborEntries: LaborEntry[] = []
    let orderdItems: OrderedItem[] = []
    let laborCost: number = 0
    let sales:number=0
    laborEntries.forEach((entry: LaborEntry) => {
        let clock_in: number = new Date(entry.clock_out).getTime()
        let clock_out: number = new Date(entry.clock_out).getTime()
        if (clock_out > start && clock_in < end) {
            laborCost += entry.pay_rate * (Math.min(clock_out, end) - Math.max(start, clock_in)) / MS_IN_HOUR
        }
    })
    // there might be a way to leverage past calculations of sales revene but I don't see a clean/easy way atm
    orderdItems.forEach((item:OrderedItem)=>{
        if (!item.time) {
            console.error("an item without a time is present in collected data")
            return
        }
        let itemTime: number = new Date(item.time).getTime()
        if (!item.voided && itemTime > start && itemTime < end) {
            sales += item.price
        }
    })
    return laborCost/sales * 100
}
function buildFCPReport(interval: Interval, start: string, end: string) {
    let startDate = new Date(start)
    let endDate = new Date(end)
    let data: FCPEntry[] = []
    while (startDate.getTime() < endDate.getTime()) {
        let next: Date = startDate
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
        data = data.concat({
            timeFrame: {
                start: startDate.toISOString(),
                end: next.toISOString()
            },
            value: getFCP(startDate.getTime(), endDate.getTime())
        }
        )
        startDate = next
    }
}
function getFCP(start: number, end: number) {
    let orderdItems: OrderedItem[] = []
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
            if(!item.voided){
                sales += item.price
            }
        }
    })

    return cost / sales * 100  // units are in percentages
}

// function breakIntoTimeWindows(interval:Interval,start:string,end:string):number{
//     switch(interval){
//         case Interval.hour:
//             let numberWindows=Math.ceil((Date.parse(end)-Date.parse(start))/MS_IN_HOUR)
//         break;
//         case Interval.day:
//         case Interval.month:
//     }
// }

function startServer(){
    server= express()
}