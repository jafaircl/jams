import { Bidder } from './bidding/bidder';
import { Modifier } from './bidding/modifier';

const maxSearchBid = 15;
const minSearchBid = 0.75;

const maxDisplayBid = 2;
const minDisplayBid = 0.75;

const maxModifier = 0.2;

const conversionThreshold = 1;

const hourToRandomize = 3;

let modifierCriteria = [
  'AdWordsApp.targeting().targetedLocations()',
  'AdWordsApp.targeting().platforms()',
];

let searchBidCriteria = [
  'AdWordsApp.keywords()',
];

let displayBidCriteria = [
  'AdWordsApp.adGroups()',
  'AdWordsApp.display().keywords()',
  'AdWordsApp.display().topics()',
  'AdWordsApp.display().audiences()',
];

const hourOfDay = new Date().getHours();

function main() {
  
  /*
   *  Bid Modifiers
   */
  for(let i in modifierCriteria){
    new Modifier({
      entity: eval(modifierCriteria[i]),
      conditions: [
        'Impressions > 100'
      ],
      dateRange: 'LAST_30_DAYS'
    }).bayesian({
      maxModifier: maxModifier,
      decisionThreshold: 0.002
    });
  }
  
  /*
   *  Search
   */
  for(let i in searchBidCriteria){
    
    // Optimize bids for entities with multiple conversions
    new Bidder({
      entity: eval(searchBidCriteria[i]),
      conditions: [
        'CampaignStatus = ENABLED',
        'Status = ENABLED',
        'CampaignName CONTAINS_IGNORE_CASE "search"',
        'Clicks > 0',
        'Conversions > ' + conversionThreshold,
      ],
      dateRange: 'LAST_30_DAYS'
    }).targetCpa({
      minBid: minSearchBid,
      maxBid: maxSearchBid,
      multiplier: 0.9
    });
    
    // Optimize for CTR for entities with clicks but few conversions
    new Bidder({
      entity: eval(searchBidCriteria[i]),
      conditions: [
        'CampaignStatus = ENABLED',
        'Status = ENABLED',
        'CampaignName CONTAINS_IGNORE_CASE "search"',
        'Clicks > 0',
        'Conversions <= ' + conversionThreshold,
      ],
      dateRange: 'LAST_30_DAYS'
    }).ortb({
      minBid: minSearchBid,
      maxBid: maxSearchBid,
      statsDuration: 30,
    });
    
    // Randomize for entities with no clicks 2x/day
    if (hourOfDay === hourToRandomize){
      new Bidder({
        entity: eval(searchBidCriteria[i]),
        conditions: [
          'CampaignStatus = ENABLED',
          'Status = ENABLED',
          'CampaignName CONTAINS_IGNORE_CASE "search"',
          'Clicks = 0'
        ],
        dateRange: 'LAST_30_DAYS'
      }).randomize({
        minBid: minSearchBid,
        maxBid: maxSearchBid,
      });
    }
  }
  
  /*
   *  Display
   */
  for(let i in displayBidCriteria){
    
    // Optimize bids for entities with multiple conversions
    new Bidder({
      entity: eval(displayBidCriteria[i]),
      conditions: [
        'CampaignStatus = ENABLED',
        'CampaignName CONTAINS_IGNORE_CASE "display"',
        'Clicks > 0',
        'Conversions > ' + conversionThreshold,
      ],
      dateRange: 'LAST_30_DAYS'
    }).targetCpa({
      minBid: minDisplayBid,
      maxBid: maxDisplayBid,
      multiplier: 0.9
    });
    
    // Optimize for CTR for entities with clicks but few conversions
    new Bidder({
      entity: eval(displayBidCriteria[i]),
      conditions: [
        'CampaignStatus = ENABLED',
        'CampaignName CONTAINS_IGNORE_CASE "display"',
        'Clicks > 0',
        'Conversions <= ' + conversionThreshold,
      ],
      dateRange: 'LAST_30_DAYS'
    }).ortb({
      minBid: minDisplayBid,
      maxBid: maxDisplayBid,
      statsDuration: 30,
    });
    
    // Randomize for entities with no clicks 2x/day
    if (hourOfDay === hourToRandomize){
      new Bidder({
        entity: eval(displayBidCriteria[i]),
        conditions: [
          'CampaignStatus = ENABLED',
          'CampaignName CONTAINS_IGNORE_CASE "display"',
          'Clicks = 0',
        ],
        dateRange: 'LAST_30_DAYS'
      }).randomize({
        minBid: minDisplayBid,
        maxBid: maxDisplayBid,
      });
    }
  }
}

main();
