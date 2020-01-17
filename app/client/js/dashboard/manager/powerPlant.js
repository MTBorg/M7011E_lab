registerPollCallback(e => {
  const powerPlant = e.detail.data.me.powerplant;
  const { battery } = e.detail.data.me.powerplant;

  document.getElementById("status").innerHTML = powerPlant.status;
  document.getElementById("production").innerHTML =
    powerPlant.currentProduction;
  document.getElementById("battery").innerHTML = `${battery.power.toFixed(
    0
  )}/${battery.maxCapacity.toFixed(0)}`;
  document.getElementById("operationButton").value =
    powerPlant.status == "stopped" ? "START" : "STOP";
  document.getElementById("operationButton").className =
    powerPlant.status == "stopped" ? "btn btn-success" : "btn btn-danger";
});

async function changePowerPlantStatus(event, button) {
  event.preventDefault();

  const status = document.getElementById("status").innerHTML;
  const query =
    status == "stopped"
      ? `
			mutation {
				startPowerPlant
			}`
      : `
			mutation {
				stopPowerPlant
			}`;
  const authToken = getCookie("authToken", document.cookie);
  let response = null;

  try {
    await fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query
      })
    })
      .then(res => res.json())
      .then(res => (response = res.data));
  } catch (err) {
    console.error(`Failed to operate the power plant: ${err}`);
  }

  // Response can have stopPowerPlant or startPowerPlant attribute
  for (key in response) {
    newStatus = response[key];
  }

  document.getElementById("status").innerHTML = newStatus;
  button.value = newStatus == "stopped" ? "START" : "STOP";
  button.className =
    newStatus == "stopped" ? "btn btn-success" : "btn btn-danger";
  // Production will always be 0 after press since start up time
  document.getElementById("production").innerHTML = "0";
}
