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

package org.openqa.selenium.bidi.network;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;

import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.module.Network;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

class AddInterceptParametersTest extends JupiterTestBase {

  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @Test
  @NotYetImplemented(EDGE)
  void canAddInterceptPhase() {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));
      assertThat(intercept).isNotNull();
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  void canAddInterceptPhases() {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(
              new AddInterceptParameters(
                  List.of(InterceptPhase.BEFORE_REQUEST_SENT, InterceptPhase.RESPONSE_STARTED)));
      assertThat(intercept).isNotNull();
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  void canAddStringUrlPattern() {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(
              new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT)
                  .urlStringPattern("http://localhost:4444/basicAuth"));
      assertThat(intercept).isNotNull();
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  void canAddStringUrlPatterns() {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(
              new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT)
                  .urlStringPatterns(
                      List.of(
                          "http://localhost:4444/basicAuth",
                          "http://localhost:4445/logEntryAdded")));
      assertThat(intercept).isNotNull();
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  void canAddUrlPattern() {
    try (Network network = new Network(driver)) {
      UrlPattern pattern =
          new UrlPattern()
              .hostname("localhost")
              .pathname("/logEntryAdded")
              .port("4444")
              .protocol("http")
              .search("");

      String intercept =
          network.addIntercept(
              new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT).urlPattern(pattern));
      assertThat(intercept).isNotNull();
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  void canAddUrlPatterns() {
    try (Network network = new Network(driver)) {
      UrlPattern pattern1 =
          new UrlPattern()
              .hostname("localhost")
              .pathname("/logEntryAdded")
              .port("4444")
              .protocol("http")
              .search("");

      UrlPattern pattern2 =
          new UrlPattern()
              .hostname("localhost")
              .pathname("/basicAuth")
              .port("4445")
              .protocol("https")
              .search("auth");

      String intercept =
          network.addIntercept(
              new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT)
                  .urlPatterns(List.of(pattern1, pattern2)));
      assertThat(intercept).isNotNull();
    }
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
