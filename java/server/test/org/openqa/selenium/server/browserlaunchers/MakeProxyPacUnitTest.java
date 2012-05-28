/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.server.browserlaunchers;

import static org.junit.Assert.assertEquals;

import com.google.common.io.Files;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.LauncherUtils;
import org.openqa.selenium.browserlaunchers.Proxies;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;

public class MakeProxyPacUnitTest {

  private File parentDir, pacFile;
  private boolean proxySeleniumTrafficOnly = true;
  private boolean avoidProxy = false;
  private String httpProxyHost = null;
  private String httpProxyPort = null;
  private String httpNonProxyHosts = null;

  @Before
  public void setUp() {
    parentDir = LauncherUtils.createCustomProfileDir("LauncherUtilsUnitTest");
    pacFile = new File(parentDir, "proxy.pac");
  }

  @After
  public void tearDown() {
    LauncherUtils.recursivelyDeleteDir(parentDir);
  }

  private String makeProxyPAC() throws IOException {
    Capabilities options = BrowserOptions.newBrowserOptions();
    options = Proxies.setOnlyProxySeleniumTraffic(options, proxySeleniumTrafficOnly);
    options = Proxies.setAvoidProxy(options, avoidProxy);
    Proxies.makeProxyPAC(parentDir, 4444, httpProxyHost, httpProxyPort,
        httpNonProxyHosts, options);
    return readEntirePacFile();
  }

  private String readEntirePacFile() throws IOException {
    String pac = Files.toString(pacFile, Charset.defaultCharset());
    return pac.replaceAll("\\s+", " ").trim();
  }

  @Test
  public void testBasic() throws IOException {
    proxySeleniumTrafficOnly = false;
    String pac = makeProxyPAC();
    String expected = "function FindProxyForURL(url, host) " +
        "{ return 'PROXY localhost:4444; DIRECT'; }";
    assertEquals(expected, pac);
  }

  @Test
  public void testNeverProxySeleniumTrafficOnly() throws IOException {
    proxySeleniumTrafficOnly = false;
    String pac = makeProxyPAC();
    String expected = "function FindProxyForURL(url, host) " +
        "{ return 'PROXY localhost:4444; DIRECT'; }";
    assertEquals(expected, pac);
  }

  @Test
  public void testAvoidProxyNeverProxySeleniumTrafficOnly() throws IOException {
    proxySeleniumTrafficOnly = false;
    avoidProxy = true;
    String pac = makeProxyPAC();
    String expected = "function FindProxyForURL(url, host) " +
        "{ return 'PROXY localhost:4444; DIRECT'; }";
    assertEquals(expected, pac);
  }

  @Test
  public void testAvoidProxy() throws IOException {
    avoidProxy = true;
    String pac = makeProxyPAC();
    String expected =
        "function FindProxyForURL(url, host) "
            +
            "{ if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:4444; DIRECT'; } }";
    assertEquals(expected, pac);
  }

  @Test
  public void testConfiguredProxy() throws IOException {
    proxySeleniumTrafficOnly = false;
    httpProxyHost = "foo";
    String pac = makeProxyPAC();
    String expected = "function FindProxyForURL(url, host) " +
        "{ return 'PROXY localhost:4444; PROXY foo'; }";
    assertEquals(expected, pac);
  }

  @Test
  public void testConfiguredProxyAvoidProxy() throws IOException {
    httpProxyHost = "foo";
    avoidProxy = true;
    String pac = makeProxyPAC();
    String expected =
        "function FindProxyForURL(url, host) "
            +
            "{ if (shExpMatch(url, '*/selenium-server/*')) { return 'PROXY localhost:4444; PROXY foo'; } return 'PROXY foo'; }";
    assertEquals(expected, pac);
  }

  @Test
  public void testAvoidProxyNonProxyHost() throws IOException {
    avoidProxy = true;
    httpNonProxyHosts = "www.google.com";
    String pac = makeProxyPAC();
    String expected = "function FindProxyForURL(url, host) { "
        + "if (shExpMatch(host, 'www.google.com')) { return 'DIRECT'; } "
        + "if (shExpMatch(url, '*/selenium-server/*')) "
        + "{ return 'PROXY localhost:4444; DIRECT'; } }";
    assertEquals(expected, pac);
  }

  @Test
  public void testConfiguredProxyAvoidProxyNonProxyHost() throws IOException {
    avoidProxy = true;
    httpProxyHost = "foo";
    httpNonProxyHosts = "www.google.com";
    String pac = makeProxyPAC();
    String expected = "function FindProxyForURL(url, host) { "
        + "if (shExpMatch(host, 'www.google.com')) { return 'DIRECT'; } "
        + "if (shExpMatch(url, '*/selenium-server/*')) { "
        + "return 'PROXY localhost:4444; PROXY foo'; } return 'PROXY foo'; }";
    assertEquals(expected, pac);
  }

  @Test
  public void testAvoidProxyNonProxyHosts() throws IOException {
    avoidProxy = true;
    httpNonProxyHosts = "www.google.com|*.yahoo.com";
    String pac = makeProxyPAC();
    String expected = "function FindProxyForURL(url, host) { "
        + "if (shExpMatch(host, 'www.google.com')) { return 'DIRECT'; } "
        + "if (shExpMatch(host, '*.yahoo.com')) { return 'DIRECT'; } "
        + "if (shExpMatch(url, '*/selenium-server/*')) { "
        + "return 'PROXY localhost:4444; DIRECT'; } }";
    assertEquals(expected, pac);
  }

  @Test
  public void testConfiguredProxyAvoidProxyNonProxyHosts() throws IOException {
    avoidProxy = true;
    httpProxyHost = "foo";
    httpNonProxyHosts = "www.google.com|*.yahoo.com";
    String pac = makeProxyPAC();
    String expected = "function FindProxyForURL(url, host) { "
        + "if (shExpMatch(host, 'www.google.com')) { return 'DIRECT'; } "
        + "if (shExpMatch(host, '*.yahoo.com')) { return 'DIRECT'; } "
        + "if (shExpMatch(url, '*/selenium-server/*')) "
        + "{ return 'PROXY localhost:4444; PROXY foo'; } return 'PROXY foo'; }";
    assertEquals(expected, pac);
  }
}
