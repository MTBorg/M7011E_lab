const POLL_INTERVAL = 3000;

window.setInterval(function() {
  const authToken = getCookie("authToken", document.cookie);
  fetch(API_ADDRESS, {
    method: "POST",
    headers: { "content-type": "application/json", authToken },
    body: JSON.stringify({
      query: `
						{
							me{
								... on prosumer{
									battery{
										power
									}
								}
								... on manager{
									powerplant{
										battery{
											power
										}
									}
								}
							}
						}`
    })
  })
    .then(res => res.json())
    .then(res => {
      document.getElementById("current-power").innerText =
        res.data.me.battery != null
          ? res.data.me.battery.power
          : res.data.me.powerplant.battery != null
          ? res.data.me.powerplant.battery.power
          : 0;
    });
}, POLL_INTERVAL);
