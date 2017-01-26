import { Iterator } from '../iterator/iterator';
import { bayesianTest, bayesianDecision } from '../shared/statistics';

export class Modifier extends Iterator {
  
  constructor(props){
    super(props);
  }
  
  bayesian(input){
    
    const dateRange = this.props.dateRange ? this.props.dateRange : 'ALL_TIME';
    const maxModifier = input.maxModifier ? input.maxModifier : 0.25;
    const decisionThreshold = input.decisionThreshold ? input.decisionThreshold : 0.005;
    
    super.run(function(){
      Logger.log(this.getStatsFor(dateRange).getAverageTimeOnSite());
      let stats = realtimeStats(this, dateRange);
      let campaign = realtimeStats(this.getCampaign(), dateRange);
      let alphaA, betaA, alphaB, betaB;
      
      if (stats.conversions > 0){
        alphaA = stats.conversions;
        betaA  = stats.clicks - alphaA;
        alphaB = campaign.conversions;
        betaB  = campaign.clicks - alphaB;
      } else {
        alphaA = stats.clicks;
        betaA  = stats.impressions - alphaA;
        alphaB = campaign.clicks;
        betaB  = campaign.impressions - alphaB;
      }
      
      let decision = bayesianDecision(alphaA, betaA, alphaB, betaB);
      
      if (decision < decisionThreshold){
        let modifier = (1 - maxModifier) + (2 * maxModifier * (1 - bayesianTest(alphaA, betaA, alphaB, betaB)));
        this.setBidModifier(modifier);
      }
    });
  }
}

export function realtimeStats(entity, dateRange){
  let history = entity.getStatsFor(dateRange);
  let today = entity.getStatsFor('TODAY');
  return {
    clicks: history.getClicks() + today.getClicks(),
    conversions: history.getConversions() + today.getConversions(),
    cost: history.getCost() + today.getCost(),
    impressions: history.getImpressions() + today.getImpressions(),
    views: history.getViews() + today.getViews()
  };
}