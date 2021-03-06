// Turbine configs
const cp = 0.45; // the power coefficent
const airDensity = 1.25; // [kg/m^2]
const rotorDiameter = 4; // rotor diameter [m]
const cutInSpeed = 2; // at what wind speed the turbine starts producing power [m/s]
const cutOutSpeed = 15; // at what wind speed the turbine shuts down to minimize damages [m/s]
const ratedOutputPower = 5.5; // the turbines maximum power output [kW]

function turbineOutput(windSpeed) {
  if (windSpeed > cutInSpeed && windSpeed < cutOutSpeed) {
    let power = // the power in kW
      (cp *
        (1 / 2) *
        airDensity *
        windSpeed ** 3 *
        ((Math.PI * rotorDiameter ** 2) / 4)) /
      1000;

    if (power > ratedOutputPower) {
      power = ratedOutputPower;
    }

    return power;
  }
  return 0;
}

module.exports = { turbineOutput, cutInSpeed, cutOutSpeed, ratedOutputPower };
