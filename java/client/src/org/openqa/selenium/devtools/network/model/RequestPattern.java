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
 * Request pattern for interception
 */
public class RequestPattern {

  private String urlPattern;

  private ResourceType resourceType;

  private InterceptionStage interceptionStage;

  public RequestPattern(String urlPattern,
                        ResourceType resourceType,
                        InterceptionStage interceptionStage) {
    this.urlPattern = urlPattern;
    this.resourceType = resourceType;
    this.interceptionStage = interceptionStage;
  }

  /**
   * Wildcards ('*' -&gt; zero or more, '?' -&gt; exactly one) are allowed. Escape character is backslash.
   * Omitting is equivalent to "*".
   */
  public String getUrlPattern() {
    return urlPattern;
  }

  /**
   * Wildcards ('*' -&gt; zero or more, '?' -&gt; exactly one) are allowed. Escape character is backslash.
   * Omitting is equivalent to "*".
   */
  public void setUrlPattern(String urlPattern) {
    this.urlPattern = urlPattern;
  }

  /**
   * If set, only requests for matching resource types will be intercepted.
   */
  public ResourceType getResourceType() {
    return resourceType;
  }

  /**
   * If set, only requests for matching resource types will be intercepted.
   */
  public void setResourceType(ResourceType resourceType) {
    this.resourceType = resourceType;
  }

  /**
   * Stage at which to begin intercepting requests. Default is Request.
   */
  public InterceptionStage getInterceptionStage() {
    return interceptionStage;
  }

  /**
   * Stage at which to begin intercepting requests. Default is Request.
   */
  public void setInterceptionStage(InterceptionStage interceptionStage) {
    this.interceptionStage = interceptionStage;
  }
}
