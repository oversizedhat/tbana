# tbana
[![Build Status](https://travis-ci.org/oversizedhat/tbana.svg?branch=master)](https://travis-ci.org/oversizedhat/tbana)

Trafiklab proxy service for stockholm subway queries using serverless framework setting up Lambda function and API gateway rest api.

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
Deploy (from local)
```
# deploy stage - Is done automatically by travis ci on merge to stage branch
$ npm run deploy:dev

# deploy prod (hardcoded to v1) - Is done automatically by travis ci on merge to master branch
$ npm run deploy:prod 
```

### Setup notes travis-ci
Travis ci is used to deploy the serverless project to AWS.

Branch rules: 
- master branch: production
- stage branch: dev

Connect github repo with Travis, and create neccessary env vars in Travis project allowing deploys to AWS S3
```
docker run -it -v $(pwd):/project -e TRAFIKLAB_API_KEY=$TRAFIKLAB_API_KEY -e GITHUB_TOKEN=$GITHUB_TOKEN -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY --rm --entrypoint=/bin/sh traviscli
/project # travis login --github-token $GITHUB_TOKEN
/project # travis enable
/project # travis env set AWS_ACCESS_KEY_ID $AWS_ACCESS_KEY
/project # travis env set AWS_SECRET_ACCESS_KEY $AWS_SECRET_ACCESS_KEY
/project # travis env set TRAFIKLAB_API_KEY $TRAFIKLAB_API_KEY
```