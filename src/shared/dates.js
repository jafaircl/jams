export function getDayOfYear(date) {
  const timestmp = new Date().setFullYear(new Date().getFullYear(), 0, 1);
  const yearFirstDay = Math.floor(timestmp / 86400000);

  return Math.ceil((date.getTime()) / 86400000) - yearFirstDay;
}

export function getLastDayOfMonth(){
  const date = new Date;
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function daysBetween(startDate, endDate) {
  return getDayOfYear(endDate) - getDayOfYear(startDate) + 1;
}

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
* Converts a day number to a string.
*
* @method dayOfWeekAsString
* @param {Number} dayIndex
* @return {Number} Returns day as number
*/
export function dayOfWeekAsString(dayIndex) {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayIndex];
}

export function dayOfWeekAsNumber(string){
  if(string.length === 3){
    return ['sun','mon','tue','wed','thu','fri','sat'].indexOf(string.toLowerCase());
  } else {
    return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].indexOf(string.toLowerCase());
  }
}

export function twoDigitMonth(m) {
  return m < 10 ? '0' + m : m;
}

export function twoDigitDate(d) {
  return d < 10 ? '0' + d : d;
}