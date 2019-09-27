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

package com.thoughtworks.selenium;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeTrue;

import com.thoughtworks.selenium.testing.SeleniumTestEnvironment;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.net.MalformedURLException;
import java.net.URL;

public class SessionExtensionJsTest {

  private static SeleniumTestEnvironment environment;
  private Selenium privateSelenium;

  private static final String TEST_URL = "tests/html/test_click_page1.html";

  @BeforeClass
  public static void startEnvironment() {
    environment = new SeleniumTestEnvironment();
  }

  @AfterClass
  public static void stopEnvironment() {
    environment.stop();
  }

  @Before
  public void privateSetUp() throws MalformedURLException {
    // Only makes sense to do this for RC
    assumeTrue(Boolean.getBoolean("selenium.browser.selenium"));

    String browserName = System.getProperty("selenium.browser");
    assumeTrue(browserName != null && browserName.startsWith("*"));

    String baseUrl = environment.getAppServer().whereIs("/selenium-server/");
    URL url = new URL(baseUrl);

    privateSelenium = new DefaultSelenium(url.getHost(), url.getPort(), browserName, baseUrl);
  }

  @After
  public void privateTearDown() {
    if (privateSelenium != null) {
      privateSelenium.stop();
    }
  }

  @Test
  public void expectFailureWhenExtensionNotSet() {
    try {
      runCommands(privateSelenium);
      fail("Expected SeleniumException but none was encountered");
    } catch (SeleniumException se) {
      assertTrue(se.getMessage().endsWith("comeGetSome is not defined"));
    }
  }

  @Test
  public void loadSimpleExtensionJs() {
    // everything is peachy when the extension is set
    privateSelenium.setExtensionJs("var comeGetSome = 'in';");
    runCommands(privateSelenium);
    assertEquals("Click Page Target", privateSelenium.getTitle());
    privateSelenium.stop();

    // reusing the session ... extension should still be available
    runCommands(privateSelenium);
    assertEquals("Click Page Target", privateSelenium.getTitle());
  }

  private void runCommands(Selenium selenium) {
    selenium.start();
    selenium.open(TEST_URL);
    selenium.click("javascript{ 'l' + comeGetSome + 'k' }");
    selenium.waitForPageToLoad("5000");
  }
}
