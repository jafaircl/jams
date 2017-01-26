import { Iterator } from '../iterator/iterator';
import { isNumber } from '../shared/utils';

export class Bidder extends Iterator {
  constructor(props){
    super(props);
  }
  
  custom(input){
    const dateRange = this.props.dateRange ? this.props.dateRange : 'ALL_TIME';
    
    super.run(function(){
      this.dateRange = dateRange;
      this.stats = this.getStatsFor(this.dateRange);
      let minBid = input.minBid.call(this);
      let maxBid = input.maxBid.call(this);
      let bid = input.bid.call(this);
      
      bidderSetBid(this, bid, minBid, maxBid);
    });
  }
  
  targetCpa(input){
    this.custom({
      minBid: function(){ return bidderMinBid.call(this, input); },
      maxBid: function(){ return bidderMaxBid.call(this, input); },
      bid: function(){
        let multi = input.multiplier? input.multiplier : 1;
        if(input.targetCpa){
          return input.targetCpa * this.stats.getConversionRate() * multi;
        } else {
          let campaign = this.getCampaign().getStatsFor(this.dateRange);
          return campaign.getCost() / campaign.getConversions() * this.stats.getConversionRate() * multi;
        }
      }
    });
  }
  
  randomize(input){
    this.custom({
      minBid: function(){ return bidderMinBid.call(this, input); },
      maxBid: function(){ return bidderMaxBid.call(this, input); },
      bid: function(){
        return Math.random() * (input.maxBid - input.minBid) + input.minBid;
      }
    });
  }
  
  ortb(input) {
    this.custom({
      minBid: function(){ return bidderMinBid.call(this, input); },
      maxBid: function(){ return bidderMaxBid.call(this, input); },
      bid: function(){
        let conversions    = this.stats.getConversions();
        let clicks         = this.stats.getClicks();
        let impressions    = this.stats.getImpressions();
        let conversionRate = this.stats.getConversionRate();
        let ctr            = this.stats.getCtr();
        let cost           = this.stats.getCost();
        let averageCpc     = this.stats.getAverageCpc();
        let averagePos     = this.stats.getAveragePosition();
        
        if(input.realTime !== false){
          let today      = this.getStatsFor('TODAY');
          conversions   += today.getConversions();
          clicks        += today.getClicks();
          impressions   += today.getImpressions();
          cost          += today.getCost();
          conversionRate = conversions / clicks;
          ctr            = clicks / impressions;
          averageCpc     = cost / clicks;
        }
        
        let adjust = averagePos === null ? 1 : averagePos;
        
        if (this.getEntityType() === 'Keyword') {
          adjust = adjust * this.getQualityScore();
        }
        
        let multi = input.multiplier? input.multiplier : 1;
        let r = conversions > 0 ? conversionRate : ctr;
        let B = this.getCampaign().getBudget();
        let l = input.tuningParameter ? input.tuningParameter : adjust / (averageCpc * ctr);
        let T = clicks / input.statsDuration;
        
        return multi * 2 * r * Math.pow((B * Math.pow(l, 2)) / T, 1/3);
      }
    });
  }
}

export function bidderSetBid(entity, bid, minBid, maxBid) {
  let strategy = entity.bidding().getCpm() <= 0.01 ? 'setCpc' : 'setCpm';
  
  if(bid > maxBid){
    entity.bidding()[strategy](maxBid);
  } else if (bid < minBid) {
    entity.bidding()[strategy](minBid);
  } else if (isNumber(bid) && isNaN(bid)){
    Logger.log(`${bid} is not a valid number`);
  } else {
    entity.bidding()[strategy](bid);
  }
}

export function bidderMinBid(input){
  let minBid = input.minBid;
  
  try{
    this.getCampaign().display().placements().get().next();
  } catch(e){
    if (
      this.getEntityType() === 'Keyword'
      && isNumber(this.getFirstPageCpc())
      && this.getFirstPageCpc() < input.maxBid
      && this.getFirstPageCpc() > input.minBid
    ){
      return this.getFirstPageCpc();
    }
  }
  return minBid;
}

export function bidderMaxBid(input){
  let maxBid = input.maxBid;
  
  try{
    this.getCampaign().display().placements().get().next();
  } catch(e){
    if (
      this.getEntityType() === 'Keyword'
      && isNumber(this.getTopOfPageCpc())
      && this.getFirstPageCpc() != this.getTopOfPageCpc()
      && this.getTopOfPageCpc() < input.maxBid
      && this.getTopOfPageCpc() > input.minBid
    ){
      return this.getTopOfPageCpc() > this.stats.getAverageCpc() ?
        this.getTopOfPageCpc() :
        this.stats.getAverageCpc();
    }
  }
  return maxBid;
}