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

package org.openqa.grid.internal.utils;

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.CapabilityType;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiFunction;
import java.util.stream.Stream;

/**
 * Default (naive) implementation of the capability matcher.
 * <p>
 * The default capability matcher will look at all the key from the request do not start with _ and
 * will try to find a node that has at least those capabilities.
 */
public class DefaultCapabilityMatcher implements CapabilityMatcher {

  private static final String GRID_TOKEN = "_";

  interface Validator extends BiFunction<Map<String, Object>, Map<String, Object>, Boolean> {}

  private boolean anything(Object requested) {
    return requested == null
           || ImmutableList.of("any", "", "*").contains(requested.toString().toLowerCase());
  }

  class PlatformValidator implements Validator {
    @Override
    public Boolean apply(Map<String, Object> providedCapabilities, Map<String, Object> requestedCapabilities) {
      if (anything(requestedCapabilities.get(CapabilityType.PLATFORM))) {
        return true;
      }
      Platform requested = extractPlatform(requestedCapabilities.get(CapabilityType.PLATFORM));
      if (requested != null) {
        Platform provided = extractPlatform(providedCapabilities.get(CapabilityType.PLATFORM));
        return provided != null && provided.is(requested);
      }
      return false;
    }
  }

  class AliasedPropertyValidator implements Validator {
    private String[] propertyAliases;

    AliasedPropertyValidator(String... propertyAliases) {
      this.propertyAliases = propertyAliases;
    }

    @Override
    public Boolean apply(Map<String, Object> providedCapabilities, Map<String, Object> requestedCapabilities) {
      Object requested = Stream.of(propertyAliases)
          .map(requestedCapabilities::get).filter(Objects::nonNull).findFirst().orElse(null);
      if (anything(requested)) {
        return true;
      }
      Object provided = Stream.of(propertyAliases)
          .map(providedCapabilities::get).filter(Objects::nonNull).findFirst().orElse(null);
      return Objects.equals(requested, provided);
    }
  }

  class SimplePropertyValidator implements Validator {
    private List<String> toConsider;

    SimplePropertyValidator(String... toConsider) {
      this.toConsider = Arrays.asList(toConsider);
    }

    @Override
    public Boolean apply(Map<String, Object> providedCapabilities, Map<String, Object> requestedCapabilities) {
      return requestedCapabilities.entrySet().stream()
          .filter(entry -> ! entry.getKey().startsWith(GRID_TOKEN))
          .filter(entry -> toConsider.contains(entry.getKey()))
          .filter(entry -> ! anything(entry.getValue()))
          .allMatch(entry -> entry.getValue().equals(providedCapabilities.get(entry.getKey())));
    }
  }

  private final List<Validator> validators = ImmutableList.of(
      new PlatformValidator(),
      new AliasedPropertyValidator(CapabilityType.BROWSER_NAME, "browser"),
      new AliasedPropertyValidator(CapabilityType.BROWSER_VERSION, CapabilityType.VERSION),
      new SimplePropertyValidator(CapabilityType.APPLICATION_NAME)
  );

  public boolean matches(Map<String, Object> providedCapabilities, Map<String, Object> requestedCapabilities) {
    return providedCapabilities != null && requestedCapabilities != null
           && validators.stream().allMatch(v -> v.apply(providedCapabilities, requestedCapabilities));
  }

  private Platform extractPlatform(Object o) {
    if (o == null) {
      return null;
    }
    if (o instanceof Platform) {
      return (Platform) o;
    }
    if (o instanceof String) {
      return Platform.fromString(o.toString());
    }
    return null;
  }
}
