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

  private MonotonicTime date;

  private MonotonicTime expires;

  private List<String> certificates;

  private SignedExchangeSignature(String label, String signature, String integrity,
                                  String certUrl, String certSha256, String validityUrl,
                                  MonotonicTime date, MonotonicTime expires,
                                  List<String> certificates) {
    this.label = requireNonNull(label, "'label' is required for SignedExchangeSignature");
    this.signature =
        requireNonNull(signature, "'signature' is required for SignedExchangeSignature");
    this.integrity =
        requireNonNull(integrity, "'integrity' is required for SignedExchangeSignature");
    this.certUrl = certUrl;
    this.certSha256 = certSha256;
    this.validityUrl =
        requireNonNull(validityUrl, "'validityUrl' is required for SignedExchangeSignature");
    this.date = requireNonNull(date, "'date' is required for SignedExchangeSignature");
    this.expires = requireNonNull(expires, "'expires' is required for SignedExchangeSignature");
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
  public MonotonicTime getDate() {
    return date;
  }

  /**
   * Signed exchange signature date.
   */
  public void setDate(MonotonicTime date) {
    this.date = date;
  }

  /**
   * Signed exchange signature expires.
   */
  public MonotonicTime getExpires() {
    return expires;
  }

  /**
   * Signed exchange signature expires.
   */
  public void setExpires(MonotonicTime expires) {
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

  private static SignedExchangeSignature fromJson(JsonInput input) {

    String label = null;

    String signature = null;

    String integrity = null;

    String certUrl = null;

    String certSha256 = null;

    String validityUrl = null;

    MonotonicTime date = null;

    MonotonicTime expires = null;

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
          date = MonotonicTime.parse(input.nextNumber());
          break;
        case "expires":
          expires = MonotonicTime.parse(input.nextNumber());
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

    return new SignedExchangeSignature(label, signature, integrity, certUrl, certSha256,
                                       validityUrl, date, expires, certificates);
  }
}
