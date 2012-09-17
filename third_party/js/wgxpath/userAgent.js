// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview Constants for user agent detection.
 */

goog.provide('wgxpath.userAgent');

goog.require('goog.userAgent');


/**
 * @type {boolean}
 * @const
 */
wgxpath.userAgent.IE_DOC_PRE_9 = goog.userAgent.IE &&
    !goog.userAgent.isDocumentMode(9);


/**
 * @type {boolean}
 * @const
 */
wgxpath.userAgent.IE_DOC_PRE_8 = goog.userAgent.IE &&
    !goog.userAgent.isDocumentMode(8);
