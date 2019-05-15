package org.openqa.selenium.devtools.network.types;

import java.util.List;

/**
 * Created by aohana
 */
public class SignedExchangeSignature {

  private String label;

  private String signature;

  private String integrity;

  private String certUrl;

  private String certSha256;

  private String validityUrl;

  private Integer date;

  private Integer expires;

  private List<String> certificates;

  /** Signed exchange signature label. */
  public String getLabel() {
    return label;
  }

  /** Signed exchange signature label. */
  public void setLabel(String label) {
    this.label = label;
  }

  /** The hex string of signed exchange signature. */
  public String getSignature() {
    return signature;
  }

  /** The hex string of signed exchange signature. */
  public void setSignature(String signature) {
    this.signature = signature;
  }

  /** Signed exchange signature integrity. */
  public String getIntegrity() {
    return integrity;
  }

  /** Signed exchange signature integrity. */
  public void setIntegrity(String integrity) {
    this.integrity = integrity;
  }

  /** Signed exchange signature cert Url. */
  public String getCertUrl() {
    return certUrl;
  }

  /** Signed exchange signature cert Url. */
  public void setCertUrl(String certUrl) {
    this.certUrl = certUrl;
  }

  /** The hex string of signed exchange signature cert sha256. */
  public String getCertSha256() {
    return certSha256;
  }

  /** The hex string of signed exchange signature cert sha256. */
  public void setCertSha256(String certSha256) {
    this.certSha256 = certSha256;
  }

  /** Signed exchange signature validity Url. */
  public String getValidityUrl() {
    return validityUrl;
  }

  /** Signed exchange signature validity Url. */
  public void setValidityUrl(String validityUrl) {
    this.validityUrl = validityUrl;
  }

  /** Signed exchange signature date. */
  public Integer getDate() {
    return date;
  }

  /** Signed exchange signature date. */
  public void setDate(Integer date) {
    this.date = date;
  }

  /** Signed exchange signature expires. */
  public Integer getExpires() {
    return expires;
  }

  /** Signed exchange signature expires. */
  public void setExpires(Integer expires) {
    this.expires = expires;
  }

  /** The encoded certificates. */
  public List<String> getCertificates() {
    return certificates;
  }

  /** The encoded certificates. */
  public void setCertificates(List<String> certificates) {
    this.certificates = certificates;
  }
}
