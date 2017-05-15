# JavaScript AdWords Modules

## Introduction

Jams is a library of ES6 classes and helper functions for use in AdWords Scripts. Build your scripts to take advantage of ES6/ES2015, automatically compile them on your machine and paste them into AdWords. You can also minify the output to help prevent modification.

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

But, in some cases, IIFEs can cause a script to miss iterations. So, the safest way to make sure you function remains in your bundled output is to call it then remove the call when you move your script to AdWords.

```javascript
function main(){

  // your code

}

main(); // remove this from your bundled output
```

## Usage

### Iterators

Build a selector and iterate through it normally:

```javascript
import { Iterator } from './core/iterator';

const conditions = ['Impressions > 100', 'Clicks > 0'];
const dateRange = 'LAST_30_DAYS';

let ads = new Iterator({
  entity: AdWordsApp.ads(),
  conditions: conditions,
  dateRange: dateRange,
}).select();

while(ads.hasNext()){
  let ad = ads.next();
  
  // your code...
}
```

Build and start iterating:

```javascript
import { Iterator } from './core/iterator';

new Iterator({
  entity: AdWordsApp.keywords(),
  conditions: ['Impressions > 100', 'Clicks > 0'],
  dateRange: 'LAST_30_DAYS',
}).iterate(keyword => {
  Logger.log(keyword.getText()); // returns keyword text
});
```

Turn the iterator into an array, which will be filterable, sortable and searchable.

```javascript
import { Iterator } from './core/iterator';

let campaigns = new Iterator({
  entity: AdWordsApp.campaigns()
});

// Create an array of objects for the properties you need
let arr = campaigns.toArray({
  id: campaign => campaign.getId(),
  // Create a nested property
  clicks: campaign => {
    let stats = campaign.getStatsFor('YESTERDAY');
    return {
      clicks: stats.getClicks(),
      ctr: stats.getCtr()
    };
  }
});

Logger.log(arr);

// Create an array from a single property
let single = campaigns.toArray(campaign => campaign.getName());

Logger.log(single);

// Grab everything (not recommended)
let everything = campaigns.toArray();

Logger.log(everything);
```

Building an array can keep you from traversing the hierarchy, which will slow down your script. Consider the following code which logs an array of information about ads in an ad group:

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
    Logger.log(arr[0]['adGroupId']);
  }
}
```

On a test account where there are 400 ad groups and 649 ads that meet this criteria, the above takes 4:57 (297 seconds) to run. That's 1/6 of your allotted run time without even doing anything to the ads you fetched. Now, consider the following code:

```javascript
import { Iterator } from './core/iterator';

const conditions = ['Impressions > 0'];
const dateRange = 'LAST_30_DAYS';

const main = function() {
  let ads = new Iterator({
    entity: AdWordsApp.ads(),
    conditions: conditions,
    dateRange: dateRange,
  }).toArray({
    id: ad => ad.getId(),
    adGroupId: ad => ad.getAdGroup().getId(),
    stats: ad => { 
      let stats = ad.getStatsFor(dateRange);
      return {
        clicks: stats.getClicks(),
        impressions: stats.getImpressions()
      };
    },
  });
  
  // Loop backwards so filtering the ads doesn't mess up indexing
  let i = ads.length - 1;
  for(i; i >= 0; i = ads.length - 1){
    
    // Filter the array for ads in the same ad group
    let group = ads.filter(ad => ad.adGroupId === ads[i].adGroupId);

    Logger.log(group[0].adGroupId);
    
    // Filter out the ads in this ad group from the main array
    ads = ads.filter(ad => ad.adGroupId !== ads[i].adGroupId);
  }
};
```

On the same account, this takes 44 seconds which is 85% faster. On large accounts, the time savings could be the difference between your script timing out or not.

### Builders

Builders can create any entity except campaigns and shared sets (excluded placement and negative keyword lists). For example, to create an ad group:

```javascript
let builder = new Builder({
  parent: AdWordsApp.campaigns(),
  conditions: ['Name = "(Display) Example"']
});

builder.createAdGroup({
  name: 'Example',
  status: 'PAUSED',
  cpc: 3
});
```

User the result to create ads and an exact match keyword in the ad group:

```javascript
let builder = new Builder({
  parent: AdWordsApp.campaigns(),
  conditions: ['Name = "(Search) Example"']
});

let adGroup = builder.createAdGroup({
  name: 'Example',
  status: 'PAUSED',
  cpc: 3
});

let adGroupBuilder = new Builder(adGroup);

adGroupBuilder.createExpandedTextAd({
  headlinePart1: 'Headline 1',
  headlinePart2: 'Headline 2',
  description: 'Description',
  path1: 'path1',
  path2: 'path2',
  finalUrl: 'https://www.google.com'
});

adGroupBuilder.createKeyword({
  text: '[testing]'
});
```

For display criteria, you can create a negative audience, keyword, placement, or topic by adding "exclude: true":

```javascript
adGroupBuilder.createDisplayKeyword({
  text: '[example]',
  exclude: true
});
```

Full example:

```javascript
import { Builder, createImageFromUrl } from './core/builder';
// We need a polyfill for Object.assign()
import * as _polyfill from './polyfills/assign'; _polyfill;

// Names of the ad groups we want to create
const adGroups = [
  'Test - Topic Targeting',
  'Test - Affinity Targeting',
  'Test - Contextual Targeting'
];

// Shared properties for the ads we want to create
const sharedAdProperties = {
  businessName: 'business name',
  logoImage: createImageFromUrl('https://www.example.com/logo.png', 'testing'),
  finalUrl: 'https://www.google.com',
};

// Unique properties for the ads we want to create
const ads = [{
  shortHeadline: 'short headline 1',
  longHeadline: 'longer headline 1',
  description: 'decription 1',
  marketingImage: createImageFromUrl('https://www.example.com/img1.png', 'mktngimg1')
},{
  shortHeadline: 'short headline 2',
  longHeadline: 'longer headline 2',
  description: 'decription 2',
  marketingImage: createImageFromUrl('https://www.example.com/img2.png', 'mktngimg2')
}];

const main = function () {
  
  // Define an ad group builder by selecting the parent
  let builder = new Builder({
    parent: AdWordsApp.campaigns(),
    conditions: ['Name = "(Display) Example"']
  });
  
  // Iterate through ad groups we want to create
  for(let i in adGroups){
    
    // Create the ad group
    let adGroup = builder.createAdGroup({
      name: adGroups[i],
      status: 'PAUSED',
      cpc: 3
    });
    
    // Iterate through the ads we want to create
    for(let j in ads){
      let ad = new Builder(adGroup);
      // Combine the shared and unique properties of the ads
      let obj = Object.assign(ads[j], sharedAdProperties);
      
      // Create the ads
      ad.createResponsiveDisplayAd(obj);
    }
  }
};
```