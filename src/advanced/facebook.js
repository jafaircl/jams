import { OAuth2 } from './oauth2';
import * as _pf from '../polyfills/assign'; _pf;

export const currentApiVersion = 'v2.9';

export class Facebook {
  
  constructor(props){
    this.props = props;
    this.baseUrl = 'https://graph.facebook.com';
    this.tokenUrl = this.baseUrl + '/oauth/access_token';
    this.accessToken = this.getAccessToken();
    this.marketingApiAccessToken = this.props.marketingApiAccessToken;
  }
  
  getAccessToken(){
    let response = OAuth2.withClientCredentials(
                     this.tokenUrl,
                     this.props.appId,
                     this.props.appSecret
                    );
    return response.accessToken;
  }
  
  get(edge, payload, accessToken = this.accessToken){
    let url = `${this.baseUrl}/${edge}?access_token=${accessToken}`;
    for(let field in payload){
      url += `&${field}=${payload[field]}`;
    }
    return JSON.parse(UrlFetchApp.fetch(encodeURI(`${url}`)));
  }
  
  post(edge, payload, accessToken = this.accessToken){
    let url = `${this.baseUrl}/${edge}`;
    payload = Object.assign(payload, {'access_token': accessToken});
    
    let authHeader = {
      method: 'POST',
      payload: payload
    };
    return JSON.parse(UrlFetchApp.fetch(encodeURI(`${url}`), authHeader));
  }
  
  getSearchResults(query, options){
    return this.get(`search?q=${query}`, options);
    /*let url = `${this.baseUrl}/search?q=${query}`;
    for(let i in options){
      url += `&${options[i]}`;
    }
    return JSON.parse(UrlFetchApp.fetch(encodeURI(`${url}&access_token=${this.accessToken}`)));*/
  }
  
  getGraphObject(id, type, options){
    let url = `${this.baseUrl}/${id}/${type}`;
    for(let i in options){
      url += `&${options[i]}`;
    }
    let authHeader = {
      headers: {
        Authorization: `OAuth ${this.accessToken}`
      }
    };
    return JSON.parse(UrlFetchApp.fetch(encodeURI(`${url}`), authHeader));
  }
  
  marketingApiPostRequest(id, payload, edge, apiVersion = currentApiVersion){
    let url = `${this.baseUrl}/${apiVersion}/${id}/${edge}`;
    payload = Object.assign(payload, {'access_token': this.marketingApiAccessToken});
    //Logger.log(payload);
    let authHeader = {
      method: 'POST',
      payload: payload
    };
    return JSON.parse(UrlFetchApp.fetch(encodeURI(`${url}`), authHeader));
  }
  
  marketingApiGetRequest(id, payload, edge, apiVersion = currentApiVersion){
    let url = `${this.baseUrl}/${apiVersion}/${id}/${edge}?access_token=${this.marketingApiAccessToken}`;
    
    for(let field in payload){
      url += `&${field}=${payload[field]}`;
    }
    //Logger.log(url);
    return JSON.parse(UrlFetchApp.fetch(encodeURI(`${url}`)));
  }
  
  getInsights(id, payload, edge, apiVersion = currentApiVersion){
    return this.marketingApiGetRequest(id, payload, 'insights', apiVersion);
  }
  
  createEntity(id, payload, edge, apiVersion = currentApiVersion){
    if(!edge){ edge = ''; }
    return this.marketingApiPostRequest(id, payload, edge, apiVersion);
  }
  
  readEntity(id, payload, edge, apiVersion = currentApiVersion){
    if(!edge){ edge = ''; }
    return this.marketingApiGetRequest(id, payload, edge, apiVersion);
  }
  
  updateEntity(id, payload, edge, apiVersion = currentApiVersion){
    if(!edge){ edge = ''; }
    return this.marketingApiPostRequest(id, payload, edge, apiVersion);
  }
}