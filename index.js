'use strict'
const http = require('http');
const AWS = require('aws-sdk');

const DEFAULT_SITE_ID = 9141; //bagarmossen
const JOURNEY_DIRECTION_NORTH = 1; //from bagarmossen towards sthlm central that is

const S3_BUCKET = "tbana-db";
const TRAFIKLAB_API_KEY = process.env.TRAFIKLAB_API_KEY;

const allowedOrigins = ["http://localhost:8080","http://www.coommuter.com"];

//lambda handler
async function handler(event) { 
    const origin = event.headers && event.headers.origin;
    if (!origin || !allowedOrigins.includes(origin)){
        return {
          statusCode: 403,
          headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": allowedOrigins[0]
          }
        }
    }
    
    const siteId = (event.queryStringParameters && event.queryStringParameters.siteId)?event.queryStringParameters.siteId:DEFAULT_SITE_ID;
    const dir = (event.queryStringParameters && event.queryStringParameters.dir)?event.queryStringParameters.dir:JOURNEY_DIRECTION_NORTH;

    //fetch train info from trafiklab 
    const trains = (await fetchRealtimeDepatures(siteId)).Metros.filter((train) => {
        return train.JourneyDirection == dir
    });
  
    //Note CORS reply with same origin
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": origin
      },
      body: JSON.stringify(trains)
    }
    return response;
}

//fetch data using trafiklab service
async function fetchRealtimeDepatures(siteId = DEFAULT_SITE_ID, timeWindow = 60, bus = false) {
    return new Promise((resolve, reject) => {
        const url = "http://api.sl.se/api2/realtimedeparturesV4.json?key=" + TRAFIKLAB_API_KEY + "&siteid=" + siteId + "&timewindow=" + timeWindow + "&Bus=" + bus;

        http.get(url, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    //TODO handle error codes (parsedData.StatusCode): https://www.trafiklab.se/api/sl-realtidsinformation-4/sl-realtidsinformation-4
                    resolve(parsedData.ResponseData);
                } catch (e) {
                    console.error(e.message);
                }
            });
        });
    });
}

//will bucket even be needed?
async function loadDBFromBucket() {
	return new Promise((resolve, reject) => {
		var s3 = new AWS.S3();
		s3.getObject({
			Bucket: S3_BUCKET, Key: "db.json"
			},
			function (err, data) {
				if (err != null) {
					reject([503, "Failed to load data from DB"]);
				} else {
					resolve(JSON.parse(data.Body.toString()));
				}
			}
		);
	});
}

module.exports = {
    handler: handler
}
