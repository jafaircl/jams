import { NegativeKeywords } from './negatives/keywords';

const main = () => {
  
  new NegativeKeywords({
    conditions: ['CampaignName CONTAINS_IGNORE_CASE "(Search)"'],
    dateRange: 'LAST_30_DAYS',
  }).crossGroup({
    exclude: ['peri', 'of', 'is', 'a'],
    phrase: true,
    exact: false,
    broad: true
  });
};

main();