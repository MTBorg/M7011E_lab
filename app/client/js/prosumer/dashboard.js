document.addEventListener("DOMContentLoaded", () => {
  pollFunc(updateData, 10000); // update prosumer data of the dashboard every 10s
});

async function updateData() {
  const data = await getProsumerData();

  document.getElementById(
    "windSpeed"
  ).innerHTML = data.currentWindSpeed.toFixed(2);
  document.getElementById(
    "production"
  ).innerHTML = data.currentProduction.toFixed(2);
  document.getElementById(
    "consumption"
  ).innerHTML = data.currentConsumption.toFixed(2);

  const netProd = data.currentProduction - data.currentConsumption;
  document.getElementById("netProduction").innerHTML = netProd.toFixed(2);

  const batteryPower = data.battery.power.toFixed(2);
  const batteryMaxCapacity = data.battery.maxCapacity.toFixed(2);
  document.getElementById(
    "battery"
  ).innerHTML = `${batteryPower}/${batteryMaxCapacity}`;
}
