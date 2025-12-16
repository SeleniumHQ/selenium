// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Implementation of DataNode for wrapping JSON data.
 */


goog.provide('goog.ds.JsonDataSource');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.ds.DataManager');
goog.require('goog.ds.JsDataSource');
goog.require('goog.ds.LoadState');
goog.require('goog.ds.logger');
goog.require('goog.log');



/**
 * Data source whose backing is a JSON-like service, in which
 * retreiving the resource specified by URL with the additional parameter
 * callback. The resource retreived is executable JavaScript that
 * makes a call to the named function with a JavaScript object literal
 * as the only parameter.
 *
 * Example URI could be:
 * http://www.google.com/data/search?q=monkey&callback=mycb
 * which might return the JS:
 * mycb({searchresults:
 *   [{uri: 'http://www.monkey.com', title: 'Site About Monkeys'}]});
 *
 * TODO(user): Evaluate using goog.net.Jsonp here.
 *
 * A URI of an empty string will mean that no request is made
 * and the data source will be a data source with no child nodes
 *
 * @param {?goog.html.TrustedResourceUrl} uri URI for the request.
 * @param {string} name Name of the datasource.
 * @param {string=} opt_callbackParamName The parameter name that is used to
 *     specify the callback. Defaults to 'callback'.
 *
 * @extends {goog.ds.JsDataSource}
 * @constructor
 * @final
 */
goog.ds.JsonDataSource = function(uri, name, opt_callbackParamName) {
  goog.ds.JsDataSource.call(this, null, name, null);
  this.uri_ = uri;

  /**
   * This is the callback parameter name that is added to the uri.
   * @type {string}
   * @private
   */
  this.callbackParamName_ = opt_callbackParamName || 'callback';

};
goog.inherits(goog.ds.JsonDataSource, goog.ds.JsDataSource);


/**
 * Default load state is NOT_LOADED
 * @private
 */
goog.ds.JsonDataSource.prototype.loadState_ = goog.ds.LoadState.NOT_LOADED;


/**
 * Map of all data sources, needed for callbacks
 * Doesn't work unless dataSources is exported (not renamed)
 */
goog.ds.JsonDataSource['dataSources'] = {};


/**
 * Load or reload the backing data for this node.
 * Fires the JsonDataSource
 * @override
 */
goog.ds.JsonDataSource.prototype.load = function() {
  if (this.uri_) {
    // NOTE: "dataSources" is expose above by name so that it will not be
    // renamed.  It should therefore be accessed via array notation here so
    // that it also doesn't get renamed and stops the compiler from complaining
    goog.ds.JsonDataSource['dataSources'][this.dataName_] = this;
    goog.log.info(
        goog.ds.logger,
        'Sending JS request for DataSource ' + this.getDataName() + ' to ' +
            this.uri_.getTypedStringValue());

    this.loadState_ = goog.ds.LoadState.LOADING;

    var params = {};
    params[this.callbackParamName_] = 'JsonReceive.' + this.dataName_;
    var uriToCall = this.uri_.cloneWithParams(params);

    goog.global['JsonReceive'][this.dataName_] =
        goog.bind(this.receiveData, this);

    var scriptEl = goog.dom.createDom(goog.dom.TagName.SCRIPT);
    goog.dom.safe.setScriptSrc(scriptEl, uriToCall);
    goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.HEAD)[0].appendChild(
        scriptEl);
  } else {
    this.root_ = {};
    this.loadState_ = goog.ds.LoadState.NOT_LOADED;
  }
};


/**
 * Gets the state of the backing data for this node
 * @return {goog.ds.LoadState} The state.
 * @override
 */
goog.ds.JsonDataSource.prototype.getLoadState = function() {
  return this.loadState_;
};


/**
 * Receives data from a Json request
 * @param {Object} obj The JSON data.
 */
goog.ds.JsonDataSource.prototype.receiveData = function(obj) {
  this.setRoot(obj);
  this.loadState_ = goog.ds.LoadState.LOADED;
  goog.ds.DataManager.getInstance().fireDataChange(this.getDataName());
};


/**
* Temp variable to hold callbacks
* until BUILD supports multiple externs.js files
*/
goog.global['JsonReceive'] = {};
