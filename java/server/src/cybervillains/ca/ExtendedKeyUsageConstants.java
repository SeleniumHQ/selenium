package cybervillains.ca;

/**
 * This interface stores commonly used OIDs for X.509v3 certificates.
 * 
 * *************************************************************************************** Copyright
 * (c) 2007, Information Security Partners, LLC All rights reserved.
 * 
 * In a special exception, Selenium/OpenQA is allowed to use this code under the Apache License 2.0.
 * 
 * @author Brad Hill
 * 
 */
interface ExtendedKeyUsageConstants {

  String keyPurposeBase = "1.3.6.1.5.5.7.3";

  //
  // standard key purpose ids
  //

  String serverAuth = keyPurposeBase + ".1";
  String clientAuth = keyPurposeBase + ".2";
  String codeSigning = keyPurposeBase + ".3";
  String emailProtection = keyPurposeBase + ".4";
  String ipsecEndSystem = keyPurposeBase + ".5";
  String ipsecTunnel = keyPurposeBase + ".6";
  String ipsecUser = keyPurposeBase + ".7";
  String timeStamping = keyPurposeBase + ".8";
  String OCSPSigning = keyPurposeBase + ".9";

  //
  // unusual key purpose ids
  //

  String netscapeServerGatedCrypto = "2.16.840.1.113730.4.1";
  String verisignUnknown = "2.16.840.1.113733.1.8.1";
  String msServerGatedCrypto = "1.3.6.1.4.1.311.10.3.3";



}
