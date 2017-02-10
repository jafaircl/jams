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
