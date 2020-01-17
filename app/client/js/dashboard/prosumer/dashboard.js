document.addEventListener("DOMContentLoaded", () => {
  pollFunc(updateData, 3000);
});

async function updateData() {
  try {
    const authToken = getCookie("authToken", document.cookie);
    const response = await fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query: `
				{
					me{
						... on prosumer{
							currentWindSpeed
							currentProduction
							currentConsumption
							blackout
							blocked
							battery{
								power
								maxCapacity
							}
						}
					}
					pricing
				}
				`
      })
    });
    const json = await response.json();
    const prosumer = json.data.me;
    const { battery } = json.data.me;
    const { pricing } = json.data;

    document.getElementById(
      "windSpeed"
    ).innerHTML = prosumer.currentWindSpeed.toFixed(2);
    document.getElementById(
      "production"
    ).innerHTML = prosumer.currentProduction.toFixed(2);
    document.getElementById(
      "consumption"
    ).innerHTML = prosumer.currentConsumption.toFixed(2);

    document.getElementById("block-status").innerHTML = prosumer.blocked
      ? "<i data-feather='x-octagon' style=color:red></i> You are blocked from selling"
      : "";
    document.getElementById("blackout-status").innerHTML = prosumer.blackout
      ? "<i data-feather='alert-triangle' style=color:red></i> You are currently experiencing a blackout"
      : "";
    feather.replace();

    const netProd = prosumer.currentProduction - prosumer.currentConsumption;
    document.getElementById("netProduction").innerHTML = netProd.toFixed(2);

    const batteryPower = battery.power.toFixed(2);
    const batteryMaxCapacity = battery.maxCapacity.toFixed(2);
    document.getElementById(
      "battery"
    ).innerHTML = `${batteryPower}/${batteryMaxCapacity}`;

    document.getElementById("pricing").innerHTML = pricing.toFixed(2);
  } catch (error) {
    console.error(`Failed to update dashboard update: ${error}`);
  }
}
