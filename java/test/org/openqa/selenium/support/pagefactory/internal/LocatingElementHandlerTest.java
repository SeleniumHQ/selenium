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

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
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

public class LocatingElementHandlerTest {

  @Test
  public void shouldAlwaysLocateTheElementPerCall() {
    final ElementLocator locator = mock(ElementLocator.class);
    final WebElement element = mock(WebElement.class);

    when(locator.findElement()).thenReturn(element);

    LocatingElementHandler handler = new LocatingElementHandler(locator);
    WebElement proxy =
        (WebElement) Proxy.newProxyInstance(getClass().getClassLoader(),
            new Class[] {WebElement.class}, handler);

    proxy.sendKeys("Fishy");
    proxy.submit();

    verify(locator, times(2)).findElement();
    verify(element).sendKeys("Fishy");
    verify(element).submit();
    verifyNoMoreInteractions(locator, element);
  }

  @Test
  public void shouldUseAnnotationsToLookUpByAlternativeMechanisms() {
    final WebDriver driver = mock(WebDriver.class);
    final WebElement element = mock(WebElement.class);

    final By by = By.xpath("//input[@name='q']");

    when(driver.findElement(by)).thenReturn(element);

    Page page = PageFactory.initElements(driver, Page.class);
    page.doQuery("cheese");

    verify(element).clear();
    verify(element).sendKeys("cheese");
    verifyNoMoreInteractions(element);
  }

  @Test
  public void shouldNotRepeatedlyLookUpElementsMarkedAsNeverChanging() {
    final ElementLocator locator = mock(ElementLocator.class);
    final WebElement element = mock(WebElement.class);

    when(locator.findElement()).thenReturn(element);

    LocatingElementHandler handler = new LocatingElementHandler(locator);
    WebElement proxy =
        (WebElement) Proxy.newProxyInstance(getClass().getClassLoader(),
            new Class[] {WebElement.class}, handler);

    proxy.isEnabled();
    proxy.sendKeys("Cheese");

    verify(element).isEnabled();
    verify(element).sendKeys("Cheese");
  }

  @Test
  public void findByAnnotationShouldBeInherited() {
    ChildPage page = new ChildPage();

    final WebDriver driver = mock(WebDriver.class);
    final WebElement element = mock(WebElement.class);

    when(driver.findElement(By.xpath("//input[@name='q']"))).thenReturn(element);

    PageFactory.initElements(driver, page);
    page.doChildQuery();

    verify(element).getAttribute("value");
  }

  public static class Page {

    @SuppressWarnings("unused")
    private WebElement q;

    @FindBy(how = How.XPATH, using = "//input[@name='q']")
    protected WebElement query;

    @SuppressWarnings("unused")
    @FindBy(how = How.XPATH, using = "//input[@name='q']")
    @CacheLookup
    private WebElement staysTheSame;

    public void doQuery(String foo) {
      query.clear();
      query.sendKeys(foo);
    }
  }

  public static class ChildPage extends Page {
    public void doChildQuery() {
      query.getAttribute("value");
    }
  }
}
