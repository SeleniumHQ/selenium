/*
 Copyright 2007-2010 WebDriver committers
 Copyright 2007-2010 Google Inc.
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

goog.provide('wdSessionStoreService');

goog.require('fxdriver.logging');
goog.require('fxdriver.modals');
goog.require('fxdriver.moz');
goog.require('fxdriver.proxy');
goog.require('goog.object');
goog.require('wdSession');

/**
 * Service that keeps track of all the active FirefoxDriver sessions.
 * @constructor
 */
wdSessionStoreService = function() {

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
};


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
 * @param {!Response} response The object to send the command response in.
 * @param {!Object.<*>} desiredCaps A map describing desired capabilities.
 * @param {Object.<*>} requiredCaps A map describing required capabilities.
 * @param {!FirefoxDriver} driver The driver instance.
 * @return {wdSession} A new WebDriver session.
 */
wdSessionStoreService.prototype.createSession = function(response, desiredCaps, 
  requiredCaps, driver) {
  var id = Components.classes['@mozilla.org/uuid-generator;1'].
      getService(Components.interfaces.nsIUUIDGenerator).
      generateUUID().
      toString();
  id = id.substring(1, id.length - 1);  // Remove enclosing {} characters

  var session = Components.classes['@googlecode.com/webdriver/wdsession;1'].
      createInstance(Components.interfaces.nsISupports);

  // Ah, xpconnect...
  var wrappedSession = session.wrappedJSObject;
  wrappedSession.setId(id);

  fxdriver.logging.configure(
    this.extractCapabilitySetting_('loggingPrefs', desiredCaps, requiredCaps),
    this.extractCapabilitySetting_('webdriver.logging.profiler.enabled',
      desiredCaps, requiredCaps));

  fxdriver.proxy.configure(this.extractCapabilitySetting_('proxy', desiredCaps,
    requiredCaps));

  fxdriver.modals.configure(
    this.extractCapabilitySetting_('unexpectedAlertBehaviour', desiredCaps,
    requiredCaps));

  this.configure_(response, desiredCaps, requiredCaps, driver);
  this.sessions_[id] = session;
  return session;
};

/**
 * Extract the setting for a capability.
 *
 * If a capability is defined both among desired capabilities and among
 * required capabilities the required setting has priority.
 *
 * @private
 * @param {!string} name The name of the capability.
 * @param {!Object.<*>} desiredCaps The desired capabilities.
 * @param {Object.<*>} requiredCaps The required capabilities.
 * @return {*} The setting for the capability.
 */
wdSessionStoreService.prototype.extractCapabilitySetting_ = function(name, 
  desiredCaps, requiredCaps) {
  var setting = desiredCaps[name];
  if (requiredCaps && requiredCaps[name] !== undefined) {
    setting = requiredCaps[name];
  }
  return setting;
};

/**
 * Read-only capabilities for FirefoxDriver and their default values.
 * @type {!Object.<string, boolean>}
 * @const
 * @private
 */
wdSessionStoreService.READ_ONLY_CAPABILITIES_ = {
  'javascriptEnabled': true,
  'takesScreenshot': true,
  'handlesAlerts': true,
  'cssSelectorsEnabled': true,
  'rotatable': false
};

/**
 * Read-write capabilities for FirefoxDriver corresponding to (boolean)
 * profile preferences. NB! the native events capability is not mapped to a
 * Firefox preferences.
 * @type {!Object.<string, string>}
 * @const
 */
wdSessionStoreService.CAPABILITY_PREFERENCE_MAPPING = {
  'webStorageEnabled': 'dom.storage.enabled',
  'applicationCacheEnabled': 'browser.cache.offline.enable',
  'databaseEnabled': 'dom.indexedDB.enabled',
  'locationContextEnabled': 'geo.enabled',
  'browserConnectionEnabled': 'dom.network.enabled',
  'acceptSslCerts': 'webdriver_accept_untrusted_certs',
  'nativeEvents' : 'webdriver_enable_native_events'
};
// TODO: Don't save firefox specific capability acceptSslCerts as preferences.

/**
 * @param {!Response} response The object to send the command response in.
 * @param {!Object.<*>} desiredCaps A map describing desired capabilities.
 * @param {Object.<*>} requiredCaps A map describing required capabilities.
 * @param {!FirefoxDriver} driver The driver instance.
 * @private
 */
wdSessionStoreService.prototype.configure_ = function(response, desiredCaps, 
    requiredCaps, driver) {
  fxdriver.logging.info('Setting preferences based on required capabilities');
  this.configureCapabilities_(desiredCaps, driver);

  if (!requiredCaps) {
    return;
  }
  var checkSettingsForReadOnlyCapabilities = function(value, key) {
    if (!goog.isBoolean(value)) {
      return;
    }
    if (key in wdSessionStoreService.READ_ONLY_CAPABILITIES_ &&
        value != wdSessionStoreService.READ_ONLY_CAPABILITIES_[key]) {
      var msg = 'Required capability ' + key + ' cannot be set to ' + value;
      fxdriver.logging.info(msg);
      response.sendError(new WebDriverError(bot.ErrorCode.SESSION_NOT_CREATED,
        msg));
      wdSession.quitBrowser(0);
    }
  };
  goog.object.forEach(requiredCaps, checkSettingsForReadOnlyCapabilities);
  this.configureCapabilities_(requiredCaps, driver);
};

/**
 * @param {!Object.<*>} capabilities A map describing capabilities.
 * @param {!FirefoxDriver} driver The driver instance.
 * @private
 */
wdSessionStoreService.prototype.configureCapabilities_ = function(capabilities, 
  driver) {
  var prefStore = fxdriver.moz.getService('@mozilla.org/preferences-service;1',
    'nsIPrefBranch');
  goog.object.forEach(capabilities, function(value, key) {
    if (!goog.isBoolean(value)) {
      return;
    }
    if (key in wdSessionStoreService.CAPABILITY_PREFERENCE_MAPPING) {
      var pref = wdSessionStoreService.CAPABILITY_PREFERENCE_MAPPING[key];
      prefStore.setBoolPref(pref, value);
      fxdriver.logging.info('Setting capability ' +
        key + ' (' + pref + ') to ' + value);
      if (key == 'nativeEvents') {
        driver.enableNativeEvents = value;
      }
    }
  });
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
NSGetModule = function() {
  return new wdSessionStoreServiceModule();
};

wdSessionStoreService.prototype.classID = wdSessionStoreService.CLASS_ID;
fxdriver.moz.load('resource://gre/modules/XPCOMUtils.jsm');
if (XPCOMUtils.generateNSGetFactory) {
  /** @const */ NSGetFactory = XPCOMUtils.generateNSGetFactory([wdSessionStoreService]);
}

