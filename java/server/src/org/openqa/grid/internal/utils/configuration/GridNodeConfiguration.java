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

package org.openqa.grid.internal.utils.configuration;

import com.beust.jcommander.IStringConverter;
import com.beust.jcommander.Parameter;

import org.openqa.selenium.remote.DesiredCapabilities;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

public class GridNodeConfiguration extends GridConfiguration {

  @Parameter(
    names = "-id",
    description = "unique identifier for the node, not required and grid will set this to the remoteHost"
  )
  public String id;

  // remoteHost is a generated value based on host / port specified, or read from JSON.
  String remoteHost;

  @Parameter(
    names = "-browser",
    description = "comma separated capability values. Example: -browser browserName=firefox,platform=linux -browser browserName=chrome,platform=linux",
    converter = DesiredCapabilityConverter.class
  )
  public List<DesiredCapabilities> browser;

  @Parameter(
    names = "-downPollingLimit",
    description = "<Integer> node is marked as down after downPollingLimit alive checks."
  )
  public Integer downPollingLimit;

  @Parameter(
    names = "-hub",
    description = "<http://localhost:4444/grid/register> : the url that will be used to post the registration request. This option takes precedence over -hubHost and -hubPort options."
  )
  public String hub;

  @Parameter(
    names = "-hubHost",
    description = "<IP | hostname> : the host address of a hub the registration request should be sent to. Default to localhost. Option -hub takes precedence over this option."
  )
  String hubHost;

  @Parameter(
    names = "-hubPort",
    description = "<Integer> : the port listened by a hub the registration request should be sent to. Default to 4444. Option -hub takes precedence over this option."
  )
  Integer hubPort;

  @Parameter(
    names = "-nodeConfig",
    description = "<file> json configuration file for the node, overrides default values."
  )
  public String nodeConfigFile;

  @Parameter(
    names = "-nodePolling",
    description = "<Integer> in ms. Interval between alive checks of node how often the hub checks if the node is still alive."
  )
  public Integer nodePolling;

  @Parameter(
    names = "-nodeStatusCheckTimeout",
    description = "<Integer> in ms. Connection and socket timeout which is used for node alive check."
  )
  public Integer nodeStatusCheckTimeout;

  @Parameter(
    names = "-proxy",
    description = "<String> the class that will be used to represent the node. By default org.openqa.grid.selenium.proxy.DefaultRemoteProxy."
  )
  public String proxy;

  @Parameter(
    names = "-register",
    description = "include this command line option if you want the node to automatically re-register itself with a grid hub if the hub becomes unavailable. Default is disabled."
  )
  public Boolean register;

  @Parameter(
    names = "-registerCycle",
    description = "<Integer> how often in ms the node will try to register itself again.Allow to restart the hub without having to restart the nodes."
  )
  public Integer registerCycle;

  @Parameter(
    names = "-unregisterIfStillDownAfter",
    description = "<Integer> in ms. If the node remains down for more than unregisterIfStillDownAfter millisec, it will disappear from the hub.Default is 1min."
  )
  public Integer unregisterIfStillDownAfter;

  public String getHubHost() {
    if (hubHost == null) {
      if (hub == null) {
        throw new RuntimeException("You must specify either a hubHost or hub parameter");
      }
      parseHubUrl();
    }
    return hubHost;
  }

  public Integer getHubPort() {
    if (hubPort == null) {
      if (hub == null) {
        throw new RuntimeException("You must specify either a hubPort or hub parameter");
      }
      parseHubUrl();
    }
    return hubPort;
  }

  public String getRemoteHost() {
    if (remoteHost == null) {
      if (host == null) {
        host = "localhost";
      }
      if (port == null) {
        port = 5555;
      }
      remoteHost = "http://" + host + ":" + port;
    }
    return remoteHost;
  }

  private void parseHubUrl() {
    try {
      URL u = new URL(hub);
      hubHost = u.getHost();
      hubPort = u.getPort();
    } catch (MalformedURLException mURLe) {
      throw new RuntimeException("-hub must be a valid url: " + hub, mURLe);
    }
  }

  private class DesiredCapabilityConverter implements IStringConverter<DesiredCapabilities> {
    @Override
    public DesiredCapabilities convert(String value) {
      DesiredCapabilities capabilities = new DesiredCapabilities();
      for (String cap : value.split(",")) {
        String[] pieces = cap.split("=");
        capabilities.setCapability(pieces[0], pieces[1]);
      }
      return capabilities;
    }
  }

  public void merge(GridNodeConfiguration other) {
    super.merge(other);
    if (other.browser != null) {
      browser = other.browser;
    }
    if (other.downPollingLimit != null) {
      downPollingLimit = other.downPollingLimit;
    }
    if (other.hubHost != null) {
      hubHost = other.hubHost;
    }
    if (other.hubPort != null) {
      hubPort = other.hubPort;
    }
    if (other.id != null) {
      id = other.id;
    }
    if (other.nodePolling != null) {
      nodePolling = other.nodePolling;
    }
    if (other.nodeStatusCheckTimeout != null) {
      nodeStatusCheckTimeout = other.nodeStatusCheckTimeout;
    }
    if (other.proxy != null) {
      proxy = other.proxy;
    }
    if (other.register != null) {
      register = other.register;
    }
    if (other.registerCycle != null) {
      registerCycle = other.registerCycle;
    }
    if (other.remoteHost != null) {
      remoteHost = other.remoteHost;
    }
    if (other.unregisterIfStillDownAfter != null) {
      unregisterIfStillDownAfter = other.unregisterIfStillDownAfter;
    }
  }

  @Override
  public String toString(String format) {
    StringBuilder sb = new StringBuilder();
    sb.append(super.toString(format));
    // id, remoteHost are not command line parameters, excluding from this?
    sb.append(toString(format, "browser", browser));
    sb.append(toString(format, "downPollingLimit", downPollingLimit));
    sb.append(toString(format, "hub", hub));
    sb.append(toString(format, "hubHost", hubHost));
    sb.append(toString(format, "hubPort", hubPort));
    sb.append(toString(format, "nodeConfigFile", nodeConfigFile));
    sb.append(toString(format, "nodePolling", nodePolling));
    sb.append(toString(format, "nodeStatusCheckTimeout", nodeStatusCheckTimeout));
    sb.append(toString(format, "proxy", proxy));
    sb.append(toString(format, "register", register));
    sb.append(toString(format, "registerCycle", registerCycle));
    sb.append(toString(format, "unregisterIfStillDownAfter", unregisterIfStillDownAfter));
    return sb.toString();
  }
}
