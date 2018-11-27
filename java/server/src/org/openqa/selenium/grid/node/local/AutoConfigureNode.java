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

package org.openqa.selenium.grid.node.local;

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.service.DriverService;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.ServiceLoader;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class AutoConfigureNode {

  public static final Logger log = Logger.getLogger("selenium");

  public static void addSystemDrivers(LocalNode.Builder node) {

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
          .peek(builder -> log.info(String.format("Adding %s %d times", caps, info.getMaximumSimultaneousSessions())))
          .forEach(builder -> {
            for (int i = 0; i < info.getMaximumSimultaneousSessions(); i++) {
              node.add(caps, c -> {
                try {
                  DriverService service = builder.build();
                  service.start();

                  RemoteWebDriver driver = new RemoteWebDriver(service.getUrl(), c);

                  return new SessionSpy(service, driver);
                } catch (IOException | URISyntaxException e) {
                  throw new RuntimeException(e);
                }
              });
            }
          });
    });
  }

  private static class SessionSpy extends Session implements CommandHandler {

    private final ReverseProxyHandler handler;
    private final DriverService service;
    private final String stop;

    public SessionSpy(DriverService service, RemoteWebDriver driver) throws URISyntaxException {
      super(driver.getSessionId(), service.getUrl().toURI(), driver.getCapabilities());
      handler = new ReverseProxyHandler(service.getUrl());
      this.service = service;

      stop = "/session/" + driver.getSessionId();
    }

    @Override
    public void execute(HttpRequest req, HttpResponse resp) throws IOException {
      handler.execute(req, resp);

      if (DELETE == req.getMethod() && stop.equals(req.getUri())) {
        service.stop();
      }
    }
  }
}
