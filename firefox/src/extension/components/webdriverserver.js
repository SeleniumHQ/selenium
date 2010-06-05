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


function WebDriverServer() {
  this.wrappedJSObject = this;
  this.serverSocket =
  Components.classes["@mozilla.org/network/server-socket;1"].
      createInstance(Components.interfaces.nsIServerSocket);
  this.generator = Utils.getService("@mozilla.org/uuid-generator;1", "nsIUUIDGenerator");
  this.enableNativeEvents = null;

  // Force our cert override service to be loaded - otherwise, it will not be
  // loaded and cause a "too deep recursion" error.
  var overrideService = Components.classes["@mozilla.org/security/certoverride;1"]
      .getService(Components.interfaces.nsICertOverrideService);

  /**
   * This server's request dispatcher.
   * @type {Dispatcher}
   * @private
   */
  this.dispatcher_ = new Dispatcher();
}


WebDriverServer.prototype.newDriver = function(window) {
  if (null == this.useNativeEvents) {
    var prefs =
        Utils.getService("@mozilla.org/preferences-service;1", "nsIPrefBranch");
    if (!prefs.prefHasUserValue("webdriver_enable_native_events")) {
      Utils.dumpn('webdriver_enable_native_events not set; defaulting to false');
    }
    this.enableNativeEvents =
    prefs.prefHasUserValue("webdriver_enable_native_events") ?
    prefs.getBoolPref("webdriver_enable_native_events") : false;
    Utils.dumpn('Enable native events: ' + this.enableNativeEvents);
  }
  window.fxdriver = new FirefoxDriver(this, this.enableNativeEvents, window);
  return window.fxdriver;
};


WebDriverServer.prototype.getNextId = function() {
  return this.generator.generateUUID().toString();
};


WebDriverServer.prototype.onSocketAccepted = function(socket, transport) {
  try {
    var socketListener = new SocketListener(this.dispatcher_, transport);
  } catch(e) {
    dump(e);
  }
};


WebDriverServer.prototype.startListening = function(port) {
  if (!port) {
    var prefs =
        Utils.getService("@mozilla.org/preferences-service;1", "nsIPrefBranch");

    port = prefs.prefHasUserValue("webdriver_firefox_port") ?
           prefs.getIntPref("webdriver_firefox_port") : 7055;
  }

  if (!this.isListening) {
    this.serverSocket.init(port, true, -1);
    this.serverSocket.asyncListen(this);
    this.isListening = true;
  }
};


WebDriverServer.prototype.onStopListening = function(socket, status)
{
};


WebDriverServer.prototype.close = function()
{
};


WebDriverServer.prototype.QueryInterface = function(aIID) {
  if (!aIID.equals(nsISupports))
    throw Components.results.NS_ERROR_NO_INTERFACE;
  return this;
};


WebDriverServer.prototype.createInstance = function(ignore1, ignore2, ignore3) {
  var port = WebDriverServer.readPort();
  this.startListening(port);
};
