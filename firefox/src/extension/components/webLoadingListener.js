/*
 Copyright 2007-2009 WebDriver committers
 Copyright 2007-2009 Google Inc.
 Portions copyright 2007 ThoughtWorks, Inc

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

var STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
var STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

function WebLoadingListener(browser, toCall) {
  var listener = this;

  this.handler = {
    QueryInterface: function(iid) {
      if (iid.equals(Components.interfaces.nsIWebProgressListener) ||
          iid.equals(Components.interfaces.nsISupportsWeakReference) ||
          iid.equals(Components.interfaces.nsISupports))
        return this;
      throw Components.results.NS_NOINTERFACE;
    },

    onStateChange: function(webProgress, request, flags, status) {
      if (flags & STATE_STOP) {
        if (request.URI) {
          WebLoadingListener.removeListener(browser, listener);
          toCall();
        }
      }
      return 0;
    },

    onLocationChange: function(aProgress, aRequest, aURI) { return 0; },
    onProgressChange: function() { return 0; },
    onStatusChange: function() { return 0; },
    onSecurityChange: function() { return 0; },
    onLinkIconAvailable: function() { return 0; }
  };

  browser.addProgressListener(this.handler,
      Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
}

WebLoadingListener.removeListener = function(browser, listener) {
  browser.removeProgressListener(listener.handler);
};
