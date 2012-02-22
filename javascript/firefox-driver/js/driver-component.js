/*
 Copyright 2007-2009 WebDriver committers
 Copyright 2007-2009 Google Inc.
 Portions copyright 2011 Software Freedom Conservancy

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


goog.require('WebDriverServer');
goog.require('WebElement');

// constants
/** @const */ var nsISupports = Components.interfaces.nsISupports;
/** @const */ var CLASS_ID = Components.ID("{1C0E8D86-B661-40d0-AE3D-CA012FADF170}");
/** @const */ var CLASS_NAME = "firefoxWebDriver";
/** @const */ var CONTRACT_ID = "@googlecode.com/webdriver/fxdriver;1";

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
NSGetModule = function(aCompMgr, aFileSpec) {
  return ServerModule;
};

NSGetFactory = function() {
  return ServerFactory;
};
WebDriverServer.prototype.classID = CLASS_ID;
