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

import org.openqa.selenium.devtools.network.model.MixedContentType;
import org.openqa.selenium.devtools.network.model.SecurityState;
import org.openqa.selenium.json.JsonInput;

import java.util.List;

public class SecurityStateExplanation {

  /**
   * Security state representing the severity of the factor being explained.
   */
  private SecurityState securityState;

  /**
   * Title describing the type of factor.
   */
  private String title;

  /**
   * Short phrase describing the type of factor.
   */
  private String summary;

  /**
   * Full text explanation of the factor.
   */
  private String description;

  /**
   * The type of mixed content described by the explanation.
   */
  private MixedContentType mixedContentType;

  /**
   * Page certificate.
   */
  private List<String> certificate;

  /**
   * Recommendations to fix any issues.
   */
  private List<String> recommendations;

  private SecurityStateExplanation(
      SecurityState securityState, String title, String summary, String description,
      MixedContentType mixedContentType, List<String> certificate,
      List<String> recommendations) {
    this.securityState =
        requireNonNull(securityState, "'securityState' is required for SecurityStateExplanation");
    this.title = requireNonNull(title, "'title' is required for SecurityStateExplanation");
    ;
    this.summary = requireNonNull(summary, "'summary' is required for SecurityStateExplanation");
    this.description =
        requireNonNull(description, "'description' is required for SecurityStateExplanation");
    this.mixedContentType =
        requireNonNull(mixedContentType,
                       "'mixedContentType' is required for SecurityStateExplanation");
    this.certificate =
        requireNonNull(certificate, "'certificate' is required for SecurityStateExplanation");
    this.recommendations = recommendations;
  }

  private static SecurityStateExplanation fromJson(JsonInput input) {
    SecurityState securityState = null;
    String title = null;
    String summary = null;
    String description = null;
    MixedContentType mixedContentType = null;
    List<String> certificate = null;
    List<String> recommendations = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "securityState":
          securityState = SecurityState.valueOf(input.nextString());
          break;
        case "title":
          title = input.nextString();
          break;
        case "summary":
          summary = input.nextString();
          break;
        case "description":
          description = input.nextString();
          break;
        case "mixedContentType":
          mixedContentType = MixedContentType.fromString(input.nextString());
          break;
        case "certificate":
          certificate = input.read(new TypeToken<List<String>>() {
          }.getType());
          break;
        case "recommendations":
          recommendations = input.read(new TypeToken<List<String>>() {
          }.getType());
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new SecurityStateExplanation(securityState, title, summary, description,
                                        mixedContentType, certificate, recommendations);
  }

  public SecurityState getSecurityState() {
    return securityState;
  }

  public String getTitle() {
    return title;
  }

  public String getSummary() {
    return summary;
  }

  public String getDescription() {
    return description;
  }

  public MixedContentType getMixedContentType() {
    return mixedContentType;
  }

  public List<String> getCertificate() {
    return certificate;
  }

  public List<String> getRecommendations() {
    return recommendations;
  }

}
