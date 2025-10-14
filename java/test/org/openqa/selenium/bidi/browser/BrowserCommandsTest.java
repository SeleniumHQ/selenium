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

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

class BrowserCommandsTest extends JupiterTestBase {

  private Browser browser;

  @BeforeEach
  public void setUp() {
    browser = new Browser(driver);
  }

  @Test
  @NeedsFreshDriver
  void canCreateAUserContext() {
    String userContext = browser.createUserContext();

    assertThat(userContext).isNotNull();

    browser.removeUserContext(userContext);
  }

  @Test
  @NeedsFreshDriver
  void canGetUserContexts() {
    String userContext1 = browser.createUserContext();
    String userContext2 = browser.createUserContext();

    List<String> userContexts = browser.getUserContexts();
    assertThat(userContexts.size()).isGreaterThanOrEqualTo(2);

    browser.removeUserContext(userContext1);
    browser.removeUserContext(userContext2);
  }

  @Test
  @NeedsFreshDriver
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

  @Test
  @NeedsFreshDriver
  void canGetClientWindows() {
    List<ClientWindowInfo> clientWindows = browser.getClientWindows();

    assertThat(clientWindows).isNotNull();
    assertThat(clientWindows.size()).isGreaterThan(0);

    ClientWindowInfo windowInfo = clientWindows.get(0);
    assertThat(windowInfo.getClientWindow()).isNotNull();
    assertThat(windowInfo.getState()).isInstanceOf(ClientWindowState.class);
    assertThat(windowInfo.getWidth()).isGreaterThan(0);
    assertThat(windowInfo.getHeight()).isGreaterThan(0);
    assertThat(windowInfo.isActive()).isIn(true, false);
  }
}
