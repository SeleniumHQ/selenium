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

/**
 * @fileOverview Contains a Javascript implementation for
 * a custom nsICertOverrideService. This class will forward requests to the
 * original certificate override service - unless it was told to accept all
 * of them.
 */

const CC = Components.classes;
const CI = Components.interfaces;

const CONSOLE = CC["@mozilla.org/consoleservice;1"].
                  getService(CI["nsIConsoleService"]);

function localdump(message) {
  try {
    CONSOLE.logStringMessage(message + "\n");
  } catch (e) {
    dump(message + "\n");
  }
}

function WdCertOverrideService() {
  var prefs =
      CC["@mozilla.org/preferences-service;1"].getService(CI["nsIPrefBranch"]);

  this.acceptAll = undefined;
  if (!prefs.prefHasUserValue("webdriver_accept_untrusted_certs")) {
    localdump('webdriver_accept_untrusted_certs not set; defaulting to true');
    this.acceptAll = true;
  } else {
    localdump("Found preference for webdriver_accept_untrusted_certs: " +
              prefs.getBoolPref("webdriver_accept_untrusted_certs"));
    this.acceptAll = prefs.getBoolPref("webdriver_accept_untrusted_certs");
  }
  // UUID of the original implementor of this service.
  var ORIGINAL_OVERRIDE_SERVICE_ID = "{67ba681d-5485-4fff-952c-2ee337ffdcd6}";

  localdump("Accept untrusted certificates: " + this.acceptAll);

  // Keep a reference to the original bad certificate listener.
  var originalService = Components.classesByID[ORIGINAL_OVERRIDE_SERVICE_ID].
      getService();

  this.origListener_ =
      originalService.QueryInterface(
        Components.interfaces.nsICertOverrideService);
};

WdCertOverrideService.prototype = {
  ERROR_UNTRUSTED: 1,
  ERROR_MISMATCH: 2,
  ERROR_TIME: 4
};

WdCertOverrideService.prototype.hasMatchingOverride = function(
    aHostName, aPort, aCert, aOverrideBits, aIsTemporary) {
  var retval = false;

  if (this.acceptAll === true) {
    localdump("Allowing certificate from site: " + aHostName + ":" + aPort);
    retval = true;
    aIsTemporary.value = false;
    aOverrideBits.value = this.ERROR_UNTRUSTED | this.ERROR_MISMATCH |
        this.ERROR_TIME;
    localdump("Bits: " + aOverrideBits.value);
  } else {
    retval = this.origListener_.hasMatchingOverride(aHostName, aPort,
              aCert, aOverrideBits, aIsTemporary);
  }

  return retval;
};

// Delegate the rest of the functions - they are not interesting as they are not
// called during validation of invalid certificate normally.
WdCertOverrideService.prototype.clearValidityOverride = function(aHostName,
                                                                 aPort) {
  this.origListener_.clearValidityOverride(aHostName, aPort);
};

WdCertOverrideService.prototype.getAllOverrideHostsWithPorts = function(
    aCount, aHostsWithPortsArray) {
  this.origListener_.getAllOverrideHostsWithPorts(aCert, aHostsWithPortsArray);
};

WdCertOverrideService.prototype.getValidityOverride = function(
    aHostName, aPort, aHashAlg, aFingerprint, aOverrideBits, aIsTemporary) {
  return this.origListener_.getValidityOverride(
      aHostName, aPort, aHashAlg, aFingerprint, aOverrideBits, aIsTemporary);
};

WdCertOverrideService.prototype.isCertUsedForOverrides = function(
    aCert, aCheckTemporaries, aCheckPermanents) {
  return this.origListener_.isCertUsedForOverrides(
      aCert, aCheckTemporaries, aCheckPermanents);
};

WdCertOverrideService.prototype.rememberValidityOverride = function(
    aHostName, aPort, aCert, aOverrideBits, aTemporary) {
  this.origListener_.rememberValidityOverride(
      aHostName, aPort, aCert, aOverrideBits, aTemporary);
};

// Service contract ID which we override
const CERTOVERRIDE_CONTRACT_ID = "@mozilla.org/security/certoverride;1";
// UUID for this instance specifically.
const DUMMY_BADCERT_SERVICE_CLASS_ID =
  Components.ID('{c8fffaba-9b7a-41aa-872d-7e7366c16715}');

var service = undefined;

var WDBadCertListenerFactory = {
  createInstance: function (aOuter, aIID) {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    if (service == undefined) {
      service = new WdCertOverrideService();
    }
    return service;
  }
};

function WDBadCertListenerModule() {
  this.firstTime_ = true;
}

WDBadCertListenerModule.prototype.registerSelf = function(
    aCompMgr, aFileSpec, aLocation, aType) {

  if (this.firstTime_) {
    this.firstTime_ = false;
    throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
  }

  localdump("Registering Override Certificate service.");
  aCompMgr = aCompMgr.QueryInterface(
      Components.interfaces.nsIComponentRegistrar);
  aCompMgr.registerFactoryLocation(
      DUMMY_BADCERT_SERVICE_CLASS_ID, "WebDriver Override Cert Service",
      CERTOVERRIDE_CONTRACT_ID, aFileSpec, aLocation, aType);
};

WDBadCertListenerModule.prototype.unregisterSelf = function(
    aCompMgr, aLocation, aType) {
  localdump("Un-registering Override Certificate service.");
  aCompMgr =
  aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  aCompMgr.unregisterFactoryLocation(DUMMY_BADCERT_SERVICE_CLASS_ID, aLocation);
};

WDBadCertListenerModule.prototype.getClassObject = function(
    aCompMgr, aCID, aIID) {
  if (!aIID.equals(Components.interfaces.nsIFactory))
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

  if (aCID.equals(DUMMY_BADCERT_SERVICE_CLASS_ID))
    return WDBadCertListenerFactory;

  throw Components.results.NS_ERROR_NO_INTERFACE;
};

WDBadCertListenerModule.prototype.canUnload = function(aCompMgr) {
  return true;
};

function NSGetModule(comMgr, fileSpec) {
  return new WDBadCertListenerModule();
}
