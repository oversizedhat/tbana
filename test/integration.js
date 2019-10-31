let assert = require('assert');
let lib = require('../index.js');

const MOCK_HEADER_OK = { origin: "http://localhost:8080" };
const MOCK_HEADER_NOT_OK = { origin: "http://not.ok.domain" };
const VALID_PARAMS = { siteId: 9141, dir: 1 }
const DEFAULT_EVENT = { headers : MOCK_HEADER_OK, queryStringParameters: VALID_PARAMS};
/**
 * Some kind of e2e integratin tests here, even using the trafiklab service
 */
describe('Validate json', function() {
    it('should respond with valid json data on a valid request', async function() {
        this.timeout(5000);
        const response = await lib.handler(DEFAULT_EVENT);
        const parsedData = JSON.parse(response.body);

        assert.equal(response.statusCode, 200);
        assert.ok(parsedData);
    });

    it('should not allow unknown domain', async function() {
        const response = await lib.handler({headers:MOCK_HEADER_NOT_OK});
        assert.equal(response.statusCode, 403);
    });

    it('should reject request without siteId as url parameter', async function() {
        const response = await lib.handler({headers:MOCK_HEADER_OK, queryStringParameters:{dir:1}});
        assert.equal(response.statusCode, 400);
    });

    it('should reject request without dir as url parameter', async function() {
        const response = await lib.handler({headers:MOCK_HEADER_OK, queryStringParameters:{siteId:4364}});
        assert.equal(response.statusCode, 400);
    });

    it('should reject request with invalid siteId typing', async function() {
        const response = await lib.handler({headers:MOCK_HEADER_OK, queryStringParameters:{siteId:"notint", dir:1}});
        assert.equal(response.statusCode, 400);
    });

    it('should reject request without url parameters', async function() {
        const response = await lib.handler({headers:MOCK_HEADER_OK});
        assert.equal(response.statusCode, 400);
    });
});
