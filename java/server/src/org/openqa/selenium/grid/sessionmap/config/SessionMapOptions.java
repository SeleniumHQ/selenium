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

package org.openqa.selenium.grid.sessionmap.config;

import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.remote.RemoteSessionMap;
import org.openqa.selenium.remote.http.HttpClient;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Optional;

public class SessionMapOptions {

  private final Config config;

  public SessionMapOptions(Config config) {
    this.config = config;
  }

  public SessionMap getSessionMap(HttpClient.Factory clientFactory) {
    HttpClient client = clientFactory.createClient(getSessionMapUrl());
    return new RemoteSessionMap(client);
  }

  private URL getSessionMapUrl() {
    Optional<URL> host = config.get("sessions", "host").map(str -> {
      try {
        return new URL(str);
      } catch (MalformedURLException e) {
        throw new ConfigException("Session map server URI is not a valid URI: " + str);
      }
    });

    if (host.isPresent()) {
      return host.get();
    }

    Optional<Integer> port = config.getInt("sessions", "port");
    Optional<String> hostname = config.get("sessions", "hostname");

    if (!(port.isPresent() && hostname.isPresent())) {
      throw new ConfigException("Unable to determine host and port for the session map server");
    }

    try {
      return new URL(
          "http",
          hostname.get(),
          port.get(),
          "");
    } catch (MalformedURLException e) {
      throw new ConfigException(
          "Session map server uri configured through host (%s) and port (%d) is not a valid URI",
          hostname.get(),
          port.get());
    }
  }
}
