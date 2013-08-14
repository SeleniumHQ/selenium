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

package org.openqa.selenium.support.pagefactory;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.jmock.integration.junit4.JUnitRuleMockery;
import org.junit.Rule;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.ui.Clock;
import org.openqa.selenium.support.ui.FakeClock;

import org.jmock.Expectations;
import org.junit.Test;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

public class AjaxElementLocatorTest {

  @Rule public JUnitRuleMockery mockery = new JUnitRuleMockery();

  private FakeClock clock = new FakeClock();

  protected ElementLocator newLocator(WebDriver driver, Field field) {
    return new MonkeyedAjaxElementLocator(clock, driver, field, 10);
  }

  @Test
  public void shouldContinueAttemptingToFindElement() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mockery.mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    final WebElement element = mockery.mock(WebElement.class);

    mockery.checking(new Expectations() {{
      exactly(1).of(driver).findElement(by);
      will(throwException(new NoSuchElementException("bar")));
      exactly(1).of(driver).findElement(by);
      will(returnValue(element));
    }});

    ElementLocator locator = newLocator(driver, f);
    WebElement returnedElement = locator.findElement();

    assertEquals(element, returnedElement);
  }

  @Test
  public void shouldContinueAttemptingToFindElements() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mockery.mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    final WebElement element = mockery.mock(WebElement.class);
    final List<WebElement> elementList = new ArrayList<WebElement>();
    elementList.add(element);

    mockery.checking(new Expectations() {{
      exactly(1).of(driver).findElements(by);
      will(throwException(new NoSuchElementException("bar")));
      exactly(1).of(driver).findElements(by);
      will(returnValue(elementList));
    }});

    ElementLocator locator = newLocator(driver, f);
    List<WebElement> returnedList = locator.findElements();

    assertEquals(element, returnedList.get(0));
  }

  @Test
  public void shouldThrowNoSuchElementExceptionIfElementTakesTooLongToAppear() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mockery.mock(WebDriver.class);
    final By by = new ByIdOrName("first");

    mockery.checking(new Expectations() {{
      // Look ups:
      // 1. In "isLoaded"
      // 2. Immediately after call of load. (clock is 0)
      // 3. First sleep, then third call.   (clock is 1)
      // 4. Main loop is now over. Final call as we exit to see if we've loaded.
      // The last call guarantees we've called "isLoaded" at least once after a load.
      exactly(4).of(driver).findElement(by);
      will(throwException(new NoSuchElementException("bar")));
    }});

    ElementLocator locator = new MonkeyedAjaxElementLocator(clock, driver, f, 2);

    try {
      locator.findElement();
      fail("Should not have located the element");
    } catch (NoSuchElementException e) {
      // This is expected
    }
  }

  @Test
  public void shouldAlwaysDoAtLeastOneAttemptAtFindingTheElement() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mockery.mock(WebDriver.class);
    final By by = new ByIdOrName("first");

    mockery.checking(new Expectations() {{
      exactly(2).of(driver).findElement(by);
      will(throwException(new NoSuchElementException("bar")));
    }});

    ElementLocator locator = new MonkeyedAjaxElementLocator(clock, driver, f, 0);

    try {
      locator.findElement();
      fail("Should not have located the element");
    } catch (NoSuchElementException e) {
      // This is expected
    }
  }

  private class MonkeyedAjaxElementLocator extends AjaxElementLocator {
    public MonkeyedAjaxElementLocator(Clock clock, WebDriver driver, Field field, int timeOutInSeconds) {
      super(clock, driver, field, timeOutInSeconds);
    }

    @Override
    protected long sleepFor() {
      clock.timePasses(1000);
      return 0;
    }
  }

  private static class Page {
    @SuppressWarnings("unused")
    private WebElement first;
  }
}
