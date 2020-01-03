document.addEventListener("DOMContentLoaded", async () => {
  const ratios = await getRatios();
  const ratioProdMarket = ratios.ratioProductionMarket * 100;

  document.getElementById("ratioProd").setAttribute("value", ratioProdMarket);

  // display the ratio as text
  document.getElementById(
    "displayProdBatteryRatio"
  ).innerText = `Battery: ${100 - ratioProdMarket}%`;
  document.getElementById(
    "displayProdMarketRatio"
  ).innerText = `Market: ${ratioProdMarket}%`;

  // update labels when slider is moved
  document.getElementById("ratioProd").addEventListener("input", function() {
    document.getElementById(
      "displayProdBatteryRatio"
    ).innerText = `Battery: ${100 - this.value}%`;
    document.getElementById(
      "displayProdMarketRatio"
    ).innerText = `Market: ${this.value}%`;
  });

  // update db when manager changes the ratios
  document.getElementById("ratioProd").addEventListener("change", function() {
    setRatioProd(this.value / 100);
  });
});
