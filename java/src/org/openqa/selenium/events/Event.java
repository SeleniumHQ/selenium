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

package org.openqa.selenium.events;

import java.util.Objects;
import java.util.StringJoiner;
import java.util.UUID;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;

public class Event {

  private static final Json JSON = new Json();
  private final UUID id;
  private final EventName eventName;
  private final String data;

  public Event(EventName eventName, Object data) {
    this(UUID.randomUUID(), eventName, data);
  }

  public Event(UUID id, EventName eventName, Object data) {
    this.id = Require.nonNull("Message id", id);
    this.eventName = Require.nonNull("Event type", eventName);

    StringBuilder builder = new StringBuilder();
    try (JsonOutput out = JSON.newOutput(builder)) {
      out.setPrettyPrint(false).writeClassName(false).write(data);
    }
    this.data = builder.toString();
  }

  public UUID getId() {
    return id;
  }

  public EventName getType() {
    return eventName;
  }

  public <T> T getData(java.lang.reflect.Type typeOfT) {
    return JSON.toType(data, typeOfT);
  }

  public String getRawData() {
    return data;
  }

  @Override
  public String toString() {
    return new StringJoiner(", ", Event.class.getSimpleName() + "[", "]")
        .add("id=" + id)
        .add("type=" + eventName)
        .add("data=" + data)
        .toString();
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Event)) {
      return false;
    }

    Event that = (Event) o;
    return Objects.equals(this.getId(), that.getId())
        && Objects.equals(this.getType(), that.getType())
        && Objects.equals(this.getRawData(), that.getRawData());
  }

  @Override
  public int hashCode() {
    return Objects.hash(getId(), getType(), data);
  }
}
