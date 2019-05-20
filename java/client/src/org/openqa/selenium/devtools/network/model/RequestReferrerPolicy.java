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

/**
 * The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/
 */
public enum RequestReferrerPolicy {

  unsafeUrl("unsafe-url"),
  noReferrerWhenDowngrade("no-referrer-when-downgrade"),
  noReferrer("no-referrer"),
  origin("origin"),
  originWhenCrossOrigin("origin-when-cross-origin"),
  sameOrigin("same-origin"),
  strictOrigin("strict-origin"),
  strictOriginWhenCrossOrigin("strict-origin-when-cross-origin");

  private String policy;

  RequestReferrerPolicy(String policy) {
    this.policy = policy;
  }

  public String getPolicy() {
    return policy;
  }

  public static RequestReferrerPolicy fromString(String s) {
    for (RequestReferrerPolicy r : RequestReferrerPolicy.values()) {
      if (r.getPolicy().equalsIgnoreCase(s)) {
        return r;
      }
    }
    return null;
  }

}
