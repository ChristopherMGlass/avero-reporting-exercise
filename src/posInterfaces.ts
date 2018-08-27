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
export interface Business extends ServerData {
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