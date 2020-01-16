async function blockProsumer(prosumerId) {
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
				mutation {
					blockProsumer(prosumerId:${prosumerId})
				}
				`
      })
    });
    const json = await response.json();
    if (json.data.blockProsumer != null) {
      if (json.data.blockProsumer) {
        document.getElementById(`blocked-status-${prosumerId}`).innerText =
          "\u2714";
      } else {
        document.getElementById(`blocked-status-${prosumerId}`).innerText = "";
        alert("Failed to block prosumer");
      }
    }
  } catch {
    alert("Failed to block prosumer");
  }
}
