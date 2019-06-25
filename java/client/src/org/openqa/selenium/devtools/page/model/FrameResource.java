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
package org.openqa.selenium.devtools.page.model;

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.network.model.ResourceType;
import org.openqa.selenium.json.JsonInput;

import java.time.Instant;
import java.util.Objects;

/**
 * Information about the Resource on the page.EXPERIMENTAL
 */
@Beta
public class FrameResource {

  /**
   * Resource URL.
   */
  private final String url;
  /**
   * Type of this resource.
   */
  private final ResourceType type;
  /**
   * Resource mimeType as determined by the browser.
   */
  private final String mineType;
  /**
   * last-modified timestamp as reported by server.
   */
  private final Instant lastModified;
  /**
   * Resource content size.
   */
  private final Double contentSize;
  /**
   * True if the resource failed to load.
   */
  private final Boolean failed;
  /**
   * True if the resource was canceled during loading.
   */
  private final Boolean canceled;

  public FrameResource(
      String url,
      ResourceType type,
      String mineType,
      Instant lastModified,
      Double contentSize,
      Boolean failed,
      Boolean canceled) {
    this.url = Objects.requireNonNull(url, "url is required");
    this.type = Objects.requireNonNull(type, "type is required");
    this.mineType = Objects.requireNonNull(mineType, "mimeType is required");
    this.lastModified = lastModified;
    this.contentSize = contentSize;
    this.failed = failed;
    this.canceled = canceled;
  }

  private static FrameResource fromnJson(JsonInput input) {
    String url = input.nextString();
    ResourceType type = null;
    String mineType = null;
    Instant lastModified = null;
    Double contentSize = null;
    Boolean failed = null, canceled = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "type":
          type = input.read(ResourceType.class);
          break;
        case "mineType":
          mineType = input.nextString();
          break;
        case "lastModified":
          lastModified = input.nextInstant();
          break;
        case "contentSize":
          contentSize = input.read(Double.class);
          break;
        case "failed":
          failed = input.nextBoolean();
          break;
        case "canceled":
          canceled = input.nextBoolean();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new FrameResource(url, type, mineType, lastModified, contentSize, failed, canceled);
  }
}
