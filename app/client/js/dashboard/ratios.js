async function getRatios() {
  const QUERY_GET_RATIOS = `{
		me {
			... on prosumer {
				ratioExcessMarket,
				ratioDeficitMarket
			}
		}
	}`;
  const authToken = getCookie("authToken", document.cookie);

  let prosumerRatios = null;
  try {
    await fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query: QUERY_GET_RATIOS
      })
    })
      .then(res => res.json())
      .then(res => (prosumerRatios = res.data.me));
  } catch (err) {
    console.error(`Failed to get prosumer ratios: ${err}`);
  }
  return prosumerRatios;
}

function setRatioExcess(ratio) {
  const QUERY_SET_RATIO_EXCESS = `
	mutation {
		setRatioExcessMarket(ratio: ${ratio})
	}
	`;
  const authToken = getCookie("authToken", document.cookie);

  try {
    fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query: QUERY_SET_RATIO_EXCESS
      })
    });
  } catch (err) {
    console.error(`Failed to set excess ratio: ${err}`);
  }
}

function setRatioDeficit(ratio) {
  const QUERY_SET_RATIO_DEFICIT = `
		mutation {
			setRatioDeficitMarket(ratio: ${ratio})
		}
	`;
  const authToken = getCookie("authToken", document.cookie);

  try {
    fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query: QUERY_SET_RATIO_DEFICIT
      })
    });
  } catch (err) {
    console.error(`Failed to set defict ratio: ${err}`);
  }
}
