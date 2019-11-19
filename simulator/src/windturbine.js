// Turbine configs
const cp = 0.45; // the power coefficent
const airDensity = 1.25; // [kg/m^2]
const rotorDiameter = 45; // rotor diameter [m]
const cutInSpeed = 2; // at what wind speed the turbine starts producing power [m/s]
const cutOutSpeed = 25; // at what wind speed the turbine shuts down to minimize damages [m/s]
const ratedOutputPower = 2000; // the turbines maximum power output [kW]

function turbineOutput(windSpeed) {
  if (windSpeed > cutInSpeed && windSpeed <= cutOutSpeed) {
    let power = // the power in kW
      (cp *
        (1 / 2) *
        airDensity *
        windSpeed ** 3 *
        ((Math.PI * rotorDiameter ** 2) / 4)) /
      1000;

    if (power > 2000) {
      power = 2000;
    }

    return power;
  } else {
    return 0;
  }
}
