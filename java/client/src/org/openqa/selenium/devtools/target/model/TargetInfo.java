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
package org.openqa.selenium.devtools.target.model;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.json.JsonInput;

import java.util.Map;
import java.util.Objects;
import java.util.StringJoiner;

public class TargetInfo {

  private final TargetId targetId;
  private final String type;
  private final String title;
  private final String url;
  private final boolean attached;

  public TargetInfo(TargetId id, String type, String title, String url, boolean attached) {
    this.targetId = Objects.requireNonNull(id);
    this.type = Objects.requireNonNull(type);
    this.title = Objects.requireNonNull(title);
    this.url = Objects.requireNonNull(url);
    this.attached = attached;
  }

  private static TargetInfo fromJson(JsonInput input) {
    TargetId id = null;
    String type = null;
    String title = null;
    String url = null;
    boolean attached = false;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "attached":
          attached = input.nextBoolean();
          break;

        case "targetId":
          id = input.read(TargetId.class);
          break;

        case "title":
          title = input.nextString();
          break;

        case "type":
          type = input.nextString();
          break;

        case "url":
          url = input.nextString();
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new TargetInfo(id, type, title, url, attached);
  }

  public TargetId getTargetId() {
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

  public boolean isAttached() {
    return attached;
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof TargetInfo)) {
      return false;
    }

    TargetInfo that = (TargetInfo) o;
    return this.attached == that.attached &&
           this.targetId.equals(that.targetId) &&
           this.type.equals(that.type) &&
           this.title.equals(that.title) &&
           this.url.equals(that.url);
  }

  @Override
  public int hashCode() {
    return Objects.hash(targetId, type, title, url, attached);
  }

  @Override
  public String toString() {
    return new StringJoiner(", ", TargetInfo.class.getSimpleName() + "[", "]")
        .add("targetId=" + targetId)
        .add("type='" + type + "'")
        .add("title='" + title + "'")
        .add("url='" + url + "'")
        .add("attached=" + attached)
        .toString();
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "targetId", targetId,
        "type", type,
        "title", title,
        "url", url,
        "attached", attached);
  }
}
