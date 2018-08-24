import axios, { AxiosPromise, AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios'
import { API_URL, AUTH_TOKEN, CHECK_PATH, LABOR_PATH, BUSINESS_PATH, MS_IN_HOUR, EMPLOYEE_PATH, ORDERED_ITEMS_PATH, CONNECTION_TIMEOUT_LENGTH } from "./appConstants"
import { businessStore } from './servet';

/**
 * takes in a function that returns a count and last entry
 */
export async function getAllEntries<T>(requestconfig: AxiosRequestConfig): Promise<Response<T>> {
    let offset: number = 0
    let count: number = 1
    let response: Response<T> = { data: [], count: -1 }
    let fullEntryList: Response<T> = { data: [], count: -1 }

    //Simple while loop result in intermittent timeout errors

    //call first time
    let tempDataStore: Promise<T[]>[] = []
    tempDataStore[0] = callService<T>(offset,requestconfig)
        .then<Response<T>, Response<T>>(handleResponse, handleError)
        .then((response: Response<T>) => {
            // console.log(response)
            count = response.count
            return (response.data)
        })
    await tempDataStore[0]
    offset += 500
    // fullEntryList.count = response.count

    //create subsequnet calls
    let i: number = 1
    for (; offset < count; offset += 500) {
        
        // console.log("config",requestconfig.params)
        tempDataStore[i] = callService<T>(offset,requestconfig).then<Response<T>, Response<T>>(handleResponse, handleError)
            .then((callResponse: Response<T>) => {
                console.log("reponse data len",callResponse.data.length)
                // console.log(callResponse.data[0])
                return (callResponse.data)
            })
        console.log(await tempDataStore.length)
        i++
    }
    // console.log(count,offset)
    // console.log(tempDataStore.length)
    let fullResponse: Response<T> = { count: count, data: [] }
    let pending = Promise.all(tempDataStore).then(async values => {
        
        for (let idx in values) {
            console.log(idx)
            if (values[idx] == []) {
                console.log("an error occured retrying")
                let index: any = idx
                let retryoffset = index * 500
                await callService<T>(retryoffset,requestconfig).then<Response<T>, Response<T>>(handleResponse, handleError).then((response) => {
                    fullResponse.data = fullResponse.data.concat(response.data)
                })
            } else {
                console.log(values[idx].length)
                fullResponse.data = fullResponse.data.concat(values[idx])
            }
        }
    })
    await pending

    return fullResponse


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
}

interface ResoltionTracker<T> {
    resolved: boolean,
    offset: number,
    promise: Promise<any>
}
export interface Response<T= any> {
    count: number,
    data: T[],
}
export interface ServerData {
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
export interface OrderedItem extends ServerData {
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

export interface LaborEntry extends ServerData {
    business_id: string,
    employee_id: string
    clock_in: string
    clock_out: string
    pay_rate: number
    price: number,
    voided: boolean
}
export interface Check extends ServerData {
    business_id: string,
    employee_id: string
    name: string
    closed: boolean
    closed_at: string
}
interface Business extends ServerData {
    name: string,
    hours: number[]
}
export interface Employee extends ServerData {
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



export function buildConfig(path: string, requestParams: RequestParams): AxiosRequestConfig {
    let requestConfig: AxiosRequestConfig = {
        method: 'get',
        baseURL: API_URL,
        timeout:CONNECTION_TIMEOUT_LENGTH,
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
    console.log("params:",rawResponse.config.params,rawResponse.data.data.length)
    let response: Response<T> = {
        data: rawResponse.data.data,
        count: rawResponse.data.count
    }
    return response

}

export function handleError(rawResponse: AxiosError): Response {
    console.error("response error", rawResponse.code, rawResponse.config.params)
    // console.log(rawResponse)
    let result: Response = { data: [], count: -1 }
    return result
}

export function callService<T>(offset:number,requestConfig: AxiosRequestConfig): AxiosPromise<Response<T>> {
    requestConfig.params.offset=offset
    console.log("call params",requestConfig.params)
    return axios(Object.assign({},requestConfig))

}


export async function getAllChecks(bid: string): Promise<Check[]> {
    let path: string = CHECK_PATH
    let requestParams: RequestParams = {
        limit: 500,
        businiess_id: bid
    }
    let checkConfig = buildConfig(path, requestParams)
    return getAllEntries<Check>(checkConfig).then((response: Response<Check>) => {
        return response.data
    })
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
    // let checkConfig = buildConfig(CHECK_PATH, requestParams)
    // let checks = getAllEntries<Check>(checkConfig).then(response => {
    //     return response.data
    // })
    //TODO - what do I have to do???
    let itemConfig: AxiosRequestConfig = buildConfig(ORDERED_ITEMS_PATH, requestParams)

    let orderItems = getAllEntries<OrderedItem>(itemConfig).then(async (response: Response<OrderedItem>) => {
        //return  mergeCheckIntoItem(response.data, await checks)
        return response.data
    })
    return orderItems


}
export function mergeCheckIntoItem(orderdItems: OrderedItem[], checks: Check[]) {
    console.log(orderdItems.length)
    let items: OrderedItem[] = orderdItems.map((item: OrderedItem) => {
        if (!item) {
            console.log(items)
            console.log("length",items.length)
        }
        // console.log(item.check_id)
        const itemCheck: Check | undefined = checks.find((check) => {
            return item.check_id == check.id && check.closed
        })
        if (itemCheck) {
            item.time = itemCheck.closed_at
        } else {
            // console.log("check not found")
        }
        return item
    });
    return items
}

async function getAllEmployees(bid: string) {
    let requestParams: RequestParams = {
        limit: 500,
        businiess_id: bid
    }
    let laborConfig = buildConfig(EMPLOYEE_PATH, requestParams)
    return getAllEntries<Employee>(laborConfig).then((response: Response<Employee>) => {
        return response.data
    })
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


export async function getAllData(bid: string): Promise<businessStore> {
    let items = await buildItems(bid)
    let labor = await buildLaborEntries(bid)
    let checks = await getAllChecks(bid)
    let employees = await getAllEmployees(bid)
    let mergedItems:OrderedItem[] = mergeCheckIntoItem(items, checks)
    console.log(mergedItems[0])
    return ({
        id: bid,
        orderedItems: mergedItems,
        laborEntries: labor,
        employees: employees
    })
}