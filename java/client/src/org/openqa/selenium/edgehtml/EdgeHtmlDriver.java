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
package org.openqa.selenium.edgehtml;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.service.DriverCommandExecutor;

/**
 * A {@link WebDriver} implementation that controls an Edge browser running on the local machine.
 * This class is provided as a convenience for easily testing the Edge browser. The control server
 * which each instance communicates with will live and die with the instance.
 *
 * To avoid unnecessarily restarting the Microsoft WebDriver server with each instance, use a
 * {@link RemoteWebDriver} coupled with the desired {@link EdgeHtmlDriverService}, which is managed
 * separately. For example: <pre>{@code
 *
 * import org.junit.jupiter.api.*;
 * import org.openqa.selenium.By;
 * import org.openqa.selenium.WebDriver;
 * import org.openqa.selenium.WebDriverException;
 * import org.openqa.selenium.WebElement;
 * import org.openqa.selenium.edgehtml.EdgeHtmlDriverService;
 * import org.openqa.selenium.edgehtml.EdgeHtmlOptions;
 * import org.openqa.selenium.remote.RemoteWebDriver;
 * import org.openqa.selenium.remote.service.DriverService;
 *
 * import java.io.IOException;
 * import java.util.ServiceLoader;
 * import java.util.stream.StreamSupport;
 *
 * import static org.junit.jupiter.api.Assertions.assertEquals;
 *
 * public class EdgeHtmlTest {
 *
 *     private static EdgeHtmlDriverService service;
 *     private WebDriver driver;
 *
 *     {@Literal @BeforeAll}
 *     public static void createAndStartService() {
 *         EdgeHtmlDriverService.Builder builder = new EdgeHtmlDriverService.Builder();
 *         service = builder.build();
 *         try {
 *             service.start();
 *         }
 *         catch (IOException e) {
 *             throw new RuntimeException(e);
 *         }
 *     }
 *
 *     {@Literal @AfterAll}
 *     public static void createAndStopService() {
 *         service.stop();
 *     }
 *
 *     {@Literal @BeforeEach}
 *     public void createDriver() {
 *         driver = new RemoteWebDriver(service.getUrl(),
 *                 new EdgeHtmlOptions());
 *     }
 *
 *     {@Literal @AfterEach}
 *     public void quitDriver() {
 *         driver.quit();
 *     }
 *
 *     {@Literal @Test}
 *     public void testBingSearch() {
 *         driver.get("http://www.bing.com");
 *         WebElement searchBox = driver.findElement(By.name("q"));
 *         searchBox.sendKeys("webdriver");
 *         searchBox.submit();
 *         assertEquals("webdriver - Bing", driver.getTitle());
 *     }
 * }}</pre>
 */
public class EdgeHtmlDriver extends RemoteWebDriver {

  public EdgeHtmlDriver() { this(new EdgeHtmlOptions()); }

  public EdgeHtmlDriver(EdgeHtmlOptions options) {
    this(new EdgeHtmlDriverService.Builder().build(), options);
  }

  public EdgeHtmlDriver(EdgeHtmlDriverService service) {
    this(service, new EdgeHtmlOptions());
  }

  public EdgeHtmlDriver(EdgeHtmlDriverService service, EdgeHtmlOptions options) {
    super(new DriverCommandExecutor(service), Require.nonNull("Driver options", options));
  }
}
