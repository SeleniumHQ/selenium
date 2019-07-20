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

import java.util.List;

/**
 * Information about a signed exchange response
 */
public class SignedExchangeInfo {

  private Response outerResponse;

  private SignedExchangeHeader header;

  private SecurityDetails securityDetails;

  private List<SignedExchangeError> errors;

  public SignedExchangeInfo() {
  }

  SignedExchangeInfo(Response outerResponse,
                     SignedExchangeHeader header,
                     SecurityDetails securityDetails,
                     List<SignedExchangeError> errors) {
    this.outerResponse =
        requireNonNull(outerResponse, "'outerResponse' is required for SignedExchangeInfo");
    this.header = header;
    this.securityDetails = securityDetails;
    this.errors = errors;
  }

  /**
   * The outer response of signed HTTP exchange which was received from network.
   */
  public Response getOuterResponse() {
    return outerResponse;
  }

  /**
   * The outer response of signed HTTP exchange which was received from network.
   */
  public void setOuterResponse(Response outerResponse) {
    this.outerResponse = outerResponse;
  }

  /**
   * Information about the signed exchange header.
   */
  public SignedExchangeHeader getHeader() {
    return header;
  }

  /**
   * Information about the signed exchange header.
   */
  public void setHeader(SignedExchangeHeader header) {
    this.header = header;
  }

  /**
   * Security details for the signed exchange header.
   */
  public SecurityDetails getSecurityDetails() {
    return securityDetails;
  }

  /**
   * Security details for the signed exchange header.
   */
  public void setSecurityDetails(SecurityDetails securityDetails) {
    this.securityDetails = securityDetails;
  }

  /**
   * Errors occurred while handling the signed exchagne.
   */
  public List<SignedExchangeError> getErrors() {
    return errors;
  }

  /**
   * Errors occurred while handling the signed exchagne.
   */
  public void setErrors(List<SignedExchangeError> errors) {
    this.errors = errors;
  }

}
