'use strict';
/**
 * Simultaneously satisfy require('fb') and Babel based ES2015 `import`
 * by exporting an object using Babel's __esModule which contains the normal
 * exports; and bound versions of the methods on FB.
 */

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyNames = require('babel-runtime/core-js/object/get-own-property-names');

var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mod = require('./fb'),
    FB = mod.FB;
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {

	for (var _iterator = (0, _getIterator3.default)((0, _getOwnPropertyNames2.default)((0, _getPrototypeOf2.default)(FB))), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
		var _key = _step.value;

		if (_key === 'constructor') continue;
		if (typeof FB[_key] === 'function') {
			exports[_key] = FB[_key].bind(FB);
		} else {
			exports[_key] = FB[_key];
		}
	}
} catch (err) {
	_didIteratorError = true;
	_iteratorError = err;
} finally {
	try {
		if (!_iteratorNormalCompletion && _iterator.return) {
			_iterator.return();
		}
	} finally {
		if (_didIteratorError) {
			throw _iteratorError;
		}
	}
}

for (var key in mod) {
	exports[key] = mod[key];
}

Object.defineProperty(exports, '__esModule', { value: true });