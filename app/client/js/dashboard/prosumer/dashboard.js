document.addEventListener("DOMContentLoaded", () => {
  pollFunc(updateData, 10000); // update prosumer data of the dashboard every 10s
});

async function updateData() {
  const data = await getData();
  const prosumer = data.me;
  const battery = data.me.battery;
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

  document.getElementById("block-status").innerHTML = prosumer.blocked
    ? "<i data-feather='x-octagon' style=color:red></i> You are blocked from selling"
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
}
