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

package org.openqa.selenium.remote;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.json.JsonOutput;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;

@Beta
class RemoteWebDriverBuilder {

  private final static Set<String> ILLEGAL_METADATA_KEYS = ImmutableSet.of("alwaysMatch", "firstMatch");
  private final static AcceptedW3CCapabilityKeys OK_KEYS = new AcceptedW3CCapabilityKeys();
  private final List<Map<String, Object>> options = new ArrayList<>();
  private final Map<String, Object> metadata = new TreeMap<>();
  private final Map<String, Object> additionalCapabilities = new TreeMap<>();

  public RemoteWebDriverBuilder addOptions(Capabilities options) {
    Map<String, Object> serialized = validate(Objects.requireNonNull(options));
    this.options.add(serialized);
    return this;
  }

  public RemoteWebDriverBuilder addMetadata(String key, Object value) {
    if (ILLEGAL_METADATA_KEYS.contains(key)) {
      throw new IllegalArgumentException(key + " is a reserved key");
    }
    metadata.put(Objects.requireNonNull(key), Objects.requireNonNull(value));
    return this;
  }

  public RemoteWebDriverBuilder setCapability(String capabilityName, String value) {
    if (!OK_KEYS.test(capabilityName)) {
      throw new IllegalArgumentException("Capability is not valid");
    }
    if (value == null) {
      throw new IllegalArgumentException("Null values are not allowed");
    }

    additionalCapabilities.put(capabilityName, value);
    return this;
  }

  public RemoteWebDriver build() {
    if (options.isEmpty()) {
      throw new SessionNotCreatedException("Refusing to create session without any capabilities");
    }

    return null;
  }

  private Map<String, Object> validate(Capabilities options) {
    return options.asMap().entrySet().stream()
        // Ensure that the keys are ok
        .peek(
            entry -> {
              if (!OK_KEYS.test(entry.getKey())) {
                throw new IllegalArgumentException(
                    "Capability key is not a valid w3c key: " + entry.getKey());
              }
            })
        // And remove null values, as these are ignored.
        .filter(entry -> entry.getValue() != null)
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  @VisibleForTesting
  void writePayload(JsonOutput out) {
    out.beginObject();

    // Try and minimise payload by finding keys that have the same value in every option. This isn't
    // terribly efficient, but we expect the number of entries to be very low in almost every case,
    // so this should be fine.
    Map<String, Object> always = new HashMap<>(options.get(0));
    for (Map<String, Object> option : options) {
      for (Map.Entry<String, Object> entry : option.entrySet()) {
        if (!always.containsKey(entry.getKey())) {
          continue;
        }

        if (!always.get(entry.getKey()).equals(entry.getValue())) {
          always.remove(entry.getKey());
        }
      }
    }
    always.putAll(additionalCapabilities);

    out.name("alwaysMatch");
    out.beginObject();
    always.forEach((key, value) -> {
      out.name(key);
      out.write(value);
    });
    out.endObject();

    out.name("firstMatch");
    out.beginArray();
    options.forEach(option -> {
      out.beginObject();
      option.entrySet().stream()
          .filter(entry -> !always.containsKey(entry.getKey()))
          .filter(entry -> !additionalCapabilities.containsKey(entry.getKey()))
          .forEach(entry -> {
            out.name(entry.getKey());
            out.write(entry.getValue());
          });
      out.endObject();
    });
    out.endArray();

    metadata.forEach((key, value) -> {
      out.name(key);
      out.write(value);
    });

    out.endObject();
  }
}
