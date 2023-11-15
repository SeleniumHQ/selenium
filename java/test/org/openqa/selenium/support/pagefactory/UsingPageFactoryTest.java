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

package org.openqa.selenium.support.pagefactory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.testing.JupiterTestBase;

class UsingPageFactoryTest extends JupiterTestBase {

  @Test
  void canExecuteJsUsingDecoratedElements() {
    driver.get(pages.xhtmlTestPage);

    Page page = new Page();
    PageFactory.initElements(driver, page);

    String tagName =
        (String)
            ((JavascriptExecutor) driver)
                .executeScript("return arguments[0].tagName", page.formElement);

    assertThat(tagName).isEqualToIgnoringCase("form");
  }

  @Test
  void canListDecoratedElements() {
    driver.get(pages.xhtmlTestPage);

    Page page = new Page();
    PageFactory.initElements(driver, page);

    assertThat(page.divs).hasSize(13);
    for (WebElement link : page.divs) {
      assertThat(link.getTagName()).isEqualToIgnoringCase("div");
    }
  }

  @Test
  void testDecoratedElementsShouldBeUnwrapped() {
    final RemoteWebElement element = new RemoteWebElement();
    element.setId("foo");

    WebDriver driver = mock(WebDriver.class);
    when(driver.findElement(new ByIdOrName("element"))).thenReturn(element);

    PublicPage page = new PublicPage();
    PageFactory.initElements(driver, page);

    Object seen = new WebElementToJsonConverter().apply(page.element);
    Object expected = new WebElementToJsonConverter().apply(element);

    assertThat(seen).isEqualTo(expected);
  }

  class PublicPage {
    public WebElement element;
  }

  public static class Page {
    @FindBy(name = "someForm")
    WebElement formElement;

    @FindBy(tagName = "div")
    @CacheLookup
    List<WebElement> divs;
  }
}
