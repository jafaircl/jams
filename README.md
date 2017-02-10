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

To build in prodution (minified with uglify) use:

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
new Iterator({
  entity: AdWordsApp.keywords(),
  conditions: ['Impressions > 100', 'Clicks > 0'],
  dateRange: 'LAST_30_DAYS',
}).run(function(){
  this.getText(); // returns keyword text
});
```

Turn the iterator into an array:

```javascript
const conditions = ['Impressions > 100', 'Clicks > 0'];
const dateRange = 'LAST_30_DAYS';

let ads = new Iterator({
  entity: AdWordsApp.ads(),
  conditions: conditions,
  dateRange: dateRange,
}).toArray({
  ad(){ return this; },
  id(){ return this.getId(); },
  stats(){ 
    let stats = this.getStatsFor(dateRange);
    return {
      clicks: stats.getClicks(),
      conversions: stats.getConversions(),
      impressions: stats.getImpressions()
    };
  },
});
```