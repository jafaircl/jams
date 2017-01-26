import { Iterator } from '../iterator/iterator';

export function arrayContainsStringFilter(arr, str){
  let bool = false;
  
  for (let i in arr){
    if (arr[i].indexOf(str)>-1){
      bool = true;
    }
  }
  return bool;
}

export class NegativeKeywords{
  constructor(props){
    this.props = props;
  }
  
  /*
  import { NegativeKeywords } from './negatives/keywords';

  const main = () => {

    new NegativeKeywords({
      conditions: ['CampaignName CONTAINS_IGNORE_CASE "(Search)"'],
      dateRange: 'LAST_30_DAYS',
    }).crossGroup({
      exclude: ['peri', 'of', 'is', 'a'],
      phrase: true,
      exact: false,
      broad: true
    });
  };
  */
  crossGroup(params){
    
    let keywordConditions = ['Status = ENABLED', 'QualityScore > 2'];
    let adGroupConditions = ['Status = ENABLED'];
    let dateRange = 'ALL_TIME';
    
    if (this.props && this.props.conditions){
      for (let i in this.props.conditions){
        keywordConditions.push(this.props.conditions[i]);
        adGroupConditions.push(this.props.conditions[i]);
      }
    }
    
    if (this.props && this.props.dateRange){
      dateRange = this.props.dateRange;
    }
    
    // Get an array of all keywords with the ad group id and keyword text
    let keywords = new Iterator({
      entity: AdWordsApp.keywords(),
      conditions: keywordConditions,
      dateRange: dateRange
    }).toArray({
      fields: {
        adGroupId: function(){ return this.item.getAdGroup().getId(); },
        text: function(){ return this.item.getText(); }
      }
    });
    
    new Iterator({
      entity: AdWordsApp.adGroups(),
      conditions: adGroupConditions,
      dateRange: dateRange
    }).run(function(){
      let thisId = this.getId();
      let keywordArray = [];

      let adGroupKeywords = keywords.filter(function(keyword){
        if (keyword.adGroupId === thisId) {
          keywordArray.push(keyword.text.toLowerCase());
          return true;
        }
      });

      for(let i in adGroupKeywords){
        let keyword = adGroupKeywords[i].text.toLowerCase();

        for(let j in keywords){
          let potentialMatch = keywords[j].text.toLowerCase();
          if(potentialMatch.indexOf(keyword) > -1 && !keywordArray.includes(potentialMatch)){
            
            keyword = keyword.replace(/(\s\+)+/g, ' ')
                             .replace(/(\+)+|(")+|(\[)+|(\])+|\s\s+/g, '');
            
            let cleanup = ['\\+', '"', '\\[', '\\]'];
            let match = potentialMatch.replace(new RegExp('(' + cleanup.join('|') + ')', 'g'), '')
                                      .replace(keyword,'')
                                      .split(' ');
            
            let orphans = ['s', 'es', 'ies'];
            
            if(params && params.exclude){
              for(let k in params.exclude){
                orphans.push(params.exclude[k]);
              }
            }
            
            for(let l in match){
              match[l] = orphans.includes(match[l]) ? null : match[l];
            }
            
            match = match.join(' ').replace(/^[ ]+|[ ]+$/g,'');
            
            let negatives = {
              phrase: `"${match}"`,
              exact: `[${match}]`,
              broad: `+${match.replace(/\s+/g, ' +')}`
            };
            
            let emptyNegatives = ['[]', '""', '+'];
            
            for(let type in negatives){
              if(params
                 && params[type] !== false
                 && !keywordArray.includes(negatives[type])
                 && !emptyNegatives.includes(negatives[type])){
                
                this.createNegativeKeyword(negatives[type]);
                keywordArray.push(negatives[type]);
                Logger.log(`${negatives[type]} will be a negative keyword in ${this.getName()}`);
              }
            }
          }
        }
      }
    });
  }
}




// Array.includes() polyfill
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        // c. Increase k by 1.
        // NOTE: === provides the correct "SameValueZero" comparison needed here.
        if (o[k] === searchElement) {
          return true;
        }
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}

if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}