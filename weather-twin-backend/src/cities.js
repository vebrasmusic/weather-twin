// const Pinecone = require("@pinecone-database/pinecone").Pinecone;
// const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
// const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });


const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const axios = require('axios');


// module.exports.xxxxxx = async (event) => {

//     const body = JSON.parse(event.body); //ONLY IF POST
//     const queryParams = event.queryStringParameters; //ONLY IF GET



//     return {
//         statusCode: 200,
//         headers: headers,
//         body: JSON.stringify({
//             message: "some message",
//         }, null, 2),
//     };
// }

// once ur in prod, get rid of input, null and 2


const findCoordinates = async (cityName) => {
  const params = {
    q: cityName,
    key: OPENCAGE_API_KEY,
    limit: 1,
    countrycode: 'US',
  }

  try { //TODO: check cache first, then if not then get coords
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, { params });
    const coordinates = response.data.results[0].geometry;
    console.log(coordinates);
    return coordinates;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    throw new Error('Failed to find coordinates');
  }
}

const matchToUsCity = async (cityCoordinates) => {
  // this function is gonna search the US pinecone db to get a closest match to the entered coordinates, then return the vector we get.

  const data = {
    vector: [cityCoordinates.lat, cityCoordinates.lng], // Assuming lat and lng are the coordinates
    topK: 1,
    includeValues: true,
    includeMetadata: true
  };

  try {
    const response = await axios.post(`https://us-temps-1mdx40t.svc.aped-4627-b74a.pinecone.io/query`, data, {
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json"
      }
    });
    return response.data.matches[0].metadata.vectors;
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw new Error('Failed to query Pinecone');
  }
};

const matchToGlobalCity = async (cityVector) => {
  // this function is gonna search the US pinecone db to get a closest match to the entered coordinates, then return the vector we get.

  let vectorArray = JSON.parse(cityVector).map(Number);
  console.log(vectorArray);

  const data = {
    vector: vectorArray,
    topK: 5,
    includeValues: false,
    includeMetadata: true
  };

  try {
    const response = await axios.post(`https://global-temps-1mdx40t.svc.aped-4627-b74a.pinecone.io/query`, data, {
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json"
      }
    });
    return response.data.matches;
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw new Error('Failed to query Pinecone');
  }
};


module.exports.matchCities = async (event) => {
    const queryParams = event.queryStringParameters; //ONLY IF GET

    const cityName = queryParams.cityName;
    const cityCoordinates = await findCoordinates(cityName);
    const matchedCityVector = await matchToUsCity(cityCoordinates);
    const globalMatchedCities = await matchToGlobalCity(matchedCityVector);

    // convert city to coordinates if the city isn't in list
    // get closest "city" to coordinates and use as base query
    // query against those vectors, find 5 closest cities (not in US)
    // return the cities

    try {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify(
          {
            globalMatchedCities: globalMatchedCities,
            //input: event,
          },
          null,
          2
        ),
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify(
          {
            message: "An error occurred",
            error: error.message,
          },
          null,
          2
        ),
      };
    }
  };