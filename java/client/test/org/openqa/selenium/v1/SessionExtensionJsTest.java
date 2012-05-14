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


package org.openqa.selenium.v1;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.InternalSelenseTestBase;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;

public class SessionExtensionJsTest extends InternalSelenseTestBase {

  private Selenium privateSelenium;
  private String host, browser;
  private int port;

  private static final String TEST_URL =
      "http://localhost:4444/selenium-server/tests/html/test_click_page1.html";

  @BeforeMethod
  @Parameters({"selenium.host", "selenium.port", "selenium.browser"})
  public void privateSetUp(@Optional("localhost") String host, @Optional("4444") String port,
      @Optional String browser) {
    if (browser == null) browser = runtimeBrowserString();
    this.host = host;
    this.port = Integer.parseInt(port);
    this.browser = browser;
    privateSelenium = getNewSelenium();
  }

  @AfterMethod(alwaysRun = true)
  public void privateTearDown() {
    if (privateSelenium != null) privateSelenium.stop();
  }

  @Test(dataProvider = "system-properties")
  public void expectFailureWhenExtensionNotSet() {
    try {
      runCommands(privateSelenium);
      fail("Expected SeleniumException but none was encountered");
    } catch (SeleniumException se) {
      assertTrue(se.getMessage().endsWith("comeGetSome is not defined"));
    }
  }

  @Test(dataProvider = "system-properties")
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

  private Selenium getNewSelenium() {
    return new DefaultSelenium(host, port, browser, TEST_URL);
  }

  private void runCommands(Selenium selenium) {
    selenium.start();
    selenium.open(TEST_URL);
    selenium.click("javascript{ 'l' + comeGetSome + 'k' }");
    selenium.waitForPageToLoad("5000");
  }

}
