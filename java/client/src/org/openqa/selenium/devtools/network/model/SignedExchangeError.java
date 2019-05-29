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
 * Information about a signed exchange response
 */
public class SignedExchangeError {

  private String message;

  private Integer signatureIndex;

  private SignedExchangeErrorField errorField;

  private SignedExchangeError(String message, Integer signatureIndex,
                              SignedExchangeErrorField errorField) {
    this.message = requireNonNull(message, "'message' is required for SignedExchangeError");
    this.signatureIndex = signatureIndex;
    this.errorField = errorField;
  }

  /**
   * Error message.
   */
  public String getMessage() {
    return message;
  }

  /**
   * Error message.
   */
  public void setMessage(String message) {
    this.message = message;
  }

  /**
   * The index of the signature which caused the error.
   */
  public Integer getSignatureIndex() {
    return signatureIndex;
  }

  /**
   * The index of the signature which caused the error.
   */
  public void setSignatureIndex(Integer signatureIndex) {
    this.signatureIndex = signatureIndex;
  }

  /**
   * The field which caused the error.
   */
  public SignedExchangeErrorField getErrorField() {
    return errorField;
  }

  /**
   * The field which caused the error.
   */
  public void setErrorField(SignedExchangeErrorField errorField) {
    this.errorField = errorField;
  }

  private static SignedExchangeError fromJson(JsonInput input) {

    String message = null;
    Number signatureIndex = null;
    SignedExchangeErrorField errorField = null;

    switch (input.nextName()) {
      case "message":
        message = input.nextString();
        break;
      case "signatureIndex":
        signatureIndex = input.nextNumber();
        break;
      case "errorField":
        errorField = SignedExchangeErrorField.valueOf(input.nextString());
        break;
      default:
        input.skipValue();
        break;
    }
    return new SignedExchangeError(message, Integer.valueOf(String.valueOf(signatureIndex)),
                                   errorField);
  }
}
