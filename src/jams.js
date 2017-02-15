import { Iterator } from './shared/iterator';

const conditions = ['Impressions > 0'];
const dateRange = 'LAST_30_DAYS';

function main(){
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
  
  // Loop backwards so filtering the ads doesn't mess up indexing
  let i = ads.length - 1;
  for(i; i >= 0; i = ads.length - 1){
    
    // Filter the array for ads in the same ad group
    let group = ads.filter(ad => ad.adGroupId === ads[i].adGroupId);

    Logger.log(group[0].adGroupId);
    
    // Filter out the ads in this ad group from the main array
    ads = ads.filter(ad => ad.adGroupId !== ads[i].adGroupId);
  }
}

main();