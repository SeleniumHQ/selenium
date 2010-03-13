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

/**
 * Encapsulates the information for a HTTP response.
 * @param {?Request} request The request this is a response to. May be null if
 *     this response is to a malformed request that could not be fully parsed.
 * @param {nsIOutputStream} outputStream The stream to write responses to.
 * @constructor
 */
function Response(request, outputStream) {

  /**
   * The request this is a response to.
   * @type {?Request}
   * @private
   */
  this.request_ = request;

  /**
   * The stream to write responses to.
   * @type {nsIOutputStream}
   * @private
   */
  this.outputStream_ = outputStream;

  /**
   * The headers for this response.
   * @type {Object}
   * @private
   */
  this.headers_ = {};

  /**
   * This response's message body.
   * @type {string}
   * @private
   */
  this.body_ = '';
}


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
 * Whether this response has been committed. Each response may only be
 * committed once.
 * @type {boolean}
 * @private
 */
Response.prototype.committed_ = false;


/**
 * This response's HTTP stauts code.
 * @type {number}
 * @private
 */
Response.prototype.status_ = Response.OK;


/** @return {number} The current HTTP response status code. */
Response.prototype.getStatus = function() {
  return this.status_;
};


/**
 * Set this response's HTTP status code.
 */
Response.prototype.setStatus = function(status) {
  this.status_ = status;
};


/**
 * Sets the value of a header field.
 * @param {string} name The name of the header.
 * @param {?string} value The header value, or null to delete the field.
 */
Response.prototype.setHeader = function(name, value) {
  if (value == null) {
    delete this.headers_[name];
  } else {
    this.headers_[name] = value;
  }
};


/**
 * Sets the value of this response's Content-Type header. Responses are always
 * sent as UTF-8, so the content type value need not specify a charset.
 * @param {string} The new content type.
 */
Response.prototype.setContentType = function(type) {
  this.setHeader('Content-Type', type + '; charset=UTF-8');
};


/**
 * @param {string} name The name of the header to get.
 * @return {string} The value of the named header if it has been specified.
 */
Response.prototype.getHeader = function(name) {
  return this.headers_[name];
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


/**
 * Commits this response. This function is a no-op if the response has already
 * been committed.
 */
Response.prototype.commit = function() {
  if (this.committed_) {
    var info = ['Response already committed'];
    if (this.request_) {
      info.push('request: ' + this.request_.getMethod() + ' ' +
                this.request_.getRequestUrl().path);
      info.push('         ' + this.request_.getBody())
    }
    info.push('response: ' + this.status_ + ' ' +
              Response.StatusMessage_[this.status_]);
    info.push('          ' + this.body_);
    Components.utils.reportError(info.join('\n  '));
    return;
  }
  
  var statusCanHaveBody = (this.status_ < 100 || this.status_ > 199) &&
                          this.status_ != 204 && this.status_ != 304;

  var converter = Components.
      classes['@mozilla.org/intl/scriptableunicodeconverter'].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  converter.charset = 'UTF-8';

  var bytes = converter.convertToByteArray(this.body_, {});

  var statusLine = 'HTTP/1.1 ' + this.status_ + ' ' +
      Response.StatusMessage_[this.status_] + Response.CRLF;

  this.setHeader('Date', new Date().toUTCString());
  if (this.status_ < 100 || this.status_ > 199) {
    this.setHeader('Connection', 'close');
  }
  if (statusCanHaveBody) {
    this.setHeader('Content-Length', bytes.length);
  }

  var headers = '';
  for (var name in this.headers_) {
    headers += name + ': ' + this.headers_[name] + Response.CRLF;
  }

  // Send the status line and headers.
  var toSend = statusLine + headers + Response.CRLF;
  this.outputStream_.write(toSend, toSend.length);

  // If necessary, send the body.
  if (statusCanHaveBody &&
      ((this.status_ > 399 && this.status_ < 600) ||
       (this.request_.getMethod() != Request.Method.HEAD))) {
    var byteStream = converter.convertToInputStream(this.body_);
    this.outputStream_.writeFrom(byteStream, bytes.length);
  }

  // Finish things up: flush and close the stream; don't close the stream if
  // this is a 1xx response as there should be a final response sent (in another
  // instance using the same stream).
  this.outputStream_.flush();
  if (this.status_ < 100 || this.status_ > 199) {
    this.outputStream_.close();
  }
  this.committed_ = true;
};
