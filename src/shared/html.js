/**
 * Get the text of an HTML string
 * @param  {String} str - Full HTML string
 * @return {String}     Text of page with HTML removed
 */
export function getPageText(str){
  str = stripHtmlScriptTags(str);
  str = stripHtmlStyleTags(str);

  let body = str.match(/<body[^>]*>([\w|\W]*)<\/body>/im);
  let main = str.match(/<main[^>]*>([\w|\W]*)<\/main>/im);
  let text;

  if (main !== null){
    text = main[1];
  } else if (body === null){
    text = str;
  } else {
    text = body[1];
  }

  text = stripHtmlTags(text);
  //text = decodeHtmlEntities(text);
  text = stripHtmlEntities(text);
  text = stripNewLines(text);
  text = reduceSpaces(text);

  return text.trim();
}

/**
 * Remove script tags from an HTML string
 * @param  {String} str - Full HTML string
 * @return {String}     HTML string with script tags removed
 */
export function stripHtmlScriptTags(str){
  return str.replace(/<\s*script[^>]*>[\s\S]*?(<\s*\/script[^>]*>|$)/ig, '');
}

/**
 * Remove style tags from an HTML string
 * @param  {String} str - Full HTML string
 * @return {String}     HTML string with style tags removed
 */
export function stripHtmlStyleTags(str){
  return str.replace(/<\s*style[^>]*>[\s\S]*?(<\s*\/style[^>]*>|$)/ig, '');
}

/**
 * Decode HTML entities (e.g. '&quot;', '&lt;', etc)
 * @param  {String} str - Full HTML string
 * @return {String}     HTML string with HTML entities decoded
 */
export function decodeHtmlEntities(str){
  return str.replace(/&([^\s]*);/g, function(match, dec) {
    return String.fromCharCode(dec);
  });
}

/**
 * Strip all HTML tags from a string
 * @param  {String} str - Full HTML string
 * @return {String}     HTML string with all HTML tags removed
 */
export function stripHtmlTags(str){
  return str.replace(/(<([^>]+)>)/ig, '');
}

/**
 * Remove excessive (2+) spaces from a string
 * @param  {String} str - Full string
 * @return {String}     string with excessive spacing removed
 */
export function reduceSpaces(str){
  return str.replace(/\s{2,}/g, ' ');
}

/**
 * Remove all HTML entities from a string
 * @param  {String} str - Full string
 * @return {String}     string with HTML entities removed
 */
export function stripHtmlEntities(str){
  return str.replace(/&([^\s]*);/g, ' ');
}

/**
 * Remove new lines from a string
 * @param  {String} str - Full string
 * @return {String}     string with new lines removed
 */
export function stripNewLines(str){
  return str.replace(/\s/g, ' ');
}

/**
 * Remove punctuation from a string
 * @param  {String} str - Full string
 * @return {String}     string with punctuation removed
 */
export function removePunctuation(str){
  return str.replace(/[^\w\s]/g, '');
}

/**
 * Remove numbers from a string
 * @param  {String} str - Full string
 * @return {String}     string with numbers removed
 */
export function removeNumbers(str){
  return str.replace(/[0-9]/g, '');
}
