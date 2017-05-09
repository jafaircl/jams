export class GooglePrediction {
  
  constructor(props){
    this.props = props;
  }
  
  createTrainingInstance(output, ...inputs){
    let trainingInstances = Prediction.newInsertTrainingInstances();
    trainingInstances.csvInstance = inputs;
    trainingInstances.output = output;
    return trainingInstances;
  }
  
  createTrainingModel(trainingInstances){
    let insert = Prediction.newInsert();
    insert.id = this.props.modelName;
    insert.trainingInstances = trainingInstances;

    let insertReply = Prediction.Trainedmodels.insert(insert, this.props.projectId);
    Logger.log(insertReply);
    Logger.log('Trained model with data.');
  }
  
  queryTrainingStatus() {
    return Prediction.Trainedmodels.get(this.props.projectId, this.props.modelName);
  }
  
  makePrediction(...inputs){
    let request = Prediction.newInput();
    request.input = Prediction.newInputInput();
    request.input.csvInstance = inputs;
    return Prediction.Trainedmodels.predict(
      request, this.props.projectId, this.props.modelName).outputValue;
  }
  
  updateTrainedModel(output, ...inputs){
    let update = Prediction.newUpdate();
    update.csvInstance = inputs;
    update.output = output;

    return Prediction.Trainedmodels.update(update, this.props.projectId, this.props.modelName);
  }
}

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