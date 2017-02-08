export function getDayOfYear(date) {
  const timestmp = new Date().setFullYear(new Date().getFullYear(), 0, 1);
  const yearFirstDay = Math.floor(timestmp / 86400000);

  return Math.ceil((date.getTime()) / 86400000) - yearFirstDay;
}

export function daysBetween(startDate, endDate) {
  return getDayOfYear(endDate) - getDayOfYear(startDate) + 1;
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