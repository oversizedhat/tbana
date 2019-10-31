'use strict'
const http = require('http');

const TRAFIKLAB_API_ENDPOINT = "http://api.sl.se/api2/realtimedeparturesV4.json";
const DEFAULT_SITE_ID = 9141; //bagarmossen
const TRAFIKLAB_API_KEY = process.env.TRAFIKLAB_API_KEY;
const TRAFIKLAB_MAX_RETRIES = 5; // this includes the initial request. ie we try a total of MAX_RETRIES times.
const TRAFIKLAB_RETRY_INTERVAL_MS = 2000;

const allowedOrigins = ["http://localhost:8080","http://www.coommuter.com"];

/**
 * OK response:
 * 200 - Valid response with json body with train info
 * 
 * Error responses:
 * 400 - Invalid url parameters
 * 403 - Forbidden, likely due to CORS
 * 503 - Failed fetching info from trafiklab service
 * 
 * ------- 
 * 
 * Cut from Trafiklab API docs
 * https://www.trafiklab.se/api/sl-realtidsinformation-4/sl-realtidsinformation-4
 *
 * StatusCode Integer Innehåller statuskod för det eventuella meddelandet.
 * Message String Innehåller eventuellt anropsrelaterade meddelanden som t.ex. felmeddelanden. Se ”Felmeddelanden” nedan.
 * ExecutionTime Long Anger hur lång tid (i ms) det tog för servern att generera svaret.
 * ResponseData Departure Innehåller själva svarsdata från tjänsten. Se ”Svarsdata” nedan.
 * 
 * Error codes:
 * 1001 problem with request: Key is undefined Nyckel hare ej skickats med.
 * 1002 problem with request: Key is invalid Nyckel är ogiltig
 * 1003 Invalid api Ogiltigt api
 * 1004 problem with request: This api is currently not available for keys with priority above 2
 * 1005 Nyckel finns, men ej för detta api problem with request: Invalid api for key
 * 1006 To many requests per minute
 * 1007 To many requests per month
 * 4001 SiteId måste gå att konvertera till heltal.
 * 5321 Kunde varken hämta information från TPI (tunnelbanan) eller DPS (övriga trafikslag).
 * 5322 Kunde inte hämta information från DPS.
 * 5323 Kunde inte hämta information från TPI.
 * 5324 Kunde varken hämta information från TPI (tunnelbanan) eller DPS (övriga trafikslag) p.g.a. inaktuell DPS-data. Detta uppstår om DPS-datan är äldre än 2 minuter vid svarstillfället.
 *
 * 
 * TODO validate that the requested siteid exists
 */

async function lambdaHandler(event) { 
    const origin = event.headers && event.headers.origin;
    if (!origin || !allowedOrigins.includes(origin)) {
        return {
            statusCode: 403,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': allowedOrigins[0]
            }
        }
    }

    const siteId = (event.queryStringParameters && event.queryStringParameters.siteId)?event.queryStringParameters.siteId:undefined;
    const dir = (event.queryStringParameters && event.queryStringParameters.dir)?event.queryStringParameters.dir:undefined;

    // Prep response, note CORS reply with same origin
    const response = {
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": origin
        }
    }

    if (!siteId || Number.isNaN(parseInt(siteId))) {
        response.statusCode = 400;
        response.body = "siteId (integer) required as get parameter.";
    } else if (!dir || Number.isNaN(parseInt(dir))) {
        response.statusCode = 400;
        response.body = "dir (integer) required as get parameter, specifying direction of travel from the given site.";
    } else {
        // Fetch train info from trafiklab on given site, filtered using dir.
        // As the service is a bit unreliable we try a couple of times..
        try {
            const sleep = async (ms) => {
                return new Promise(resolve => setTimeout(resolve, ms))
            }
            const retry = async (siteId, n) => {
                try {
                    return (await fetchRealtimeDepatures(siteId)).Metros.filter((train) => {
                        return train.JourneyDirection == dir
                    });
                } catch(err) {
                    if (n === 1) {
                        throw err;
                    }
                    await sleep(TRAFIKLAB_RETRY_INTERVAL_MS);
                    return await retry(siteId, n - 1);
                }
            };

            const trains = await retry(siteId, TRAFIKLAB_MAX_RETRIES);
            response.statusCode = 200;
            response.body = JSON.stringify(trains);
        } catch (e) {
            response.statusCode = 503;
            response.body = JSON.stringify(e);
        }   
    }
    return response;
}

// Fetch data using trafiklab service
async function fetchRealtimeDepatures(siteId = DEFAULT_SITE_ID, timeWindow = 60, bus = false) {
    return new Promise((resolve, reject) => {
        const url = `${TRAFIKLAB_API_ENDPOINT}?key=${TRAFIKLAB_API_KEY}&siteid=${siteId}&timewindow=${timeWindow}&Bus=${bus}`;
        console.log(`get ${url}`);
        http.get(url, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    if (!parsedData.ResponseData) {
                        reject(new Error(`Trafiklab request failed with ${parsedData.StatusCode} - ${parsedData.Message}`));
                    } else {
                        resolve(parsedData.ResponseData);
                    }
                } catch (e) {
                    // Unable to parse json
                    reject(e);
                }
            });
        });
    });
}

module.exports = {
    handler: lambdaHandler
}
