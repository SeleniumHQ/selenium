/*
 Copyright 2007-2010 WebDriver committers
 Copyright 2007-2010 Google Inc.
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

/**
 * Logs a message to the console service.
 * @param {string} message The message to log.
 */
function log(message) {
  Components.classes['@mozilla.org/consoleservice;1'].
    getService(Components.interfaces.nsIConsoleService).
    logStringMessage(message);
}


/**
 * Service that keeps track of all the active FirefoxDriver sessions.
 * @constructor
 */
function wdSessionStoreService() {

  /**
   * A wrapped self-reference for XPConnect.
   * @type {wdSessionStoreService}
   */
  this.wrappedJSObject = this;

  /**
   * Map of active sessions.
   * @type {Object}
   * @private
   */
  this.sessions_ = {};
}


/**
 * This component's ID.
 * @type {nsIJSID}
 */
wdSessionStoreService.CLASS_ID = Components.ID('{b54195d3-841e-47df-b709-edf1bc4c7166}');


/**
 * This component's class name.
 * @type {string}
 */
wdSessionStoreService.CLASS_NAME = 'wdSessionStoreService';


/**
 * This component's contract ID.
 * @type {string}
 */
wdSessionStoreService.CONTRACT_ID = '@googlecode.com/webdriver/wdsessionstoreservice;1';


/** @see nsISupports.QueryInterface */
wdSessionStoreService.prototype.QueryInterface = function(aIID) {
  if (aIID.equals(Components.interfaces.nsISupports)) {
    return this;
  }
  throw Components.results.NS_ERROR_NO_INTERFACE;
};


/**
 * @return {wdSession} A new WebDriver session.
 */
wdSessionStoreService.prototype.createSession = function() {
  var id = Components.classes['@mozilla.org/uuid-generator;1'].
      getService(Components.interfaces.nsIUUIDGenerator).
      generateUUID().
      toString();
  id = id.substring(1, id.length - 1);  // Remove enclosing {} characters

  var session = Components.classes['@googlecode.com/webdriver/wdsession;1'].
      createInstance(Components.interfaces.nsISupports);

  // Ah, xpconnect...
  session.wrappedJSObject.setId(id);
  this.sessions_[id] = session;
  return session;
};


/**
 * Deletes the specified session.
 * @param {string} sessionId ID of the session to delete.
 */
wdSessionStoreService.prototype.deleteSession = function(sessionId) {
  if (sessionId in this.sessions_) {
    delete this.sessions_[sessionId];
  }
};


/**
 * Retrieves the session with the given ID.
 * @param {string} sessionId ID of the session to retrieve.
 * @return {wdSession} The matching session.
 * @throws NS_ERROR_NOT_AVAILABLE if the session does not exist.
 */
wdSessionStoreService.prototype.getSession = function(sessionId) {
  if (sessionId in this.sessions_) {
    var session = this.sessions_[sessionId].wrappedJSObject;  // XPConnect
    return this.sessions_[sessionId];
  }
  var sessions = [];
  for (var session in this.sessions_) {
    sessions.push(session);
  }
  throw Components.results.NS_ERROR_NOT_AVAILABLE;
};


///////////////////////////////////////////////////////////////////
//
// nsIFactory functions
//
///////////////////////////////////////////////////////////////////

/** @constructor */
function wdSessionStoreServiceFactory() {
}


/**
 * The singleton instance for this component.
 * @type {?wdSessionStoreService}
 * @private
 */
wdSessionStoreServiceFactory.prototype.instance_ = null;


/** @see nsIFactory.createInstance */
wdSessionStoreServiceFactory.prototype.createInstance = function(aOuter, aIID) {
  if (aOuter != null) {
    throw Components.results.NS_ERROR_NO_AGGREGATION;
  }
  if (!this.instance_) {
    this.instance_ = new wdSessionStoreService();
  }
  return this.instance_.QueryInterface(aIID);
};

///////////////////////////////////////////////////////////////////
//
// nsIModule functions
//
///////////////////////////////////////////////////////////////////

/** @constructor */
function wdSessionStoreServiceModule() {
}


/**
 * Whether this module has already been registered.
 * @type {!boolean}
 * @private
 */
wdSessionStoreServiceModule.prototype.hasRegistered_ = false;


/** @see nsIModule.registerSelf */
wdSessionStoreServiceModule.prototype.registerSelf = function(aCompMgr, aFileSpec, aLocation, aType) {
  if (this.hasRegistered_) {
    throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
  }
  aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar).
      registerFactoryLocation(
          wdSessionStoreService.CLASS_ID,
          wdSessionStoreService.CLASS_NAME,
          wdSessionStoreService.CONTRACT_ID,
          aFileSpec, aLocation, aType);
  this.hasRegistered_ = true;
};


/** @see nsIModule.unregisterSelf */ 
wdSessionStoreServiceModule.prototype.unregisterSelf = function(aCompMgr, aLocation) {
  aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar).
      unregisterFactoryLocation(wdSessionStoreService.CLASS_ID, aLocation);
};


/** @see nsIModule.getClassObject */
wdSessionStoreServiceModule.prototype.getClassObject = function(aCompMgr, aCID, aIID) {
  if (!aIID.equals(Components.interfaces.nsIFactory)) {
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
  } else if (!aCID.equals(wdSessionStoreService.CLASS_ID)) {
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
  return new wdSessionStoreServiceFactory();
};


/** @see nsIModule.canUnload */
wdSessionStoreServiceModule.prototype.canUnload = function() {
  return true;
};



/**
 * Module initialization.
 */
function NSGetModule() {
  return new wdSessionStoreServiceModule();
}

