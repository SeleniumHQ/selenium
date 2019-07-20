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

/**
 * Details of a signed certificate timestamp (SCT)
 */
public class SignedCertificateTimestamp {

  private String status;

  private String origin;

  private String logDescription;

  private String logId;

  private MonotonicTime timestamp;

  private String hashAlgorithm;

  private String signatureAlgorithm;

  private String signatureData;

  private SignedCertificateTimestamp(String status, String origin, String logDescription,
                                     String logId, MonotonicTime timestamp, String hashAlgorithm,
                                     String signatureAlgorithm, String signatureData) {
    this.status = requireNonNull(status, "'status' is required for SignedCertificateTimestamp");
    this.origin = requireNonNull(origin, "'origin' is required for SignedCertificateTimestamp");
    this.logDescription =
        requireNonNull(logDescription,
                       "'logDescription' is required for SignedCertificateTimestamp");
    this.logId = requireNonNull(logId, "'logId' is required for SignedCertificateTimestamp");
    this.timestamp =
        requireNonNull(timestamp, "'timestamp' is required for SignedCertificateTimestamp");
    this.hashAlgorithm =
        requireNonNull(hashAlgorithm, "'hashAlgorithm' is required for SignedCertificateTimestamp");
    this.signatureAlgorithm =
        requireNonNull(signatureAlgorithm,
                       "'signatureAlgorithm' is required for SignedCertificateTimestamp");
    this.signatureData =
        requireNonNull(signatureData, "'signatureData' is required for SignedCertificateTimestamp");
  }

  /**
   * Validation status.
   */
  public String getStatus() {
    return status;
  }

  /**
   * Validation status.
   */
  public void setStatus(String status) {
    this.status = status;
  }

  /**
   * Origin.
   */
  public String getOrigin() {
    return origin;
  }

  /**
   * Origin.
   */
  public void setOrigin(String origin) {
    this.origin = origin;
  }

  /**
   * Log name / description.
   */
  public String getLogDescription() {
    return logDescription;
  }

  /**
   * Log name / description.
   */
  public void setLogDescription(String logDescription) {
    this.logDescription = logDescription;
  }

  /**
   * Log ID.
   */
  public String getLogId() {
    return logId;
  }

  /**
   * Log ID.
   */
  public void setLogId(String logId) {
    this.logId = logId;
  }

  /**
   * Issuance date.
   */
  public MonotonicTime getTimestamp() {
    return timestamp;
  }

  /**
   * Issuance date.
   */
  public void setTimestamp(MonotonicTime timestamp) {
    this.timestamp = timestamp;
  }

  /**
   * Hash algorithm.
   */
  public String getHashAlgorithm() {
    return hashAlgorithm;
  }

  /**
   * Hash algorithm.
   */
  public void setHashAlgorithm(String hashAlgorithm) {
    this.hashAlgorithm = hashAlgorithm;
  }

  /**
   * Signature algorithm.
   */
  public String getSignatureAlgorithm() {
    return signatureAlgorithm;
  }

  /**
   * Signature algorithm.
   */
  public void setSignatureAlgorithm(String signatureAlgorithm) {
    this.signatureAlgorithm = signatureAlgorithm;
  }

  /**
   * Signature data.
   */
  public String getSignatureData() {
    return signatureData;
  }

  /**
   * Signature data.
   */
  public void setSignatureData(String signatureData) {
    this.signatureData = signatureData;
  }

  private static SignedCertificateTimestamp fromJson(JsonInput input) {

    String status = null;

    String origin = null;

    String logDescription = null;

    String logId = null;

    MonotonicTime timestamp = null;

    String hashAlgorithm = null;

    String signatureAlgorithm = null;

    String signatureData = null;

    input.beginObject();

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "status":
          status = input.nextString();
          break;
        case "origin":
          origin = input.nextString();
          break;
        case "logDescription":
          logDescription = input.nextString();
          break;
        case "logId":
          logId = input.nextString();
          break;
        case "timestamp":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;
        case "hashAlgorithm":
          hashAlgorithm = input.nextString();
          break;
        case "signatureAlgorithm":
          signatureAlgorithm = input.nextString();
          break;
        case "signatureData":
          signatureData = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }

    }

    input.endObject();

    return new SignedCertificateTimestamp(status, origin, logDescription, logId,
                                          timestamp, hashAlgorithm,
                                          signatureAlgorithm, signatureData);

  }
}
