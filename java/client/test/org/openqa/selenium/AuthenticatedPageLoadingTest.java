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

package org.openqa.selenium;

import org.junit.Test;
import org.openqa.selenium.security.UserAndPassword;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.alertToBePresent;

@Ignore
public class AuthenticatedPageLoadingTest extends JUnit4TestBase {

  @Test
  public void canAuthenticateUsingBasicAuthentication() {
    String url = appServer.whereIs("basicAuth");
    driver.get(url);

    Alert alert = waitFor(alertToBePresent(driver));

    UserAndPassword user = new UserAndPassword("test", "test");

    alert.authenticateUsing(user);

    assertEquals("authorized", driver.findElement(By.tagName("h1")).getText());
  }

  @Test
  public void canAuthenticateUsingDigestAuthentication() {

  }

}
