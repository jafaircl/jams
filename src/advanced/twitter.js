import { OAuth2 } from './oauth2';

export class Twitter {
  
  constructor(props){
    this.props = props;
    this.tokenUrl = 'https://api.twitter.com/oauth2/token';
  }
  
  getTweets(url){
    url = encodeURI(url);
    
    let response = OAuth2.withClientCredentials(
                     this.tokenUrl,
                     this.props.consumerKey,
                     this.props.consumerSecret
                    ).fetch(url);
    return JSON.parse(response.getContentText());
  }
  
  /**
   * Retrieves Tweets for a specific search term.
   * @param {string} searchTerm The search term to look for.
   * @param {string=} opt_geocode Limit returned Tweets to those from users in a
   *     location. Specified in the form "latitude,longitude,radius", where radius
   *     is in either "km" or "mi". e.g. 37.781157,-122.398720,1mi
   * @param {string=} opt_mode Optional preference for recent, popular or mixed
   *     results. Defaults to 'mixed', other options are 'recent' and 'popular'.
   * @return {Object} The statuses results object, see:
   *     https://dev.twitter.com/rest/reference/get/search/tweets for details.
   */
  getTweetsForSearch(searchTerm, opt_geocode, opt_mode) {
    let mode = opt_mode || 'mixed';
    let url = 'https://api.twitter.com/1.1/search/tweets.json?q=' +
        encodeURIComponent(searchTerm) + '&result_type=' + mode;
    if (opt_geocode) {
      url += 'geocode=' + opt_geocode;
    }
    return this.getTweets(url);
  }
  
  /**
   * Retrieves a list of trending topics for a given geographic area of interest.
   * @param {string} woeId Geographic location specified in Yahoo! Where On Earth
   *     format. See https://developer.yahoo.com/geo/geoplanet/guide/concepts.html
   * @return {Object} The Trends results object, see:
   *     https://dev.twitter.com/rest/reference/get/trends/place for details.
   */
  getTrendsForLocation(woeId, filter) {
    let url = 'https://api.twitter.com/1.1/trends/place.json?id=' + woeId;
    if(filter){
      url += ' ' + filter;
    }
    return this.getTweets(url);
  }
  
  getTweetsFromAccount(accountName, filter){
    let url = 'https://api.twitter.com/1.1/search/tweets.json?q=from:' + accountName;
    if(filter){
      url += ' ' + filter;
    }
    return this.getTweets(url);
  }
  
  getTweetsToAccount(accountName, filter){
    let url = 'https://api.twitter.com/1.1/search/tweets.json?q=to:' + accountName;
    if(filter){
      url += ' ' + filter;
    }
    return this.getTweets(url);
  }
  
  getTweetsWithHashtag(hashtag, filter){
    let url = 'https://api.twitter.com/1.1/search/tweets.json?q=#' + hashtag;
    if(filter){
      url += ' ' + filter;
    }
    return this.getTweets(url);
  }
  
  getTweetsMentioning(accountName, filter){
    let url = 'https://api.twitter.com/1.1/search/tweets.json?q=@' + accountName;
    if(filter){
      url += ' ' + filter;
    }
    return this.getTweets(url);
  }
}