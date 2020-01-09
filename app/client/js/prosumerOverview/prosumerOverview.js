const POLL_INTERVAL = 3000;

document.addEventListener("DOMContentLoaded", () => {
  pollFunc(updateData, POLL_INTERVAL);
});

async function updateData() {
  const authToken = getCookie("authToken", document.cookie);
  try {
    let response = await fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query: `
				{
					prosumers {
						id
						blocked
					}
				}
				`
      })
    });
    const json = await response.json();
    json.data.prosumers.forEach(prosumer => {
      document.getElementById(
        `blocked-status-${prosumer.id}`
      ).innerText = prosumer.blocked ? "Blocked" : "Not blocked";
    });
  } catch (error) {
    alert(`Failed to fetch prosumers: ${error}`);
  }
}
