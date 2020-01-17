const TEST_INTERVAL = 3000;
const POLL_MESSAGE_NAME = "POLL_UPDATE";

document.addEventListener("DOMContentLoaded", () => {
  pollFunc(getDashboardData, TEST_INTERVAL);
});

async function getDashboardData() {
  const query = `
	{
		simPricing,
		pricing,
		prosumers{
			... prosumerOverviewFields
		},
		marketDemand
	}
	${prosumerOverviewFields}
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

function registerPollCallback(callback) {
  document.addEventListener(POLL_MESSAGE_NAME, callback);
}
