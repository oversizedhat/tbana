let assert = require('assert');
let lib = require('../index.js');

const MOCK_HEADER_OK = { origin: "http://www.localhost:8080" };
const MOCK_HEADER_NOT_OK = { origin: "http://test.test.test" };
const DEFAULT_EVENT = { headers : MOCK_HEADER_OK};
/**
 * Some kind of e2e tests here, actually using the trafiklab service
 */
describe('Validate json', function() {
    it('should respond with 200', async function() {
        this.timeout(5000);
        const response = await lib.handler(DEFAULT_EVENT);
        assert.equal(response.statusCode, 200);
    });

    it('should respond with valid json data', async function() {
        this.timeout(5000);
        const response = await lib.handler(DEFAULT_EVENT);
        const parsedData = JSON.parse(response.body);
        assert.ok(parsedData);
    });

    it('should not allow unknown domain', async function() {
        this.timeout(5000);
        const response = await lib.handler({headers:MOCK_HEADER_NOT_OK});
        assert.equal(response.statusCode, 403);
    });
});
