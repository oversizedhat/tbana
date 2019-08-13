const http = require('http');
const AWS = require('aws-sdk');

const DEFAULT_SITE_ID = 9141; //bagarmossen
const JOURNEY_DIRECTION_NORTH = 1; //from bagarmossen that is

const S3_BUCKET = "tbana-db";

let TRAFIKLAB_API_KEY = ""; //fetched from bucket

//lambda handler
async function handler(event) {
    //fetch api key from bucket
    const db = await loadDBFromBucket();
    TRAFIKLAB_API_KEY = db.key;
    
    //fetch train info from trafiklab 
    const timetableAsText = await getUpcomingTrainsAsText();
  
    //respond
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: "Bagarmossen norrut:\n\n"+ timetableAsText
    }
    return response;
}

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

async function getUpcomingTrainsAsText() {
    let trainData = await fetchUpcomingTrains();

    const nextNorthboundTrains = trainData.ResponseData.Metros.filter((train) => {
        return train.JourneyDirection == JOURNEY_DIRECTION_NORTH
    });
    
    let timetable = "";

    nextNorthboundTrains.forEach((train) => {
        timetable += train.Destination + " " + train.DisplayTime + "\n";
    });
    
    return timetable;
}

async function fetchUpcomingTrains(siteId = DEFAULT_SITE_ID, timeWindow = 60, bus = false) {
    return new Promise((resolve, reject) => {
        const url = "http://api.sl.se/api2/realtimedeparturesV4.json?key=" + TRAFIKLAB_API_KEY + "&siteid=" + siteId + "&timewindow=" + timeWindow + "&Bus=" + bus;

        http.get(url, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    //console.log(parsedData);

                    //TODO handle error codes (parsedData.StatusCode): https://www.trafiklab.se/api/sl-realtidsinformation-4/sl-realtidsinformation-4
                    resolve(parsedData);
                } catch (e) {
                    console.error(e.message);
                }
            });
        });
    });
}

module.exports = {
    handler: handler
}
