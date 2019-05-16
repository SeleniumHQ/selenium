package org.openqa.selenium.devtools.network.types;

/**
 * Field type for a signed exchange related error
 */
public enum SignedExchangeErrorField {

  signatureSig,
  signatureIntegrity,
  signatureCertUrl,
  signatureCertSha256,
  signatureValidityUrl,
  signatureTimestamps

}
