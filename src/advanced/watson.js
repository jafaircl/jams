export const identifyLanguageApiUrl = 'https://gateway.watsonplatform.net/language-translator/api/v2/identify?text=';

export const naturalLanguageUnderstandingApiUrl = (features) => {
  let url = 'https://gateway.watsonplatform.net/natural-language-understanding/api/v1/analyze?version=2017-02-27';
  if(features){
    url += '&features=' + features.join(',');
  } else {
    Logger.log('Features are required for Natural Language Understanding. See https://www.ibm.com/watson/developercloud/doc/natural-language-understanding/');
  }
  return url;
};

export const watsonFetchOptions = (user, password) => {
  return {
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(user + ':' + password),
      'Accept': 'application/json'
    },
    muteHttpExceptions: true
  };
};