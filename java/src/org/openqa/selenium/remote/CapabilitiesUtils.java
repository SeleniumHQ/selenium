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

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.session.CapabilitiesFilter;
import org.openqa.selenium.remote.session.CapabilityTransform;
import org.openqa.selenium.remote.session.ChromeFilter;
import org.openqa.selenium.remote.session.EdgeFilter;
import org.openqa.selenium.remote.session.FirefoxFilter;
import org.openqa.selenium.remote.session.InternetExplorerFilter;
import org.openqa.selenium.remote.session.OperaFilter;
import org.openqa.selenium.remote.session.ProxyTransform;
import org.openqa.selenium.remote.session.SafariFilter;
import org.openqa.selenium.remote.session.StripAnyPlatform;
import org.openqa.selenium.remote.session.W3CPlatformNameNormaliser;

import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Queue;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.openqa.selenium.remote.CapabilityType.PLATFORM;
import static org.openqa.selenium.remote.CapabilityType.PLATFORM_NAME;
import static org.openqa.selenium.remote.CapabilityType.PROXY;

public class CapabilitiesUtils {

  private static final Predicate<String> ACCEPTED_W3C_PATTERNS = new AcceptedW3CCapabilityKeys();

  private CapabilitiesUtils() {
    // Helper class
  }

  public static Stream<Capabilities> makeW3CSafe(Capabilities possiblyInvalidCapabilities) {
    Require.nonNull("Capabilities", possiblyInvalidCapabilities);

    return makeW3CSafe(possiblyInvalidCapabilities.asMap()).map(ImmutableCapabilities::new);
  }

  public static Stream<Map<String, Object>> makeW3CSafe(Map<String, Object> possiblyInvalidCapabilities) {
    Require.nonNull("Capabilities", possiblyInvalidCapabilities);

    Set<CapabilitiesFilter> adapters = getCapabilityFilters();

    // If there's an OSS value, generate a stream of capabilities from that using the transforms,
    // then add magic to generate each of the w3c capabilities. For the sake of simplicity, we're
    // going to make the (probably wrong) assumption we can hold all of the firstMatch values and
    // alwaysMatch value in memory at the same time.
    Map<String, Object> oss = convertOssToW3C(possiblyInvalidCapabilities);
    Stream<Map<String, Object>> fromOss;
    Set<String> usedKeys = new HashSet<>();

    // Are there any values we care want to pull out into a mapping of their own?
    List<Map<String, Object>> firsts = adapters.stream()
      .map(adapter -> adapter.apply(oss))
      .filter(Objects::nonNull)
      .filter(map -> !map.isEmpty())
      .map(
        map -> map.entrySet().stream()
          .filter(entry -> entry.getKey() != null)
          .filter(entry -> ACCEPTED_W3C_PATTERNS.test(entry.getKey()))
          .filter(entry -> entry.getValue() != null)
          .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)))
      .peek(map -> usedKeys.addAll(map.keySet()))
      .collect(ImmutableList.toImmutableList());
    if (firsts.isEmpty()) {
      firsts = ImmutableList.of(ImmutableMap.of());
    }

    // Are there any remaining unused keys?
    Map<String, Object> always = oss.entrySet().stream()
      .filter(entry -> !usedKeys.contains(entry.getKey()))
      .filter(entry -> entry.getValue() != null)
      .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    // Firsts contains at least one entry, always contains everything else. Let's combine them
    // into the stream to form a unified set of capabilities. Woohoo!
    fromOss = firsts.stream()
      .map(first -> ImmutableMap.<String, Object>builder().putAll(always).putAll(first).build())
      .map(CapabilitiesUtils::applyTransforms)
      .map(map -> map.entrySet().stream()
        .filter(entry -> ACCEPTED_W3C_PATTERNS.test(entry.getKey()))
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue)));

    return fromOss;
  }

  private static Map<String, Object> convertOssToW3C(Map<String, Object> capabilities) {
    Map<String, Object> toReturn = new TreeMap<>(capabilities);

    // Platform name
    if (capabilities.containsKey(PLATFORM) && !capabilities.containsKey(PLATFORM_NAME)) {
      toReturn.put(PLATFORM_NAME, String.valueOf(capabilities.get(PLATFORM)));
    }

    if (capabilities.containsKey(PROXY)) {
      Map<String, Object> proxyMap = getProxyFromCapabilities(capabilities);
      if (proxyMap.containsKey("noProxy")) {
        Map<String, Object> w3cProxyMap = new HashMap<>(proxyMap);
        Object rawData = proxyMap.get("noProxy");
        if (rawData instanceof String) {
          w3cProxyMap.put("noProxy", Arrays.asList(((String) rawData).split(",\\s*")));
        }
        toReturn.put(CapabilityType.PROXY, w3cProxyMap);
      }
    }

    return toReturn;
  }

  private static Map<String, Object> getProxyFromCapabilities(Map<String, Object> capabilities) {
    Object rawProxy = capabilities.get(CapabilityType.PROXY);
    if (rawProxy instanceof Proxy) {
      return ((Proxy) rawProxy).toJson();
    } else if (rawProxy instanceof Map) {
      //noinspection unchecked
      return (Map<String, Object>) rawProxy;
    } else {
      return new HashMap<>();
    }
  }

  private static Map<String, Object> applyTransforms(Map<String, Object> caps) {
    Queue<Map.Entry<String, Object>> toExamine = new LinkedList<>(caps.entrySet());
    Set<String> seenKeys = new HashSet<>();
    Map<String, Object> toReturn = new TreeMap<>();

    Set<CapabilityTransform> transforms = getCapabilityTransforms();

    // Take each entry and apply the transforms
    while (!toExamine.isEmpty()) {
      Map.Entry<String, Object> entry = toExamine.remove();
      seenKeys.add(entry.getKey());

      if (entry.getValue() == null) {
        continue;
      }

      for (CapabilityTransform transform : transforms) {
        Collection<Map.Entry<String, Object>> result = transform.apply(entry);
        if (result == null) {
          toReturn.remove(entry.getKey());
          break;
        }

        for (Map.Entry<String, Object> newEntry : result) {
          if (!seenKeys.contains(newEntry.getKey())) {
            toExamine.add(newEntry);
          } else {
            if (newEntry.getKey().equals(entry.getKey())) {
              entry = newEntry;
            }
            toReturn.put(newEntry.getKey(), newEntry.getValue());
          }
        }
      }
    }
    return toReturn;
  }

  private static Set<CapabilitiesFilter> getCapabilityFilters() {
    ImmutableSet.Builder<CapabilitiesFilter> adapters = ImmutableSet.builder();
    ServiceLoader.load(CapabilitiesFilter.class).forEach(adapters::add);
    adapters
      .add(new ChromeFilter())
      .add(new EdgeFilter())
      .add(new FirefoxFilter())
      .add(new InternetExplorerFilter())
      .add(new OperaFilter())
      .add(new SafariFilter());
    return adapters.build();
  }

  private static Set<CapabilityTransform> getCapabilityTransforms() {
    ImmutableSet.Builder<CapabilityTransform> transforms = ImmutableSet.builder();
    ServiceLoader.load(CapabilityTransform.class).forEach(transforms::add);
    transforms
      .add(new ProxyTransform())
      .add(new StripAnyPlatform())
      .add(new W3CPlatformNameNormaliser());
    return transforms.build();
  }
}
