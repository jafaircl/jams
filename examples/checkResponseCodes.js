import { Iterator } from './core/iterator';
import { deDuplicate } from './shared/utils';

const main = function () {
  let ads = new Iterator({
    entity: AdWordsApp.ads(),
    conditions: ['CampaignStatus = ENABLED','AdGroupStatus = ENABLED','Status = ENABLED']
  }).toArray({
    finalUrl(){ return this.urls().getFinalUrl(); }
  });
  let urls = deDuplicate(ads);
  let fetchOpts = {
    'followRedirects': false
  };
  let failArr = [];
  
  for(let i in urls){
    let resp = UrlFetchApp.fetch(urls[i].finalUrl, fetchOpts).getResponseCode();
    
    if(resp !== 200.0){
      failArr.push(urls[i]);
    }
  }
  
  Logger.log(failArr);
};

main();
