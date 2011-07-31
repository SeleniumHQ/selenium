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

package org.openqa.selenium.support.pagefactory;

import org.jmock.Expectations;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.MockTestBase;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;

import java.lang.reflect.Field;
import java.util.NoSuchElementException;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

public class DefaultElementLocatorTest extends MockTestBase {
  protected ElementLocator newLocator(WebDriver driver, Field field) {
    return new DefaultElementLocator(driver, field);
  }

  @Test
  public void shouldDelegateToDriverInstanceToFindElement() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      exactly(1).of(driver).findElement(by);
      will(returnValue(element));
    }});

    ElementLocator locator = newLocator(driver, f);
    WebElement returnedElement = locator.findElement();

    assertEquals(element, returnedElement);
  }

  @Test
  public void cachedElementsShouldBeCached() throws Exception {
    Field f = Page.class.getDeclaredField("cached");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("cached");
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      exactly(1).of(driver).findElement(by);
      will(returnValue(element));
    }});

    ElementLocator locator = newLocator(driver, f);
    locator.findElement();
    locator.findElement();
  }

  @Test
  public void shouldNotCacheNormalElements() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      exactly(2).of(driver).findElement(by);
      will(returnValue(element));
    }});

    ElementLocator locator = newLocator(driver, f);
    locator.findElement();
    locator.findElement();
  }

  @Test
  public void shouldUseFindByAnnotationsWherePossible() throws Exception {
    Field f = Page.class.getDeclaredField("byId");
    final WebDriver driver = mock(WebDriver.class);
    final By by = By.id("foo");
    final WebElement element = mock(WebElement.class);

    checking(new Expectations() {{
      exactly(1).of(driver).findElement(by);
      will(returnValue(element));
    }});

    ElementLocator locator = newLocator(driver, f);
    locator.findElement();
  }

  @Test
  public void shouldNotMaskNoSuchElementExceptionIfThrown() throws Exception {
    Field f = Page.class.getDeclaredField("byId");
    final WebDriver driver = mock(WebDriver.class);
    final By by = By.id("foo");

    checking(new Expectations() {{
      exactly(1).of(driver).findElement(by);
      will(throwException(new NoSuchElementException("Foo")));
    }});

    ElementLocator locator = newLocator(driver, f);

    try {
      locator.findElement();
      fail("Should have allowed the exception to bubble up");
    } catch (NoSuchElementException e) {
      // This is expected
    }
  }

  private static class Page {
    @SuppressWarnings("unused")
    private WebElement first;

    @SuppressWarnings("unused")
    @CacheLookup
    private WebElement cached;

    @SuppressWarnings("unused")
    @FindBy(how = How.ID, using = "foo")
    private WebElement byId;
  }
}
