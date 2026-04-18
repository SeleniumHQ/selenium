/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Externs used by cspviolationobserver.js that are not available
 * in the open-source Closure compiler release. This file should be deleted
 * once w3c_reporting_observer.js is available in open-source externs.
 *
 * @externs
 */

// TODO(user): Remove this file once w3c_reporting_observer.js is
//     available in the open-source Closure compiler.

/**
 * https://w3c.github.io/reporting/#interface-reporting-observer
 * @constructor
 * @param {!ReportingObserverCallback} callback
 * @param {!ReportingObserverOptions} opts
 */
function ReportingObserver2(callback, opts) {}
/** @return {void} */
ReportingObserver2.prototype.observe = function() {};
/** @return {void} */
ReportingObserver2.prototype.disconnect = function() {};
/** @return {!Array<!Report>} */
ReportingObserver2.prototype.takeRecords = function() {};

/**
 * @typedef {ReportingObserver2|ReportingObserver}
 * @suppress {duplicate}
 */
var ReportingObserver;


/**
 * @typedef {!function(!Array<Report>, !ReportingObserver): void}
 * @suppress {duplicate}
 */
var ReportingObserverCallback;


/**
 * @constructor
 */
function ReportingObserverOptions2() {}
/** @type {undefined|!Array<string>} */
ReportingObserverOptions2.prototype.types;
/** @type {boolean} */
ReportingObserverOptions2.prototype.buffered;

/**
 * @typedef {ReportingObserverOptions2|ReportingObserverOptions}
 * @suppress {duplicate}
 */
var ReportingObserverOptions;


/**
 * @constructor
 * @suppress {duplicate}
 */
function Report2() {}
/** @type {string} */ Report2.prototype.type;
/** @type {string} */ Report2.prototype.url;
/** @type {?ReportBody} */ Report2.prototype.body;

/**
 * @typedef {Report2|Report}
 * @suppress {duplicate}
 */
var Report;


/**
 * @constructor
 */
function ReportBody2() {}

/**
 * @typedef {ReportBody2|ReportBody2}
 * @suppress {duplicate}
 */
var ReportBody;
