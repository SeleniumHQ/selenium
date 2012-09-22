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


package org.openqa.selenium.v1.support;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;
import org.openqa.selenium.support.PageFactory;

import static org.junit.Assert.assertEquals;

public class DecoratedWebElementTest {

  @Test
  public void testDecoratedElementsShouldBeUnwrapped() {
    final RemoteWebElement element = new RemoteWebElement();
    element.setId("foo");

    WebDriver driver = new StubDriver() {
      @Override
      public WebElement findElement(By by) {
        return element;
      }
    };

    PublicPage page = new PublicPage();
    PageFactory.initElements(driver, page);

    Object seen = new WebElementToJsonConverter().apply(page.element);
    Object expected = new WebElementToJsonConverter().apply(element);

    assertEquals(expected, seen);
  }


  public class PublicPage {
    public WebElement element;
  }
}
