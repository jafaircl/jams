# JavaScript AdWords Modules

## Introduction

Jams is a library of ES6 classes and helper functions for use in AdWords Scripts.

## Getting Started

cd to your directory and clone this repository:

```sh
git clone https://github.com/jafaircl/jams.git
```

By default, rollup will look at src/jams.js and output to build/bundle.js. To change the input or output files, modify the entry/dest properties of rollup.config.js:

```javascript
export default {
  entry: "src/jams.js", // change this for the input
  dest: 'build/bundle.js', /// change this for the output
  format: "es",
  plugins: [...],
};
```

To build & watch for changes in development, cd to the directory and use:

```sh
npm run watch
```

To build with minification via uglify, use:

```sh
npm run minify
```

One of rollup's features is tree shaking. Any functions that are not called will be removed from the bundled output. AdWords Scripts require a "main" function to run. To keep this function in your bundled output, you will need to call it. The easiest way to do this is to use an Immediately Invoked Function Expression (IIFE). e.g.

```javascript
(function main(){

  // your code...
  
})();
```

## Usage

### Iterators

Build an iterator and run through it normally:

```javascript
import { Iterator } from './shared/iterator';

const conditions = ['Impressions > 100', 'Clicks > 0'];
const dateRange = 'LAST_30_DAYS';

let ads = new Iterator({
  entity: AdWordsApp.ads(),
  conditions: conditions,
  dateRange: dateRange,
}).build();

while(ads.hasNext()){
  let ad = ads.next();
  
  // your code...
}
```

Quickly build and start iterating. "this" is set to the next item in the iterator:

```javascript
import { Iterator } from './shared/iterator';

new Iterator({
  entity: AdWordsApp.keywords(),
  conditions: ['Impressions > 100', 'Clicks > 0'],
  dateRange: 'LAST_30_DAYS',
}).run(function(){
  this.getText(); // returns keyword text
});
```

Turn the iterator into an array. This can keep you from traversing the hierarchy, slowing down your script. Consider the following code which logs an array of information about ads in an ad group:

```javascript
function main(){
  var adGroupSelector = AdWordsApp.adGroups()
  .withCondition("Impressions > 0")
  .forDateRange("LAST_30_DAYS");

  var adGroupIterator = adGroupSelector.get();
  while (adGroupIterator.hasNext()) {
    var adGroup = adGroupIterator.next();
    var adGroupId = adGroup.getId();
    var adsIterator = adGroup.ads()
    .withCondition("Impressions > 0")
    .forDateRange("LAST_30_DAYS")
    .orderBy("Impressions DESC")
    .get();
    var arr = [];
    
    while (adsIterator.hasNext()){
      var ad = adsIterator.next();
      var stats = ad.getStatsFor('LAST_30_DAYS');

      arr.push({
        id: ad.getId(),
        adGroupId: adGroupId,
        stats: {
          clicks: stats.getClicks(),
          impressions: stats.getImpressions()
        }
      })
    }
    Logger.log(arr);
  }
}
```

On a small test account, this takes 1:35 to run and log 144 rows of data. Now, consider the following code:

```javascript
import { Iterator } from './shared/iterator';

const conditions = ['Impressions > 0'];
const dateRange = 'LAST_30_DAYS';

(function main(){
  let ads = new Iterator({
    entity: AdWordsApp.ads(),
    conditions: conditions,
    dateRange: dateRange,
  }).toArray({
    id(){ return this.getId(); },
    adGroupId(){ return this.getAdGroup().getId(); },
    stats(){ 
      let stats = this.getStatsFor(dateRange);
      return {
        clicks: stats.getClicks(),
        impressions: stats.getImpressions()
      };
    },
  });

  for(let i in ads){
    // Filter the array for ads in the same ad group
    let group = ads.filter(ad => ad.adGroupId === ads[i].adGroupId);

    // Sort the group by impressions in descending order
    group.sort((a, b) => b.stats.impressions - a.stats.impressions);
    
    Logger.log(group);
    
    for(let j in group){
      
      
      // Get the index of the logged ad & remove it so we don't keep logging the same ad groups
      ads.splice(ads.indexOf(group[j]), 1);
    }
  }
})();
```

On the same account, this takes 19 seconds.