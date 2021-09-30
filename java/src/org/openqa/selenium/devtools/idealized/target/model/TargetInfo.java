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

package org.openqa.selenium.devtools.idealized.target.model;

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.idealized.browser.model.BrowserContextID;
import org.openqa.selenium.json.JsonInput;

import java.util.Optional;

public class TargetInfo {

  private final TargetID targetId;
  private final String type;
  private final String title;
  private final String url;
  private final Boolean attached;

  private final Optional<TargetID> openerId;

  private final Optional<BrowserContextID> browserContextId;

  public TargetInfo(
    TargetID targetId,
    String type,
    String title,
    String url,
    Boolean attached,
    Optional<TargetID> openerId,
    Optional<BrowserContextID> browserContextId) {
    this.targetId = java.util.Objects.requireNonNull(targetId, "targetId is required");
    this.type = java.util.Objects.requireNonNull(type, "type is required");
    this.title = java.util.Objects.requireNonNull(title, "title is required");
    this.url = java.util.Objects.requireNonNull(url, "url is required");
    this.attached = java.util.Objects.requireNonNull(attached, "attached is required");
    this.openerId = openerId;
    this.browserContextId = browserContextId;
  }

  public TargetID getTargetId() {
    return targetId;
  }

  public String getType() {
    return type;
  }

  public String getTitle() {
    return title;
  }

  public String getUrl() {
    return url;
  }

  /**
   * Whether the target has an attached client.
   */
  public Boolean getAttached() {
    return attached;
  }

  /**
   * Opener target Id
   */
  public Optional<TargetID> getOpenerId() {
    return openerId;
  }

  @Beta()
  public Optional<BrowserContextID> getBrowserContextId() {
    return browserContextId;
  }

  private static TargetInfo fromJson(JsonInput input) {
    TargetID targetId = null;
    String type = null;
    String title = null;
    String url = null;
    Boolean attached = null;
    Optional<TargetID> openerId = Optional.empty();
    Optional<BrowserContextID> browserContextId = Optional.empty();
    input.beginObject();
    while (input.hasNext()) {
      switch(input.nextName()) {
        case "targetId":
          targetId = input.read(TargetID.class);
          break;
        case "type":
          type = input.nextString();
          break;
        case "title":
          title = input.nextString();
          break;
        case "url":
          url = input.nextString();
          break;
        case "attached":
          attached = input.nextBoolean();
          break;
        case "openerId":
          openerId = Optional.ofNullable(input.read(TargetID.class));
          break;
        case "browserContextId":
          browserContextId = Optional.ofNullable(input.read(BrowserContextID.class));
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new TargetInfo(targetId, type, title, url, attached, openerId, browserContextId);
  }
}
