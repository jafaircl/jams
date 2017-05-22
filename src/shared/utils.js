export function arrayIsEmpty(arr){
  return arr === undefined || arr.length == 0;
}

// Type checking
export function getType(elem) {
  return Object.prototype.toString.call(elem).slice(8, -1);
}

export function isArray(elem) {
  return getType(elem) === 'Array';
}

export function isObject(elem) {
  return getType(elem) === 'Object';
}

export function isString(elem) {
  return getType(elem) === 'String';
}

export function isDate(elem) {
  return getType(elem) === 'Date';
}

export function isNumber(elem) {
  return getType(elem) === 'Number';
}

export function isFunction(elem) {
  return getType(elem) === 'Function';
}

export function isRegExp(elem) {
  return getType(elem) === 'RegExp';
}

export function isBoolean(elem) {
  return getType(elem) === 'Boolean';
}

export function isNull(elem) {
  return getType(elem) === 'Null';
}

export function isUndefined(elem) {
  return getType(elem) === 'Undefined';
}

export function isEmpty(elem) {
  return elem === '';
}

export function checkType(elem, isType, message) {
  return isType(elem) ? elem : logError(`Expected ${isType.name.slice(2)} but received ${getType(elem)} ${message}`);
}

// Error handling
export const ERROR_MSG = 'An error occured with the Jams library';

export function logError(message) {
  if(!message) {
    message = ERROR_MSG;
  }
  Logger.log(`Jams Error: ${message}`);
}

// Remove duplicates from an array
export function deDuplicate(arr) {
  let hashTable = {};

  return arr.filter(function (el) {
    let key = JSON.stringify(el);
    let match = Boolean(hashTable[key]);

    return (match ? false : hashTable[key] = true);
  });
}

export function interval(x, fn){
  const time = Date.now();
  for(let i = 0; i < x * 1E10; i++){
    let delta = Date.now() - time;
    if(delta >= x){
      break;
    }
  }
  if(fn){
    fn();
  }
}

export function convertGender(str){
  switch ( str ) {
  case 'Male':
    return 10;
  case 'Female':
    return 11;
  case 'Undetermined':
    return 20;
  default:
    return null;
  }
}