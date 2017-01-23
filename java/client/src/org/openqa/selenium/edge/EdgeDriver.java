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
package org.openqa.selenium.edge;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.service.DriverCommandExecutor;

/**
 * A {@link WebDriver} implementation that controls a Edge browser running on the local machine.
 * This class is provided as a convenience for easily testing the Edge browser. The control server
 * which each instance communicates with will live and die with the instance.
 *
 * To avoid unnecessarily restarting the MicrosoftEdgeDriver server with each instance, use a
 * {@link RemoteWebDriver} coupled with the desired {@link EdgeDriverService}, which is managed
 * separately. For example: <pre>{@code
 *
 * import static org.junit.Assert.assertEquals;
 *
 * import org.junit.*;
 * import org.junit.runner.RunWith;
 * import org.junit.runners.JUnit4;
 * import org.openqa.selenium.edge.EdgeDriverService;
 * import org.openqa.selenium.remote.DesiredCapabilities;
 * import org.openqa.selenium.remote.RemoteWebDriver;
 *
 * {@literal @RunWith(JUnit4.class)}
 * public class EdgeTest extends TestCase {
 *
 *   private static EdgeDriverService service;
 *   private WebDriver driver;
 *
 *   {@literal @BeforeClass}
 *   public static void createAndStartService() {
 *     service = new EdgeDriverService.Builder()
 *         .usingDriverExecutable(new File("path/to/my/MicrosoftWebDriver.exe"))
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
 *         DesiredCapabilities.edge());
 *   }
 *
 *   {@literal @After}
 *   public void quitDriver() {
 *     driver.quit();
 *   }
 *
 *   {@literal @Test}
 *   public void testGoogleSearch() {
 *     driver.get("http://www.google.com");
 *     WebElement searchBox = driver.findElement(By.name("q"));
 *     searchBox.sendKeys("webdriver");
 *     searchBox.quit();
 *     assertEquals("webdriver - Google Search", driver.getTitle());
 *   }
 * }
 * }</pre>
 *
 *
 * @see EdgeDriverService#createDefaultService
 */
public class EdgeDriver extends RemoteWebDriver {

	  /**
	   * Creates a new EdgeDriver using the {@link EdgeDriverService#createDefaultService default}
	   * server configuration.
	   *
	   * @see #EdgeDriver(EdgeDriverService, EdgeOptions)
	   */
	  public EdgeDriver() {
		    this(EdgeDriverService.createDefaultService(), new EdgeOptions());
		  }

	  /**
	   * Creates a new EdgeDriver instance. The {@code service} will be started along with the driver,
	   * and shutdown upon calling {@link #quit()}.
	   *
	   * @param service The service to use.
	   * @see #EdgeDriver(EdgeDriverService, EdgeOptions)
	   */
	  public EdgeDriver(EdgeDriverService service) {
	    this(service, new EdgeOptions());
	  }

	  /**
	   * Creates a new EdgeDriver instance. The {@code capabilities} will be passed to the
	   * edgedriver service.
	   *
	   * @param capabilities The capabilities required from the EdgeDriver.
	   * @see #EdgeDriver(EdgeDriverService, Capabilities)
	   */
	  public EdgeDriver(Capabilities capabilities) {
	    this(EdgeDriverService.createDefaultService(), capabilities);
	  }

	  /**
	   * Creates a new EdgeDriver instance with the specified options.
	   *
	   * @param options The options to use.
	   * @see #EdgeDriver(EdgeDriverService, EdgeOptions)
	   */
	  public EdgeDriver(EdgeOptions options) {
	    this(EdgeDriverService.createDefaultService(), options);
	  }

	  /**
	   * Creates a new EdgeDriver instance with the specified options. The {@code service} will be
	   * started along with the driver, and shutdown upon calling {@link #quit()}.
	   *
	   * @param service The service to use.
	   * @param options The options to use.
	   */
	  public EdgeDriver(EdgeDriverService service, EdgeOptions options) {
	    this(service, options.toCapabilities());
	  }
	  
	  /**
	   * Creates a new EdgeDriver instance. The {@code service} will be started along with the
	   * driver, and shutdown upon calling {@link #quit()}.
	   *
	   * @param service The service to use.
	   * @param capabilities The capabilities required from the EdgeDriver.
	   */
	  public EdgeDriver(EdgeDriverService service, Capabilities capabilities) {
	    super(new DriverCommandExecutor(service), capabilities);
	  }
}
