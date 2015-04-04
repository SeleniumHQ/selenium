// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('fxdriver.Response');

/**
 * Encapsulates the information for a HTTP response.
 * @param {?fxdriver.Request} request The request this is a response to. May be
 *     null if this response is to a malformed request that could not be fully
 *     parsed.
 * @param {nsIOutputStream} outputStream The stream to write responses to.
 * @constructor
 */
fxdriver.Response = function(response, outputStream) {

  /**
   * The request this is a response to.
   * @private {?fxdriver.Request}
   */
  this.response_ = response;

  /**
   * This response's message body.
   * @private {string}
   */
  this.body_ = '';

  this.committed_ = false;
};


fxdriver.Response.CONTINUE = 100;
fxdriver.Response.OK = 200;
fxdriver.Response.NO_CONTENT = 204;
fxdriver.Response.SEE_OTHER = 303;
fxdriver.Response.BAD_REQUEST = 400;
fxdriver.Response.NOT_FOUND = 404;
fxdriver.Response.METHOD_NOT_ALLOWED = 405;
fxdriver.Response.LENGTH_REQUIRED = 411;
fxdriver.Response.INTERNAL_ERROR = 500;
fxdriver.Response.NOT_IMPLEMENTED = 501;
fxdriver.Response.HTTP_VERSION_NOT_SUPPORTED = 505;

fxdriver.Response.TEXT_PLAIN = 'text/plain';
fxdriver.Response.TEXT_HTML = 'text/html';
fxdriver.Response.APPLICATION_JSON = 'application/json';


/**
 * Internal map of supported status messages.
 * @enum {string}
 */
fxdriver.Response.StatusMessage_ = {
  100: 'Continue',
  200: 'OK',
  204: 'No Content',
  303: 'See Other',
  400: 'Bad Request',
  404: 'Not Found',
  405: 'Method Not Allowed',
  411: 'Length Required',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  505: 'HTTP Version Not Supported'
};


/**
 * Constant for carriage return line feed.
 * @type {string}
 * @const
 */
fxdriver.Response.CRLF = '\r\n';


/**
 * This response's HTTP stauts code.
 * @private {number}
 */
fxdriver.Response.prototype.status_ = fxdriver.Response.OK;


/**
 * Set this response's HTTP status code.
 */
fxdriver.Response.prototype.setStatus = function(status) {
  this.status_ = status;
  this.response_.setStatusLine(
      null, status, fxdriver.Response.StatusMessage_[status]);
};


/**
 * Sets the value of a header field.
 * @param {string} name The name of the header.
 * @param {?string} value The header value, or null to delete the field.
 */
fxdriver.Response.prototype.setHeader = function(name, value) {
  this.response_.setHeader(name, value, false);
};


/**
 * Sets the value of this response's Content-Type header. fxdriver.Responses are
 * always sent as UTF-8, so the content type value need not specify a charset.
 * @param {string} type The new content type.
 */
fxdriver.Response.prototype.setContentType = function(type) {
  this.setHeader('Content-Type', type + '; charset=UTF-8');
};


/**
 * @param {string} name The name of the header to get.
 * @return {string} The value of the named header if it has been specified.
 */
fxdriver.Response.prototype.getHeader = function(name) {
  return this.response_.getHeader(name);
};


/**
 * Sets this response's message body, overwriting any previously saved content.
 * The message body will be converted to UTF-8 before the response is committed.
 * @param {string} body The new message body.
 * @see fxdriver.Response.prototype.commit
 */
fxdriver.Response.prototype.setBody = function(body) {
  this.body_ = body.toString();
};


/** @return {string} The response message body. */
fxdriver.Response.prototype.getBody = function() {
  return this.body_;
};


/**
 * Convenience function for sending a 303 redirect.
 * @param {string} location The location to redirect to.
 */
fxdriver.Response.prototype.sendRedirect = function(location) {
  this.setStatus(fxdriver.Response.SEE_OTHER);
  this.setHeader('Location', location);
  this.commit();
};


/**
 * Convenience function for sending an error message.
 * @param {number} code The HTTP status code to use. Must be either a 4xx or
 *     5xx value.
 * @param {string} opt_message An optional error message to include.
 * @param {string} opt_contentType An optional content type to send with the
 *     error response.
 */
fxdriver.Response.prototype.sendError = function(
    code, opt_message, opt_contentType) {
  this.setStatus(code);
  this.setBody(opt_message || '');
  if (opt_contentType) {
    this.setContentType(opt_contentType);
  }
  this.commit();
};

fxdriver.Response.prototype.send = function() {
  this.commit();
};

/**
 * Commits this response. This function is a no-op if the response has already
 * been committed.
 */
fxdriver.Response.prototype.commit = function() {
  if (this.committed_) {
    var info = ['fxdriver.Response already committed'];
    info.push('response: ' + this.status_ + ' ' +
              fxdriver.Response.StatusMessage_[this.status_]);
    info.push('          ' + this.body_);
    Components.utils.reportError(info.join('\n  '));
    return;
  }

  this.committed_ = true;

  var statusCanHaveBody = (this.status_ < 100 || this.status_ > 199) &&
                          this.status_ != 204 && this.status_ != 304;

  var converter = Components.
      classes['@mozilla.org/intl/scriptableunicodeconverter'].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  converter.charset = 'UTF-8';

  var bytes = converter.convertToByteArray(this.body_, {});

  if (this.status_ < 100 || this.status_ > 199) {
    this.setHeader('Connection', 'close');
  }
  if (statusCanHaveBody) {
    this.setHeader('Content-Length', bytes.length);
  }

  // If necessary, send the body.
  if (statusCanHaveBody) {
    var byteStream = converter.convertToInputStream(this.body_);
    this.response_.bodyOutputStream.writeFrom(byteStream, bytes.length);
    this.response_.bodyOutputStream.flush();
  }

  this.response_.finish();
};
