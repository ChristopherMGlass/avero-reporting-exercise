import { AxiosResponse, AxiosRequestConfig } from "axios";
import { handleResponse, buildConfig, RequestParams, getAllEntries, callService, mergeCheckIntoItem, Check } from "../src/getAllNodes";

import { expect } from 'chai'
import 'mocha'
import { API_URL, AUTH_TOKEN } from "../src/appConstants";
let testItems=require("./simpleItems.json")
let testchecks=require("./simpleChecks.json")


describe('testing API connection', () => {
    //test start out simple and integrate more and more components
    it('should make axios call', () => {

    })

    it('should merge checks into items', () => {
        let items = [
            {
                "id": "7fa83733-0a5e-4038-96d8-3024739ed555",
                "business_id": "b2aeb27b-c85c-4ad8-83d4-d9511063d418",
                "employee_id": "c6981ace-81d9-4ae0-b8f7-80d4d28caf20",
                "check_id": "4ba5c3c5-fd7b-4080-9e05-f5c2f0cf1510",
                "item_id": "d1b1299c-54dc-4163-8ee1-04488f50c071",
                "name": "Reds Brisket",
                "cost": 10,
                "price": 17,
                "voided": false,
                "updated_at": "2018-06-02T17:41:00.000Z",
                "created_at": "2018-06-02T17:18:00.000Z"
            },
            {
                "id": "03280bce-a45c-411d-8595-0a27472aef0e",
                "business_id": "b2aeb27b-c85c-4ad8-83d4-d9511063d418",
                "employee_id": "c6981ace-81d9-4ae0-b8f7-80d4d28caf20",
                "check_id": "4ba5c3c5-fd7b-4080-9e05-f5c2f0cf1510",
                "item_id": "3d056f52-d812-41cd-ae58-bf6e154ab912",
                "name": "Hot Links Sandwich",
                "cost": 4,
                "price": 10,
                "voided": false,
                "updated_at": "2018-06-02T17:41:00.000Z",
                "created_at": "2018-06-02T17:14:00.000Z"
            },
            {
                "id": "ecac0a65-39ce-4186-916b-c0e77f89f59e",
                "business_id": "b2aeb27b-c85c-4ad8-83d4-d9511063d418",
                "employee_id": "5558ab4a-d395-4728-85c4-3a930f251a6a",
                "check_id": "fd01b59f-a455-4463-b83c-aae96ce9d864",
                "item_id": "a54400cf-92cb-4647-8bda-8c24e666be11",
                "name": "Mac & Cheese",
                "cost": 5,
                "price": 11,
                "voided": false,
                "updated_at": "2018-06-01T17:51:00.000Z",
                "created_at": "2018-06-01T17:13:00.000Z"
            }]
        let checks = [{
            "id": "fd01b59f-a455-4463-b83c-aae96ce9d864",
            "business_id": "b2aeb27b-c85c-4ad8-83d4-d9511063d418",
            "employee_id": "5558ab4a-d395-4728-85c4-3a930f251a6a",
            "name": "Sasha Yii",
            "closed": true,
            "closed_at": "2018-06-01T17:51:00.000Z",
            "updated_at": "2018-08-01T17:40:22.152Z",
            "created_at": "2018-06-01T17:06:00.000Z"
        }, {
            "id": "4ba5c3c5-fd7b-4080-9e05-f5c2f0cf1510",
            "business_id": "b2aeb27b-c85c-4ad8-83d4-d9511063d418",
            "employee_id": "c6981ace-81d9-4ae0-b8f7-80d4d28caf20",
            "name": "Casey Dondel",
            "closed": true,
            "closed_at": "2018-06-02T17:41:00.000Z",
            "updated_at": "2018-08-01T17:40:22.152Z",
            "created_at": "2018-06-02T17:11:00.000Z"
        }]
    let result=mergeCheckIntoItem(items,checks)
    expect(result.length).to.eql(3)
    expect(result[0].time).to.eql("2018-06-02T17:41:00.000Z")
    expect(result[1].time).to.eql("2018-06-02T17:41:00.000Z")
    expect(result[2].time).to.eql("2018-06-01T17:51:00.000Z")

    
    // let sndresult=mergeCheckIntoItem(testItems,testchecks.data)
    // console.log(sndresult)

    })
    //TODO - test call failures
    it('should handle an api response', () => {
        let response: AxiosResponse = {
            data: {
                count: 5,
                data: ["value1", "value2", "value3", "value4", "value5"]
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {}
        }
        let result = handleResponse(response)
        expect(result.data.length).to.eq(5)
        expect(result.data[0]).to.eq("value1")
        expect(result.data[4]).to.eq("value5")
        expect(result.count).to.eq(5)
    })

    it("should build axios config", () => {
        let path: string = "/test"
        let requestParams: RequestParams = {
            limit: 500
        }
        let expectedConfig: AxiosRequestConfig = {
            method: 'get',
            baseURL: API_URL,
            url: path,
            headers: { "Authorization": AUTH_TOKEN },
            params: requestParams
        }
        let requestconfig: AxiosRequestConfig = buildConfig(path, requestParams)
        expect(requestconfig).to.deep.equal(expectedConfig)
    })

    it('should get all entries for buisnesses', () => {
        let testConfig: AxiosRequestConfig = {
            method: 'get',
            baseURL: API_URL,
            url: "/businesses",
            headers: { "Authorization": AUTH_TOKEN },
            params: {
                limit: 500
            }
        }
        //note: this calls the real service so this test assumes a static service
        getAllEntries(testConfig).then(response => {
            expect(response.data.length).to.eql(response.count)
            expect(response.count).to.eql(3)
        }).catch((e) => {
            console.error(e)
        })
    })
    it('should get all entries for checks', () => {
        let testConfig: AxiosRequestConfig = {
            method: 'get',
            baseURL: API_URL,
            url: "/checks",
            headers: { "Authorization": AUTH_TOKEN },
            params: {
                limit: 500,
                business_id: "b2aeb27b-c85c-4ad8-83d4-d9511063d418"
            }
        }
        //note: this calls the real service so this test assumes a static service
        getAllEntries(testConfig).then((response) => {
            expect(response.data.length).to.eql(response.count)
            expect(response.count).to.eql(6151)
        }).catch((e) => {
            console.error(e)
        })
    })
})