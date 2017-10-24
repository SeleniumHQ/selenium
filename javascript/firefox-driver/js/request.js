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

goog.provide('fxdriver.Request');

goog.require('Utils');


/**
 * Encapsulates information describing an HTTP request.
 * @param {fxdriver.Request.Method} method The HTTP method used to make the
 *     request.
 * @param {nsIURL} requestUrl URL for the requested resource.
 * @param {Object} headers Map of request headers;.
 * @param {?string} body The request body, or null, if the request method does
 *     not permit a message body.
 * @constructor
 */
fxdriver.Request = function(request) {

  this.request_ = request;

  /**
   * Map of custom request attributes.
   * @private {Object}
   */
  this.attributes_ = {};
};


/**
 * The set of valid HTTP methods.
 * @enum {string}
 */
fxdriver.Request.Method = {
  'DELETE': 'DELETE',
  'GET': 'GET',
  'HEAD': 'HEAD',
  'OPTIONS': 'OPTIONS',
  'POST': 'POST',
  'PUT': 'PUT',
  'TRACE': 'TRACE'
};


/**
 * Path to the servlet servicing this request.
 * @private {string}
 */
fxdriver.Request.prototype.prefix_ = '';


/**
 * @return {fxdriver.Request.Method} The HTTP method used to make the request.
 */
fxdriver.Request.prototype.getMethod = function() {
  return this.request_.method;
};


/** @return {?nsIURL} The full request URL. */
fxdriver.Request.prototype.getRequestUrl = function() {
  return {
    scheme: this.request_.scheme,
    host: this.request_.host,
    hostPort: this.request_.port,
    path: this.request_.path
  };
};


/**
 * Retrieves the named header value.
 * @param {string} name The name of the header to lookup.
 * @return {string} The header value, if it was included in this request.
 */
fxdriver.Request.prototype.getHeader = function(name) {
  return this.request_.getHeader(name.toLowerCase());
};


/**
 * Sets the servlet path for this request; that is the path prefix that is
 * mapped to the receiving servlet. The remainder of the path, excluding query
 * and param data, is available via fxdriver.Request.getPathInfo().
 * @param {string} servletPath The receiving servlet's path.
 */
fxdriver.Request.prototype.setServletPath = function(servletPath) {
  this.prefix_ = servletPath;
};


/** @return {string} The servlet path for this request. */
fxdriver.Request.prototype.getServletPath = function() {
  return this.prefix_;
};


/** @return {string} The path info for this request. */
fxdriver.Request.prototype.getPathInfo = function() {
  return this.request_.path.substring(this.prefix_.length);
};


/** @return {?string} The request body if there was one. */
fxdriver.Request.prototype.getBody = function() {
  var converter = Utils.newInstance("@mozilla.org/intl/scriptableunicodeconverter",
                      'nsIScriptableUnicodeConverter');
  converter.charset = 'UTF-8';
  var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .createInstance(Components.interfaces.nsIScriptableInputStream);
  scriptableStream.init(this.request_.bodyInputStream);


  var body = '';

  // This doesn't feel right to me.
  for (var chunk = scriptableStream.read(4096); chunk; chunk = scriptableStream.read(4096)) {
    body += converter.ConvertToUnicode(chunk);
  }

  return body;
};


/** @return {string} The value of the named attribute if it exists. */
fxdriver.Request.prototype.getAttribute = function(name) {
  return this.attributes_[name];
};


/** @return {Array.<string>} A list of names for all set attributes. */
fxdriver.Request.prototype.getAttributeNames = function() {
  var names = [];
  for (var name in this.attributes_) {
    names.push(name);
  }
  return names;
};


/**
 * Sets an attribute on this request, replacing any previously set attribute
 * value.
 * @param {string} name The name of the attribute, or null to delete it.
 * @param {*} value The attribute value.
 */
fxdriver.Request.prototype.setAttribute = function(name, value) {
  if (value === null || value === undefined) {
    delete this.attributes_[name];
  } else {
    this.attributes_[name] = value;
  }
};


/**
 * @return {string} This request as a string for debugging.
 */
fxdriver.Request.prototype.toDebugString = function() {
//  var message = this.method_ + ' ' + this.requestUrl_.path + ' HTTP/1.1\r\n';
//  for (var name in this.headers_) {
//    message += name + ':' + this.headers_[name] + '\r\n';
//  }
//  message += '\r\n';
//  if (this.body_) {
//    message += this.body_;
//  }
  return 'request debug string';
};
