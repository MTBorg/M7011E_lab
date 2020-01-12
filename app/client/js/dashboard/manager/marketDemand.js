const POLL_INTERVAL = 3000;

document.addEventListener("DOMContentLoaded", () => {
  pollFunc(updateMarketDemand, POLL_INTERVAL);
});

async function updateMarketDemand() {
  const authToken = getCookie("authToken", document.cookie);
  try {
    const response = await fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query: `
				{
					marketDemand
				}
				`
      })
    });
    const json = await response.json();

    document.getElementById(
      "market-demand"
    ).innerText = json.data.marketDemand.toFixed(2);
  } catch (error) {
    console.error(`Failed to get market demand: ${error}`);
  }
}
