import "mocha"
import  * as request from 'supertest'
import server from '../src/app'

describe("reporting server", () => {

    let lcpParams = {
        business_id: "f21c2579-b95e-4a5b-aead-a3cf9d60d43b",
        report: "LCP",
        timeInterval: "day",
        start: "2018-05-01T00:00:00.000Z",
        end: "2018-05-02T00:00:00.000Z"
    }

    it("should recieve 404", (done) => {
        request(server).get('/').expect(404, done)
    })
    it("should generate report", (done) => {
        let result = request(server).get('/reporting').query(lcpParams)
            .expect(200)
            .expect((result:request.Response) => {
                console.log(result)
            }, done)

    })
    it("should reject arguments", () => {
        //todo
        let lcpParams = {
            business_id: "f21c2579-b95e-4a5b-aead-a3cf9d60d43b",
            report: "LCP",
            timeInterval: "day",
            start: "2018-05-01T00:00:00.000Z",
            end: "2018-05-02T00:00:00.000Z"
        }
    })
})