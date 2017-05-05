import { Iterator } from './core/iterator';

const main = function () {
  
  // Use selectors
  let selector = new Iterator({
    entity: AdWordsApp.campaigns()
  }).select();
  
  while(selector.hasNext()){
    let campaign = selector.next();
    Logger.log(campaign.getName());
  }
  
  // Go straight to iterating:
  // Use arrows
  new Iterator({
    entity: AdWordsApp.campaigns()
  }).iterate(campaign => {
    Logger.log(campaign.getName());
  });
  
  // Don't use arrows
  new Iterator({
    entity: AdWordsApp.campaigns()
  }).iterate(function(){
    Logger.log(this.getName());
  });
  
  // Create an array of objects using arrow functions
  let arrowArray = new Iterator({
    entity: AdWordsApp.campaigns()
  }).toArray({
    id: campaign => campaign.getId(),
    clicks: campaign => {
      let stats = campaign.getStatsFor('YESTERDAY');
      return {
        clicks: stats.getClicks(),
        ctr: stats.getCtr()
      };
    }
  });
  
  Logger.log(arrowArray);
  
  // Create an array of objects
  let thisArray = new Iterator({
    entity: AdWordsApp.campaigns()
  }).toArray({
    name(){ return this.getName(); },
    conversions(){
      let stats = this.getStatsFor('YESTERDAY');
      return {
        conversions: stats.getConversions(),
        conversionRate: stats.getConversionRate()
      };
    }
  });
  
  Logger.log(thisArray);
  
  // Create an array from a single property
  let singleArray = new Iterator({
    entity: AdWordsApp.campaigns()
  }).toArray(campaign => campaign.getName());
  
  Logger.log(singleArray);
};

main();
