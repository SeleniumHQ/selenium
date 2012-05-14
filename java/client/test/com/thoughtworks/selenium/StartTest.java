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

package com.thoughtworks.selenium;

import static org.junit.Assert.assertEquals;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.v1.SeleniumTestEnvironment;

import java.net.MalformedURLException;
import java.net.URL;

public class StartTest {

  private static URL url;
  private static SeleniumTestEnvironment env;
  private static String root;

  @BeforeClass
  public static void startSelenium() throws MalformedURLException {
    env = new SeleniumTestEnvironment();
    root = env.getAppServer().whereIs("/");
    url = new URL(root);
  }

  @AfterClass
  public static void killSeleniumServer() {
    env.stop();
  }

  @Test
  public void shouldBeAbleToPassCapabilitiesWithoutDetonating() {
    DefaultSelenium selenium = new DefaultSelenium(
        url.getHost(), url.getPort(), "*firefox", root);

    try {
      selenium.start(DesiredCapabilities.firefox());
      // No exception is a good thing
    } finally {
      selenium.stop();
    }
  }
  
  @Test
  public void shouldBeAbleToCreateAWebDriverBackedSeleniumInstance() throws MalformedURLException {
    URL wdServer = new URL(String.format("http://%s:%d/wd/hub", url.getHost(), url.getPort()));
    WebDriver driver = new RemoteWebDriver(wdServer, DesiredCapabilities.firefox());
    Capabilities capabilities = ((HasCapabilities) driver).getCapabilities();

    DefaultSelenium selenium = new DefaultSelenium(
        url.getHost(), url.getPort(), "*webdriver", root);

    try {
      selenium.start(capabilities);
      selenium.open(wdServer.toString());

      String seleniumTitle = selenium.getTitle();
      String title = driver.getTitle();

      assertEquals(title, seleniumTitle);
    } finally {
      selenium.stop();
      // This isn't handled elegantly yet
//      driver.quit();
    }
  }
}
