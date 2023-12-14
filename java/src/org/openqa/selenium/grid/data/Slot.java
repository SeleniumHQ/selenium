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

package org.openqa.selenium.grid.data;

import static java.util.Collections.unmodifiableMap;

import java.io.Serializable;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

public class Slot implements Serializable {

  private final SlotId id;
  private final Capabilities stereotype;
  private final Session session;
  private final Instant lastStarted;

  public Slot(SlotId id, Capabilities stereotype, Instant lastStarted, Session session) {
    this.id = Require.nonNull("Slot ID", id);
    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
    this.lastStarted = Require.nonNull("Last started", lastStarted);
    this.session = session;
  }

  private static Slot fromJson(JsonInput input) {
    SlotId id = null;
    Capabilities stereotype = null;
    Instant lastStarted = null;
    Session session = null;

    input.beginObject();
    while (input.hasNext()) {
      String name = input.nextName();
      switch (name) {
        case "id":
          id = input.read(SlotId.class);
          break;

        case "lastStarted":
          lastStarted = input.read(Instant.class);
          break;

        case "session":
          session = input.read(Session.class);
          break;

        case "stereotype":
          stereotype = input.read(Capabilities.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new Slot(id, stereotype, lastStarted, session);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put("id", getId());
    toReturn.put("lastStarted", getLastStarted());
    toReturn.put("session", getSession());
    toReturn.put("stereotype", getStereotype());
    return unmodifiableMap(toReturn);
  }

  public SlotId getId() {
    return id;
  }

  public Capabilities getStereotype() {
    return stereotype;
  }

  public Instant getLastStarted() {
    return lastStarted;
  }

  public Session getSession() {
    return session;
  }

  public boolean isSupporting(Capabilities caps, SlotMatcher slotMatcher) {
    return slotMatcher.matches(getStereotype(), caps);
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Slot)) {
      return false;
    }

    Slot that = (Slot) o;
    return Objects.equals(this.id, that.id)
        && Objects.equals(this.stereotype, that.stereotype)
        && Objects.equals(this.session, that.session)
        && Objects.equals(this.lastStarted.toEpochMilli(), that.lastStarted.toEpochMilli());
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, stereotype, session, lastStarted.toEpochMilli());
  }
}
