/*
 * Cross-Ad Group Negative Keywords
 * ---
 * Say you have these 2 single keyword ad groups:
 * "emergency room"
 * "emergency room near me"
 * This script will add "near me" (modified broad & phrase variants)
 * as a negative keyword in the ad group "emergency room." It removes
 * all negative keyword in an ad group before it runs so that, if we
 * were to remove "emergency room near me," "near me" will be removed
 * from the negative keywords for "emergency room."
 * ---
 * Schedule: Run daily
 */

import { NegativeKeywords } from './negatives/keywords';

const main = function () {
  
  new NegativeKeywords({
    conditions: ['CampaignName CONTAINS_IGNORE_CASE "search"'],
    dateRange: 'LAST_30_DAYS'
  }).crossAdGroup({
    exclude: ['peri', 'of', 'is', 'a'],
    phrase: true,
    exact: false,
    broad: true
  });
};