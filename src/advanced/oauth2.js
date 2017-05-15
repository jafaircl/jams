/** Adapted from https://developers.google.com/adwords/scripts/docs/examples/oauth20-library */
/**
 * Simple library for sending OAuth2 authenticated requests.
 * See: https://developers.google.com/adwords/scripts/docs/features/third-party-apis#oauth_2
 * for full details.
 */
export class OAuth2 {
  
  constructor(accessToken){
    this.accessToken = accessToken;
  }
  
  /**
   * Performs an HTTP request for the given URL.
   * @param {string} url The URL to fetch
   * @param {?Object=} options Options as per UrlFetchApp.fetch
   * @return {!HTTPResponse} The HTTP Response object.
   */
  fetch(url, options){
    let fetchOptions = options || {};
    if (!fetchOptions.headers) {
      fetchOptions.headers = {};
    }
    fetchOptions.headers.Authorization = 'Bearer ' + this.accessToken;
    
    return UrlFetchApp.fetch(url, fetchOptions);
  }
  
  /**
   * Performs the authentication step
   * @param {string} tokenUrl The endpoint for use in obtaining the token.
   * @param {!Object} payload The authentication payload, typically containing
   *     details of the grant type, credentials etc.
   * @param {string=} opt_authHeader Client credential grant also can make use
   *     of an Authorisation header, as specified here
   * @param {string=} opt_scope Optional string of spaced-delimited scopes.
   * @return {string} The access token
   */
  _authenticate(tokenUrl, payload, opt_authHeader, opt_scope) {
    let options = {muteHttpExceptions: true, method: 'POST', payload: payload};
    let accessToken;
    
    if (opt_scope) {
      options.payload.scope = opt_scope;
    }
    if (opt_authHeader) {
      options.headers = {Authorization: opt_authHeader};
    }
    
    let response = UrlFetchApp.fetch(tokenUrl, options);
    let responseData = JSON.parse(response.getContentText());
    
    if (responseData && responseData.access_token) {
      accessToken = responseData.access_token;
    } else {
      throw Error('No access token received: ' + response.getContentText());
    }
    return accessToken;
  }
  
  /**
   * Creates a OAuth2UrlFetchApp object having authenticated with a refresh
   * token.
   * @param {string} tokenUrl The endpoint for use in obtaining the token.
   * @param {string} clientId The client ID representing the application.
   * @param {string} clientSecret The client secret.
   * @param {string} refreshToken The refresh token obtained through previous
   *     (possibly interactive) authentication.
   * @param {string=} opt_scope Space-delimited set of scopes.
   * @return {!OAuth2UrlFetchApp} The object for making authenticated requests.
   */
  withRefreshToken(tokenUrl, clientId, clientSecret, refreshToken, opt_scope) {
    const payload = {
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken
    };
    this.accessToken = this._authenticate(tokenUrl, payload, null, opt_scope);
  }
  
  /**
   * Creates a OAuth2UrlFetchApp object having authenticated with client
   * credentials.
   * @param {string} tokenUrl The endpoint for use in obtaining the token.
   * @param {string} clientId The client ID representing the application.
   * @param {string} clientSecret The client secret.
   * @param {string=} opt_scope Space-delimited set of scopes.
   * @return {!OAuth2UrlFetchApp} The object for making authenticated requests.
   */
  withClientCredentials(tokenUrl, clientId, clientSecret, opt_scope) {
    let authHeader = 'Basic ' + Utilities.base64Encode([clientId, clientSecret].join(':'));
    let payload = {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    };
    this.accessToken = this._authenticate(tokenUrl, payload, authHeader, opt_scope);
  }
  
  /**
   * Creates a OAuth2UrlFetchApp object having authenticated with OAuth2 username
   * and password.
   * @param {string} tokenUrl The endpoint for use in obtaining the token.
   * @param {string} clientId The client ID representing the application.
   * @param {string} username OAuth2 Username
   * @param {string} password OAuth2 password
   * @param {string=} opt_scope Space-delimited set of scopes.
   * @return {!OAuth2UrlFetchApp} The object for making authenticated requests.
   */
  withPassword(tokenUrl, clientId, username, password, opt_scope) {
    const payload = {
      grant_type: 'password',
      client_id: clientId,
      username: username,
      password: password
    };
    this.accessToken = this._authenticate(tokenUrl, payload, null, opt_scope);
  }
  
  /**
   * Creates a OAuth2UrlFetchApp object having authenticated as a Service
   * Account.
   * Flow details taken from:
   *     https://developers.google.com/identity/protocols/OAuth2ServiceAccount
   * @param {string} tokenUrl The endpoint for use in obtaining the token.
   * @param {string} serviceAccount The email address of the Service Account.
   * @param {string} key The key taken from the downloaded JSON file.
   * @param {string} scope Space-delimited set of scopes.
   * @return {!OAuth2UrlFetchApp} The object for making authenticated requests.
   */
  withServiceAccount(tokenUrl, serviceAccount, key, scope) {
    let assertionTime = new Date();
    const jwtHeader = '{"alg":"RS256","typ":"JWT"}';
    let jwtClaimSet = {
      iss: serviceAccount,
      scope: scope,
      aud: tokenUrl,
      exp: Math.round(assertionTime.getTime() / 1000 + 3600),
      iat: Math.round(assertionTime.getTime() / 1000)
    };
    let jwtAssertion = Utilities.base64EncodeWebSafe(jwtHeader) + '.' +
        Utilities.base64EncodeWebSafe(JSON.stringify(jwtClaimSet));
    const signature = Utilities.computeRsaSha256Signature(jwtAssertion, key);
    jwtAssertion += '.' + Utilities.base64Encode(signature);
    const payload = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtAssertion
    };
    this.accessToken = this._authenticate(tokenUrl, payload, null);
  }
}