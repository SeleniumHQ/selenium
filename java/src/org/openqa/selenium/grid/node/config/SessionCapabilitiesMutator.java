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

package org.openqa.selenium.grid.node.config;

import com.google.common.collect.ImmutableMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;

public class SessionCapabilitiesMutator implements Function<Capabilities, Capabilities> {

  private static final ImmutableMap<String, String> BROWSER_OPTIONS =
      ImmutableMap.of(
          "chrome", "goog:chromeOptions",
          "firefox", "moz:firefoxOptions",
          "microsoftedge", "ms:edgeOptions");
  private static final String SE_VNC_ENABLED = "se:vncEnabled";
  private static final String SE_NO_VNC_PORT = "se:noVncPort";
  private final Capabilities slotStereotype;

  public SessionCapabilitiesMutator(Capabilities slotStereotype) {
    this.slotStereotype = slotStereotype;
  }

  @Override
  public Capabilities apply(Capabilities capabilities) {
    if (!Objects.equals(slotStereotype.getBrowserName(), capabilities.getBrowserName())) {
      return capabilities;
    }

    if (slotStereotype.getCapability(SE_VNC_ENABLED) != null) {
      capabilities =
          new PersistentCapabilities(capabilities)
              .setCapability(SE_VNC_ENABLED, slotStereotype.getCapability(SE_VNC_ENABLED))
              .setCapability(SE_NO_VNC_PORT, slotStereotype.getCapability(SE_NO_VNC_PORT));
    }

    String browserName = capabilities.getBrowserName().toLowerCase();

    if ("internet explorer".equalsIgnoreCase(browserName)) {
      return new ImmutableCapabilities(removeUnknownExtensionsForIE(capabilities));
    }

    if (!BROWSER_OPTIONS.containsKey(browserName)) {
      return capabilities;
    }

    String options = BROWSER_OPTIONS.get(browserName);
    if (slotStereotype.asMap().containsKey(options) && capabilities.asMap().containsKey(options)) {

      @SuppressWarnings("unchecked")
      Map<String, Object> stereotypeOptions =
          new HashMap<>((Map<String, Object>) slotStereotype.asMap().get(options));

      @SuppressWarnings("unchecked")
      Map<String, Object> capsOptions =
          new HashMap<>((Map<String, Object>) capabilities.asMap().get(options));

      // Merge top level capabilities, excluding browser specific options.
      // This will overwrite the browser options too, but it does not matter since we tackle it
      // separately just after this.
      Map<String, Object> toReturn = new HashMap<>(slotStereotype.merge(capabilities).asMap());

      // Merge browser specific stereotype and capabilities options
      switch (browserName.toLowerCase()) {
        case "chrome":
        case "microsoftedge":
        case "msedge":
          toReturn.put(options, mergeChromiumOptions(stereotypeOptions, capsOptions));
          break;
        case "firefox":
          toReturn.put(options, mergeFirefoxOptions(stereotypeOptions, capsOptions));
          break;
        default:
          break;
      }

      return new ImmutableCapabilities(toReturn);
    }

    return slotStereotype.merge(capabilities);
  }

  private Map<String, Object> removeUnknownExtensionsForIE(Capabilities capabilities) {
    Map<String, Object> toReturn = new HashMap<>(capabilities.asMap());
    capabilities.asMap().keySet().stream()
        .filter(key -> key.contains(":"))
        .filter(key -> !"se:ieOptions".equalsIgnoreCase(key))
        .forEach(toReturn::remove);
    return toReturn;
  }

  private Map<String, Object> mergeChromiumOptions(
      Map<String, Object> stereotypeOptions, Map<String, Object> capsOptions) {
    Map<String, Object> toReturn = new HashMap<>(stereotypeOptions);

    for (Map.Entry<String, Object> entry : capsOptions.entrySet()) {
      String name = entry.getKey();
      Object value = entry.getValue();
      if (name.equals("args")) {
        @SuppressWarnings("unchecked")
        List<String> arguments = new ArrayList<>((List<String>) value);

        @SuppressWarnings("unchecked")
        List<String> stereotypeArguments =
            new ArrayList<>(
                (List<String>) (stereotypeOptions.getOrDefault(("args"), new ArrayList<>())));

        arguments.forEach(
            arg -> {
              if (!stereotypeArguments.contains(arg)) {
                stereotypeArguments.add(arg);
              }
            });
        toReturn.put("args", stereotypeArguments);
      }

      if (name.equals("extensions")) {
        @SuppressWarnings("unchecked")
        List<String> extensionList = new ArrayList<>((List<String>) value);

        @SuppressWarnings("unchecked")
        List<String> stereotypeExtensions =
            new ArrayList<>(
                (List<String>) (stereotypeOptions.getOrDefault(("extensions"), new ArrayList<>())));

        extensionList.forEach(
            extension -> {
              if (!stereotypeExtensions.contains(extension)) {
                stereotypeExtensions.add(extension);
              }
            });

        toReturn.put("extensions", stereotypeExtensions);
      }

      if (name.equals("binary") && !stereotypeOptions.containsKey("binary")) {
        toReturn.put(name, value);
      }

      if (!name.equals("binary") && !name.equals("extensions") && !name.equals("args")) {
        toReturn.put(name, value);
      }
    }

    return toReturn;
  }

  private Map<String, Object> mergeFirefoxOptions(
      Map<String, Object> stereotypeOptions, Map<String, Object> capsOptions) {
    Map<String, Object> toReturn = new HashMap<>(stereotypeOptions);

    for (Map.Entry<String, Object> entry : capsOptions.entrySet()) {
      String name = entry.getKey();
      Object value = entry.getValue();
      if (name.equals("args")) {
        @SuppressWarnings("unchecked")
        List<String> arguments = new ArrayList<>((List<String>) value);

        @SuppressWarnings("unchecked")
        List<String> stereotypeArguments =
            new ArrayList<>(
                (List<String>) (stereotypeOptions.getOrDefault(("args"), new ArrayList<>())));

        arguments.forEach(
            arg -> {
              if (!stereotypeArguments.contains(arg)) {
                stereotypeArguments.add(arg);
              }
            });
        toReturn.put("args", stereotypeArguments);
      }

      if (name.equals("prefs")) {
        @SuppressWarnings("unchecked")
        Map<String, Object> prefs = new HashMap<>((Map<String, Object>) value);

        @SuppressWarnings("unchecked")
        Map<String, Object> stereotypePrefs =
            new HashMap<>(
                (Map<String, Object>) (stereotypeOptions.getOrDefault(("prefs"), new HashMap<>())));

        stereotypePrefs.putAll(prefs);
        toReturn.put("prefs", stereotypePrefs);
      }

      if (name.equals("profile")) {
        String rawProfile = (String) value;
        toReturn.put("profile", rawProfile);
      }

      if (name.equals("log")) {
        @SuppressWarnings("unchecked")
        Map<String, Object> logLevelMap = (Map<String, Object>) value;
        toReturn.put("log", logLevelMap);
      }
    }

    return toReturn;
  }
}
