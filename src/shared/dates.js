export function getDayOfYear(date) {
  const timestmp = new Date().setFullYear(new Date().getFullYear(), 0, 1);
  const yearFirstDay = Math.floor(timestmp / 86400000);

  return Math.ceil((date.getTime()) / 86400000) - yearFirstDay;
}

/**
 * Get the last day of the current month
 * @return {Date} last day of the month
 */
export function getLastDayOfMonth(){
  const date = new Date;
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Get the days between two dates
 * @param  {String} startDate any valid date string
 * @param  {String} endDate   any valid date string
 * @return {Integer}          number of days between start and end dates
 */
export function daysBetween(startDate, endDate) {
  return getDayOfYear(endDate) - getDayOfYear(startDate) + 1;
}

/**
 * Get the number of days since a date
 * @param  {String} startDate any valid date string
 * @return {Integer}          number of days since the start date
 */
export function daysSince(startDate){
  let diff = Math.abs(new Date() - new Date(startDate));
  return Math.ceil(diff / (1000 * 3600 * 24));
}

export function incrementDate(date) {
  return new Date(date.getTime() + 86400000);
}

export function formatDateRange(startDate, endDate) {
  const start = incrementDate(startDate);
  const end = incrementDate(endDate);

  return [
    {
      year: start.getFullYear(),
      month: start.getMonth() + 1,
      day: start.getDate()
    },{
      year: end.getFullYear(),
      month: end.getMonth() + 1,
      day: end.getDate()
    }
  ];
}

/**
* Converts a day of the week integer to a string.
* @method dayOfWeekAsString
* @param {Number} dayIndex day of the week as an integer
* @return {String}         day of the week as a string
*/
export function dayOfWeekAsString(dayIndex) {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayIndex];
}

/**
 * Converts a string day of the week to an integer.
 * @param  {String} string day of the week as string
 * @return {Number}        day of the week as an integer
 */
export function dayOfWeekAsNumber(string){
  if(string.length === 3){
    return ['sun','mon','tue','wed','thu','fri','sat'].indexOf(string.toLowerCase());
  } else {
    return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].indexOf(string.toLowerCase());
  }
}

/**
 * Convert a month to two digits
 * @param  {Number} m month
 * @return {String}   two digit month
 */
export function twoDigitMonth(m) {
  return m < 10 ? '0' + m : m;
}

/**
 * Convert a date to two digits
 * @param  {Number} d date
 * @return {String}   two digit date
 */
export function twoDigitDate(d) {
  return d < 10 ? '0' + d : d;
}

export function lastXDays(x, dateBuffer = 1){
  let date = new Date();
  let startDate = new Date(date.getTime() - ((x + dateBuffer) * 86400000));
  let endDate = new Date(date.getTime() - 2 * 86400000);
  return formatDateRange(startDate, endDate);
}

export const LAST_60_DAYS = lastXDays(60);
export const LAST_90_DAYS = lastXDays(90);
export const LAST_120_DAYS = lastXDays(120);
export const LAST_180_DAYS = lastXDays(180);
export const LAST_365_DAYS = lastXDays(365);
export const THIS_YEAR = lastXDays(getDayOfYear(new Date()), 0);