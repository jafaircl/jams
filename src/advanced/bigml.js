export class BigML {
  
  constructor(props){
    this.userName = props.userName;
    this.apiKey = props.apiKey;
    this.auth = `username=${this.userName};api_key=${this.apiKey}`;
    this.baseUrl = 'https://bigml.io/';
  }

  request(requestType, endpoint, data){
    let options = {
      'method': requestType,
      'contentType': 'application/json',
      'payload': JSON.stringify(data)
    };
    
    return JSON.parse(UrlFetchApp.fetch(this.baseUrl + endpoint + '?' + this.auth, options));
  }
  
  post(endpoint, data){
    return this.request('post', endpoint, data);
  }

  put(endpoint, data){
    return this.request('put', endpoint, data);
  }
  
  _delete(endpoint){
    return this.request('delete', endpoint);
  }

  createProject(data){
    return this.post('project', data);
  }
  
  createInlineSource(data){
    return this.post('source', data);
  }

  updateInlineSource(source, data){
    return this.put(source, data);
  }

  deleteInlineSource(source){
    return this._delete(source);
  }
  
  createDataset(data){
    return this.post('dataset', data);
  }
  
  createModel(data){
    return this.post('model', data);
  }
  
  createPrediction(data){
    return this.post('prediction', data);
  }
  
  updateSource(sourceEndpoint, data){
    return this.post(sourceEndpoint, data);
  }
}