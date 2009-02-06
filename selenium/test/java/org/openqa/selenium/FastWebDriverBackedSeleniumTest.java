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

import org.jmock.Expectations;
import org.jmock.integration.junit3.MockObjectTestCase;

public class FastWebDriverBackedSeleniumTest extends MockObjectTestCase {

  public void testOpenPrefixARelativeURLWithTheBaseURL() {
    final WebDriverBackedSelenium selenium;
    final WebDriver driver;

    driver = mock(WebDriver.class);
    selenium = new WebDriverBackedSelenium(driver, "http://a.base.url:3000");
    checking(new Expectations() {{
        one(driver).get("http://a.base.url:3000/a/relative/path");
      }
    });
    selenium.open("a/relative/path");
  }

  public void testOpenPrefixARelativeURLWithTheBaseURLEvenWhenItStartsWithASlash() {
    final WebDriverBackedSelenium selenium;
    final WebDriver driver;

    driver = mock(WebDriver.class);
    selenium = new WebDriverBackedSelenium(driver, "http://a.base.url:3000");
    checking(new Expectations() {{
        one(driver).get("http://a.base.url:3000/relative/path/starting_with_a_slash");
      }
    });
    selenium.open("/relative/path/starting_with_a_slash");
  }

  public void testOpenDoesNotPrefixAURLIncludingHttpProtocol() {
    final WebDriverBackedSelenium selenium;
    final WebDriver driver;

    driver = mock(WebDriver.class);
    selenium = new WebDriverBackedSelenium(driver, "http://a.base.url:3000");
    checking(new Expectations() {{
        one(driver).get("http://a.url/with/protocol.info");
      }
    });
    selenium.open("http://a.url/with/protocol.info");
  }

  public void testOpenDoesNotPrefixAURLIncludingHttpsProtocol() {
    final WebDriverBackedSelenium selenium;
    final WebDriver driver;

    driver = mock(WebDriver.class);
    selenium = new WebDriverBackedSelenium(driver, "http://a.base.url:3000");
    checking(new Expectations() {{
        one(driver).get("https://a.url/with/protocol.info");
      }
    });
    selenium.open("https://a.url/with/protocol.info");
  }

}
