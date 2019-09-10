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
package org.openqa.selenium.devtools.fetch.model;

import org.openqa.selenium.devtools.network.model.ResourceType;
import org.openqa.selenium.json.JsonInput;

public class RequestPattern {

  /**
   * Wildcards ('*' -> zero or more, '?' -> exactly one) are allowed. Escape character is backslash.
   * Omitting is equivalent to "*".
   */
  private final String urlPattern;
  /**
   * If set, only requests for matching resource types will be intercepted.
   */
  private final ResourceType resourceType;
  /**
   * Stage at wich to begin intercepting requests. Default is Request.
   */
  private final RequestStage requestStage;

  public RequestPattern(String urlPattern,
                        ResourceType resourceType,
                        RequestStage requestStage) {
    this.urlPattern = urlPattern;
    this.resourceType = resourceType;
    this.requestStage = (null == requestStage) ? RequestStage.Request : requestStage;
  }

  private static RequestPattern fromJson(JsonInput input) {
    String urlPattern = null;
    ResourceType resourceType = null;
    RequestStage requestStage = null;
    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "urlPattern":
          urlPattern = input.nextString();
          break;
        case "resourceType":
          resourceType = input.read(ResourceType.class);
          break;
        case "requestStage":
          requestStage = input.read(RequestStage.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new RequestPattern(urlPattern, resourceType, requestStage);
  }
}
