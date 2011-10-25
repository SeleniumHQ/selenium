// Copyright 2011 WebDriver committers
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A JSONP HTTP client. Note that this client is redundant in
 * browsers that support cross-origin resource sharing with the XMLHttpRequest
 * object.
 */

goog.provide('webdriver.http.JsonpClient');

goog.require('goog.dom');
goog.require('goog.json');
goog.require('webdriver.http.Response');


/**
 * A {@code webdriver.http.Client} that supports sending commands to a server on
 * a different domain using JSONP. All commands will be encoded and sent as
 * query data in a GET request to the /jsonp command handler on the server:
 * <ol>
 *   <li>method: The HTTP method for the encoded command
 *   <li>path: The path to the encoded command's handler (e.g. /session)
 *   <li>body: The JSON command payload
 *   <li>callback: The name of the global JavaScript function that the server
 *       should respond to
 * </ol>
 *
 * @param {!(goog.Uri|string)} url Base URL of the server that requests will be
 *     sent to.
 * @param {!goog.dom.DomHelper=} opt_dom The DOM helper for this instance.
 *     Defaults to the current document's DOM helper.
 * @constructor
 * @implements {webdriver.http.Client}
 */
webdriver.http.JsonpClient = function(url, opt_dom) {

  /**
   * DOM helper for this instance.
   * @type {!goog.dom.DomHelper}
   * @private
   */
  this.dom_ = opt_dom || goog.dom.getDomHelper();

  /**
   * Base URL of the server to send requests to.
   * @type {string}
   * @private
   */
  this.url_ = url + '/jsonp';
};


/**
 * Sequence counter used to construct unique global callback names for each
 * JSONP request.
 * @type {number}
 * @private
 */
webdriver.http.JsonpClient.nextRequestId_ = 0;


/**
 * Creates a unique callback name for a JSONP request.
 * @return {string}
 * @private
 */
webdriver.http.JsonpClient.createCallbackName_ = function() {
  return ['wdJSONP_',
      (webdriver.http.JsonpClient.nextRequestId_++).toString(36), '_',
      goog.now().toString(36)].join('');
};


/** @override */
webdriver.http.JsonpClient.prototype.send = function(request, callback) {
  var callbackName = webdriver.http.JsonpClient.createCallbackName_();

  var dom = this.dom_;
  var jsonpRequest = dom.createDom('script', {
      'type': 'text/javascript',
      'charset': 'UTF-8',
      // NOTE: Safari will never load the script if we don't set the src
      // attribute before appending to the DOM.
      'src': [
          this.url_,
          '?method=', request.method,
          '&path=', encodeURIComponent(request.path),
          '&body=', encodeURIComponent(goog.json.serialize(request.data)),
          '&callback=', callbackName,
          '&cacheBuster=', goog.now()
      ].join('')
  });

  function deleteCallback() {
    try {
      delete goog.global[callbackName];
    } catch (ex) {
      // We cannot delete objects from the window object in IE:
      // "Object doesn't support this action"
      // Just clear it out so the function can't be used again.
      goog.global[callbackName] = undefined;
    }
  }

  goog.global[callbackName] = function(serverResponse) {
    deleteCallback();
    dom.removeNode(jsonpRequest);

    var response = new webdriver.http.Response(200, {}, serverResponse);
    callback(null, response);
  };

  jsonpRequest.onerror = function() {
    deleteCallback();
    dom.removeNode(jsonpRequest);

    callback(new Error('Unable to send request: ' + jsonpRequest.src));
  };

  dom.appendChild(dom.getDocument().documentElement, jsonpRequest);
};
