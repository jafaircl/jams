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

export function stripHtmlScriptTags(str){
  return str.replace(/<\s*script[^>]*>[\s\S]*?(<\s*\/script[^>]*>|$)/ig, '');
}

export function stripHtmlStyleTags(str){
  return str.replace(/<\s*style[^>]*>[\s\S]*?(<\s*\/style[^>]*>|$)/ig, '');
}

export function decodeHtmlEntities(str){
  return str.replace(/&([^\s]*);/g, function(match, dec) {
    return String.fromCharCode(dec);
  });
}

export function stripHtmlTags(str){
  return str.replace(/(<([^>]+)>)/ig, '');
}

export function reduceSpaces(str){
  return str.replace(/\s{2,}/g, ' ');
}

export function stripHtmlEntities(str){
  return str.replace(/&([^\s]*);/g, ' ');
}

export function stripNewLines(str){
  return str.replace(/\s/g, ' ');
}

export function removePunctuation(str){
  return str.replace(/[^\w\s]/g, '');
}

export function removeNumbers(str){
  return str.replace(/[0-9]/g, '');
}