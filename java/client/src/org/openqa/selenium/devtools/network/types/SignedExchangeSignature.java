package org.openqa.selenium.devtools.network.types;

import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;

/**
 * Information about a signed exchange signature
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

  public SignedExchangeSignature() {
  }

  public SignedExchangeSignature(String label, String signature, String integrity,
                                 String certUrl, String certSha256, String validityUrl,
                                 Integer date, Integer expires,
                                 List<String> certificates) {
    this.label = label;
    this.signature = signature;
    this.integrity = integrity;
    this.certUrl = certUrl;
    this.certSha256 = certSha256;
    this.validityUrl = validityUrl;
    this.date = date;
    this.expires = expires;
    this.certificates = certificates;
  }

  /**
   * Signed exchange signature label.
   */
  public String getLabel() {
    return label;
  }

  /**
   * Signed exchange signature label.
   */
  public void setLabel(String label) {
    this.label = label;
  }

  /**
   * The hex string of signed exchange signature.
   */
  public String getSignature() {
    return signature;
  }

  /**
   * The hex string of signed exchange signature.
   */
  public void setSignature(String signature) {
    this.signature = signature;
  }

  /**
   * Signed exchange signature integrity.
   */
  public String getIntegrity() {
    return integrity;
  }

  /**
   * Signed exchange signature integrity.
   */
  public void setIntegrity(String integrity) {
    this.integrity = integrity;
  }

  /**
   * Signed exchange signature cert Url.
   */
  public String getCertUrl() {
    return certUrl;
  }

  /**
   * Signed exchange signature cert Url.
   */
  public void setCertUrl(String certUrl) {
    this.certUrl = certUrl;
  }

  /**
   * The hex string of signed exchange signature cert sha256.
   */
  public String getCertSha256() {
    return certSha256;
  }

  /**
   * The hex string of signed exchange signature cert sha256.
   */
  public void setCertSha256(String certSha256) {
    this.certSha256 = certSha256;
  }

  /**
   * Signed exchange signature validity Url.
   */
  public String getValidityUrl() {
    return validityUrl;
  }

  /**
   * Signed exchange signature validity Url.
   */
  public void setValidityUrl(String validityUrl) {
    this.validityUrl = validityUrl;
  }

  /**
   * Signed exchange signature date.
   */
  public Integer getDate() {
    return date;
  }

  /**
   * Signed exchange signature date.
   */
  public void setDate(Integer date) {
    this.date = date;
  }

  /**
   * Signed exchange signature expires.
   */
  public Integer getExpires() {
    return expires;
  }

  /**
   * Signed exchange signature expires.
   */
  public void setExpires(Integer expires) {
    this.expires = expires;
  }

  /**
   * The encoded certificates.
   */
  public List<String> getCertificates() {
    return certificates;
  }

  /**
   * The encoded certificates.
   */
  public void setCertificates(List<String> certificates) {
    this.certificates = certificates;
  }

  public static SignedExchangeSignature parseSignedExchangeSignature(JsonInput input) {

    String label = null;

    String signature = null;

    String integrity = null;

    String certUrl = null;

    String certSha256 = null;

    String validityUrl = null;

    Number date = null;

    Number expires = null;

    List<String> certificates = null;

    input.beginObject();

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "label":
          label = input.nextString();
          break;
        case "signature":
          signature = input.nextString();
          break;
        case "integrity":
          integrity = input.nextString();
          break;
        case "certUrl":
          certUrl = input.nextString();
          break;
        case "certSha256":
          certSha256 = input.nextString();
          break;
        case "validityUrl":
          validityUrl = input.nextString();
          break;
        case "date":
          date = input.nextNumber();
          break;
        case "expires":
          expires = input.nextNumber();
          break;
        case "certificates":
          input.beginArray();
          certificates = new ArrayList<>();
          while (input.hasNext()) {
            certificates.add(input.nextString());
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }

    }

    return new SignedExchangeSignature(label, signature, integrity, certUrl, certSha256, validityUrl, Integer.valueOf(String.valueOf(date)), Integer.valueOf(String.valueOf(expires)), certificates);
  }
}
