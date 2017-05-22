'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.version = exports.FacebookApiException = exports.Facebook = exports.FB = undefined;

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _desc, _value, _class;

var _anyPromise = require('any-promise');

var _anyPromise2 = _interopRequireDefault(_anyPromise);

var _coreDecorators = require('core-decorators');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _FacebookApiException = require('./FacebookApiException');

var _FacebookApiException2 = _interopRequireDefault(_FacebookApiException);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	var desc = {};
	Object['ke' + 'ys'](descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;

	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}

	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);

	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}

	if (desc.initializer === void 0) {
		Object['define' + 'Property'](target, property, desc);
		desc = null;
	}

	return desc;
}

var _require = require('../package.json'),
    version = _require.version,
    debugReq = (0, _debug2.default)('fb:req'),
    debugSig = (0, _debug2.default)('fb:sig'),
    METHODS = ['get', 'post', 'delete', 'put'],
    toString = Object.prototype.toString,
    has = Object.prototype.hasOwnProperty,
    log = function log(d) {
	// todo
	console.log(d); // eslint-disable-line no-console
},
    defaultOptions = (0, _assign2.default)((0, _create2.default)(null), {
	Promise: _anyPromise2.default,
	accessToken: null,
	appId: null,
	appSecret: null,
	appSecretProof: null,
	beta: false,
	version: 'v2.3',
	timeout: null,
	scope: null,
	redirectUri: null,
	proxy: null,
	userAgent: `thuzi_nodejssdk/${version}`
}),
    isValidOption = function isValidOption(key) {
	return has.call(defaultOptions, key);
},
    stringifyParams = function stringifyParams(params) {
	var data = {};

	for (var key in params) {
		var value = params[key];
		if (value && typeof value !== 'string') {
			value = (0, _stringify2.default)(value);
		}
		if (value !== undefined) {
			data[key] = value;
		}
	}

	return _querystring2.default.stringify(data);
},
    postParamData = function postParamData(params) {
	var data = {},
	    isFormData = false;

	for (var key in params) {
		var value = params[key];
		if (value && typeof value !== 'string') {
			var _context;

			var val = typeof value === 'object' && (_context = value, has).call(_context, 'value') && (_context = value, has).call(_context, 'options') ? value.value : value;
			if (Buffer.isBuffer(val)) {
				isFormData = true;
			} else if (typeof val.read === 'function' && typeof val.pipe === 'function' && val.readable) {
				isFormData = true;
			} else {
				value = (0, _stringify2.default)(value);
			}
		}
		if (value !== undefined) {
			data[key] = value;
		}
	}

	return { [isFormData ? 'formData' : 'form']: data };
},
    getAppSecretProof = function getAppSecretProof(accessToken, appSecret) {
	var hmac = _crypto2.default.createHmac('sha256', appSecret);
	hmac.update(accessToken);
	return hmac.digest('hex');
},
    base64UrlDecode = function base64UrlDecode(str) {
	var base64String = str.replace(/\-/g, '+').replace(/_/g, '/');
	var buffer = new Buffer(base64String, 'base64');
	return buffer.toString('utf8');
},
    nodeifyCallback = function nodeifyCallback(originalCallback) {
	// normalizes the callback parameters so that the
	// first parameter is always error and second is response
	return function (res) {
		if (!res || res.error) {
			originalCallback(new _FacebookApiException2.default(res));
		} else {
			originalCallback(null, res);
		}
	};
};

var _opts = (0, _symbol2.default)('opts');
var graph = (0, _symbol2.default)('graph');
var oauthRequest = (0, _symbol2.default)('oauthRequest');

var Facebook = (_class = function () {
	function Facebook(opts, _internalInherit) {
		(0, _classCallCheck3.default)(this, Facebook);

		if (_internalInherit instanceof Facebook) {
			this[_opts] = (0, _create2.default)(_internalInherit[_opts]);
		} else {
			this[_opts] = (0, _create2.default)(defaultOptions);
		}

		if (typeof opts === 'object') {
			this.options(opts);
		}
	}

	/**
  *
  * @access public
  * @param path {String} the url path
  * @param method {String} the http method (default: `"GET"`)
  * @param params {Object} the parameters for the query
  * @param cb {Function} the callback function to handle the response
  * @return {Promise|undefined}
  */


	(0, _createClass3.default)(Facebook, [{
		key: 'api',
		value: function api() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			//
			// FB.api('/platform', function(response) {
			//  console.log(response.company_overview);
			// });
			//
			// FB.api('/platform/posts', { limit: 3 }, function(response) {
			// });
			//
			// FB.api('/me/feed', 'post', { message: body }, function(response) {
			//  if(!response || response.error) {
			//      console.log('Error occured');
			//  } else {
			//      console.log('Post ID:' + response.id);
			//  }
			// });
			//
			// var postId = '1234567890';
			// FB.api(postId, 'delete', function(response) {
			//  if(!response || response.error) {
			//      console.log('Error occurred');
			//  } else {
			//      console.log('Post was deleted');
			//  }
			// });
			//
			//

			var ret = void 0;

			if (args.length > 0 && typeof args[args.length - 1] !== 'function') {
				var _Promise = this.options('Promise');
				ret = new _Promise(function (resolve, reject) {
					args.push(function (res) {
						if (!res || res.error) {
							reject(new _FacebookApiException2.default(res));
						} else {
							resolve(res);
						}
					});
				});
			}

			this[graph].apply(this, args);

			return ret;
		}

		/**
   *
   * @access public
   * @param path {String} the url path
   * @param method {String} the http method (default: `"GET"`)
   * @param params {Object} the parameters for the query
   * @param cb {Function} the callback function to handle the error and response
   */
		// this method does not exist in fb js sdk

	}, {
		key: 'napi',
		value: function napi() {
			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			//
			// normalizes to node style callback so can use the sdk with async control flow node libraries
			//  first parameters:          error (always type of FacebookApiException)
			//  second callback parameter: response
			//
			// FB.napi('/platform', function(err, response) {
			//  console.log(response.company_overview);
			// });
			//
			// FB.napi('/platform/posts', { limit: 3 }, function(err, response) {
			// });
			//
			// FB.napi('/me/feed', 'post', { message: body }, function(error, response) {
			//  if(error) {
			//      console.log('Error occured');
			//  } else {
			//      console.log('Post ID:' + response.id);
			//  }
			// });
			//
			// var postId = '1234567890';
			// FB.napi(postId, 'delete', function(error, response) {
			//  if(error) {
			//      console.log('Error occurred');
			//  } else {
			//      console.log('Post was deleted');
			//  }
			// });
			//
			//

			if (args.length > 0) {
				var originalCallback = args.pop();
				args.push(typeof originalCallback === 'function' ? nodeifyCallback(originalCallback) : originalCallback);
			}

			this.api.apply(this, args);
		}

		/**
   *
   * Make a api call to Graph server.
   *
   * Except the path, all arguments to this function are optiona. So any of
   * these are valid:
   *
   *  FB.api('/me') // throw away the response
   *  FB.api('/me', function(r) { console.log(r) })
   *  FB.api('/me', { fields: 'email' }); // throw away response
   *  FB.api('/me', { fields: 'email' }, function(r) { console.log(r) });
   *  FB.api('/123456789', 'delete', function(r) { console.log(r) } );
   *  FB.api(
   *      '/me/feed',
   *      'post',
   *      { body: 'hi there' },
   *      function(r) { console.log(r) }
   *  );
   *
   */

	}, {
		key: graph,
		value: function value(path, next) {
			var method, params, cb;

			if (typeof path !== 'string') {
				throw new Error(`Path is of type ${typeof path}, not string`);
			}

			for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
				args[_key3 - 2] = arguments[_key3];
			}

			while (next) {
				var type = typeof next;
				if (type === 'string' && !method) {
					method = next.toLowerCase();
				} else if (type === 'function' && !cb) {
					cb = next;
				} else if (type === 'object' && !params) {
					params = next;
				} else {
					log('Invalid argument passed to FB.api(): ' + next);
					return;
				}
				next = args.shift();
			}

			method = method || 'get';
			params = params || {};

			// remove prefix slash if one is given, as it's already in the base url
			if (path[0] === '/') {
				path = path.substr(1);
			}

			if (METHODS.indexOf(method) < 0) {
				log('Invalid method passed to FB.api(): ' + method);
				return;
			}

			this[oauthRequest](path, method, params, cb);
		}

		/**
   * Add the oauth parameter, and fire of a request.
   *
   * @access private
   * @param path {String}     the request path
   * @param method {String}   the http method
   * @param params {Object}   the parameters for the query
   * @param cb {Function}     the callback function to handle the response
   */

	}, {
		key: oauthRequest,
		value: function value(path, method, params, cb) {
			var uri, parsedUri, parsedQuery, formOptions, requestOptions, pool;

			cb = cb || function () {};
			if (!params.access_token) {
				if (this.options('accessToken')) {
					params.access_token = this.options('accessToken');
					if (this.options('appSecret')) {
						params.appsecret_proof = this.options('appSecretProof');
					}
				}
			} else if (!params.appsecret_proof && this.options('appSecret')) {
				params.appsecret_proof = getAppSecretProof(params.access_token, this.options('appSecret'));
			}

			if (!/^v\d+\.\d+\//.test(path)) {
				path = this.options('version') + '/' + path;
			}
			uri = `https://graph.${this.options('beta') ? 'beta.' : ''}facebook.com/${path}`;

			parsedUri = _url2.default.parse(uri);
			delete parsedUri.search;
			parsedQuery = _querystring2.default.parse(parsedUri.query);

			if (method === 'post') {
				if (params.access_token) {
					parsedQuery.access_token = params.access_token;
					delete params.access_token;

					if (params.appsecret_proof) {
						parsedQuery.appsecret_proof = params.appsecret_proof;
						delete params.appsecret_proof;
					}
				}

				formOptions = postParamData(params);
			} else {
				for (var key in params) {
					parsedQuery[key] = params[key];
				}
			}

			parsedUri.search = stringifyParams(parsedQuery);
			uri = _url2.default.format(parsedUri);

			pool = { maxSockets: this.options('maxSockets') || Number(process.env.MAX_SOCKETS) || 5 };
			requestOptions = (0, _extends3.default)({
				method,
				uri
			}, formOptions, {
				pool
			});
			if (this.options('proxy')) {
				requestOptions['proxy'] = this.options('proxy');
			}
			if (this.options('timeout')) {
				requestOptions['timeout'] = this.options('timeout');
			}
			if (this.options('userAgent')) {
				requestOptions['headers'] = {
					'User-Agent': this.options('userAgent')
				};
			}

			debugReq(method.toUpperCase() + ' ' + uri);
			(0, _request2.default)(requestOptions, function (error, response, body) {
				if (error !== null) {
					if (error === Object(error) && has.call(error, 'error')) {
						return cb(error);
					}
					return cb({ error });
				}

				var json = void 0;
				try {
					json = JSON.parse(body);
				} catch (ex) {
					// sometimes FB is has API errors that return HTML and a message
					// of "Sorry, something went wrong". These are infrequent and unpredictable but
					// let's not let them blow up our application.
					json = {
						error: {
							code: 'JSONPARSE',
							Error: ex
						}
					};
				}
				cb(json);
			});
		}

		/**
   *
   * @access public
   * @param signedRequest {String} the signed request value
   * @param appSecret {String} the application secret
   * @return {Object} the parsed signed request or undefined if failed
   *
   * throws error if appSecret is not defined
   *
   * FB.parseSignedRequest('signedRequest', 'appSecret')
   * FB.parseSignedRequest('signedRequest') // will use appSecret from options('appSecret')
   *
   */

	}, {
		key: 'parseSignedRequest',
		value: function parseSignedRequest(signedRequest) {
			var _context2;

			for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
				args[_key4 - 1] = arguments[_key4];
			}

			// this method does not exist in fb js sdk
			var appSecret = args.shift() || this.options('appSecret'),
			    split,
			    encodedSignature,
			    encodedEnvelope,
			    envelope,
			    hmac,
			    base64Digest,
			    base64UrlDigest;

			if (!signedRequest) {
				debugSig('invalid signedRequest');
				return;
			}

			if (!appSecret) {
				throw new Error('appSecret required');
			}

			split = signedRequest.split('.');

			if (split.length !== 2) {
				debugSig('invalid signedRequest');
				return;
			}

			var _split = split;

			var _split2 = (0, _slicedToArray3.default)(_split, 2);

			encodedSignature = _split2[0];
			encodedEnvelope = _split2[1];


			if (!encodedSignature || !encodedEnvelope) {
				debugSig('invalid signedRequest');
				return;
			}

			try {
				envelope = JSON.parse(base64UrlDecode(encodedEnvelope));
			} catch (ex) {
				debugSig('encodedEnvelope is not a valid base64 encoded JSON');
				return;
			}

			if (!(envelope && (_context2 = envelope, has).call(_context2, 'algorithm') && envelope.algorithm.toUpperCase() === 'HMAC-SHA256')) {
				debugSig(envelope.algorithm + ' is not a supported algorithm, must be one of [HMAC-SHA256]');
				return;
			}

			hmac = _crypto2.default.createHmac('sha256', appSecret);
			hmac.update(encodedEnvelope);
			base64Digest = hmac.digest('base64');

			// remove Base64 padding
			base64UrlDigest = base64Digest.replace(/={1,3}$/, '');

			// Replace illegal characters
			base64UrlDigest = base64UrlDigest.replace(/\+/g, '-').replace(/\//g, '_');

			if (base64UrlDigest !== encodedSignature) {
				debugSig('invalid signature');
				return;
			}

			return envelope;
		}

		/**
   *
   * @access public
   * @param opt {Object} the parameters for appId and scope
   */

	}, {
		key: 'getLoginUrl',
		value: function getLoginUrl() {
			var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			// this method does not exist in fb js sdk
			var clientId = opt.appId || opt.client_id || this.options('appId'),
			    redirectUri = opt.redirectUri || opt.redirect_uri || this.options('redirectUri') || 'https://www.facebook.com/connect/login_success.html',
			    scope = opt.scope || this.options('scope'),
			    display = opt.display,
			    state = opt.state,
			    scopeQuery = '',
			    displayQuery = '',
			    stateQuery = '';

			if (!clientId) {
				throw new Error('client_id required');
			}

			if (scope) {
				scopeQuery = '&scope=' + encodeURIComponent(scope);
			}

			if (display) {
				displayQuery = '&display=' + display;
			}

			if (state) {
				stateQuery = '&state=' + state;
			}

			return `https://www.facebook.com/${this.options('version')}/dialog/oauth` + '?response_type=' + (opt.responseType || opt.response_type || 'code') + scopeQuery + displayQuery + stateQuery + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&client_id=' + clientId;
		}
	}, {
		key: 'options',
		value: function options(keyOrOptions) {
			// this method does not exist in the fb js sdk
			var o = this[_opts];
			if (!keyOrOptions) {
				return o;
			}
			if (toString.call(keyOrOptions) === '[object String]') {
				return isValidOption(keyOrOptions) && keyOrOptions in o ? o[keyOrOptions] : null;
			}
			for (var key in o) {
				if (isValidOption(key) && key in o && has.call(keyOrOptions, key)) {
					o[key] = keyOrOptions[key];
					switch (key) {
						case 'appSecret':
						case 'accessToken':
							o.appSecretProof = o.appSecret && o.accessToken ? getAppSecretProof(o.accessToken, o.appSecret) : null;
							break;
					}
				}
			}
		}

		/**
   * Return a new instance of Facebook with a different set of options
   * that inherit unset options from the current instance.
   * @access public
   * @param {Object} [opts] Options to set
   */

	}, {
		key: 'extend',
		value: function extend(opts) {
			return new Facebook(opts, this);
		}
	}, {
		key: 'getAccessToken',
		value: function getAccessToken() {
			return this.options('accessToken');
		}
	}, {
		key: 'setAccessToken',
		value: function setAccessToken(accessToken) {
			// this method does not exist in fb js sdk
			this.options({ accessToken });
		}
	}, {
		key: 'withAccessToken',
		value: function withAccessToken(accessToken) {
			return this.extend({ accessToken });
		}
	}]);
	return Facebook;
}(), (_applyDecoratedDescriptor(_class.prototype, 'api', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'api'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'napi', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'napi'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'parseSignedRequest', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'parseSignedRequest'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getLoginUrl', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getLoginUrl'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'options', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'options'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'extend', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'extend'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getAccessToken', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getAccessToken'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setAccessToken', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'setAccessToken'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'withAccessToken', [_coreDecorators.autobind], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'withAccessToken'), _class.prototype)), _class);
var FB = exports.FB = new Facebook();
exports.default = FB;
exports.Facebook = Facebook;
exports.FacebookApiException = _FacebookApiException2.default;
exports.version = version;