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
 * Object for storing Network response
 */
public class ResponseBody {

  /**
   * Response body
   */
  private final String body;

  /**
   * True, if content was sent as base64
   */
  private final Boolean base64Encoded;

  private ResponseBody(String body, Boolean base64Encoded) {
    this.body = requireNonNull(body, "'body' is required for ResponseBody");
    this.base64Encoded = requireNonNull(base64Encoded, "'base64Encoded' is required for ResponseBody");
  }

  private static ResponseBody fromJson(JsonInput input) {
    String body = input.nextString();
    Boolean base64Encoded = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "base64Encoded":
          base64Encoded = input.nextBoolean();
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new ResponseBody(body, base64Encoded);
  }

  public String getBody() {
    return body;
  }

  public Boolean getBase64Encoded() {
    return base64Encoded;
  }

  @Override
  public String toString() {
    return "ResponseBody{" +
           "body='" + body + '\'' +
           ", base64Encoded=" + base64Encoded +
           '}';
  }

}
