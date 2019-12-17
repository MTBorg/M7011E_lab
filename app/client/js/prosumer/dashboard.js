// Gets all of the prosumer fields aswell as the current electricity pricing
const QUERY = `{
	prosumer(id: 1) {
		... prosumerFields
	}
	pricing
}
${prosumerFields}
`;

document.addEventListener("DOMContentLoaded", () => {
  pollFunc(updateData, 10000); // update prosumer data of the dashboard every 10s
});

async function updateData() {
  const data = await getDashboardData();
  const prosumer = data.prosumer;
  const battery = data.prosumer.battery;
  const pricing = data.pricing;

  document.getElementById(
    "windSpeed"
  ).innerHTML = prosumer.currentWindSpeed.toFixed(2);
  document.getElementById(
    "production"
  ).innerHTML = prosumer.currentProduction.toFixed(2);
  document.getElementById(
    "consumption"
  ).innerHTML = prosumer.currentConsumption.toFixed(2);

  const netProd = prosumer.currentProduction - prosumer.currentConsumption;
  document.getElementById("netProduction").innerHTML = netProd.toFixed(2);

  const batteryPower = battery.power.toFixed(2);
  const batteryMaxCapacity = battery.maxCapacity.toFixed(2);
  document.getElementById(
    "battery"
  ).innerHTML = `${batteryPower}/${batteryMaxCapacity}`;

  document.getElementById("pricing").innerHTML = pricing.toFixed(2);
}

/**
 * Fetches the prosumer data which will be displayed on the dashboard
 * @returns an object with subfields prosumer and pricing
 */
async function getDashboardData() {
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
