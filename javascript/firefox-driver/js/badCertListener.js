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

/**
 * @fileoverview Contains a Javascript implementation for
 * a custom nsICertOverrideService. This class will forward requests to the
 * original certificate override service - unless it was told to accept all
 * of them.
 */

goog.provide('WdCertOverrideService');

goog.require('bot.userAgent');
goog.require('fxdriver.logging');
goog.require('fxdriver.moz');


function getPreferenceFromProfile(prefName, prefDefaultValue) {
  var prefs =
      CC['@mozilla.org/preferences-service;1'].getService(CI['nsIPrefBranch']);

  if (!prefs.prefHasUserValue(prefName)) {
    fxdriver.logging.info(prefName + ' not set; defaulting to ' + prefDefaultValue);
    return prefDefaultValue;
  }

  var prefValue = prefs.getBoolPref(prefName);
  fxdriver.logging.info('Found preference for ' + prefName + ': ' + prefValue);

  return prefValue;
}

function shouldAcceptUntrustedCerts() {
  // Defaults to true - accepting untrusted certificates.
  // This puts the module into effect - setting it to false
  // will delegate all calls to the original service.
  return getPreferenceFromProfile('webdriver_accept_untrusted_certs', true);
}

function shouldAssumeUntrustedIssuer() {
  return getPreferenceFromProfile('webdriver_assume_untrusted_issuer', true);
}

WdCertOverrideService = function() {
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

  fxdriver.logging.info('Accept untrusted certificates: ' + shouldAcceptUntrustedCerts());

  // UUID of the original implementor of this service.
  var ORIGINAL_OVERRIDE_SERVICE_ID = '{67ba681d-5485-4fff-952c-2ee337ffdcd6}';

  // Keep a reference to the original bad certificate listener.
  var originalService = Components.classesByID[ORIGINAL_OVERRIDE_SERVICE_ID].
      getService();

  this.origListener_ =
      originalService.QueryInterface(
        CI['nsICertOverrideService']);
};

// Constants needed since WdCertOverrideService implements
// nsICertOverrideService
WdCertOverrideService.prototype = {
  ERROR_UNTRUSTED: 1,
  ERROR_MISMATCH: 2,
  ERROR_TIME: 4
};

// Returns the bit needed to mask if the certificate has expired, 0 otherwise.
WdCertOverrideService.prototype.certificateExpiredBit_ =
    function(theCert, verification_result) {
  if ((verification_result & theCert.CERT_EXPIRED) != 0) {
    fxdriver.logging.info('Certificate expired.');
    return this.ERROR_TIME;
  }

  return 0;
};

// Returns the bit needed to mask untrusted issuers, 0 otherwise.
// Note that this bit is already set by default in default_bits
WdCertOverrideService.prototype.certificateIssuerUntrusted_ =
    function(theCert, verification_result) {
  if (((verification_result & theCert.ISSUER_UNKNOWN) != 0) ||
      ((verification_result & theCert.ISSUER_NOT_TRUSTED) != 0) ||
      ((verification_result & theCert.CERT_NOT_TRUSTED) != 0) ||
      ((verification_result & theCert.INVALID_CA) != 0)) {
    fxdriver.logging.info('Certificate issuer unknown.');
    fxdriver.logging.info('Unknown: ' + (theCert.ISSUER_UNKNOWN & verification_result));
    fxdriver.logging.info('Issuer not trusted: ' + (theCert.ISSUER_NOT_TRUSTED & verification_result));
    fxdriver.logging.info('Cert not trusted: ' + (theCert.CERT_NOT_TRUSTED & verification_result));
    fxdriver.logging.info('Invalid CA: ' + (theCert.INVALID_CA & verification_result));

    return this.ERROR_UNTRUSTED;
  }

  return 0;
};

// Returns the bit needed to mask mismatch between actual hostname
// and the hostname the certificate was issued for, 0 otherwise.
WdCertOverrideService.prototype.certificateHostnameMismatch_ =
    function(theCert, aHost) {
  var commonNameRE = new RegExp('^' + theCert.commonName.replace('*', '[\\w|\-]+') + '$', 'i');
  if (aHost.match(commonNameRE) === null) {
    fxdriver.logging.info('Host name mismatch: cert: ' + theCert.commonName + ' get: ' + aHost);
    return this.ERROR_MISMATCH;
  }

  return 0;
};

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

  fxdriver.logging.info('Certificate verification results: ' + verification_bits);

  return_bits = return_bits | this.certificateExpiredBit_(
      aCert, verification_bits);
  return_bits = return_bits | this.certificateHostnameMismatch_(aCert, aHost);

  // Return bits will be 0 here only if:
  // 1. Both checks above returned 0.
  // 2. shouldAssumeUntrustedIssuer is false (otherwise this.default_bits = 1)
  // It has been observed that if there's a host name mismatch then it
  // may not be required to check the trust status of the certificate issuer.
  if (return_bits == 0) {
    fxdriver.logging.info('Checking issuer since certificate has not expired or has a host name mismatch.');
    return_bits = return_bits | this.certificateIssuerUntrusted_(
        aCert, verification_bits);
  }

  fxdriver.logging.info('return_bits now: ' + return_bits);
  return return_bits;
};

// Interface functions from now on.
WdCertOverrideService.prototype.hasMatchingOverride = function(
    aHostName, aPort, aCert, aOverrideBits, aIsTemporary) {
  var retval = false;

  var acceptAll = shouldAcceptUntrustedCerts();
  if (acceptAll === true) {
    fxdriver.logging.info('Allowing certificate from site: ' + aHostName + ':' + aPort);
    retval = true;
    aIsTemporary.value = false;

    aOverrideBits.value = this.fillNeededBits(aCert, aHostName);
    fxdriver.logging.info('Override Bits: ' + aOverrideBits.value);
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
  this.origListener_.getAllOverrideHostsWithPorts(aCount, aHostsWithPortsArray);
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
  if (aIID.equals(CI['nsICertOverrideService']) ||
      aIID.equals(CI['nsIInterfaceRequestor']) ||
      aIID.equals(CI['nsISupports'])) {
    return this;
  }

  throw CR['NS_ERROR_NO_INTERFACE'];
};

// Service contract ID which we override
/** @const */ var CERTOVERRIDE_CONTRACT_ID = '@mozilla.org/security/certoverride;1';
// UUID for this instance specifically.
/** @const */ var DUMMY_CERTOVERRIDE_SERVICE_CLASS_ID =
  Components.ID('{c8fffaba-9b7a-41aa-872d-7e7366c16715}');

var service = undefined;

var WDCertOverrideFactory = {
  createInstance: function(aOuter, aIID) {
    if (aOuter != null)
      throw CR['NS_ERROR_NO_AGGREGATION'];
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
    throw CR['NS_ERROR_FACTORY_REGISTER_AGAIN'];
  }

  fxdriver.logging.info('Registering Override Certificate service.');
  aCompMgr = aCompMgr.QueryInterface(
      CI['nsIComponentRegistrar']);
  aCompMgr.registerFactoryLocation(
      DUMMY_CERTOVERRIDE_SERVICE_CLASS_ID, 'badCertListener',
      CERTOVERRIDE_CONTRACT_ID, aFileSpec, aLocation, aType);
};

WDBadCertListenerModule.prototype.unregisterSelf = function(
    aCompMgr, aLocation, aType) {
  fxdriver.logging.info('Un-registering Override Certificate service.');
  aCompMgr =
  aCompMgr.QueryInterface(CI['nsIComponentRegistrar']);
  aCompMgr.unregisterFactoryLocation(DUMMY_CERTOVERRIDE_SERVICE_CLASS_ID, aLocation);
};


var FACTORY;

if (!bot.userAgent.isProductVersion('10')) {
/** @const */ FACTORY = {
  createInstance: function(aOuter, aIID) {
    if (aOuter != null)
      throw CR['NS_ERROR_NO_AGGREGATION'];

    if (service != undefined) {
      return service;
    }

    var raw = new WdCertOverrideService();

    var mainThread = CC['@mozilla.org/thread-manager;1'].getService().mainThread;
    var proxyManager = CC['@mozilla.org/xpcomproxy;1']
        .getService(CI.nsIProxyObjectManager);

    // 5 == NS_PROXY_ALWAYS | NS_PROXY_SYNC
    service = proxyManager.getProxyForObject(mainThread,
                CI.nsICertOverrideService, raw, 5);

    return service;
    }
  };

  WdCertOverrideService.prototype._xpcom_factory = FACTORY;
}

WDBadCertListenerModule.prototype.getClassObject = function(
    aCompMgr, aCID, aIID) {
  if (!aIID.equals(CI['nsIFactory']))
    throw CR['NS_ERROR_NOT_IMPLEMENTED'];

  if (aCID.equals(DUMMY_CERTOVERRIDE_SERVICE_CLASS_ID)) {
    if (bot.userAgent.isProductVersion('10')) {
      return WDCertOverrideFactory;
    } else {
      return FACTORY;
   }
  }

  throw CR['NS_ERROR_NO_INTERFACE'];
};

WDBadCertListenerModule.prototype.canUnload = function(aCompMgr) {
  return true;
};

NSGetModule = function(comMgr, fileSpec) {
  return new WDBadCertListenerModule();
};


WdCertOverrideService.prototype.classID = DUMMY_CERTOVERRIDE_SERVICE_CLASS_ID;
fxdriver.moz.load('resource://gre/modules/XPCOMUtils.jsm');
if (XPCOMUtils.generateNSGetFactory) {
  /** @const */ NSGetFactory = XPCOMUtils.generateNSGetFactory([WdCertOverrideService]);
}
