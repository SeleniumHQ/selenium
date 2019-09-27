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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.service.DriverService;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.ServiceLoader;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class NodeOptions {

  public static final Logger LOG = Logger.getLogger(NodeOptions.class.getName());
  private final Config config;

  public NodeOptions(Config config) {
    this.config = Objects.requireNonNull(config);
  }

  public void configure(HttpClient.Factory httpClientFactory, LocalNode.Builder node) {
    if (!config.getBool("node", "detect-drivers").orElse(false)) {
      return;
    }

    addSystemDrivers(httpClientFactory, node);
  }


  private void addSystemDrivers(
      HttpClient.Factory clientFactory,
      LocalNode.Builder node) {

    // We don't expect duplicates, but they're fine
    List<WebDriverInfo> infos =
        StreamSupport.stream(ServiceLoader.load(WebDriverInfo.class).spliterator(), false)
            .filter(WebDriverInfo::isAvailable)
            .collect(Collectors.toList());

    // Same
    List<DriverService.Builder> builders = new ArrayList<>();
    ServiceLoader.load(DriverService.Builder.class).forEach(builders::add);

    infos.forEach(info -> {
      Capabilities caps = info.getCanonicalCapabilities();
      builders.stream()
          .filter(builder -> builder.score(caps) > 0)
          .peek(builder -> LOG.info(String.format("Adding %s %d times", caps, info.getMaximumSimultaneousSessions())))
          .forEach(builder -> {
            DriverService.Builder freePortBuilder = builder.usingAnyFreePort();

            for (int i = 0; i < info.getMaximumSimultaneousSessions(); i++) {
              node.add(
                  caps,
                  new DriverServiceSessionFactory(
                      clientFactory, c -> freePortBuilder.score(c) > 0,
                      freePortBuilder));
            }
          });
    });
  }
}
