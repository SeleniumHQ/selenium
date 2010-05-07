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

function getPreferenceFromProfile(prefName, prefDefaultValue) {
  var prefs =
      CC["@mozilla.org/preferences-service;1"].getService(CI["nsIPrefBranch"]);

  if (!prefs.prefHasUserValue(prefName)) {
    localdump(prefName + ' not set; defaulting to ' + prefDefaultValue);
    return prefDefaultValue;
  }

  var prefValue = prefs.getBoolPref(prefName);
  localdump("Found preference for " + prefName + ": " + prefValue);

  return prefValue;
}

function shouldAcceptUntrustedCerts() {
  return getPreferenceFromProfile("webdriver_accept_untrusted_certs", true);
}

function shouldAssumeUntrustedIssuer() {
  return getPreferenceFromProfile("webdriver_assume_untrusted_issuer", true);
}

function WdCertOverrideService() {
  // Defaults to true - accepting untrusted certificates.
  // This puts the module into effect - setting it to false
  // will delegate all calls to the original service.
  this.acceptAll = shouldAcceptUntrustedCerts();

  // If untrusted issuer is set to false by the user,
  // the initial bitmask will not include ERROR_UNTRUSTED.
  //
  // See the javadoc for FirefoxProfile and documentation
  // for fillNeededBits for further explanation.
  var untrusted_issuer = shouldAssumeUntrustedIssuer();
  if (untrusted_issuer) {
    this.default_bits = this.ERROR_UNTRUSTED;
  } else {
    this.default_bits = 0;
  }

  localdump("Accept untrusted certificates: " + this.acceptAll);

  // UUID of the original implementor of this service.
  var ORIGINAL_OVERRIDE_SERVICE_ID = "{67ba681d-5485-4fff-952c-2ee337ffdcd6}";

  // Keep a reference to the original bad certificate listener.
  var originalService = Components.classesByID[ORIGINAL_OVERRIDE_SERVICE_ID].
      getService();

  this.origListener_ =
      originalService.QueryInterface(
        Components.interfaces.nsICertOverrideService);
};

// Constants needed since WdCertOverrideService implements
// nsICertOverrideService
WdCertOverrideService.prototype = {
  ERROR_UNTRUSTED: 1,
  ERROR_MISMATCH: 2,
  ERROR_TIME: 4
};

// Returns the bit needed to mask if the certificate has expired, 0 otherwise.
WdCertOverrideService.prototype.certificateExpiredBit_ = function
  (theCert, verification_result) {
  if ((verification_result & theCert.CERT_EXPIRED) != 0) {
    localdump("Certificate expired.");
    return this.ERROR_TIME;
  }

  return 0;
}

// Returns the bit needed to mask untrusted issuers, 0 otherwise.
// Note that this bit is already set by default in default_bits
WdCertOverrideService.prototype.certificateIssuerUntrusted_ = function
  (theCert, verification_result) {
  if (((verification_result & theCert.ISSUER_UNKNOWN) != 0) ||
      ((verification_result & theCert.ISSUER_NOT_TRUSTED) != 0) ||
      ((verification_result & theCert.CERT_NOT_TRUSTED) != 0) ||
      ((verification_result & theCert.INVALID_CA) != 0)) {
    localdump("Certificate issuer unknown.");
    return this.ERROR_UNTRUSTED;
  }

  return 0;
}

// Returns the bit needed to mask mismatch between actual hostname
// and the hostname the certificate was issued for, 0 otherwise.
WdCertOverrideService.prototype.certificateHostnameMismatch_ = function
  (theCert, aHost) {
  commonNameRE = new RegExp(theCert.commonName.replace('*', '\\w+'));
  if (aHost.match(commonNameRE) === null) {
    localdump("Host name mismatch: cert: " + theCert.commonName + " get: " + aHost);
    return this.ERROR_MISMATCH;
  }

  return 0;
}

// Given a certificate and the host it was received for, fill in the bits
// needed to accept this certificate for this host, even though the 
// certificate is invalid.
//
// Note that the bitmask has to be accurate: At the moment, Firefox expects
// the returned bitmask to match *exactly* to the errors the certificate
// caused. If extra bits will be set, the untrusted certificate screen
// will appear.
WdCertOverrideService.prototype.fillNeededBits = function(aCert, aHost) {
  var verification_bits = aCert.verifyForUsage(aCert.CERT_USAGE_SSLClient);
  var return_bits = this.default_bits;

  localdump("Certificate verification results: " + verification_bits);

  return_bits = return_bits | this.certificateExpiredBit_(
      aCert, verification_bits);
  return_bits = return_bits | this.certificateIssuerUntrusted_(
      aCert, verification_bits);
  return_bits = return_bits | this.certificateHostnameMismatch_(aCert, aHost);
  localdump("return_bits now: " + return_bits);
  return return_bits;
};

// Interface functions from now on.
WdCertOverrideService.prototype.hasMatchingOverride = function(
    aHostName, aPort, aCert, aOverrideBits, aIsTemporary) {
  var retval = false;

  if (this.acceptAll === true) {
    localdump("Allowing certificate from site: " + aHostName + ":" + aPort);
    retval = true;
    aIsTemporary.value = false;

    aOverrideBits.value = this.fillNeededBits(aCert, aHostName);
    localdump("Override Bits: " + aOverrideBits.value);
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

WdCertOverrideService.prototype.QueryInterface = function(aIID) {
  if (aIID.equals(Components.interfaces.nsICertOverrideService) ||
      aIID.equals(Components.interfaces.nsIInterfaceRequestor) ||
      aIID.equals(Components.interfaces.nsISupports)) {
    return this;
  }

  throw Components.results.NS_ERROR_NO_INTERFACE;
}

// Service contract ID which we override
const CERTOVERRIDE_CONTRACT_ID = "@mozilla.org/security/certoverride;1";
// UUID for this instance specifically.
const DUMMY_CERTOVERRIDE_SERVICE_CLASS_ID =
  Components.ID('{c8fffaba-9b7a-41aa-872d-7e7366c16715}');

var service = undefined;

var WDCertOverrideFactory = {
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
      DUMMY_CERTOVERRIDE_SERVICE_CLASS_ID, "WebDriver Override Cert Service",
      CERTOVERRIDE_CONTRACT_ID, aFileSpec, aLocation, aType);
};

WDBadCertListenerModule.prototype.unregisterSelf = function(
    aCompMgr, aLocation, aType) {
  localdump("Un-registering Override Certificate service.");
  aCompMgr =
  aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  aCompMgr.unregisterFactoryLocation(DUMMY_CERTOVERRIDE_SERVICE_CLASS_ID, aLocation);
};

WDBadCertListenerModule.prototype.getClassObject = function(
    aCompMgr, aCID, aIID) {
  if (!aIID.equals(Components.interfaces.nsIFactory))
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

  if (aCID.equals(DUMMY_CERTOVERRIDE_SERVICE_CLASS_ID))
    return WDCertOverrideFactory;

  throw Components.results.NS_ERROR_NO_INTERFACE;
};

WDBadCertListenerModule.prototype.canUnload = function(aCompMgr) {
  return true;
};

function NSGetModule(comMgr, fileSpec) {
  var appInfo = Components.classes['@mozilla.org/xre/app-info;1'].
    getService(Components.interfaces.nsIXULAppInfo);
  var versionChecker = Components.classes['@mozilla.org/xpcom/version-comparator;1'].
    getService(Components.interfaces.nsIVersionComparator);
  if (versionChecker.compare(appInfo.version, '3.0') >= 0) {
    return new WDBadCertListenerModule();
  }
}
