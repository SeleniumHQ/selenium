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

package org.openqa.selenium.grid.e2e;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import org.assertj.core.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.grid.Bootstrap;
import org.openqa.selenium.remote.RemoteWebDriver;

public class SessionTimeoutTest {
  @Test
  void testSessionTimeout() throws Exception {
    Assumptions.assumeThat(System.getProperty("webdriver.chrome.binary")).isNull();
    Bootstrap.main(("hub --host 127.0.0.1 --port 4444").split(" "));
    Bootstrap.main(
        ("node --host 127.0.0.1 --port 5555 --session-timeout 12 --selenium-manager true")
            .split(" "));

    var options = new ChromeOptions();
    options.addArguments("--disable-search-engine-choice-screen");
    options.addArguments("--headless=new");

    WebDriver driver = new RemoteWebDriver(URI.create("http://localhost:4444").toURL(), options);
    driver.get("http://localhost:4444");
    Thread.sleep(12000);
    NoSuchSessionException exception = assertThrows(NoSuchSessionException.class, driver::getTitle);
    assertTrue(exception.getMessage().startsWith("Cannot find session with id:"));
  }
}
