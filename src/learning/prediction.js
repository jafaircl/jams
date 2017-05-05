import { dayOfWeekAsNumber } from '../shared/dates';
import * as _math from '../polyfills/math'; _math;

export function periodicFormula(x, periodLength){
  return Math.sin(2 * Math.PI * (x / periodLength)) + Math.cos(2 * Math.PI * (x / periodLength));
}

// returns a number between 0 and 1 for the hour
export function hourlyPeriodicFormula(x){
  return 0.5 + Math.pow(Math.sin(2 * Math.PI * (x / 24)) + Math.cos(2 * Math.PI * (x / 24)), 3) / 5.656;
}

export function dailyPeriodicFormula(x){
  return Math.sin(Math.PI * (x / 7)); // Sine Wave between 0 and 1
}

export function createHourlyBidTrainingModelFromReport (report, modelName, projectId) {
  
  let trainingInstances = [];
  let rows = report.rows();
  
  while(rows.hasNext()){
    let row = rows.next();
    trainingInstances.push(createHourlyBidTrainingInstance(row['AdGroupName'], row['CampaignName'], dailyPeriodicFormula(dayOfWeekAsNumber(row['DayOfWeek'])),hourlyPeriodicFormula(row['HourOfDay']),row['AverageCpc']));
  }

  let insert = Prediction.newInsert();
  insert.id = modelName;
  insert.trainingInstances = trainingInstances;

  let insertReply = Prediction.Trainedmodels.insert(insert, projectId);
  Logger.log(insertReply);
  Logger.log('Trained model with data.');
}

export function createHourlyBidTrainingInstance (campaignName, adGroup, dayOfWeek, hourOfDay, cpc) {
  let trainingInstances = Prediction.newInsertTrainingInstances();
  trainingInstances.csvInstance = [campaignName, adGroup, dayOfWeek, hourOfDay];
  trainingInstances.output = cpc;
  return trainingInstances; 
}

export function updateHourlyBidTrainedModelData(report, modelName, projectId) {
  let rows = report.rows();
  
  while(rows.hasNext()){
    let row = rows.next();
    let update = Prediction.newUpdate();
    update.csvInstance = [row['AdGroupName'], row['CampaignName'], dailyPeriodicFormula(dayOfWeekAsNumber(row['DayOfWeek'])), hourlyPeriodicFormula(row['HourOfDay'])];
    update.output = row['AverageCpc'];
    let updateResponse = Prediction.Trainedmodels.update(update, projectId, modelName);
    Logger.log(updateResponse);
    Logger.log('Trained model updated with new data.');
  }
}

export function makeHourlyBidPrediction (campaignName, adGroupName, projectId, modelName, runsLate = false) {
  
  let time = new Date();
  let timeZone = AdWordsApp.currentAccount().getTimeZone();
  let correctedHour = Math.filterInt(Utilities.formatDate(time, timeZone, 'HH'));
  let correctedDay = dayOfWeekAsNumber(Utilities.formatDate(time, timeZone, 'E'));
  
  let hour = runsLate ? correctedHour + 1 : correctedHour;
  if(hour === 24){
    hour = 0;
    if (correctedDay + 1 === 7){
      correctedDay = 0;
    } else {
      correctedDay = correctedDay + 1;
    }
  }
  
  //Logger.log(typeof Utilities.formatDate(time, timeZone, 'HH') + ' - ' + Utilities.formatDate(time, timeZone, 'E') + ' - ' + correctedDay + ' - ' + correctedHour + ' - ' + hour);
  let request = Prediction.newInput();
  
  request.input = Prediction.newInputInput();
  request.input.csvInstance = [adGroupName, campaignName, dailyPeriodicFormula(correctedDay), hourlyPeriodicFormula(hour)];
  //Logger.log(`${campaignName} - ${adGroupName} - ${time.getDay()} - ${hour}`)
  var predictionResult = Prediction.Trainedmodels.predict(
      request, projectId, modelName);
  return predictionResult.outputValue;
}