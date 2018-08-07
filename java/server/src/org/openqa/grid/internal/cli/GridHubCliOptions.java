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

package org.openqa.grid.internal.cli;

import static org.openqa.grid.internal.utils.configuration.GridHubConfiguration.DEFAULT_HUB_CONFIG_FILE;

import com.beust.jcommander.IDefaultProvider;
import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.selenium.json.Json;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class GridHubCliOptions extends CommonGridCliOptions {

  public static class Parser {

    public GridHubCliOptions parse(String[] args) {
      GridHubCliOptions result = new GridHubCliOptions();
      JCommander.newBuilder().addObject(result).build().parse(args);

      if (result.configFile != null) {
        // Second round
        String configFile = result.configFile;
        result = new GridHubCliOptions();
        JCommander.newBuilder().addObject(result)
            .defaultProvider(defaults(fromConfigFile(configFile))).build().parse(args);
      }

      return result;
    }
  }

  /**
   * @deprecated Use GridHubCliOptions.Parser instead
   */
  @Deprecated
  public GridHubCliOptions parse(String[] args) {
    JCommander.newBuilder().addObject(this).build().parse(args);

    if (configFile != null) {
      //re-parse the args using any -nodeConfig specified to init
      JCommander.newBuilder().addObject(this)
          .defaultProvider(defaults(fromConfigFile(configFile))).build().parse(args);
    }
    return this;
  }

  private static IDefaultProvider defaults(String json) {
    Map<String, Object> map = new Json().toType(json, Map.class);
    map.remove("custom");
    return optionName -> {
      String option = optionName.replaceAll("-", "");
      if (map.containsKey(option) && map.get(option) != null) {
        if (map.get(option) instanceof List) {
          List<?> l = (List<?>) map.get(option);
          if (l.isEmpty()) {
            return null;
          } else {
            return l.stream().map(Object::toString).collect(Collectors.joining(","));
          }
        } else {
          return map.get(option).toString();
        }
      } else {
        return null;
      }
    };
  }

  /**
   * Hub specific json config file to use. Defaults to {@code null}.
   */
  @Parameter(
      names = "-hubConfig",
      description =  "<String> filename: a JSON file (following grid2 format), which defines the hub properties",
      validateValueWith = FileExistsValueValidator.class
  )
  private String configFile;

  /**
   * Capability matcher to use. Defaults to {@link DefaultCapabilityMatcher}
   */
  @Parameter(
      names = { "-matcher", "-capabilityMatcher" },
      description = "<String> class name : a class implementing the CapabilityMatcher interface. Specifies the logic the hub will follow to define whether a request can be assigned to a node. For example, if you want to have the matching process use regular expressions instead of exact match when specifying browser version. ALL nodes of a grid ecosystem would then use the same capabilityMatcher, as defined here.",
      converter = StringToClassConverter.CapabilityMatcherStringConverter.class
  )
  private CapabilityMatcher capabilityMatcher;

  /**
   * Timeout for new session requests. Defaults to unlimited.
   */
  @Parameter(
      names = "-newSessionWaitTimeout",
      description = "<Integer> in ms : The time after which a new test waiting for a node to become available will time out. When that happens, the test will throw an exception before attempting to start a browser. An unspecified, zero, or negative value means wait indefinitely."
  )
  private Integer newSessionWaitTimeout;

  /**
   * Prioritizer for new honoring session requests based on some priority. Defaults to {@code null}.
   */
  @Parameter(
      names = "-prioritizer",
      description = "<String> class name : a class implementing the Prioritizer interface. Specify a custom Prioritizer if you want to sort the order in which new session requests are processed when there is a queue. Default to null ( no priority = FIFO )",
      converter = StringToClassConverter.PrioritizerStringConverter.class
  )
  private Prioritizer prioritizer;

  /**
   * Whether to throw an Exception when there are no capabilities available that match the request. Defaults to {@code true}.
   */
  @Parameter(
      names = "-throwOnCapabilityNotPresent",
      description = "<Boolean> true or false : If true, the hub will reject all test requests if no compatible proxy is currently registered. If set to false, the request will queue until a node supporting the capability is registered with the grid.",
      arity = 1
  )
  private Boolean throwOnCapabilityNotPresent;

  @Parameter(
      names = "-registry",
      description = "<String> class name : a class implementing the GridRegistry interface. Specifies the registry the hub will use."
  )
  private String registry;

  public GridHubConfiguration toConfiguration() {
    GridHubConfiguration configuration = GridHubConfiguration.loadFromJSON(
        configFile == null ? DEFAULT_HUB_CONFIG_FILE : configFile);

    fillCommonConfiguration(configuration);
    fillCommonGridConfiguration(configuration);
    if (configFile != null) {
      configuration.hubConfig = configFile;
    }
    if (capabilityMatcher != null) {
      configuration.capabilityMatcher = capabilityMatcher;
    }
    if (newSessionWaitTimeout != null) {
      configuration.newSessionWaitTimeout = newSessionWaitTimeout;
    }
    if (prioritizer != null) {
      configuration.prioritizer = prioritizer;
    }
    if (throwOnCapabilityNotPresent != null) {
      configuration.throwOnCapabilityNotPresent = throwOnCapabilityNotPresent;
    }
    if (registry != null) {
      configuration.registry = registry;
    }
    return configuration;
  }

}
