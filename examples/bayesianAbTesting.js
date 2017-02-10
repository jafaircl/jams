import { Iterator } from './shared/iterator';
import { bayesianTest, bayesianDecision } from './shared/statistics';
import { addLabel, deleteLabel } from './shared/labels';
import { HtmlTable, tableStyle } from './shared/email';

// Ad conditions
const adConditions = [
  'CampaignStatus = ENABLED',
  'AdGroupStatus = ENABLED',
  'Status = ENABLED',
  'CampaignName CONTAINS_IGNORE_CASE "Search"',
  'Impressions > 100'
];
const dateRange = 'ALL_TIME';

// Testing variables
const conversionsGreaterThan = 0;
const decisionThreshold = 0.002;
const probabilityThreshold = 0.8;

// Labels
const labels = {
  control: {
    name: 'Control Ad',
    color: '#4CAF50'
  },
  winning: {
    name: 'Winning Ad',
    color: '#2196F3'
  },
  losing: {
    name: 'Losing Ad',
    color: '#F44336'
  },
  testing: {
    name: 'Test In Progress',
    color: '#FFC107'
  },
};

// Email
const emailRecipient = 'jfaircloth@cocg.co';
const accountName = AdWordsApp.currentAccount().getName();

(function main() {
  
  // Initialize the labels
  for(let i in labels){
    // Remove each label from the account entirely.
    // This is faster than removing each label from individual ads.
    // As long as your labels are unique to this test, it should not matter.
    deleteLabel(labels[i].name);
    
    // Add them back. They should not be assigned to any ad now.
    addLabel(labels[i].name, labels[i].color);
  }
  
  // Start an email table
  let table = new HtmlTable({
    title: accountName + ' - A/B Testing Results',
    columns: ['Campaign', 'Ad Group', 'Probability', 'Expected Loss'],
    style: tableStyle
  });
  
  let sendEmail = false;
  
  // Build an array of ads in the account
  let ads = new Iterator({
    entity: AdWordsApp.ads(),
    conditions: adConditions,
    dateRange: dateRange,
  }).toArray({
    ad(){ return this; },
    adGroupId(){ return this.getAdGroup().getId(); },
    adGroupName(){ return this.getAdGroup().getName(); },
    campaignName(){ return this.getCampaign().getName(); },
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
  
  for(let i in ads){
    // Filter the array for ads in the same ad group
    let group = ads.filter(ad => ad.adGroupId === ads[i].adGroupId);
    
    // Sort the group by impressions in descending order
    group.sort((a, b) => b.stats.impressions - a.stats.impressions);
    
    // Check to make sure there are at least 2 ads
    if (group.length > 1){
      
      // Apply label to control ad
      group[0].ad.applyLabel(labels.control.name);
      
      // Skip the first ad so we can use it as a control
      for(let j = 1; j < group.length; j += 1){
        let alphaA, alphaB, betaA, betaB;
        
        // If either ad is over the conversion threshold, use conversion rate
        if(group[0].stats.conversions > conversionsGreaterThan || group[j].stats.conversions > conversionsGreaterThan){
          alphaA = group[0].stats.conversions;
          betaA = group[0].stats.clicks - alphaA;
          alphaB = group[j].stats.conversions;
          betaB = group[j].stats.clicks - alphaB;
          
        // Otherwise, use click through rate
        } else {
          alphaA = group[0].stats.clicks;
          betaA = group[0].stats.impressions - alphaA;
          alphaB = group[j].stats.clicks;
          betaB = group[j].stats.impressions - alphaB;
        }
        
        // Get the probability
        let test = bayesianTest(alphaA, betaA, alphaB, betaB);
        // Check against decision threshould
        let decision = bayesianDecision(alphaA, betaA, alphaB, betaB);
        
        // Condition: B > A and clears both thresholds
        if (decision < decisionThreshold && test > probabilityThreshold && (test * 100).toFixed(2) !== 0.00){
          group[j].ad.applyLabel(labels.winning.name);
          sendEmail = true;
          table.addRow([group[j].campaignName, group[j].adGroupName, (test * 100).toFixed(2) + '%', (decision * 100).toFixed(2) + '%']);
          
        // Condition: A > B and clears both thresholds
        } else if (decision < decisionThreshold && test < 1 - probabilityThreshold){
          group[j].ad.applyLabel(labels.losing.name);
          sendEmail = true;
          table.addRow([group[j].campaignName, group[j].adGroupName, (test * 100).toFixed(2) + '%', (decision * 100).toFixed(2) + '%']);
          
        // Condition: Either decision or probability threshold is not met
        } else {
          group[j].ad.applyLabel(labels.testing.name);
        }
        
        // Get the index of the tested ad & remove it so we don't keep testing it
        ads.splice(ads.indexOf(group[j]), 1);
      }
    }
  }
  
  table.close();
  
  if (sendEmail === true){
    MailApp.sendEmail({
      to: emailRecipient,
      subject: accountName + ' - A/B Testing Results',
      htmlBody: table.html,
    });
  }
})();
