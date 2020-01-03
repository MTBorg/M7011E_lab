/**
 * Fetches the prosumer data which will be displayed on the dashboard
 * @returns an object with subfields prosumer and pricing
 */
async function getDashboardData() {
  // Gets all of the prosumer fields aswell as the current electricity pricing
  const QUERY_PROSUMER_DATA = `{
		me {
			... on prosumer {
				... prosumerFields
			}
		}
		pricing
	}
	${prosumerFields}
	`;
  const authToken = getCookie("authToken", document.cookie);
  let prosumerData = null;
  try {
    await fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query: QUERY_PROSUMER_DATA
      })
    })
      .then(res => res.json())
      .then(res => (prosumerData = res.data));
  } catch (err) {
    console.error(`Failed to get prosumer data: ${err}`);
  }
  return prosumerData;
}
