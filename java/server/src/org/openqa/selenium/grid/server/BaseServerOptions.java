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

package org.openqa.selenium.grid.server;

import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Optional;

public class BaseServerOptions {

  private final Config config;
  private int port = -1;

  public BaseServerOptions(Config config) {
    this.config = config;
  }

  public Optional<String> getHostname() {
    return config.get("server", "hostname");
  }

  public int getPort() {
    if (port != -1) {
      return port;
    }

    int port = config.getInt("server", "port")
        .orElseGet(PortProber::findFreePort);

    if (port < 0) {
      throw new ConfigException("Port cannot be less than 0: " + port);
    }

    this.port = port;

    return port;
  }

  public int getMaxServerThreads() {
    int count = config.getInt("server", "max-threads")
        .orElse(200);

    if (count < 0) {
      throw new ConfigException("Maximum number of server threads cannot be less than 0: " + count);
    }

    return count;
  }

  public URI getExternalUri() {
    // Assume the host given is addressable if it's been set
    String host = getHostname()
        .orElseGet(() -> new NetworkUtils().getNonLoopbackAddressOfThisMachine());

    int port = getPort();

    try {
      return new URI("http", null, host, port, null, null, null);
    } catch (URISyntaxException e) {
      throw new ConfigException("Cannot determine external URI: " + e.getMessage());
    }
  }
}
