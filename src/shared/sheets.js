import * as _math from '../polyfills/math'; _math;

export function getRowByName (sheet, name) {
  let range = sheet.getRange(1, 1, sheet.getMaxRows());
  let values = range.getValues();
  let index = -1;
  for(let row in values){
    if(values[row][0] === name){
      index = Math.filterInt(row) + 1;
    }
  }
  return index;
}