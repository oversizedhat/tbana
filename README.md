# tbana

Trafiklab proxy service for stockholm subway queries using serverless setting up Lambda function and API gateway rest api.

Install:
```
# Have an aws account and AWS CLI setup
# Install nodejs > v8
# Install serverless globally
# Setup a trafiklab.se account and export env var TRAFIKLAB_API_KEY with your api token for SL Realtidsinformation 4

$ npm install -g serverless
$ npm install
```
Test
```
$ npm test
```
Local dev
```
$ npm start
......starting serveless in offline mode
```
Deploy
```
# deploy stage
$ npm run deploy:dev

# deploy prod (hardcoded to v1)
$ npm run deploy:prod
```
