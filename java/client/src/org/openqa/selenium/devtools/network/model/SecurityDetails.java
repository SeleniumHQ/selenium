package org.openqa.selenium.devtools.network.model;

import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.List;

/**
 * Security details about a request
 */
public class SecurityDetails {

  private String protocol;

  private String keyExchange;

  private String keyExchangeGroup;

  private String cipher;

  private String mac;

  private Integer certificateId;

  private String subjectName;

  private List<String> sanList;

  private String issuer;

  private Double validFrom;

  private Double validTo;

  private List<SignedCertificateTimestamp> signedCertificateTimestampList;

  private CertificateTransparencyCompliance certificateTransparencyCompliance;

  public SecurityDetails() {
  }

  public SecurityDetails(String protocol, String keyExchange, String keyExchangeGroup,
                         String cipher, String mac, Integer certificateId,
                         String subjectName, List<String> sanList, String issuer,
                         Double validFrom, Double validTo,
                         List<SignedCertificateTimestamp> signedCertificateTimestampList,
                         CertificateTransparencyCompliance certificateTransparencyCompliance) {
    this.protocol = protocol;
    this.keyExchange = keyExchange;
    this.keyExchangeGroup = keyExchangeGroup;
    this.cipher = cipher;
    this.mac = mac;
    this.certificateId = certificateId;
    this.subjectName = subjectName;
    this.sanList = sanList;
    this.issuer = issuer;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.signedCertificateTimestampList = signedCertificateTimestampList;
    this.certificateTransparencyCompliance = certificateTransparencyCompliance;
  }

  /**
   * Protocol name (e.g. "TLS 1.2" or "QUIC").
   */
  public String getProtocol() {
    return protocol;
  }

  /**
   * Protocol name (e.g. "TLS 1.2" or "QUIC").
   */
  public void setProtocol(String protocol) {
    this.protocol = protocol;
  }

  /**
   * Key Exchange used by the connection, or the empty string if not applicable.
   */
  public String getKeyExchange() {
    return keyExchange;
  }

  /**
   * Key Exchange used by the connection, or the empty string if not applicable.
   */
  public void setKeyExchange(String keyExchange) {
    this.keyExchange = keyExchange;
  }

  /**
   * (EC)DH group used by the connection, if applicable.
   */
  public String getKeyExchangeGroup() {
    return keyExchangeGroup;
  }

  /**
   * (EC)DH group used by the connection, if applicable.
   */
  public void setKeyExchangeGroup(String keyExchangeGroup) {
    this.keyExchangeGroup = keyExchangeGroup;
  }

  /**
   * Cipher name.
   */
  public String getCipher() {
    return cipher;
  }

  /**
   * Cipher name.
   */
  public void setCipher(String cipher) {
    this.cipher = cipher;
  }

  /**
   * TLS MAC. Note that AEAD ciphers do not have separate MACs.
   */
  public String getMac() {
    return mac;
  }

  /**
   * TLS MAC. Note that AEAD ciphers do not have separate MACs.
   */
  public void setMac(String mac) {
    this.mac = mac;
  }

  /**
   * Certificate ID value.
   */
  public Integer getCertificateId() {
    return certificateId;
  }

  /**
   * Certificate ID value.
   */
  public void setCertificateId(Integer certificateId) {
    this.certificateId = certificateId;
  }

  /**
   * Certificate subject name.
   */
  public String getSubjectName() {
    return subjectName;
  }

  /**
   * Certificate subject name.
   */
  public void setSubjectName(String subjectName) {
    this.subjectName = subjectName;
  }

  /**
   * Subject Alternative Name (SAN) DNS names and IP addresses.
   */
  public List<String> getSanList() {
    return sanList;
  }

  /**
   * Subject Alternative Name (SAN) DNS names and IP addresses.
   */
  public void setSanList(List<String> sanList) {
    this.sanList = sanList;
  }

  /**
   * Name of the issuing CA.
   */
  public String getIssuer() {
    return issuer;
  }

  /**
   * Name of the issuing CA.
   */
  public void setIssuer(String issuer) {
    this.issuer = issuer;
  }

  /**
   * Certificate valid from date.
   */
  public Double getValidFrom() {
    return validFrom;
  }

  /**
   * Certificate valid from date.
   */
  public void setValidFrom(Double validFrom) {
    this.validFrom = validFrom;
  }

  /**
   * Certificate valid to (expiration) date
   */
  public Double getValidTo() {
    return validTo;
  }

  /**
   * Certificate valid to (expiration) date
   */
  public void setValidTo(Double validTo) {
    this.validTo = validTo;
  }

  /**
   * List of signed certificate timestamps (SCTs).
   */
  public List<SignedCertificateTimestamp> getSignedCertificateTimestampList() {
    return signedCertificateTimestampList;
  }

  /**
   * List of signed certificate timestamps (SCTs).
   */
  public void setSignedCertificateTimestampList(
      List<SignedCertificateTimestamp> signedCertificateTimestampList) {
    this.signedCertificateTimestampList = signedCertificateTimestampList;
  }

  /**
   * Whether the request complied with Certificate Transparency policy
   */
  public CertificateTransparencyCompliance getCertificateTransparencyCompliance() {
    return certificateTransparencyCompliance;
  }

  /**
   * Whether the request complied with Certificate Transparency policy
   */
  public void setCertificateTransparencyCompliance(
      CertificateTransparencyCompliance certificateTransparencyCompliance) {
    this.certificateTransparencyCompliance = certificateTransparencyCompliance;
  }

  public static SecurityDetails parseSecurityDetails(JsonInput input) {

    SecurityDetails securityDetails = null;

    String protocol = null;

    String keyExchange = null;

    String keyExchangeGroup = null;

    String cipher = null;

    String mac = null;

    Number certificateId = null;

    String subjectName = null;

    List<String> sanList = null;

    String issuer = null;

    Number validFrom = null;

    Number validTo = null;

     List<SignedCertificateTimestamp> signedCertificateTimestampList = null;

     CertificateTransparencyCompliance certificateTransparencyCompliance = null;

    input.beginObject();

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "protocol":
          protocol = input.nextString();
          break;
        case "keyExchange":
          keyExchange = input.nextString();
          break;
        case "keyExchangeGroup":
          keyExchangeGroup = input.nextString();
          break;
        case "cipher":
          cipher = input.nextString();
          break;
        case "mac":
          mac = input.nextString();
          break;
        case "certificateId":
          certificateId = input.nextNumber();
          break;
        case "subjectName":
          subjectName = input.nextString();
          break;
        case "sanList":
          input.beginArray();
          sanList = new ArrayList<>();
          while (input.hasNext()) {
           sanList.add(input.nextString());
          }
          input.endArray();
          break;
        case "issuer":
          issuer = input.nextString();
          break;
        case "validFrom":
          validFrom = input.nextNumber();
          break;
        case "validTo":
          validTo = input.nextNumber();
          break;
        case "signedCertificateTimestampList":
          input.beginArray();
          signedCertificateTimestampList = new ArrayList<>();
          while (input.hasNext()) {
            signedCertificateTimestampList.add(SignedCertificateTimestamp.parseSignedCertificateTimestamp(input));
          }
          input.endArray();
          break;
        case "certificateTransparencyCompliance":
          certificateTransparencyCompliance = CertificateTransparencyCompliance.valueOf(input.nextString());
          break;
        default:
          input.skipValue();
          break;
      }

    }

    return new SecurityDetails(protocol, keyExchange, keyExchangeGroup, cipher, mac, Integer.valueOf(String.valueOf(certificateId)), subjectName, sanList, issuer,
                               Double.valueOf(String.valueOf(validFrom)), Double.valueOf(String.valueOf(validTo)), signedCertificateTimestampList, certificateTransparencyCompliance);
  }

}
