import axios, { AxiosPromise, AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios'
import { API_URL, AUTH_TOKEN, CHECK_PATH, LABOR_PATH, BUSINESS_PATH, EMPLOYEE_PATH, ORDERED_ITEMS_PATH, CONNECTION_TIMEOUT_LENGTH } from "./appConstants"
import { businessStore } from './server';
import { OrderedItem, Business, Check, RequestParams, Employee, Response, LaborEntry } from './posInterfaces';

/**
 * calls endpoint with increasing offset until all records are retrieved
 */
export async function getAllEntries<T>(requestconfig: AxiosRequestConfig): Promise<Response<T>> {
    let offset: number = 0
    let count: number = 1

    //call first time
    let tempDataStore: Promise<T[]>[] = []
    tempDataStore[0] = callService<T>(offset, requestconfig)
        .then<Response<T>, Response<T>>(handleResponse, handleError)
        .then((response: Response<T>) => {
            // console.log(response)
            count = response.count
            return (response.data)
        })
    await tempDataStore[0]
    offset += 500

    //create subsequent calls
    let i: number = 1
    for (; offset < count; offset += 500) {

        tempDataStore[i] = callService<T>(offset, requestconfig).then<Response<T>, Response<T>>(handleResponse, handleError)
            .then((callResponse: Response<T>) => {
                return (callResponse.data)
            })
        i++
    }

    //collect date from call promises
    let fullResponse: Response<T> = { count: count, data: [] }
    await Promise.all(tempDataStore).then(async values => {

        for (let idx in values) {
            if (values[idx] == []) {
                console.log("an error occured retrying")
                let index: any = idx
                let retryoffset = index * 500
                await callService<T>(retryoffset, requestconfig).then<Response<T>, Response<T>>(handleResponse, handleError).then((response) => {
                    fullResponse.data = fullResponse.data.concat(response.data)
                })
            } else {
                fullResponse.data = fullResponse.data.concat(values[idx])
            }
        }
    })

    return fullResponse
}


export function buildConfig(path: string, requestParams: RequestParams): AxiosRequestConfig {
    let requestConfig: AxiosRequestConfig = {
        method: 'get',
        baseURL: API_URL,
        timeout: CONNECTION_TIMEOUT_LENGTH,
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

export function handleError(rawResponse: AxiosError): Response {
    console.error("response error", rawResponse.code, rawResponse.config.params)
    // console.log(rawResponse)
    let result: Response = { data: [], count: -1 }
    return result
}

export function callService<T>(offset: number, requestConfig: AxiosRequestConfig): AxiosPromise<Response<T>> {
    requestConfig.params.offset = offset
    return axios(Object.assign({}, requestConfig))

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
    let itemConfig: AxiosRequestConfig = buildConfig(ORDERED_ITEMS_PATH, requestParams)

    let orderItems = getAllEntries<OrderedItem>(itemConfig).then(async (response: Response<OrderedItem>) => {
        return response.data
    })
    return orderItems


}
export function mergeCheckIntoItem(orderdItems: OrderedItem[], checks: Check[]) {
    let items: OrderedItem[] = orderdItems.map((item: OrderedItem) => {
        const itemCheck: Check | undefined = checks.find((check) => {
            return item.check_id == check.id && check.closed
        })
        if (itemCheck) {
            item.time = itemCheck.closed_at
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

export async function getAllData(bid: string): Promise<businessStore> {
    let items = await buildItems(bid)
    let labor = await buildLaborEntries(bid)
    let checks = await getAllChecks(bid)
    let employees = await getAllEmployees(bid)
    let mergedItems: OrderedItem[] = mergeCheckIntoItem(items, checks)
    return ({
        id: bid,
        orderedItems: mergedItems,
        laborEntries: labor,
        employees: employees
    })
}