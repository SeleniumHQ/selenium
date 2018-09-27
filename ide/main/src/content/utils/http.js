/*
 * Copyright 2014 Samit Badle
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * HTTP service for Firefox addons
 * Do not instantiate
 */
function HTTP() {
}

/**
 * Make a generic http request
 *
 * @param method GET, POST, DELETE, PUT or any other http request
 * @param url
 * @param {string|object} [data] string or object, object is converted to json and sets the Content-Type header
 * @param {Object.<string, string>} [headers] hash with keys containing header names and values containing its value
 * @param {function(string, string, string)} [callback] a callback function that takes response, success, status. If callback is not given,
 * a deferred object is created. If deferred.js is not loaded, an exception will occur.
 * @returns {Deferred} if a deferred has been created
 */
HTTP.request = function(method, url, data, headers, callback) {
  var deferred;
  if (!callback) {
    deferred = new Deferred();
    callback = function(response, success, status) {
      if (success) {
        deferred.resolve(response, success, status);
      } else {
        deferred.reject(response, success, status);
      }
    };

  }
  var httpRequest = new XMLHttpRequest();
  //LOG.debug('Executing: ' + method + " " + url);
  httpRequest.open(method, url);
  httpRequest.onreadystatechange = function() {
    try {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200 || (httpRequest.status > 200 && httpRequest.status < 300)) {
          callback(httpRequest.responseText, true, httpRequest.status);
        } else if (httpRequest.status === 500 ) {
          callback(httpRequest.responseText, false, httpRequest.status);
        } else {
          callback(httpRequest.responseText, false, httpRequest.status);
          //TODO eliminate alert and signal the failure
//          alert('There was a problem with the request.\nUrl: ' + url + '\nHttp Status: ' + httpRequest.status + "\nResponse: " + httpRequest.responseText);
          LOG.debug('Error: There was a problem with the request.\nUrl: ' + url + '\nHttp Status: ' + httpRequest.status + "\nResponse: " + httpRequest.responseText);
        }
      }
    } catch(e) {
      //TODO eliminate alert and signal the failure, typically when callback is not given and Deferred is not loaded
      //LOG.error('Error: There was a problem with the request.\nUrl: ' + url + '\nHttp Status: ' + httpRequest.status + "\nResponse: " + httpRequest.responseText);
      alert('Caught Exception in HTTP.request: ' + e);
      throw e;
    }
  };
  //httpRequest.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
  if (data && typeof data !== 'string') {
    data = JSON.stringify(data);
    //do this before you set custom headers, so that user supplied headers will overwrite this
    httpRequest.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  }
  if (headers) {
    for (var header in headers) {
      httpRequest.setRequestHeader(header, headers[header] + '');
    }
  }
  if (data) {
    httpRequest.send(data);
  } else {
    httpRequest.send();
  }
  return deferred;
};

/**
 * Shortcut method to create HTTP POST requests. See HTTP.request() for more details.
 *
 * @param url
 * @param {string|object} [data] string or object, object is converted to json and sets the Content-Type header
 * @param {Object.<string, string>} [headers] hash with keys containing header names and values containing its value
 * @param {function(string, string, string)} [callback] a callback function that takes response, success, status. If callback is not given,
 * a deferred object is created. If deferred.js is not loaded, an exception occurs.
 * @returns {Deferred} if a deferred has been created
 */
HTTP.post = function(url, data, headers, callback) {
  return this.request('POST', url, data, headers, callback);
};

/**
 * Shortcut method to create HTTP GET requests. See HTTP.request() for more details.
 *
 * @param url
 * @param {Object.<string, string>} [headers] hash with keys containing header names and values containing its value
 * @param {function(string, string, string)} [callback] a callback function that takes response, success, status. If callback is not given,
 * a deferred object is created. If deferred.js is not loaded, an exception occurs.
 * @returns {Deferred} if a deferred has been created
 */
HTTP.get = function (url, headers, callback) {
  return this.request('GET', url, null, headers, callback);
};

/**
 * Shortcut method to create HTTP DELETE requests. See HTTP.request() for more details.
 *
 * @param url
 * @param {Object.<string, string>} [headers] hash with keys containing header names and values containing its value
 * @param {function(string, string, string)} [callback] a callback function that takes response, success, status. If callback is not given,
 * a deferred object is created. If deferred.js is not loaded, an exception occurs.
 * @returns {Deferred} if a deferred has been created
 */
HTTP._delete = function (url, headers, callback) {
  return this.request('DELETE', url, null, headers, callback);
};

