import { Iterator } from './iterator';
import { isArray } from '../shared/utils';
import {
  adGroupMethods,
  displayAudienceMethods,
  displayKeywordMethods,
  displayPlacementMethods,
  displayTopicMethods,
  expandedTextAdMethods,
  gmailImageAdMethods,
  gmailMultiProductAdMethods,
  gmailSinglePromotionAdMethods,
  html5AdMethods,
  imageAdMethods,
  keywordMethods,
  responsiveDisplayAdMethods
} from './constants';

/**
 * Create an image formatted for AdWords from a URL
 * @param   {string} url  URL for the image
 * @param   {string} name Name of the image
 * @returns {object} image formatted for AdWords
 */
export function createImageFromUrl(url, name){
  return formatMediaFromUrl(url, name, 'newImageBuilder');
}

/**
 * Create a media bundle (.zip) formatted for AdWords from a URL
 * @param   {string} url  URL for the bundle (.zip)
 * @param   {string} name Name of the bundle
 * @returns {object} bundle formatted for AdWords
 */
export function createMediaBundleFromUrl(url, name){
  return formatMediaFromUrl(url, name, 'newMediaBundleBuilder');
}

/**
 * Create a video from its YouTube ID
 * @param   {string} videoId ID of the video
 * @returns {object} video formatted for AdWords
 */
export function createVideoFromYouTubeId(videoId){
  return AdWordsApp.adMedia().newVideoBuilder()
    .withYouTubeVideoId(videoId)
    .build()
    .getResult();
}

export class Builder extends Iterator {
  
  super(props){
    this.props = props;
  }
  
  _logic(inputs, method, arr, parent){
    
    let item = isArray(method) ?
        parent[method[0]]()[method[1]]() :
        parent[method]();

    for (let method in arr) {
      let current = inputs[arr[method]];

      if(current !== undefined){
        
        if(isArray(current)){
          for(let i in current){
            item = item[method](current[i]);
          }
        } else {
          item = item[method](current);
        }
      }
    }
    
    if('exclude' in inputs && inputs.exclude === true){
      return item.exclude().getResult();
    } else {
      return item.build().getResult();
    }
  }
  
  _build(inputs, method, arr){
    let result;
    
    if('getEntityType' in this.props) {
      result = this._logic(inputs, method, arr, this.props);
    } else {
      super.iterate(parent => {
        result = this._logic(inputs, method, arr, parent);
      });
    }
    
    return result;
  }
  
  createAdGroup(inputs){
    return this._build(inputs, 'newAdGroupBuilder', adGroupMethods);
  }
  
  createDisplayAudience(inputs){
    return this._build(inputs, ['display', 'newAudienceBuilder'], displayAudienceMethods);
  }
  
  createDisplayKeyword(inputs){
    return this._build(inputs, ['display', 'newKeywordBuilder'], displayKeywordMethods);
  }
  
  createDisplayPlacement(inputs){
    return this._build(inputs, ['display', 'newPlacementBuilder'], displayPlacementMethods);
  }
  
  createDisplayTopic(inputs){
    return this._build(inputs, ['display', 'newTopicBuilder'], displayTopicMethods);
  }
  
  createExpandedTextAd(inputs){
    return this._build(inputs, ['newAd', 'expandedTextAdBuilder'], expandedTextAdMethods);
  }
  
  createGmailImageAd(inputs){
    return this._build(inputs, ['newAd', 'gmailImageAdBuilder'], gmailImageAdMethods);
  }
  
  createGmailMultiProductAd(inputs){
    return this._build(inputs, ['newAd', 'gmailMultiProductAdBuilder'], gmailMultiProductAdMethods);
  }
  
  createGmailSinglePromotionAd(inputs){
    return this._build(inputs, ['newAd', 'gmailSinglePromotionAdBuilder'], gmailSinglePromotionAdMethods);
  }
  
  createHtml5Ad(inputs){
    return this._build(inputs, ['newAd', 'html5AdBuilder'], html5AdMethods);
  }
  
  createImageAd(inputs){
    return this._build(inputs, ['newAd', 'imageAdBuilder'], imageAdMethods);
  }
  
  createKeyword(inputs){
    return this._build(inputs, 'newKeywordBuilder', keywordMethods);
  }
  
  createResponsiveDisplayAd(inputs){
    return this._build(inputs, ['newAd', 'responsiveDisplayAdBuilder'], responsiveDisplayAdMethods);
  }
  
}

export function formatMediaFromUrl(url, name, method){
  let blob = UrlFetchApp.fetch(url).getBlob();
  return AdWordsApp.adMedia()[method]()
    .withName(name)
    .withData(blob)
    .build()
    .getResult();
}