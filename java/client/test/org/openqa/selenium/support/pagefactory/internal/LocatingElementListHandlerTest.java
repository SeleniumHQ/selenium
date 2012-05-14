/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.support.pagefactory.internal;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;

import org.openqa.selenium.By;
import org.openqa.selenium.testing.MockTestBase;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.pagefactory.ElementLocator;

import org.jmock.Expectations;
import org.junit.Test;

import java.lang.reflect.Proxy;
import java.util.Arrays;
import java.util.List;

public class LocatingElementListHandlerTest extends MockTestBase {
  @Test
  public void shouldAlwaysLocateTheElementPerCall() {
    final ElementLocator locator = mock(ElementLocator.class);
    final WebElement element1 = mock(WebElement.class, "webElement1");
    final WebElement element2 = mock(WebElement.class, "webElement2");
    final List<WebElement> list = Arrays.asList(new WebElement[] {element1, element2});

    checking(new Expectations() {{
      exactly(2).of(locator).findElements();
      will(returnValue(list));
      exactly(1).of(element2).sendKeys("Fishy");
    }});

    LocatingElementListHandler handler = new LocatingElementListHandler(locator);
    List<WebElement> proxy =
        (List<WebElement>) Proxy.newProxyInstance(getClass().getClassLoader(),
            new Class[] {List.class}, handler);

    proxy.get(1).sendKeys("Fishy");
    assertThat(proxy.size(), equalTo(2));
  }

  @Test
  public void shouldUseAnnotationsToLookUpByAlternativeMechanisms() {
    final WebDriver driver = mock(WebDriver.class);
    final WebElement element1 = mock(WebElement.class, "webElement1");
    final WebElement element2 = mock(WebElement.class, "webElement2");
    final List<WebElement> list = Arrays.asList(new WebElement[] {element1, element2});

    checking(new Expectations() {{
      exactly(1).of(driver).findElements(By.tagName("a"));
      will(returnValue(list));
      exactly(1).of(element1).getAttribute("href");
      will(returnValue(""));
      exactly(1).of(element2).getAttribute("href");
      will(returnValue(""));
    }});

    Page page = PageFactory.initElements(driver, Page.class);
    page.getLinks();
  }

  @Test
  public void findByAnnotationShouldBeInherited() {
    final WebDriver driver = mock(WebDriver.class);
    final WebElement element1 = mock(WebElement.class, "webElement1");
    final WebElement element2 = mock(WebElement.class, "webElement2");
    final List<WebElement> list = Arrays.asList(new WebElement[] {element1, element2});

    checking(new Expectations() {{
      exactly(1).of(driver).findElements(By.tagName("a"));
      will(returnValue(list));
      exactly(1).of(element1).getText();
      will(returnValue(""));
      exactly(1).of(element2).getText();
      will(returnValue(""));
    }});

    ChildPage page = new ChildPage();

    PageFactory.initElements(driver, page);
    page.getTextOfLinks();
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
