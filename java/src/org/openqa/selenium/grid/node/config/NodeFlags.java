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

import com.google.auto.service.AutoService;

import com.beust.jcommander.Parameter;

import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.NonSplittingSplitter;
import org.openqa.selenium.grid.config.Role;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.openqa.selenium.grid.config.StandardGridRoles.NODE_ROLE;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_DETECT_DRIVERS;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_DRAIN_AFTER_SESSION_COUNT;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_ENABLE_CDP;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_HEARTBEAT_PERIOD;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_MAX_SESSIONS;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_NODE_IMPLEMENTATION;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_NO_VNC_PORT;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_REGISTER_CYCLE;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_REGISTER_PERIOD;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_SESSION_TIMEOUT;
import static org.openqa.selenium.grid.node.config.NodeOptions.DEFAULT_VNC_ENV_VAR;
import static org.openqa.selenium.grid.node.config.NodeOptions.NODE_SECTION;
import static org.openqa.selenium.grid.node.config.NodeOptions.OVERRIDE_MAX_SESSIONS;

@SuppressWarnings({"unused", "FieldMayBeFinal"})
@AutoService(HasRoles.class)
public class NodeFlags implements HasRoles {

  @Parameter(
    names = {"--max-sessions"},
    description = "Maximum number of concurrent sessions. Default value is the number "
                  + "of available processors.")
  @ConfigValue(section = NODE_SECTION, name = "max-sessions", example = "8")
  public int maxSessions = DEFAULT_MAX_SESSIONS;

  @Parameter(
    names = {"--override-max-sessions"},
    arity = 1,
    description = "The # of available processors is the recommended max sessions value (1 browser "
                  + "session per processor). Setting this flag to true allows the recommended max "
                  + "value to be overwritten. Session stability and reliability might suffer as "
                  + "the host could run out of resources.")
  @ConfigValue(section = NODE_SECTION, name = "override-max-sessions", example = "false")
  public Boolean overrideMaxSessions = OVERRIDE_MAX_SESSIONS;

  @Parameter(
    names = {"--session-timeout"},
    description = "Let X be the session-timeout in seconds. The Node will automatically kill "
                  + "a session that has not had any activity in the last X seconds. " +
                  "This will release the slot for other tests.")
  @ConfigValue(section = NODE_SECTION, name = "session-timeout", example = "60")
  public int sessionTimeout = DEFAULT_SESSION_TIMEOUT;

  @Parameter(
    names = {"--detect-drivers"}, arity = 1,
    description = "Autodetect which drivers are available on the current system, " +
                  "and add them to the Node.")
  @ConfigValue(section = NODE_SECTION, name = "detect-drivers", example = "true")
  public Boolean autoconfigure = DEFAULT_DETECT_DRIVERS;

  @Parameter(
    names = {"-I", "--driver-implementation"},
    description = "Drivers that should be checked. If specified, will skip autoconfiguration. " +
                  "Example: -I \"firefox\" -I \"chrome\"")
  @ConfigValue(
    section = NODE_SECTION,
    name = "driver-implementation",
    example = "[\"firefox\", \"chrome\"]")
  public Set<String> driverNames = new HashSet<>();

  @Parameter(
    names = {"--driver-factory"},
    description = "Mapping of fully qualified class name to a browser configuration that this " +
                  "matches against. " +
                  "--driver-factory org.openqa.selenium.example.LynxDriverFactory " +
                  "'{\"browserName\": \"lynx\"}'",
    arity = 2,
    variableArity = true,
    splitter = NonSplittingSplitter.class)
  @ConfigValue(
    section = NODE_SECTION,
    name = "driver-factories",
    example = "[\"org.openqa.selenium.example.LynxDriverFactory '{\"browserName\": \"lynx\"}']")
  public List<String> driverFactory2Config;

  @Parameter(
    names = {"--grid-url"},
    description = "Public URL of the Grid as a whole (typically the address of the Hub " +
                  "or the Router)")
  @ConfigValue(section = NODE_SECTION, name = "grid-url", example = "\"https://grid.example.com\"")
  public String gridUri;

  @Parameter(
    names = {"--hub"},
    description = "The address of the Hub in a Hub-and-Node configuration. This can " +
                  "be a plain hostname or IP address (`hostname`), in which case the Hub will be " +
                  "assumed to be `http://hostname:4444`, the `--grid-url` will be the same, " +
                  "`--publish-events` will be `tcp://hostname:4442` and `--subscribe-events` " +
                  "will be `tcp://hostname:4443`. If `hostname` contains a port number, that " +
                  "will be used for `--grid-url` but the URIs for the event bus will remain " +
                  "the same. Any of these default values may be overridden but setting the " +
                  "correct flags. If the hostname has  a protocol (such as `https`) that will " +
                  "be used too.")
  @ConfigValue(section = NODE_SECTION, name = "hub", example = "hub.grid.example.com")
  public String hub;

  @Parameter(
    names = {"--driver-configuration"},
    description = "List of configured drivers a Node supports. " +
                  "It is recommended to provide this type of configuration through a toml config " +
                  "file to improve readability. Command line example: " +
                  "--drivers-configuration display-name=\"Firefox Nightly\" max-sessions=2 " +
                  "webdriver-path=\"/usr/local/bin/geckodriver\" "
                  + "stereotype='{\"browserName\": \"firefox\", \"browserVersion\": \"86\", " +
                  "\"moz:firefoxOptions\": " +
                  "{\"binary\":\"/Applications/Firefox Nightly.app/Contents/MacOS/firefox-bin\"}}'",
    arity = 4,
    variableArity = true,
    splitter = NonSplittingSplitter.class)
  @ConfigValue(
    section = NODE_SECTION,
    name = "driver-configuration",
    prefixed = true,
    example = "\n" +
              "display-name = \"Firefox Nightly\"\n" +
              "webdriver-executable = \"/usr/local/bin/geckodriver\"\n" +
              "max-sessions = 2\n" +
              "stereotype = \"{\\\"browserName\\\": \\\"firefox\\\", \\\"browserVersion\\\": \\\"86\\\", " +
              "\\\"moz:firefoxOptions\\\": " +
              "{\\\"binary\\\":\\\"/Applications/Firefox Nightly.app/Contents/MacOS/firefox-bin\\\"}}\"")
  public List<String> driverConfiguration;

  @Parameter(
    names = "--register-cycle",
    description = "How often, in seconds, the Node will try to register itself for "
                  + "the first time to the Distributor.")
  @ConfigValue(section = NODE_SECTION, name = "register-cycle", example = "10")
  public int registerCycle = DEFAULT_REGISTER_CYCLE;

  @Parameter(
    names = "--register-period",
    description = "How long, in seconds, will the Node try to register to the Distributor for " +
                  "the first time. After this period is completed, the Node will not attempt " +
                  "to register again.")
  @ConfigValue(section = NODE_SECTION, name = "register-period", example = "120")
  public int registerPeriod = DEFAULT_REGISTER_PERIOD;

  @Parameter(
    names = "--heartbeat-period",
    description = "How often, in seconds, will the Node send heartbeat events to the Distributor " +
                  "to inform it that the Node is up.")
  @ConfigValue(section = NODE_SECTION, name = "heartbeat-period", example = "10")
  public int heartbeatPeriod = DEFAULT_HEARTBEAT_PERIOD;

  @Parameter(
    names = "--vnc-env-var",
    description = "Environment variable to check in order to determine if a vnc stream is " +
                  "available or not.")
  @ConfigValue(section = NODE_SECTION, name = "vnc-env-var", example = "SE_START_XVFB")
  public String vncEnvVar = DEFAULT_VNC_ENV_VAR;

  @Parameter(
    names = "--no-vnc-port",
    description = "If VNC is available, sets the port where the local noVNC stream can be obtained")
  @ConfigValue(section = NODE_SECTION, name = "no-vnc-port", example = "7900")
  public int noVncPort = DEFAULT_NO_VNC_PORT;

  @Parameter(
    names = "--drain-after-session-count",
    description = "Drain and shutdown the Node after X sessions have been executed. Useful for " +
                  "environments like Kubernetes. A value higher than zero enables this feature.")
  @ConfigValue(section = NODE_SECTION, name = "drain-after-session-count", example = "1")
  public int drainAfterSessionCount = DEFAULT_DRAIN_AFTER_SESSION_COUNT;

  @Parameter(
    names = {"--enable-cdp"},
    arity = 1,
    description = "Enable CDP proxying in Grid. A Grid admin can disable CDP if the network does "
                  + "not allow websockets. True by default")
  @ConfigValue(section = NODE_SECTION, name = "enable-cdp", example = "true")
  public Boolean enableCdp = DEFAULT_ENABLE_CDP;

  @Parameter(
    names = {"--node-implementation"},
    description = "Full classname of non-default Node implementation. This is used to manage "
                  + "a session's lifecycle.")
  @ConfigValue(section = NODE_SECTION, name = "implementation",
    example = DEFAULT_NODE_IMPLEMENTATION)
  private String nodeImplementation = DEFAULT_NODE_IMPLEMENTATION;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(NODE_ROLE);
  }
}
