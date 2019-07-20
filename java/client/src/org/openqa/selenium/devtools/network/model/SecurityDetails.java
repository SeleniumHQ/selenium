// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.devtools.network.model;

import static java.util.Objects.requireNonNull;

import com.google.common.reflect.TypeToken;

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

  private SecurityDetails(String protocol, String keyExchange, String keyExchangeGroup,
                          String cipher, String mac, Integer certificateId,
                          String subjectName, List<String> sanList, String issuer,
                          Double validFrom, Double validTo,
                          List<SignedCertificateTimestamp> signedCertificateTimestampList,
                          CertificateTransparencyCompliance certificateTransparencyCompliance) {
    this.protocol = requireNonNull(protocol, "'protocol' is required for SecurityDetails");
    this.keyExchange = requireNonNull(keyExchange, "'keyExchange' is required for SecurityDetails");
    this.keyExchangeGroup = keyExchangeGroup;
    this.cipher = requireNonNull(cipher, "'cipher' is required for SecurityDetails");
    this.mac = mac;
    this.certificateId =
        requireNonNull(certificateId, "'certificateId' is required for SecurityDetails");
    this.subjectName = requireNonNull(subjectName, "'subjectName' is required for SecurityDetails");
    this.sanList = requireNonNull(sanList, "'sanList' is required for SecurityDetails");
    this.issuer = requireNonNull(issuer, "'issuer' is required for SecurityDetails");
    this.validFrom = requireNonNull(validFrom, "'validFrom' is required for SecurityDetails");
    this.validTo = requireNonNull(validTo, "'validTo' is required for SecurityDetails");
    this.signedCertificateTimestampList =
        requireNonNull(signedCertificateTimestampList,
                       "'signedCertificateTimestampList' is required for SecurityDetails");
    this.certificateTransparencyCompliance =
        requireNonNull(certificateTransparencyCompliance,
                       "'certificateTransparencyCompliance' is required for SecurityDetails");
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

  private static SecurityDetails fromJson(JsonInput input) {

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
          signedCertificateTimestampList =
              input.read(new TypeToken<List<SignedCertificateTimestamp>>() {
              }.getType());
          break;
        case "certificateTransparencyCompliance":
          certificateTransparencyCompliance =
              CertificateTransparencyCompliance.fromString(input.nextString());
          break;
        default:
          input.skipValue();
          break;
      }

    }

    return new SecurityDetails(protocol, keyExchange, keyExchangeGroup, cipher, mac,
                               Integer.valueOf(String.valueOf(certificateId)), subjectName, sanList,
                               issuer,
                               validFrom != null ? Double.valueOf(String.valueOf(validFrom)) : null,
                               validTo != null ? Double.valueOf(String.valueOf(validTo)) : null,
                               signedCertificateTimestampList, certificateTransparencyCompliance);
  }

}
