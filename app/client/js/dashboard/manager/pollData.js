const POLL_INTERVAL = 3000;
const POLL_MESSAGE_NAME = "POLL_UPDATE";

document.addEventListener("DOMContentLoaded", () => {
  pollFunc(getDashboardData, POLL_INTERVAL);
});

/*
 * Fetches all data needed to render the manager dashboard page properly.
 */
async function getDashboardData() {
  const query = `
	{
		simPricing,
		pricing,
		prosumers{
			... prosumerOverviewFields
		},
		marketDemand,
		me{
			... on manager{
				powerplant{
					... powerPlantStatusFields
				}
			}
		}
	}
	${prosumerOverviewFields}
	${powerPlantStatusFields}
	`;
  const authToken = getCookie("authToken", document.cookie);
  try {
    const response = await fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query
      })
    });
    const json = await response.json();
    if (json.errors != null) {
      throw new Error(json.errors[0].message);
    }

    const event = new CustomEvent(POLL_MESSAGE_NAME, {
      detail: { data: json.data }
    });
    document.dispatchEvent(event);
  } catch (err) {
    console.error(`Failed to get poll dashboard data: ${err}`);
  }
}

/*
 * Register a callback function that will be called on every poll interval.
 *
 * The callback will be passed an event object with a property detail which contains the
 * property data which will be populated with all the data from the query. E.g. this will
 * retrieve the data from the query
 * function myCallback(e){
 * 	const { data } = e.detail;
 * }
 *
 * @param {Function} The callback function to call on every poll interval.
 */
function registerPollCallback(callback) {
  document.addEventListener(POLL_MESSAGE_NAME, callback);
}
