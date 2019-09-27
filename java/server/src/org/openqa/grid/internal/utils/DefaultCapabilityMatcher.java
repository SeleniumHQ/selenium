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

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.safari.SafariOptions;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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
    return requested == null ||
           ImmutableSet.of("any", "", "*").contains(requested.toString().toLowerCase());
  }

  class PlatformValidator implements Validator {
    @Override
    public Boolean apply(Map<String, Object> providedCapabilities, Map<String, Object> requestedCapabilities) {
      Object requested = Optional.ofNullable(requestedCapabilities.get(CapabilityType.PLATFORM))
          .orElse(requestedCapabilities.get(CapabilityType.PLATFORM_NAME));
      if (anything(requested)) {
        return true;
      }
      Object provided = Optional.ofNullable(providedCapabilities.get(CapabilityType.PLATFORM))
          .orElse(providedCapabilities.get(CapabilityType.PLATFORM_NAME));
      Platform requestedPlatform = extractPlatform(requested);
      if (requestedPlatform != null) {
        Platform providedPlatform = extractPlatform(provided);
        return providedPlatform != null && providedPlatform.is(requestedPlatform);
      }

      return provided != null && Objects.equals(requested.toString(), provided.toString());
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
          .map(requestedCapabilities::get)
          .filter(Objects::nonNull)
          .findFirst()
          .orElse(null);

      if (anything(requested)) {
        return true;
      }

      Object provided = Stream.of(propertyAliases)
          .map(providedCapabilities::get)
          .filter(Objects::nonNull)
          .findFirst()
          .orElse(null);
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

  class FirefoxSpecificValidator implements Validator {
    @Override
    public Boolean apply(Map<String, Object> providedCapabilities, Map<String, Object> requestedCapabilities) {
      if (! "firefox".equals(requestedCapabilities.get(BROWSER_NAME))) {
        return true;
      }

      if (requestedCapabilities.get("marionette") != null &&
          !Boolean.valueOf(requestedCapabilities.get("marionette").toString())) {
        return providedCapabilities.get("marionette") != null &&
               !Boolean.valueOf(providedCapabilities.get("marionette").toString());
      } else {
        return providedCapabilities.get("marionette") == null ||
               Boolean.valueOf(providedCapabilities.get("marionette").toString());
      }
    }
  }

  class SafariSpecificValidator implements Validator {
    @Override
    public Boolean apply(Map<String, Object> providedCapabilities, Map<String, Object> requestedCapabilities) {
      if (!"safari".equals(requestedCapabilities.get(BROWSER_NAME)) &&
          !"Safari Technology Preview".equals(requestedCapabilities.get(BROWSER_NAME))) {
        return true;
      }

      SafariOptions providedOptions = new SafariOptions(new ImmutableCapabilities(providedCapabilities));
      SafariOptions requestedOptions = new SafariOptions(new ImmutableCapabilities(requestedCapabilities));

      return requestedOptions.getAutomaticInspection() == providedOptions.getAutomaticInspection() &&
             requestedOptions.getAutomaticProfiling() == providedOptions.getAutomaticProfiling() &&
             requestedOptions.getUseTechnologyPreview() == providedOptions.getUseTechnologyPreview();
    }
  }

  private final List<Validator> validators = new ArrayList<>();
  {
    validators.addAll(Arrays.asList(
        new PlatformValidator(),
        new AliasedPropertyValidator(BROWSER_NAME, "browser"),
        new AliasedPropertyValidator(CapabilityType.BROWSER_VERSION, CapabilityType.VERSION),
        new SimplePropertyValidator(CapabilityType.APPLICATION_NAME),
        new FirefoxSpecificValidator(),
        new SafariSpecificValidator()));
  }

  public void addToConsider(String capabilityName) {
    validators.add(new SimplePropertyValidator(capabilityName));
  }

  @Override
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
    try {
      return Platform.fromString(o.toString());
    } catch (WebDriverException ex) {
      return null;
    }
  }
}
