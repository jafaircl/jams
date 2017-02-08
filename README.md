#Jams
## JavaScript AdWords Modules

## Introduction

Jams is a library of ES6 classes and helper functions for use in AdWords Scripts.

## Get Started

cd to your directory and clone the repo:

```sh
git clone https://github.com/jafaircl/jams.git
```

By default, rollup will look at src/jams.js and output to build/bundle.js. To change the input or output files, modify the entry/dest properties of rollup.config.js:

```javascript
export default {
  entry: "src/index.js", // change this for the input
  dest: 'build/bundle.js', /// change this for the output
  format: "es",
  plugins: [...],
};
```

To build & watch for changes in development (un-minified) use:

```sh
npm run watch
```

To build in prodution (minified with uglify) use:

```sh
npm run minify
```

One of Rollup's features is tree shaking. Any functions that are not called will be removed from the bundled output. AdWords Scripts require a "main" function to run. To keep this function in your bundled output, you will need to call it. To keep your script from running twice, manually remove the call from the bundled output. e.g.

```javascript
const main = function(){
  // your code...
};

main(); // Remove this from bundled output
```
