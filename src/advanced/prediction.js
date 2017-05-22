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