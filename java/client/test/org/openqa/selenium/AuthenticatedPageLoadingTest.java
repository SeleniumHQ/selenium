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

package org.openqa.selenium;

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;

import org.junit.Test;
import org.openqa.selenium.security.Credentials;
import org.openqa.selenium.security.UserAndPassword;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

@Ignore(CHROME)
@Ignore(FIREFOX)
@Ignore(HTMLUNIT)
@Ignore(IE)
@Ignore(MARIONETTE)
@Ignore(PHANTOMJS)
@Ignore(SAFARI)
public class AuthenticatedPageLoadingTest extends JUnit4TestBase {

  @Test
  public void canAuthenticateUsingBasicAuthentication() {
    String url = appServer.whereIs("basicAuth");
    driver.get(url);

    Alert alert = wait.until(alertIsPresent());

    Credentials user = new UserAndPassword("test", "test");

    alert.authenticateUsing(user);

	WebElement element = wait.until(presenceOfElementLocated(By.tagName("h1")));
    assertEquals("authorized", element.getText());
  }

  @Test
  public void canAuthenticateUsingDigestAuthentication() {

  }

}
