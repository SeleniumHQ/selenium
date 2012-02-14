/*
 Copyright 2007-2010 WebDriver committers
 Copyright 2007-2010 Google Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

goog.provide('Response');

/**
 * Encapsulates the information for a HTTP response.
 * @param {?Request} request The request this is a response to. May be null if
 *     this response is to a malformed request that could not be fully parsed.
 * @param {nsIOutputStream} outputStream The stream to write responses to.
 * @constructor
 */
Response = function(response, outputStream) {

  /**
   * The request this is a response to.
   * @type {?Request}
   * @private
   */
  this.response_ = response;

  /**
   * This response's message body.
   * @type {string}
   * @private
   */
  this.body_ = '';

  this.committed_ = false;
};


Response.CONTINUE = 100;
Response.OK = 200;
Response.NO_CONTENT = 204;
Response.SEE_OTHER = 303;
Response.BAD_REQUEST = 400;
Response.NOT_FOUND = 404;
Response.METHOD_NOT_ALLOWED = 405;
Response.LENGTH_REQUIRED = 411;
Response.INTERNAL_ERROR = 500;
Response.NOT_IMPLEMENTED = 501;
Response.HTTP_VERSION_NOT_SUPPORTED = 505;

Response.TEXT_PLAIN = 'text/plain';
Response.TEXT_HTML = 'text/html';
Response.APPLICATION_JSON = 'application/json';


/**
 * Internal map of supported status messages.
 * @enum {string}
 */
Response.StatusMessage_ = {
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
Response.CRLF = '\r\n';


/**
 * This response's HTTP stauts code.
 * @type {number}
 * @private
 */
Response.prototype.status_ = Response.OK;


/**
 * Set this response's HTTP status code.
 */
Response.prototype.setStatus = function(status) {
  this.status_ = status;
  this.response_.setStatusLine(null, status, Response.StatusMessage_[status]);
};


/**
 * Sets the value of a header field.
 * @param {string} name The name of the header.
 * @param {?string} value The header value, or null to delete the field.
 */
Response.prototype.setHeader = function(name, value) {
  this.response_.setHeader(name, value, false);
};


/**
 * Sets the value of this response's Content-Type header. Responses are always
 * sent as UTF-8, so the content type value need not specify a charset.
 * @param {string} type The new content type.
 */
Response.prototype.setContentType = function(type) {
  this.setHeader('Content-Type', type + '; charset=UTF-8');
};


/**
 * @param {string} name The name of the header to get.
 * @return {string} The value of the named header if it has been specified.
 */
Response.prototype.getHeader = function(name) {
  return this.response_.getHeader(name);
};


/**
 * Sets this response's message body, overwriting any previously saved content.
 * The message body will be converted to UTF-8 before the response is committed.
 * @param {string} body The new message body.
 * @see Response.prototype.commit
 */
Response.prototype.setBody = function(body) {
  this.body_ = body.toString();
};


/** @return {string} The response message body. */
Response.prototype.getBody = function() {
  return this.body_;
};


/**
 * Convenience function for sending a 303 redirect.
 * @param {string} location The location to redirect to.
 */
Response.prototype.sendRedirect = function(location) {
  this.setStatus(Response.SEE_OTHER);
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
Response.prototype.sendError = function(code, opt_message, opt_contentType) {
  this.setStatus(code);
  this.setBody(opt_message || '');
  if (opt_contentType) {
    this.setContentType(opt_contentType);
  }
  this.commit();
};

Response.prototype.send = function() {
  this.commit();
};

/**
 * Commits this response. This function is a no-op if the response has already
 * been committed.
 */
Response.prototype.commit = function() {
  if (this.committed_) {
    var info = ['Response already committed'];
    info.push('response: ' + this.status_ + ' ' +
              Response.StatusMessage_[this.status_]);
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
