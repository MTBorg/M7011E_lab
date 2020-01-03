async function getRatios() {
  const QUERY_GET_RATIOS = `{
		me {
			... on prosumer {
				ratioExcessMarket,
				ratioDeficitMarket
			},
			... on manager {
				ratioProductionMarket
			}
		}
	}`;
  const authToken = getCookie("authToken", document.cookie);

  let ratios = null;
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
      .then(res => (ratios = res.data.me));
  } catch (err) {
    console.error(`Failed to get ratios: ${err}`);
  }
  return ratios;
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

function setRatioProd(ratio) {
  const QUERY_SET_RATIO_PROD = `
		mutation {
			setRatioProdMarket(ratio: ${ratio})
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
        query: QUERY_SET_RATIO_PROD
      })
    });
  } catch (err) {
    console.error(`Failed to set manager production ratio: ${err}`);
  }
}
