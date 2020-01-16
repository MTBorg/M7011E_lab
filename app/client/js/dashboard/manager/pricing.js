document.addEventListener("DOMContentLoaded", () => {
  // update price to catch price changes from other managers
  pollFunc(getPricing, INTERVAL_TIMER);
});

async function getPricing() {
  const PRICING_QUERY = `{
		simPricing,
		pricing
	}`;
  const authToken = getCookie("authToken", document.cookie);
  let prices = null;
  try {
    await fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query: PRICING_QUERY
      })
    })
      .then(res => res.json())
      .then(res => (prices = res.data));
  } catch (err) {
    console.error(`Failed to get pricing: ${err}`);
  }
  displayPrices(prices.pricing, prices.simPricing);
}

function displayPrices(price, simPrice) {
  price = parseFloat(price);
  simPrice = parseFloat(simPrice);
  document.getElementById("currPrice").innerHTML = price.toFixed(2);
  document.getElementById("suggestedPrice").innerHTML = simPrice.toFixed(2);
  document.getElementById("diffPrice").innerHTML =
    price - simPrice > 0
      ? `+${(price - simPrice).toFixed(2)}`
      : (price - simPrice).toFixed(2);
}

async function submitPricingForm(event, form) {
  event.preventDefault();
  const price = form[0].value;
  const SET_PRICE_QUERY = `mutation {
		setPricing(price: ${price})
	}`;
  const authToken = getCookie("authToken", document.cookie);
  try {
    await fetch(API_ADDRESS, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authToken
      },
      body: JSON.stringify({
        query: SET_PRICE_QUERY
      })
    });
  } catch (err) {
    console.error(`Failed to get pricing: ${err}`);
    alert(`Failed to update price: ${err.message}`);
    return;
  }

  displayPrices(price, document.getElementById("suggestedPrice").innerHTML);
  form.reset();
  alert("Price updated");
}
