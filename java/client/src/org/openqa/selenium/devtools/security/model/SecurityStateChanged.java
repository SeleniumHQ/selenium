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
package org.openqa.selenium.devtools.security.model;

import static java.util.Objects.requireNonNull;

import com.google.common.reflect.TypeToken;

import org.openqa.selenium.devtools.network.model.SecurityState;
import org.openqa.selenium.json.JsonInput;

import java.util.List;

public class SecurityStateChanged {

  /**
   * Security state
   */
  private SecurityState securityState;

  /**
   * True if the page was loaded over cryptographic transport such as HTTPS.
   */
  private boolean schemeIsCryptographic;

  /**
   * List of explanations for the security state.
   * If the overall security state is insecure or warning, at least one corresponding
   * explanation should be included.
   */
  private List<SecurityStateExplanation> securityStateExplanations;

  /**
   * Overrides user-visible description of the state.
   */
  private String summary;

  private SecurityStateChanged(SecurityState securityState, boolean schemeIsCryptographic,
                               List<SecurityStateExplanation> securityStateExplanations,
                               String summary) {
    this.securityState =
        requireNonNull(securityState, "'securityState' is required for SecurityStateChanged");
    this.schemeIsCryptographic = schemeIsCryptographic;
    this.securityStateExplanations = securityStateExplanations;
    this.summary = summary;
  }

  private static SecurityStateChanged fromJson(JsonInput input) {
    SecurityState securityState = SecurityState.valueOf(input.nextString());
    boolean schemeIsCryptographic = false;
    List<SecurityStateExplanation> securityStateExplanations = null;
    String summary = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "schemeIsCryptographic":
          schemeIsCryptographic = input.nextBoolean();
          break;
        case "securityStateExplanations":
          securityStateExplanations = input.read(new TypeToken<List<SecurityStateExplanation>>() {
          }.getType());
          break;
        case "summary":
          summary = input.nextString();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new SecurityStateChanged(securityState, schemeIsCryptographic, securityStateExplanations,
                                    summary);
  }

  public SecurityState getSecurityState() {
    return securityState;
  }

  public boolean isSchemeIsCryptographic() {
    return schemeIsCryptographic;
  }

  public List<SecurityStateExplanation> getSecurityStateExplanations() {
    return securityStateExplanations;
  }

  public String getSummary() {
    return summary;
  }

}
