/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNot.not;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.internal.FindsByCssSelector;

import junit.framework.TestCase;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class AbstractDriverTestCase extends TestCase implements NeedsDriver {

  protected TestEnvironment environment;
  protected AppServer appServer;
  protected WebDriver driver;
  protected Pages pages;

  public void setDriver(WebDriver driver) {
    this.driver = driver;
  }

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    environment = GlobalTestEnvironment.get();
    appServer = environment.getAppServer();

    pages = new Pages(appServer);

    String hostName = environment.getAppServer().getHostName();
    String alternateHostName = environment.getAppServer().getAlternateHostName();

    assertThat(hostName, is(not(equalTo(alternateHostName))));
  }

  protected boolean isIeDriverTimedOutException(IllegalStateException e) {
    // The IE driver may throw a timed out exception
    return e.getClass().getName().contains("TimedOutException");
  }

  protected boolean browserNeedsFocusOnThisOs(WebDriver driver) {
    // No browser yet demands focus on windows
    if (Platform.getCurrent().is(Platform.WINDOWS))
      return false;

    if (Boolean.getBoolean("webdriver.focus.override")) {
      return false;
    }

    String browserName = getBrowserName(driver);
    return browserName.toLowerCase().contains("firefox");
  }

  // It's methods like this that make me think we need a "HasCapabilities" interface
  private String getBrowserName(WebDriver driver) {
    try {
    // is there a "getCababilities" method?
    Method getCapabilities = driver.getClass().getMethod("getCapabilities");
    Object capabilities = getCapabilities.invoke(driver);
    return (String) capabilities.getClass().getMethod("getBrowserName") .invoke(capabilities);
    } catch (NoSuchMethodException e) {
      // Fall through
    } catch (IllegalAccessException e) {
      // Fall through
    } catch (InvocationTargetException e) {
      // Fall through
    }

    return driver.getClass().getName();
  }
  
  protected Boolean supportsSelectorApi() {
    //Assumes a page is loaded on which javascript can be executed
    return driver instanceof FindsByCssSelector &&
        (Boolean) ((JavascriptExecutor) driver).executeScript(
        "return document['querySelector'] !== undefined;");
  }
}
