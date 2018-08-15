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

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;

public class GridHubCliOptions extends CommonGridCliOptions {

  private String[] rawArgs;

  public JCommander parse(String... args) {
    rawArgs = args;
    JCommander commander = JCommander.newBuilder().addObject(this).build();
    commander.parse(args);
    return commander;
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

  public String getConfigFile() {
    return configFile;
  }

  public CapabilityMatcher getCapabilityMatcher() {
    return capabilityMatcher;
  }

  public Integer getNewSessionWaitTimeout() {
    return newSessionWaitTimeout;
  }

  public Prioritizer getPrioritizer() {
    return prioritizer;
  }

  public Boolean getThrowOnCapabilityNotPresent() {
    return throwOnCapabilityNotPresent;
  }

  public String getRegistry() {
    return registry;
  }

  public String[] getRawArgs() {
    return rawArgs;
  }
}
