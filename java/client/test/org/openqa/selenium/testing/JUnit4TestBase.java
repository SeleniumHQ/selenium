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

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.runner.RunWith;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.support.ui.Wait;

import static org.assertj.core.api.Assumptions.assumeThat;

@RunWith(SeleniumTestRunner.class)
public abstract class JUnit4TestBase {

  @Rule
  public SeleniumTestRule seleniumTestRule = new SeleniumTestRule();

  protected TestEnvironment environment;
  protected AppServer appServer;
  protected Pages pages;
  protected WebDriver driver;
  protected Wait<WebDriver> wait;
  protected Wait<WebDriver> shortWait;

  @BeforeClass
  public static void shouldTestBeRunAtAll() {
    assumeThat(Boolean.getBoolean("selenium.skiptest")).isFalse();
  }

  @Before
  public void prepareEnvironment() {
    environment = GlobalTestEnvironment.getOrCreate(InProcessTestEnvironment::new);
    appServer = environment.getAppServer();

    pages = new Pages(appServer);

    driver = seleniumTestRule.getDriver();
    wait = seleniumTestRule::waitUntil;
    shortWait = seleniumTestRule::shortWaitUntil;
  }

  public void createNewDriver(Capabilities capabilities) {
    driver = seleniumTestRule.createNewDriver(capabilities);
    wait = seleniumTestRule::waitUntil;
    shortWait = seleniumTestRule::shortWaitUntil;
  }

  public void removeDriver() {
    seleniumTestRule.removeDriver();
  }
}
