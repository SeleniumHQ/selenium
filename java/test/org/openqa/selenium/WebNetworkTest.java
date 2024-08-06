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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import java.net.URL;
import java.util.function.Predicate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.Browser;

class WebNetworkTest extends JupiterTestBase {

  private String page;
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @AfterEach
  public void cleanUp() {
    driver.quit();
  }

  @Test
  @NotYetImplemented(Browser.CHROME)
  @NotYetImplemented(Browser.EDGE)
  void canAddAuthenticationHandler() {
    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(new UsernameAndPassword("test", "test"));

    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("authorized");
  }

  @Test
  @NotYetImplemented(Browser.CHROME)
  @NotYetImplemented(Browser.EDGE)
  void canAddAuthenticationHandlerWithFilter() {
    Predicate<URL> filter = url -> url.getPath().contains("basicAuth");

    long id =
        ((RemoteWebDriver) driver)
            .network()
            .addAuthenticationHandler(filter, new UsernameAndPassword("test", "test"));

    ((RemoteWebDriver) driver).network().removeAuthenticationHandler(id);
    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("h1")));
  }

  @Test
  @NotYetImplemented(Browser.CHROME)
  @NotYetImplemented(Browser.EDGE)
  void canRemoveAuthenticationHandler() {
    long id =
        ((RemoteWebDriver) driver)
            .network()
            .addAuthenticationHandler(new UsernameAndPassword("test", "test"));

    ((RemoteWebDriver) driver).network().removeAuthenticationHandler(id);
    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("h1")));
  }

  @Test
  @NotYetImplemented(Browser.CHROME)
  @NotYetImplemented(Browser.EDGE)
  void canClearAuthenticationHandlers() {
    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(new UsernameAndPassword("test", "test"));

    ((RemoteWebDriver) driver)
        .network()
        .addAuthenticationHandler(new UsernameAndPassword("test1", "test1"));

    ((RemoteWebDriver) driver).network().clearAuthenticationHandlers();
    page = server.whereIs("basicAuth");
    driver.get(page);

    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> driver.findElement(By.tagName("h1")));
  }
}
