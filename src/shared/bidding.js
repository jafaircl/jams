import { Iterator } from '../core/iterator';

/**
 * Optimal Real-Time Bidding Formula
 * See: http://discovery.ucl.ac.uk/1496878/1/weinan-zhang-phd-2016.pdf
 * Courtesy: wnzhang (https://github.com/wnzhang/rtbarbitrage/blob/master/python/arbitrage_rtb_test.py)
 * @param {number} pctr: predicted KPI (CTR, CVR, etc)
 * @param {number} base_ctr : base KPI (CTR, CVR, etc)
 * @param {number} dsp_l : market price of a click/conversion/impression
 * @param {number} para : lamda (daily budget / clicks per day works well )
 */
export function optimalRealTimeBid (pctr, base_ctr, dsp_l, para) {
  return Math.sqrt(pctr * dsp_l * para / base_ctr + dsp_l * dsp_l) - dsp_l;
}

/**
 * Statistical Arbitrage Mining Bid
 * See: http://discovery.ucl.ac.uk/1496878/1/weinan-zhang-phd-2016.pdf
 * Courtesy: wnzhang (https://github.com/wnzhang/rtbarbitrage/blob/master/python/arbitrage_rtb_test.py)
 * @param {*} pCtr : predicted CTR
 * @param {*} pCpc : predicted Cost Per Click
 * @param {*} cpa : base cost per acquisition
 * @param {*} r : payoff setting. default is cpa * 0.2
 */
export function statisticalArbitrageMiningBid (pCtr, pCpc, cpa, r = 0.2 * cpa){
  return Math.sqrt(r * pCpc * pCtr * (1 / (pCpc + 1)) + pCpc * pCpc) - pCpc;
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