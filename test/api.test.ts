import { AxiosResponse, AxiosRequestConfig } from "axios";
import { handleResponse, buildConfig, RequestParams, getAllEntries, callService } from "../src/getAllNodes";

import { expect } from 'chai'
import 'mocha'
import { API_URL, AUTH_TOKEN } from "../src/appConstants";


describe('testing API connection', () => {
    //test start out simple and integrate more and more components
    it('should make axios call', () => {

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
        getAllEntries(testConfig).then(response=>{       
            expect(response.data.length).to.eql(response.count)
            expect(response.count).to.eql(3)
        }).catch((e)=>{
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
                business_id:"b2aeb27b-c85c-4ad8-83d4-d9511063d418"
            }
        }
        //note: this calls the real service so this test assumes a static service
        getAllEntries(testConfig).then(response=>{
            expect(response.data.length).to.eql(response.count)
            expect(response.count).to.eql(6151)
        }).catch((e)=>{
            console.error(e)
        })
    })
})