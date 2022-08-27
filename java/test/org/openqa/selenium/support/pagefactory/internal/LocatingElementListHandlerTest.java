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

package org.openqa.selenium.support.pagefactory.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.pagefactory.ElementLocator;

import java.lang.reflect.Proxy;
import java.util.Arrays;
import java.util.List;

public class LocatingElementListHandlerTest {

  @SuppressWarnings("unchecked")
  @Test
  public void shouldAlwaysLocateTheElementPerCall() {
    final ElementLocator locator = mock(ElementLocator.class);
    final WebElement element1 = mock(WebElement.class, "webElement1");
    final WebElement element2 = mock(WebElement.class, "webElement2");
    final List<WebElement> list = Arrays.asList(element1, element2);

    when(locator.findElements()).thenReturn(list);

    LocatingElementListHandler handler = new LocatingElementListHandler(locator);
    List<WebElement> proxy =
        (List<WebElement>) Proxy.newProxyInstance(getClass().getClassLoader(),
            new Class[] {List.class}, handler);

    proxy.get(1).sendKeys("Fishy");
    assertThat(proxy).hasSize(2);

    verify(locator, times(2)).findElements();
    verify(element2, times(1)).sendKeys("Fishy");
    verifyNoMoreInteractions(locator, element2);
    verifyNoInteractions(element1);
  }

  @Test
  public void shouldUseAnnotationsToLookUpByAlternativeMechanisms() {
    final WebDriver driver = mock(WebDriver.class);
    final WebElement element1 = mock(WebElement.class, "webElement1");
    final WebElement element2 = mock(WebElement.class, "webElement2");
    final List<WebElement> list = Arrays.asList(element1, element2);

    when(driver.findElements(By.tagName("a"))).thenReturn(list);

    Page page = PageFactory.initElements(driver, Page.class);
    page.getLinks();

    verify(element1).getAttribute("href");
    verify(element2).getAttribute("href");
    verifyNoMoreInteractions(element1, element2);
  }

  @Test
  public void findByAnnotationShouldBeInherited() {
    final WebDriver driver = mock(WebDriver.class);
    final WebElement element1 = mock(WebElement.class, "webElement1");
    final WebElement element2 = mock(WebElement.class, "webElement2");
    final List<WebElement> list = Arrays.asList(element1, element2);

    when(driver.findElements(By.tagName("a"))).thenReturn(list);

    ChildPage page = new ChildPage();

    PageFactory.initElements(driver, page);
    page.getTextOfLinks();

    verify(element1).getText();
    verify(element2).getText();
    verifyNoMoreInteractions(element1, element2);
  }

  public static class Page {

    @FindBy(how = How.TAG_NAME, using = "a")
    protected List<WebElement> links;

    @SuppressWarnings("unused")
    @CacheLookup
    private List<WebElement> staysTheSame;

    public void getLinks() {
      for (WebElement element : links) {
        element.getAttribute("href");
      }
    }
  }

  public static class ChildPage extends Page {
    public void getTextOfLinks() {
      for (WebElement element : links) {
        element.getText();
      }
    }
  }
}
