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

package org.openqa.selenium.rc;

import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.testing.Driver.IE;

import com.google.common.io.Files;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.Pages;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.ProxyServer;
import org.openqa.selenium.testing.SeleniumTestRunner;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.BrowserToCapabilities;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;

@RunWith(SeleniumTestRunner.class)
@Ignore(IE)
public class SetProxyTest {

  private static Pages pages;
  private ProxyServer proxyServer;

  @BeforeClass
  public static void startProxy() {
    TestEnvironment environment = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    pages = new Pages(environment.getAppServer());
  }

  @Before
  public void newProxyInstance() {
    proxyServer = new ProxyServer();
  }

  @After
  public void deleteProxyInstance() {
    proxyServer.destroy();
  }

  @Test
  public void shouldAllowProxyToBeSetViaTheCapabilities() {
    Proxy proxy = proxyServer.asProxy();

    DesiredCapabilities caps = BrowserToCapabilities.of(Browser.detect());
    if (caps == null) {
      caps = new DesiredCapabilities();
    }
    caps.setCapability(PROXY, proxy);

    WebDriver driver = new WebDriverBuilder().setDesiredCapabilities(caps).get();

    driver.get(pages.simpleTestPage);
    driver.quit();

    assertTrue(proxyServer.hasBeenCalled("simpleTest.html"));
  }

  @Test
  public void shouldAllowProxyToBeConfiguredAsAPac() throws IOException {
    String pac = String.format(
        "function FindProxyForURL(url, host) {\n" +
        "  return 'PROXY %s';\n" +
        "}", proxyServer.getBaseUrl());
    TemporaryFilesystem tempFs = TemporaryFilesystem.getDefaultTmpFS();
    File base = tempFs.createTempDir("proxy", "test");
    File pacFile = new File(base, "proxy.pac");
    // Use the default platform charset because otherwise IE gets upset. Apparently.
    Files.write(pac, pacFile, Charset.defaultCharset());

    String autoConfUrl = pacFile.toURI().toString();

    Proxy proxy = new Proxy();
    proxy.setProxyAutoconfigUrl(autoConfUrl);

    DesiredCapabilities caps = BrowserToCapabilities.of(Browser.detect());
    if (caps == null) {
      caps = DesiredCapabilities.firefox();
    }
    caps.setCapability(PROXY, proxy);

    WebDriver driver = new WebDriverBuilder().setDesiredCapabilities(caps).get();

    driver.get(pages.simpleTestPage);
    driver.quit();
    tempFs.deleteTemporaryFiles();

    assertTrue(proxyServer.hasBeenCalled("simpleTest.html"));
  }
}
