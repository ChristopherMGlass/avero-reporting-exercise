import "mocha"
import * as request from 'supertest'
import server from "../src/servet"

describe("reporting server", () => {

    let lcpParams = {
        business_id: "f21c2579-b95e-4a5b-aead-a3cf9d60d43b",
        report: "LCP",
        timeInterval: "day",
        start: "2018-05-01T00:00:00.000Z",
        end: "2018-05-02T00:00:00.000Z"
    }
    
    let expectedLCP={
        "report": "LCP",
        "timeInterval": "day",
        "data": [
          {
            "timeFrame": {
                "start": "2018-05-03T15:00:00.000Z",
                "end": "2018-05-03T16:00:00.000Z"
            },
            "value": 13.0 
          },
          {
            "timeFrame": {
                "start": "2018-05-03T16:00:00.000Z",
                "end": "2018-05-03T17:00:00.000Z"
            },
            "value": 54.0 
          }, 
          {
            "timeFrame": {
                "start": "2018-05-03T17:00:00.000Z",
                "end": "2018-05-03T18:00:00.000Z"
            },
            "value": 23.0 
          }
       ]
      }
    it("should recieve 404", (done) => {
        request(server).get('/').expect(404, done)
    })
    it("should generate report", (done) => {
        let result = request(server).get('/reporting').query(lcpParams)
        .expect(200)
        .expect(expectedLCP,done)
        // console.log(result)

    })
    it("should reject arguments", () => {

    })
})