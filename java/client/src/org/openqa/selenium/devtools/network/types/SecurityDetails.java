package org.openqa.selenium.devtools.network.types;

import java.util.List;

/**
 * Created by aohana
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

  /** Protocol name (e.g. "TLS 1.2" or "QUIC"). */
  public String getProtocol() {
    return protocol;
  }

  /** Protocol name (e.g. "TLS 1.2" or "QUIC"). */
  public void setProtocol(String protocol) {
    this.protocol = protocol;
  }

  /** Key Exchange used by the connection, or the empty string if not applicable. */
  public String getKeyExchange() {
    return keyExchange;
  }

  /** Key Exchange used by the connection, or the empty string if not applicable. */
  public void setKeyExchange(String keyExchange) {
    this.keyExchange = keyExchange;
  }

  /** (EC)DH group used by the connection, if applicable. */
  public String getKeyExchangeGroup() {
    return keyExchangeGroup;
  }

  /** (EC)DH group used by the connection, if applicable. */
  public void setKeyExchangeGroup(String keyExchangeGroup) {
    this.keyExchangeGroup = keyExchangeGroup;
  }

  /** Cipher name. */
  public String getCipher() {
    return cipher;
  }

  /** Cipher name. */
  public void setCipher(String cipher) {
    this.cipher = cipher;
  }

  /** TLS MAC. Note that AEAD ciphers do not have separate MACs. */
  public String getMac() {
    return mac;
  }

  /** TLS MAC. Note that AEAD ciphers do not have separate MACs. */
  public void setMac(String mac) {
    this.mac = mac;
  }

  /** Certificate ID value. */
  public Integer getCertificateId() {
    return certificateId;
  }

  /** Certificate ID value. */
  public void setCertificateId(Integer certificateId) {
    this.certificateId = certificateId;
  }

  /** Certificate subject name. */
  public String getSubjectName() {
    return subjectName;
  }

  /** Certificate subject name. */
  public void setSubjectName(String subjectName) {
    this.subjectName = subjectName;
  }

  /** Subject Alternative Name (SAN) DNS names and IP addresses. */
  public List<String> getSanList() {
    return sanList;
  }

  /** Subject Alternative Name (SAN) DNS names and IP addresses. */
  public void setSanList(List<String> sanList) {
    this.sanList = sanList;
  }

  /** Name of the issuing CA. */
  public String getIssuer() {
    return issuer;
  }

  /** Name of the issuing CA. */
  public void setIssuer(String issuer) {
    this.issuer = issuer;
  }

  /** Certificate valid from date. */
  public Double getValidFrom() {
    return validFrom;
  }

  /** Certificate valid from date. */
  public void setValidFrom(Double validFrom) {
    this.validFrom = validFrom;
  }

  /** Certificate valid to (expiration) date */
  public Double getValidTo() {
    return validTo;
  }

  /** Certificate valid to (expiration) date */
  public void setValidTo(Double validTo) {
    this.validTo = validTo;
  }

  /** List of signed certificate timestamps (SCTs). */
  public List<SignedCertificateTimestamp> getSignedCertificateTimestampList() {
    return signedCertificateTimestampList;
  }

  /** List of signed certificate timestamps (SCTs). */
  public void setSignedCertificateTimestampList(
      List<SignedCertificateTimestamp> signedCertificateTimestampList) {
    this.signedCertificateTimestampList = signedCertificateTimestampList;
  }

  /** Whether the request complied with Certificate Transparency policy */
  public CertificateTransparencyCompliance getCertificateTransparencyCompliance() {
    return certificateTransparencyCompliance;
  }

  /** Whether the request complied with Certificate Transparency policy */
  public void setCertificateTransparencyCompliance(
      CertificateTransparencyCompliance certificateTransparencyCompliance) {
    this.certificateTransparencyCompliance = certificateTransparencyCompliance;
  }
}
