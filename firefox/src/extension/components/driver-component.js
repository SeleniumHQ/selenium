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

// constants
const nsISupports = Components.interfaces.nsISupports;
const CLASS_ID = Components.ID("{1C0E8D86-B661-40d0-AE3D-CA012FADF170}");
const CLASS_NAME = "Firefox WebDriver";
const CONTRACT_ID = "@googlecode.com/webdriver/fxdriver;1";

// The following code is derived from https://addons.mozilla.org/en-US/firefox/files/browse/3682/
// Its copyrights belong to its original author.

var ExternalScripts = [
  "errorcode.js",
  "dispatcher.js",
  "firefoxDriver.js",
  "socketListener.js",
  "request.js",
  "response.js",
  "utils.js",
  "webdriverserver.js",
  "webLoadingListener.js",
  "wrappedElement.js",
  "screenshooter.js"
];


(function() {
  var self;
  var fileProtocolHandler = Components.
      classes['@mozilla.org/network/protocol;1?name=file'].
      createInstance(Components.interfaces.nsIFileProtocolHandler);
  self = __LOCATION__;

  var parent = self.parent;
  // the directory this file is in
  var loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].
      createInstance(Components.interfaces.mozIJSSubScriptLoader);

  // Firefox 3.5+ has native JSON support; prefer that over our script from
  // www.json.org, which may be slower.
  var appInfo = Components.classes['@mozilla.org/xre/app-info;1'].
      getService(Components.interfaces.nsIXULAppInfo);
  var versionChecker = Components.classes['@mozilla.org/xpcom/version-comparator;1'].
      getService(Components.interfaces.nsIVersionComparator);
  if (versionChecker.compare(appInfo.version, '3.5') < 0) {
    ExternalScripts.push('json2.js');
  }

  for (var index in ExternalScripts) {
    var child = parent.clone();
    child.append(ExternalScripts[index]);
    // child is a nsILocalFile of the file we want to load
    var childname = fileProtocolHandler.getURLSpecFromFile(child);
    loader.loadSubScript(childname);
  }
})();


// This code has been derived from the example code at
// http://developer-stage.mozilla.org/en/docs/How_to_Build_an_XPCOM_Component_in_Javascript
// Its copyrights belong to the original author

var ServerFactory = {
  createInstance: function (aOuter, aIID) {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    if (!this.server)
      this.server = new WebDriverServer();
    return (this.server).QueryInterface(aIID);
  }
};


//module definition (xpcom registration)
var ServerModule = {
  firstTime_: true,

  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType) {
    if (this.firstTime_) {
      this.firstTime_ = false;
      throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
    }
    aCompMgr =
        aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(
        CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType) {
    aCompMgr =
        aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
  },

  getClassObject: function(aCompMgr, aCID, aIID) {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(CLASS_ID))
      return ServerFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) {
    return true;
  }
};


//module initialization
function NSGetModule(aCompMgr, aFileSpec) {
  return ServerModule;
}
