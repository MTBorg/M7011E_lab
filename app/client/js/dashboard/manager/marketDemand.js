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
    const demand = json.data.marketDemand.toFixed(2);
    document.getElementById("market-demand").innerText = `${demand} kW`;
  } catch (error) {
    console.error(`Failed to get market demand: ${error}`);
  }
}
