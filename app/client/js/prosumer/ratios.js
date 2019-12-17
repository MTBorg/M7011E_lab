document.addEventListener("DOMContentLoaded", async () => {
  const ratios = await getRatios(); // ratios in db stored as decimal
  const ratioExcessMarket = ratios.ratioExcessMarket * 100;
  const ratioDeficitMarket = ratios.ratioDeficitMarket * 100;

  document
    .getElementById("ratioExcess")
    .setAttribute("value", ratioExcessMarket);

  document
    .getElementById("ratioDeficit")
    .setAttribute("value", ratioDeficitMarket);

  // update db when prosumer changes the ratios
  document.getElementById("ratioExcess").addEventListener("change", function() {
    console.log("value after change = ", this.value / 100);
    setRatioExcess(this.value / 100);
  });

  document
    .getElementById("ratioDeficit")
    .addEventListener("change", function() {
      console.log("value after change = ", this.value / 100);
      setRatioDeficit(this.value / 100);
    });
});

async function getRatios() {
  const QUERY_GET_RATIOS = `{
		prosumer(id: 1) {
			ratioExcessMarket,
			ratioDeficitMarket
		}
	}`;

  let prosumerRatios = null;
  await fetch(API_ADDRESS, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: QUERY_GET_RATIOS
    })
  })
    .then(res => res.json())
    .then(res => (prosumerRatios = res.data.prosumer));
  return prosumerRatios;
}

function setRatioExcess(ratio) {
  const QUERY_SET_RATIO_EXCESS = `
		mutation {
			setRatioExcessMarket(id: 1, ratio: ${ratio})
		}
	`;

  fetch(API_ADDRESS, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: QUERY_SET_RATIO_EXCESS
    })
  });
}

function setRatioDeficit(ratio) {
  const QUERY_SET_RATIO_DEFICIT = `
		mutation {
			setRatioDeficitMarket(id: 1, ratio: ${ratio})
		}
	`;

  fetch(API_ADDRESS, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: QUERY_SET_RATIO_DEFICIT
    })
  });
}
