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

module.exports.matchCities = async (event) => {
    const queryParams = event.queryStringParameters; //ONLY IF GET

    /**
     * Represents the name of the city extracted from the request body.
     * @type {string}
     */
    const cityName = queryParams.cityName;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify(
        {
          message: `Got city ${cityName}`,
          city: cityName,
          input: event,
        },
        null,
        2
      ),
    };
  };