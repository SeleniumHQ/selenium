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

import java.util.List;

/**
 * Object for storing Network.signedExchangeReceived response
 */
public class SignedExchangeReceived {

  /**
   * Request identifier
   */
  private final RequestId requestId;

  /**
   * Information about the signed exchange response
   */
  private final SignedExchangeInfo info;

  private SignedExchangeReceived(RequestId requestId,
                                 SignedExchangeInfo info) {
    this.requestId =
        requireNonNull(requestId, "'requestId' is required for SignedExchangeReceived");
    this.info = info;
  }

  private static SignedExchangeReceived fromJson(JsonInput input) {
    RequestId requestId = new RequestId(input.nextString());
    SignedExchangeInfo info = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "info":
          input.beginObject();

          Response outerResponse = null;
          SignedExchangeHeader header = null;
          SecurityDetails securityDetails = null;
          List<SignedExchangeError> errors = null;

          while (input.hasNext()) {
            switch (input.nextName()) {
              case "outerResponse":
                outerResponse = input.read(Response.class);
                break;
              case "header":
                header = input.read(SignedExchangeHeader.class);
                break;
              case "securityDetails":
                securityDetails = input.read(SecurityDetails.class);
                break;
              case "errors":
                while (input.hasNext()) {
                  errors = input.read(new TypeToken<List<SignedExchangeError>>() {
                  }.getType());
                }
                break;
              default:
                input.skipValue();
                break;

            }
          }
          info = new SignedExchangeInfo(outerResponse, header, securityDetails, errors);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new SignedExchangeReceived(requestId, info);
  }
}
