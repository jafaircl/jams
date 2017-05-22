export function periodicFormula(x, periodLength){
  return Math.sin(2 * Math.PI * (x / periodLength)) + Math.cos(2 * Math.PI * (x / periodLength));
}

// returns a number between 0 and 1 for the hour
export function hourlyPeriodicFormula(x){
  return Math.pow(Math.sin(2 * Math.PI * (x / 24)) + Math.sin(2 * Math.PI * (x / 12)) + Math.cos(2 * Math.PI * (x / 24)) + 1.25, 1.7731);
  //return Math.pow(Math.sin(2 * Math.PI * (x / 24)) + Math.cos(2 * Math.PI * (x / 24)) + Math.sin(2 * Math.PI * (x / 12)), 0.2);
}

export function dailyPeriodicFormula(x){
  return Math.pow(Math.sin(Math.PI * (x / 7)), 0.2); // Sine Wave between 0 and 1
}