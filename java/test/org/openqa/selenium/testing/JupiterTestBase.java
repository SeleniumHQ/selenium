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

package org.openqa.selenium.testing;

import static org.assertj.core.api.Assumptions.assumeThat;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;

public abstract class JupiterTestBase {

  private static final Logger LOG = Logger.getLogger(JupiterTestBase.class.getName());

  @RegisterExtension
  protected static final SeleniumExtension seleniumExtension = new SeleniumExtension();

  protected TestEnvironment environment;
  protected AppServer appServer;
  protected Pages pages;
  protected WebDriver driver;
  protected Wait<WebDriver> wait;
  protected Wait<WebDriver> shortWait;
  protected WebDriver localDriver;

  @BeforeAll
  public static void shouldTestBeRunAtAll() {
    assumeThat(Boolean.getBoolean("selenium.skiptest")).isFalse();
  }

  @BeforeEach
  public void prepareEnvironment() {
    boolean needsSecureServer =
        Optional.ofNullable(this.getClass().getAnnotation(NeedsSecureServer.class))
            .map(NeedsSecureServer::value)
            .orElse(false);

    environment =
        GlobalTestEnvironment.getOrCreate(() -> new InProcessTestEnvironment(needsSecureServer));
    appServer = environment.getAppServer();

    if (needsSecureServer) {
      try {
        appServer.whereIsSecure("/");
      } catch (IllegalStateException ex) {
        // this should not happen with bazel, a new JVM is used for each class
        // the annotation is on class level, so we should never see this
        LOG.log(Level.WARNING, "appServer is restarted with secureServer=true", ex);
        environment.stop();
        environment = new InProcessTestEnvironment(true);
        appServer = environment.getAppServer();
      }
    }

    pages = new Pages(appServer);

    driver = seleniumExtension.getDriver();
    wait = seleniumExtension::waitUntil;
    shortWait = seleniumExtension::shortWaitUntil;

    if (driver != null) {
      driver.get("about:blank");
      driver.get(pages.blankPage);
      driver.manage().deleteAllCookies();
    }
  }

  @AfterEach
  public void quitLocalDriver() {
    if (localDriver != null) {
      try {
        localDriver.quit();
      } catch (NoSuchSessionException e) {
        // Driver already quit
      } catch (RuntimeException e) {
        LOG.log(Level.SEVERE, "Failed to quit browser: ", e);
        // fall through
      }
    }
  }

  public void createNewDriver(Capabilities capabilities) {
    driver = seleniumExtension.createNewDriver(capabilities);
    wait = seleniumExtension::waitUntil;
    shortWait = seleniumExtension::shortWaitUntil;
  }

  public void removeDriver() {
    seleniumExtension.removeDriver();
  }

  public String toLocalUrl(String url) {
    try {
      URL original = new URL(url);
      return new URL(original.getProtocol(), "localhost", original.getPort(), original.getFile())
          .toString();
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  protected WebDriverWait wait(WebDriver driver) {
    return new WebDriverWait(driver, Duration.ofSeconds(10));
  }
}
