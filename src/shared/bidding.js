import { Iterator } from '../core/iterator';

export function ortb(rate, budget, tuning, time){
  return 2 * rate * Math.pow(budget * Math.pow(tuning, 2) / time, 1 / 3);
}

export function setMinKeywordProvidedBid(inputConditions, maxBid, type){
  let conditions = ['CampaignStatus = ENABLED','Status = ENABLED'];
  
  for(let i in inputConditions){
    conditions.push(inputConditions[i]);
  }
  
  return new Iterator({
    entity: AdWordsApp.adGroups(),
    conditions: conditions, 
    dateRange: 'LAST_30_DAYS'
  }).run(function(){
    let adGroupCpc = this.bidding().getCpc();
    
    try {
      let keywords = new Iterator({
        entity: this.keywords(),
        conditions: ['Status = ENABLED']
      });
      keywords.run(function(){
        this.bidding().clearCpc();
      });
      keywords.run(function(){
        let firstPageCpc = this[type]();
        if(firstPageCpc > adGroupCpc && firstPageCpc <= maxBid){
          this.bidding().setCpc(firstPageCpc);
        } else if (firstPageCpc > adGroupCpc && firstPageCpc > maxBid){
          this.bidding().setCpc(maxBid);
        }
      });
    } catch(e){ Logger.log(e); }

  });
}

export function setMinFirstPageBid(inputConditions, maxBid){
  setMinKeywordProvidedBid(inputConditions, maxBid, 'getFirstPageCpc');
}
export function setMinTopOfPageBid(inputConditions, maxBid){
  setMinKeywordProvidedBid(inputConditions, maxBid, 'getTopOfPageCpc');
}