'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.default = FacebookApiException;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function FacebookApiException(res) {
	this.name = 'FacebookApiException';
	this.message = (0, _stringify2.default)(res || {});
	this.response = res;
	Error.captureStackTrace(this, this.constructor.name);
}

FacebookApiException.prototype = (0, _create2.default)(Error.prototype, {
	constructor: {
		value: FacebookApiException,
		enumerable: false,
		writable: true,
		configurable: true
	}
});