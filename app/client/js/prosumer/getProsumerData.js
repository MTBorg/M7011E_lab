const API_ADDRESS = "http://localhost:8080/graphql";

// Gets all of the prosumer fields aswell as the current electricity pricing
const QUERY = `{
	prosumer(id: 1) {
		... prosumerFields
	}
	pricing
}
${prosumerFields}
`;

/**
 * Fetches the prosumer data along with the electricity pricing
 * @returns an object with subfields prosumer and pricing
 */
async function getProsumerData() {
  let prosumerData = null;
  await fetch(API_ADDRESS, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: QUERY
    })
  })
    .then(res => res.json())
    .then(res => (prosumerData = res.data));
  return prosumerData;
}
