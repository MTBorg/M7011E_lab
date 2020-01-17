registerPollCallback(e => {
  const demand = e.detail.data.marketDemand.toFixed(2);
  document.getElementById("market-demand").innerText = `${demand} kW`;
});
