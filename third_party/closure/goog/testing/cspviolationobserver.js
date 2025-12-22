/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.testing.CspViolationObserver');
goog.setTestOnly('goog.testing.CspViolationObserver');

/**
 * A class for watching Content Security Policy violation reports.
 *
 * @constructor
 */
goog.testing.CspViolationObserver = function() {
  if (!window.ReportingObserver) {
    return;
  }

  /** @private {?ReportingObserver} */
  this.reportingObserver_ = null;

  /** @private {boolean} */
  this.enabled_ = true;

  /** @private {!Array<!Report>} */
  this.reports_ = [];
};


/**
 * Starts listening for CSP reports.
 */
goog.testing.CspViolationObserver.prototype.start = function() {
  if (!window.ReportingObserver || !this.enabled_) {
    return;
  }

  if (this.reportingObserver_) {
    throw new Error('CspViolationObserver already started');
  }

  this.reportingObserver_ = new ReportingObserver(this.onReport_.bind(this), {
    types: ['csp-violation'],
    buffered: false,
  });

  this.reports_ = [];
  this.reportingObserver_.observe();
};


/**
 * Returns CSP reports collected so far and empties the collection buffer.
 *
 * @return {!Array<!Report>}
 * @private
 */
goog.testing.CspViolationObserver.prototype.take_ = function() {
  const newReports = this.reportingObserver_.takeRecords();
  this.reports_.push(...newReports);

  const results = this.reports_;
  this.reports_ = [];

  return results;
};


/**
 * Stops listening for violation reports and returns all reports captured so
 * far.
 *
 * @return {!Array<!Report>}
 */
goog.testing.CspViolationObserver.prototype.stop = function() {
  if (!window.ReportingObserver) {
    return [];
  }

  if (!this.reportingObserver_) {
    return [];
  }

  const results = this.take_();
  this.reportingObserver_.disconnect();
  this.reportingObserver_ = null;

  return results;
};


/**
 * If called with false, violation reports will no longer be captured and empty
 * arrays will be returned from stop().
 *
 * @param {boolean} enabled
 */
goog.testing.CspViolationObserver.prototype.setEnabled = function(enabled) {
  if (!window.ReportingObserver) {
    return;
  }
  if (enabled === this.enabled_) {
    return;
  }

  this.reports_ = [];

  if (this.reportingObserver_) {
    if (enabled) {
      this.reportingObserver_.observe();
    } else {
      this.reportingObserver_.disconnect();
    }
  }
  this.enabled_ = enabled;
};


/**
 * ReportingObserver callback.
 *
 * @param {!Array<!Report>} reports
 * @param {!ReportingObserver} observer
 * @private
 */
goog.testing.CspViolationObserver.prototype.onReport_ = function(
    reports, observer) {
  this.reports_.push(...reports);
};


/**
 * Returns previously generated reports.
 *
 * @return {!Array<!Report>}
 */
goog.testing.CspViolationObserver.getBufferedReports = function() {
  if (!window.ReportingObserver) {
    return [];
  }

  const reportingObserver = new ReportingObserver(function() {}, {
    types: ['csp-violation'],
    buffered: true,
  });

  // Calling .observe() is necessary otherwise takeRecords() will not return
  // results.
  reportingObserver.observe();
  const reports = reportingObserver.takeRecords();
  reportingObserver.disconnect();
  return reports;
};


/**
 * Formats the given list of reports as a string.
 *
 * @param {!Array<!Report>} reports
 * @return {string}
 */
goog.testing.CspViolationObserver.formatReports = function(reports) {
  return reports
      .map(function(report) {
        return JSON.stringify(report.body.toJSON(), null, '    ');
      })
      .join(', ');
};
