import axios, { AxiosPromise, AxiosResponse, AxiosRequestConfig } from 'axios'
import { API_URL, AUTH_TOKEN, CHECK_PATH, LABOR_PATH, BUSINESS_PATH } from "./appConstants"

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

interface APIData{
    EmplyeeData:Promise<Employee[]>
    BusinesData:Promise<Business[]>
    CheckData:Promise<Check[]>
    LaborData:Promise<LaborEntry[]>
    ItemData:Promise<OrderedItem[]>
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
enum Interval {
    hour, day, month  //Week??
}
enum ReportType{
    LCP,FCP,EGS
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

function calcEGS(start: number, end: number, laborEntries: LaborEntry[], orderdItems: OrderedItem[], employees: Employee[]) {
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

}
async function buildEPSReport(interval: Interval, business: string,start:string,end:string, DataStruct:APIData) {
    let laborEntries:LaborEntry[]=await DataStruct.LaborData
     let orderdItems:OrderedItem[]=await DataStruct.ItemData
     let employees:Employee[]=await DataStruct.EmplyeeData
    
    let report={
        report:"EPS",
        timeInterval:interval,
        data:calcEGS(Date.parse(start),Date.parse(end),laborEntries,orderdItems,employees)
    }
    return report
}
function generateFCPReport() {

}