let assert = require('assert');
let lib = require('../index.js');

/**
 * Some kind of e2e tests here, actually using the trafiklab service
 */
describe('Validate json', function() {
    it('should respond with 200', async function() {
        this.timeout(5000);
        const mockEvent = {};
        const response = await lib.handler(mockEvent);
        assert.equal(response.statusCode, 200);
    });

    it('should respond with valid json data', async function() {
        this.timeout(5000);
        const mockEvent = {};
        const response = await lib.handler(mockEvent);
        const parsedData = JSON.parse(response.body);
        assert.ok(parsedData);
    });
});
