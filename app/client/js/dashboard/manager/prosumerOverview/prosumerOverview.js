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
						blackout
						account {
							online
						}
					}
				}
				`
      })
    });
    const json = await response.json();
    let numBlackout = 0;
    json.data.prosumers.forEach(prosumer => {
      if (prosumer.blackout) numBlackout++;
      document.getElementById(
        `blocked-status-${prosumer.id}`
      ).innerText = prosumer.blocked ? "Blocked" : "Not blocked";
      document.getElementById(
        `blackout-status-${prosumer.id}`
      ).innerText = prosumer.blackout ? "Blackout" : "";
      document.getElementById(
        `online-status-${prosumer.id}`
      ).innerText = prosumer.account.online ? "Online" : "Offline";
    });
    document.getElementById("prosumer-status").innerText =
      numBlackout > 0
        ? numBlackout > 1
          ? `${numBlackout} prosumers are currently experiencing blackouts`
          : `${numBlackout} prosumer is currently experiencing a blackout`
        : `No prosumers are exeriencing blackouts`;
  } catch (error) {
    alert(`Failed to fetch prosumers: ${error}`);
  }
}
