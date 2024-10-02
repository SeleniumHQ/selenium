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

package org.openqa.selenium.bidi.browser;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;
import static org.openqa.selenium.testing.drivers.Browser.*;

import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.testing.JupiterTestBase;

class BrowserCommandsTest extends JupiterTestBase {

  private AppServer server;
  private Browser browser;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
    browser = new Browser(driver);
  }

  @Test
  void canCreateAUserContext() {
    String userContext = browser.createUserContext();

    assertThat(userContext).isNotNull();

    browser.removeUserContext(userContext);
  }

  @Test
  void canGetUserContexts() {
    String userContext1 = browser.createUserContext();
    String userContext2 = browser.createUserContext();

    List<String> userContexts = browser.getUserContexts();
    assertThat(userContexts.size()).isGreaterThanOrEqualTo(2);

    browser.removeUserContext(userContext1);
    browser.removeUserContext(userContext2);
  }

  @Test
  void canRemoveUserContext() {
    String userContext1 = browser.createUserContext();
    String userContext2 = browser.createUserContext();

    List<String> userContexts = browser.getUserContexts();
    assertThat(userContexts.size()).isGreaterThanOrEqualTo(2);

    browser.removeUserContext(userContext2);

    List<String> updatedUserContexts = browser.getUserContexts();
    assertThat(userContext1).isIn(updatedUserContexts);
    assertThat(userContext2).isNotIn(updatedUserContexts);

    browser.removeUserContext(userContext1);
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
