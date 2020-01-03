document.addEventListener("DOMContentLoaded", async () => {
  const ratios = await getRatios();
  const ratioExcessMarket = ratios.ratioExcessMarket * 100;
  const ratioDeficitMarket = ratios.ratioDeficitMarket * 100;

  document
    .getElementById("ratioExcess")
    .setAttribute("value", ratioExcessMarket);

  document
    .getElementById("ratioDeficit")
    .setAttribute("value", ratioDeficitMarket);

  // display the ratios as text
  document.getElementById(
    "displayExcessBatteryRatio"
  ).innerText = `Battery: ${100 - ratioExcessMarket}%`;
  document.getElementById(
    "displayExcessMarketRatio"
  ).innerText = `Market: ${ratioExcessMarket}%`;
  document.getElementById(
    "displayDeficitBatteryRatio"
  ).innerText = `Battery: ${100 - ratioDeficitMarket}%`;
  document.getElementById(
    "displayDeficitMarketRatio"
  ).innerText = `Market: ${ratioDeficitMarket}%`;

  // update labels when slider is moved
  document.getElementById("ratioExcess").addEventListener("input", function() {
    document.getElementById(
      "displayExcessBatteryRatio"
    ).innerText = `Battery: ${100 - this.value}%`;
    document.getElementById(
      "displayExcessMarketRatio"
    ).innerText = `Market: ${this.value}%`;
  });
  document.getElementById("ratioDeficit").addEventListener("input", function() {
    document.getElementById(
      "displayDeficitBatteryRatio"
    ).innerText = `Battery: ${100 - this.value}%`;
    document.getElementById(
      "displayDeficitMarketRatio"
    ).innerText = `Market: ${this.value}%`;
  });

  // update db when prosumer changes the ratios
  document.getElementById("ratioExcess").addEventListener("change", function() {
    setRatioExcess(this.value / 100);
  });
  document
    .getElementById("ratioDeficit")
    .addEventListener("change", function() {
      setRatioDeficit(this.value / 100);
    });
});
