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
    
    Logger.log(trainingInstances);

    return Prediction.Trainedmodels.insert(insert, this.props.projectId);
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
  return Math.pow(Math.sin(2 * Math.PI * (x / 24)) + Math.sin(2 * Math.PI * (x / 12)) + Math.cos(2 * Math.PI * (x / 24)) + 1.25, 1.7731);
  //return Math.pow(Math.sin(2 * Math.PI * (x / 24)) + Math.cos(2 * Math.PI * (x / 24)) + Math.sin(2 * Math.PI * (x / 12)), 0.2);
}

export function dailyPeriodicFormula(x){
  return Math.pow(Math.sin(Math.PI * (x / 7)), 0.2); // Sine Wave between 0 and 1
}