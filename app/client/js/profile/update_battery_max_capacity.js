async function updateBatteryMaxCapacity(event) {
  event.preventDefault();

  const maxCapacity = document.getElementById("new-max-capacity").value;
  try {
    const authToken = getCookie("authToken", document.cookie);
    const response = await fetch(API_ADDRESS, {
      method: "POST",
      headers: { "content-type": "application/json", authToken },
      body: JSON.stringify({
        query: `
				mutation{
					updateBatteryMaxCapacity(maxCapacity:${maxCapacity})
				}
			`
      })
    });
    const result = await response.json();

    if (result.errors != null) {
      alert("Failed to update battery max capacity");
      return;
    }

    const newMaxCapacity = result.data.updateBatteryMaxCapacity;

    // Display the new max capacity
    document.getElementById("max-capacity").innerText = newMaxCapacity;

    alert("Successfully updated battery max capacity");
    document.getElementById("max-capacity-form").reset();
  } catch (error) {
    alert(`Failed to update battery max capacity: ${error}`);
  }
}
