import { Iterator } from './core/iterator';
import { isArray, isNull } from './shared/utils';
import { GooglePrediction, dailyPeriodicFormula, hourlyPeriodicFormula } from './learning/prediction';
import { dayOfWeekAsNumber, dayOfWeekAsString, daysSince, twoDigitMonth, twoDigitDate } from './shared/dates';
import { getRowByName } from './shared/sheets';

const firstRun = true;
const runsLate = false;
const maxBid = 30;
const maxDisplayBid = 4;
const modelName = 'testing1';
const projectId = '168438661239';
const accountStartDate = '20170301';
const daysRunning = daysSince('March 1, 2017');
const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1sh41PAf4K7GhkX4CPuxUx8DQWzy4Rvw366KaF1LMmz8/edit#gid=896040189';

let prediction = new GooglePrediction({
  modelName: modelName,
  projectId: projectId
});

let time = new Date();
let currentDate = `${time.getFullYear()}${twoDigitMonth(time.getMonth() + 1)}${twoDigitDate(time.getDate())}`;
let timeZone = AdWordsApp.currentAccount().getTimeZone();
let correctedDay = dayOfWeekAsNumber(Utilities.formatDate(time, timeZone, 'E'));
let correctedHour = Math.filterInt(Utilities.formatDate(time, timeZone, 'HH'));
let hour = runsLate ? correctedHour + 1 : correctedHour;
if(hour === 24){
  hour = 0;
  if (correctedDay + 1 === 7){
    correctedDay = 0;
  } else {
    correctedDay = correctedDay + 1;
  }
}

const ortb = function (rate, budget, l, totalRequests) {
  let x = Math.cbrt((budget * Math.pow(l, 2)) / totalRequests);
  return 2 * rate * x;
};

const config = [
  'keywords',
  ['display','audiences'],
  ['display','keywords'],
  ['display','topics'],
];

let ss = SpreadsheetApp.openByUrl(spreadsheetUrl);
let sheet = ss.getSheetByName(dayOfWeekAsString(correctedDay));

const main = function () {
  
  if(firstRun === true){
    
    let trainingInstances = [];
    let report = AdWordsApp.report(
      'SELECT CampaignName,AdGroupName,DayOfWeek,HourOfDay,AverageCpc ' +
      ' FROM ADGROUP_PERFORMANCE_REPORT ' +
      ' WHERE Clicks > 0' +
      ' DURING ' + `${accountStartDate},${currentDate}`).rows();

    while(report.hasNext()){
      let row = report.next();
      let day = dailyPeriodicFormula(dayOfWeekAsNumber(row['DayOfWeek']));
      let hour = hourlyPeriodicFormula(row['HourOfDay']);
      let cpc = row['AverageCpc'] * (0.5 + Math.abs(day)) * (0.5 + Math.abs(hour));
      
      trainingInstances.push(prediction.createTrainingInstance(
        cpc,
        row['AdGroupName'],
        row['CampaignName'],
        day,
        hour
      ));
    }
    //Logger.log(trainingInstances);
    prediction.createTrainingModel(trainingInstances);
  } else {
    let test = prediction.queryTrainingStatus();
    Logger.log(test);
    
    new Iterator({
      entity: AdWordsApp.adGroups(),
      conditions: ['CampaignStatus = ENABLED','Status = ENABLED']
    }).iterate(adGroup => {
      let bid = Math.abs(prediction.makePrediction(
        adGroup.getName(),
        adGroup.getCampaign().getName(),
        dailyPeriodicFormula(correctedDay),
        hourlyPeriodicFormula(hour)
      ));
      
      if (bid < maxBid) {
        adGroup.bidding().setCpc(bid);
      } else {
        adGroup.bidding().setCpc(maxBid);
      }
      
      //Logger.log(adGroup.getCampaign().getName() + ' - ' + adGroup.getName());
      
      for (let i in config){
        try {
          let criteriaSelector = isArray(config[i]) ? 
              adGroup[config[i][0]]()[config[i][1]]().get() : 
              adGroup[config[i]]().get();

          while(criteriaSelector.hasNext()){
            let criteria = criteriaSelector.next();
            let criteriaStats = criteria.getStatsFor('LAST_30_DAYS');
            
            criteria.bidding().clearCpc();
            
            let adjust = criteriaStats.getAveragePosition() === null ? 1 : criteriaStats.getAveragePosition();
            adjust = adjust * (1 + criteriaStats.getConversionRate());
            if(criteria.getEntityType() === 'Keyword' && config[i][0] !== 'display'){
              let qs = criteria.getQualityScore();
              if(!isNull(qs)){
                adjust = adjust * (1 + (qs/40));
              }
            }
            
            
            let adGroupBid = adGroup.bidding().getCpc();
            let r = criteriaStats.getCtr();
            let l = adjust / (adGroupBid * r);
            let T = criteriaStats.getClicks() / daysRunning;
            let B = adGroup.getCampaign().getBudget();
            
            let criteriaBid = ortb(r,B,l,T);
            
            let rowName = `${adGroup.getCampaign().getName()} - ${adGroup.getName()} - ${criteria.getId()}`;
            let row = getRowByName(sheet, rowName);
            if(row === -1){
              row = sheet.getMaxRows() + 1;
            }
            let cell = sheet.getRange('A' + row);
            
            try {
              let fpCpc = criteria.getFirstPageCpc();
              
              if (isNaN(criteriaBid)){
                if(fpCpc > adGroupBid && fpCpc < maxBid){
                  //Logger.log(`First Page Cpc Bid - ${fpCpc} (${adGroupBid})`);
                  criteria.bidding().setCpc(fpCpc);

                } else if (fpCpc > adGroupBid && fpCpc > maxBid) {
                  //Logger.log(`Max Bid - ${maxBid} (${adGroupBid})`);
                  criteria.bidding().setCpc(maxBid);
                } 
              } else {
                
                if(fpCpc > criteriaBid && fpCpc < maxBid){
                  //Logger.log(`First Page Cpc Bid - ${fpCpc} (${criteriaBid})`);
                  criteria.bidding().setCpc(fpCpc);

                } else if (fpCpc > criteriaBid && fpCpc > maxBid) {
                  //Logger.log(`Max Bid - ${maxBid} (FPCPC: ${fpCpc}, Bid: ${criteriaBid})`);
                  criteria.bidding().setCpc(maxBid);

                } else if (criteriaBid < maxBid) {
                  //Logger.log('Predicted Bid - ' + criteriaBid);
                  criteria.bidding().setCpc(criteriaBid);
                  
                  cell.setValue(rowName);
                  cell = sheet.getRange(row, hour + 2);
                  cell.setValue(criteriaBid);
                } else {
                  Logger.log('No Match');
                }
              }
            } catch (e) {

              if(!isNaN(criteriaBid) && criteriaBid < maxDisplayBid){
                criteria.bidding().setCpc(criteriaBid);
                //Logger.log('Predicted Bid - ' + criteriaBid);
                
                cell.setValue(rowName);
                cell = sheet.getRange(row, hour + 2);
                cell.setValue(criteriaBid);
              } else if (!isNaN(criteriaBid) && criteriaBid > maxDisplayBid){
                criteria.bidding().setCpc(maxDisplayBid);
                //Logger.log(`Max Bid - ${maxDisplayBid} (${criteriaBid})`);
              } else {
                Logger.log('No Match');
              }
            }
          }
        } catch (e) {
          Logger.log(e);
        }
      }
    });
    
    if (hour === '04'){
      let update = AdWordsApp.report(
        'SELECT CampaignName,AdGroupName,DayOfWeek,HourOfDay,AverageCpc ' +
        ' FROM ADGROUP_PERFORMANCE_REPORT ' +
        ' WHERE Clicks > 0' +
        ' DURING YESTERDAY').rows();
      
      while(update.hasNext()){
        let row = update.next();
        let day = dailyPeriodicFormula(dayOfWeekAsNumber(row['DayOfWeek']));
        let hour = hourlyPeriodicFormula(row['HourOfDay']);
        let cpc = row['AverageCpc'] * (0.5 + Math.abs(day)) * (0.5 + Math.abs(hour));
        
        prediction.updateTrainedModel(
          cpc,
          row['AdGroupName'],
          row['CampaignName'],
          day,
          hour
        );
      }
    }
  }
    
};

main();
