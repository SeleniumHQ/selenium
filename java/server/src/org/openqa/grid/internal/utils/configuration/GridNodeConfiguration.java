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
    description = "<String> : unique identifier for the node. Not required--by default, grid will use the url of the remoteHost"
  )
  public String id;

  // remoteHost is a generated value based on host / port specified, or read from JSON.
  String remoteHost;

  @Parameter(
    names = "-browser",
    description = "<String> : comma separated Capability values. Example: -browser browserName=firefox,platform=linux -browser browserName=chrome,platform=linux",
    converter = DesiredCapabilityConverter.class
  )
  public List<DesiredCapabilities> browser;

  @Parameter(
    names = "-downPollingLimit",
    description = "<Integer> : node is marked as \"down\" if the node hasn't responded after the number of checks specified in [downPollingLimit]. Default is 2"
  )
  public Integer downPollingLimit;

  @Parameter(
    names = "-hub",
    description = "<String> (e.g. http://localhost:4444/grid/register) : the url that will be used to post the registration request. This option takes precedence over -hubHost and -hubPort options"
  )
  public String hub;

  @Parameter(
    names = "-hubHost",
    description = "<String> IP or hostname : the host address of the hub we're attempting to register with. If \"role\" is set to [hub], this option will be ignored. Default is localhost"
  )
  String hubHost;

  @Parameter(
    names = "-hubPort",
    description = "<Integer> : the port of the hub we're attempting to register with. If \"role\" is set to [hub], this option will be ignored. Default to 4444"
  )
  Integer hubPort;

  @Parameter(
    names = "-nodeConfig",
    description = "<String> filename : JSON configuration file for the node. Overrides default values"
  )
  public String nodeConfigFile;

  @Parameter(
    names = "-nodePolling",
    description = "<Integer> in ms : specifies how often the hub will poll to see if the node is still responding"
  )
  public Integer nodePolling;

  @Parameter(
    names = "-nodeStatusCheckTimeout",
    description = "<Integer> in ms : connection/socket timeout, used for node \"nodePolling\" check"
  )
  public Integer nodeStatusCheckTimeout;

  @Parameter(
    names = "-proxy",
    description = "<String> : the class used to represent the node proxy. Default is [org.openqa.grid.selenium.proxy.DefaultRemoteProxy]"
  )
  public String proxy;

  @Parameter(
    names = "-register",
    description = "if specified, node will attempt to re-register itself automatically with its known grid hub if the hub becomes unavailable. Default is disabled"
  )
  public Boolean register;

  @Parameter(
    names = "-registerCycle",
    description = "<Integer> in ms : specifies how often the node will try to register itself again. Allows administrator to restart the hub without restarting (or risk orphaning) registered nodes. Must be specified with the \"-register\" option"
  )
  public Integer registerCycle;

  @Parameter(
    names = "-unregisterIfStillDownAfter",
    description = "<Integer> in ms : if the node remains down for more than [unregisterIfStillDownAfter] ms, it will step attempting to re-register from the hub. Default is 6000 (1 minute)"
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
    if (other.hub != null) {
      hub = other.hub;
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
    sb.append(toString(format, "browser", browser));
    sb.append(toString(format, "downPollingLimit", downPollingLimit));
    sb.append(toString(format, "hub", hub));
    sb.append(toString(format, "id", id));
    sb.append(toString(format, "hubHost", hubHost));
    sb.append(toString(format, "hubPort", hubPort));
    sb.append(toString(format, "nodeConfigFile", nodeConfigFile));
    sb.append(toString(format, "nodePolling", nodePolling));
    sb.append(toString(format, "nodeStatusCheckTimeout", nodeStatusCheckTimeout));
    sb.append(toString(format, "proxy", proxy));
    sb.append(toString(format, "register", register));
    sb.append(toString(format, "registerCycle", registerCycle));
    sb.append(toString(format, "remoteHost", remoteHost));
    sb.append(toString(format, "unregisterIfStillDownAfter", unregisterIfStillDownAfter));
    return sb.toString();
  }
}
