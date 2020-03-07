# tbana

Trafiklab proxy service for stockholm subway queries using serverless setting up Lambda function and API gateway rest api.

Install:
```
# Have an aws account and AWS CLI setup
# Istall nodejs > v8
# Install serverless globally
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
# ......Starting serveless in offline mode..
```
Deploy
```
# deploy stage
$ npm run deploy:dev

# deploy prod (hardcoded to v1)
$ npm run deploy:prod
```
