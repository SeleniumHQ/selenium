/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;

public class AlertsTest extends AbstractDriverTestCase {

  private String alertPage;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    TestEnvironment environment = GlobalTestEnvironment.get();
    alertPage = environment.getAppServer().whereIs("alerts.html");
  }

  @JavascriptEnabled
  @Ignore({IE, IPHONE})
  public void testShouldBeAbleToOverrideTheWindowAlertMethod() {
    driver.get(alertPage);

    ((JavascriptExecutor) driver).executeScript(
        "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
    driver.findElement(By.id("alert")).click();
  }
}
