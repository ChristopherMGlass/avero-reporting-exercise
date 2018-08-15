import express, { Response } from 'express'
import { Request } from '../node_modules/@types/express-serve-static-core';

let server = express()

server.get('/reporting', (req: Request, res) => {

})

interface URLParams {
    business_id: string,
    report: string,
    start: string,
    end: string,
    interval: string
}
function reportingController(req: Request, res: Response) {
    let requestParams = req.params
    try{
    validateParamsOrFail(requestParams)
    }catch(e){
        console.error(e)
        //TODO build error response
    }
    let params: URLParams = requestParams
}

function validateParamsOrFail(params:any) {
    let keys: string[] = ["business_id", "report",
        "start",
        "end",
        "interval"]
        for(let idx in keys){
            if(!params.contains(keys[idx])){
                throw "Malformed Request: request is missing necessary paramters"
            }
        }
}