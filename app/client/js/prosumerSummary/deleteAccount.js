async function deleteProsumerAccount(prosumerId) {
  try {
    const authToken = getCookie("authToken", document.cookie);
    const response = await fetch(API_ADDRESS, {
      method: "POST",
      headers: { "content-type": "application/json", authToken },
      body: JSON.stringify({
        query: `
				mutation{
					deleteProsumerAccount(prosumerId:${prosumerId})
				}
			`
      })
    });
    const result = await response.json();

    if (result.errors != null) {
      console.log(result.errors);
    } else if (!result.data.deleteProsumerAccount) {
      alert("Failed to delete account, error: unkown");
    } else {
      alert("Successfully deleted account");
      window.location.replace("/prosumer-overview");
    }
  } catch (error) {
    alert(`Failed to delete account: ${error}`);
  }
}
