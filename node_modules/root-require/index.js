/**
 * Module dependencies
 */
var path = require('path');
var packpath = require('packpath');



/**
 * Uses `packpath` (https://github.com/jprichardson/node-packpath)
 * to generate a more convenient require method.
 * 
 * @type {Function}
 */
function requireFromModuleRoot ( relativePathFromModuleRoot ) {
	return require(path.join(packpath.parent(),relativePathFromModuleRoot));
}

/**
 * Provide access to packpath directly
 * @type {Object}
 */
requireFromModuleRoot.packpath = packpath;

module.exports = requireFromModuleRoot;