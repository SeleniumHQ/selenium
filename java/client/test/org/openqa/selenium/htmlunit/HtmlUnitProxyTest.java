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

package org.openqa.selenium.htmlunit;

import com.gargoylesoftware.htmlunit.ProxyConfig;

import org.junit.Test;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.remote.DesiredCapabilities;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.CapabilityType.PROXY;

import java.util.ArrayList;

/**
 * Test the proxy setting.
 */
public class HtmlUnitProxyTest {

  @Test
  public void testProxyAsCapability() {
    DesiredCapabilities capabilities = new DesiredCapabilities("foo", "1", Platform.LINUX);
    Proxy proxy = new Proxy().setHttpProxy("http.proxy");
    capabilities.setCapability(PROXY, proxy);

    HtmlUnitDriver driver = new HtmlUnitDriver(capabilities);
    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("http.proxy", config.getProxyHost());

    driver.quit();
  }

  @Test
  public void testManualHttpProxy() {
    Proxy proxy = new Proxy().setHttpProxy("http.proxy:1234");

    HtmlUnitDriver driver = new HtmlUnitDriver();
    driver.setProxySettings(proxy);

    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("http.proxy", config.getProxyHost());
    assertEquals(1234, config.getProxyPort());
    assertFalse(config.isSocksProxy());

    driver.quit();
  }

  @Test
  public void testManualHttpProxyDirectly() {

    HtmlUnitDriver driver = new HtmlUnitDriver();
    driver.setProxy("http.proxy", 1234);

    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("http.proxy", config.getProxyHost());
    assertEquals(1234, config.getProxyPort());
    assertFalse(config.isSocksProxy());

    driver.quit();
  }


  @Test
  public void testManualHttpProxyWithNoProxy() {
    Proxy proxy = new Proxy().setHttpProxy("http.proxy").
        setNoProxy("localhost, 127.0.0.1");

    HtmlUnitDriver driver = new HtmlUnitDriver();
    driver.setProxySettings(proxy);

    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("http.proxy", config.getProxyHost());
    assertEquals(0, config.getProxyPort());
    assertFalse(config.isSocksProxy());

    driver.quit();
  }

  @Test
  public void testManualHttpProxyWithNoProxyDirectly() {

    HtmlUnitDriver driver = new HtmlUnitDriver();

    ArrayList<String> noProxy = new ArrayList<>();
    noProxy.add("localhost");
    noProxy.add("127.0.0.1");
    driver.setHTTPProxy("http.proxy", 0, noProxy);

    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("http.proxy", config.getProxyHost());
    assertEquals(0, config.getProxyPort());
    assertFalse(config.isSocksProxy());

    driver.quit();
  }


  @Test
  public void testManualSocksProxy() {
    Proxy proxy = new Proxy().setSocksProxy("socks.proxy:1234");

    HtmlUnitDriver driver = new HtmlUnitDriver();
    driver.setProxySettings(proxy);

    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("socks.proxy", config.getProxyHost());
    assertEquals(1234, config.getProxyPort());
    assertTrue(config.isSocksProxy());

    driver.quit();
  }

  @Test
  public void testManualSocksProxyDirectly() {

    HtmlUnitDriver driver = new HtmlUnitDriver();
    driver.setSocksProxy("socks.proxy", 1234);

    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("socks.proxy", config.getProxyHost());
    assertEquals(1234, config.getProxyPort());
    assertTrue(config.isSocksProxy());

    driver.quit();
  }


  @Test
  public void testManualSocksProxyWithNoProxy() {
    Proxy proxy = new Proxy().setSocksProxy("socks.proxy").
        setNoProxy("localhost");

    HtmlUnitDriver driver = new HtmlUnitDriver();
    driver.setProxySettings(proxy);

    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("socks.proxy", config.getProxyHost());
    assertEquals(0, config.getProxyPort());
    assertTrue(config.isSocksProxy());

    driver.quit();
  }

  @Test
  public void testManualSocksProxyWithNoProxyDirectly() {
    HtmlUnitDriver driver = new HtmlUnitDriver();
    ArrayList<String> noProxy = new ArrayList<>();
    noProxy.add("localhost");
    driver.setSocksProxy("socks.proxy", 0, noProxy);

    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("socks.proxy", config.getProxyHost());
    assertEquals(0, config.getProxyPort());
    assertTrue(config.isSocksProxy());

    driver.quit();
  }


  @Test
  public void testPACProxy() {
    Proxy proxy = new Proxy().setProxyAutoconfigUrl("http://aaa/bb.pac");

    HtmlUnitDriver driver = new HtmlUnitDriver();
    driver.setProxySettings(proxy);

    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("http://aaa/bb.pac", config.getProxyAutoConfigUrl());

    driver.quit();
  }

  @Test
  public void testPACProxyDirectly() {
    HtmlUnitDriver driver = new HtmlUnitDriver();
    driver.setAutoProxy("http://aaa/bb.pac");

    ProxyConfig config = driver.getWebClient().getOptions().getProxyConfig();

    assertEquals("http://aaa/bb.pac", config.getProxyAutoConfigUrl());

    driver.quit();
  }

}
