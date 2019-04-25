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

package org.openqa.selenium.msedge;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chromium.ChromiumDriver;
import org.openqa.selenium.chromium.ChromiumDriverCommandExecutor;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.remote.RemoteWebDriver;

/**
 * A {@link WebDriver} implementation that controls a MSEdge browser running on the local machine.
 * This class is provided as a convenience for easily testing the MSEdge browser. The control server
 * which each instance communicates with will live and die with the instance.
 *
 * To avoid unnecessarily restarting the MSEdgeDriver server with each instance, use a
 * {@link RemoteWebDriver} coupled with the desired {@link MSEdgeDriverService}, which is managed
 * separately. For example: <pre>{@code
 *
 * import static org.junit.Assert.assertEquals;
 *
 * import org.junit.*;
 * import org.junit.runner.RunWith;
 * import org.junit.runners.JUnit4;
 * import org.openqa.selenium.msedge.MSEdgeDriverService;
 * import org.openqa.selenium.remote.DesiredCapabilities;
 * import org.openqa.selenium.remote.RemoteWebDriver;
 *
 * {@literal @RunWith(JUnit4.class)}
 * public class MSEdgeTest extends TestCase {
 *
 *   private static MSEdgeDriverService service;
 *   private WebDriver driver;
 *
 *   {@literal @BeforeClass}
 *   public static void createAndStartService() {
 *     service = new MSEdgeDriverService.Builder()
 *         .usingDriverExecutable(new File("path/to/my/msedgedriver.exe"))
 *         .usingAnyFreePort()
 *         .build();
 *     service.start();
 *   }
 *
 *   {@literal @AfterClass}
 *   public static void createAndStopService() {
 *     service.stop();
 *   }
 *
 *   {@literal @Before}
 *   public void createDriver() {
 *     driver = new RemoteWebDriver(service.getUrl(),
 *         DesiredCapabilities.msedge());
 *   }
 *
 *   {@literal @After}
 *   public void quitDriver() {
 *     driver.quit();
 *   }
 *
 *   {@literal @Test}
 *   public void testBingSearch() {
 *     driver.get("http://www.bing.com");
 *     WebElement searchBox = driver.findElement(By.name("q"));
 *     searchBox.sendKeys("webdriver");
 *     searchBox.quit();
 *     assertEquals("webdriver - Bing", driver.getTitle());
 *   }
 * }
 * }</pre>
 *
 * Note that unlike MSEdgeDriver, RemoteWebDriver doesn't directly implement
 * role interfaces such as {@link LocationContext} and {@link WebStorage}.
 * Therefore, to access that functionality, it needs to be
 * {@link org.openqa.selenium.remote.Augmenter augmented} and then cast
 * to the appropriate interface.
 *
 * @see MSEdgeDriverService#createDefaultService
 */
public class MSEdgeDriver extends ChromiumDriver {

  /**
   * Creates a new MSEdgeDriver using the {@link MSEdgeDriverService#createDefaultService default}
   * server configuration.
   *
   * @see #MSEdgeDriver(MSEdgeDriverService, MSEdgeOptions)
   */
  public MSEdgeDriver() {
    this(MSEdgeDriverService.createDefaultService(), new MSEdgeOptions());
  }

  /**
   * Creates a new MSEdgeDriver instance. The {@code service} will be started along with the driver,
   * and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @see RemoteWebDriver#RemoteWebDriver(org.openqa.selenium.remote.CommandExecutor, Capabilities)
   */
  public MSEdgeDriver(MSEdgeDriverService service) {
    this(service, new MSEdgeOptions());
  }

  /**
   * Creates a new MSEdgeDriver instance. The {@code capabilities} will be passed to the
   * MSEdgeDriver service.
   *
   * @param capabilities The capabilities required from the MSEdgeDriver.
   * @see #MSEdgeDriver(MSEdgeDriverService, Capabilities)
   * @deprecated Use {@link MSEdgeDriver(MSEdgeOptions)} instead.
   */
  @Deprecated
  public MSEdgeDriver(Capabilities capabilities) {
    this(MSEdgeDriverService.createDefaultService(), capabilities);
  }

  /**
   * Creates a new MSEdgeDriver instance with the specified options.
   *
   * @param options The options to use.
   * @see #MSEdgeDriver(MSEdgeDriverService, MSEdgeOptions)
   */
  public MSEdgeDriver(MSEdgeOptions options) {
    this(MSEdgeDriverService.createDefaultService(), options);
  }

  /**
   * Creates a new MSEdgeDriver instance with the specified options. The {@code service} will be
   * started along with the driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @param options The options to use.
   */
  public MSEdgeDriver(MSEdgeDriverService service, MSEdgeOptions options) {
    this(service, (Capabilities) options);
  }

  /**
   * Creates a new MSEdgeDriver instance. The {@code service} will be started along with the
   * driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service      The service to use.
   * @param capabilities The capabilities required from the MSEdgeDriver.
   * @deprecated Use {@link MSEdgeDriver(MSEdgeDriverService, MSEdgeOptions)} instead.
   */
  @Deprecated
  public MSEdgeDriver(MSEdgeDriverService service, Capabilities capabilities) {
    super(new ChromiumDriverCommandExecutor(service), capabilities);
  }
}
