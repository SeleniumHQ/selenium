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

package org.openqa.selenium.support.events;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.InOrder;
import org.mockito.Mockito;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriver.Navigation;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

/**
 * @author Michael Tamm
 */
@RunWith(JUnit4.class)
public class EventFiringWebDriverTest {

  @Test
  public void alertEvents() {
    final WebDriver mockedDriver = mock(WebDriver.class);
    final Alert mockedAlert = mock(Alert.class);
    final WebDriver.TargetLocator mockedTargetLocator = mock(WebDriver.TargetLocator.class);
    final StringBuilder log = new StringBuilder();

    when(mockedDriver.switchTo()).thenReturn(mockedTargetLocator);
    when(mockedTargetLocator.alert()).thenReturn(mockedAlert);

    EventFiringWebDriver testedDriver =
      new EventFiringWebDriver(mockedDriver).register(new AbstractWebDriverEventListener() {
        @Override
        public void beforeAlertAccept(WebDriver driver) {
          log.append("beforeAlertAccept\n");
        }

        @Override
        public void afterAlertAccept(WebDriver driver) {
          log.append("afterAlertAccept\n");
        }

        @Override
        public void beforeAlertDismiss(WebDriver driver) {
          log.append("beforeAlertDismiss\n");
        }

        @Override
        public void afterAlertDismiss(WebDriver driver) {
          log.append("afterAlertDismiss\n");
        }
      });

    testedDriver.switchTo().alert().accept();
    testedDriver.switchTo().alert().dismiss();

    assertEquals(
      "beforeAlertAccept\n" +
        "afterAlertAccept\n" +
        "beforeAlertDismiss\n" +
        "afterAlertDismiss\n",
      log.toString());

    InOrder order = Mockito.inOrder(mockedDriver, mockedAlert);
    order.verify(mockedAlert).accept();
    order.verify(mockedAlert).dismiss();
    order.verifyNoMoreInteractions();
  }

  @Test
  public void navigationEvents() {
    final WebDriver mockedDriver = mock(WebDriver.class);
    final Navigation mockedNavigation = mock(Navigation.class);
    final StringBuilder log = new StringBuilder();

    when(mockedDriver.navigate()).thenReturn(mockedNavigation);

    EventFiringWebDriver testedDriver =
        new EventFiringWebDriver(mockedDriver).register(new AbstractWebDriverEventListener() {
          @Override
          public void beforeNavigateTo(String url, WebDriver driver) {
            log.append("beforeNavigateTo ").append(url).append("\n");
          }

          @Override
          public void afterNavigateTo(String url, WebDriver driver) {
            log.append("afterNavigateTo ").append(url).append("\n");
          }

          @Override
          public void beforeNavigateBack(WebDriver driver) {
            log.append("beforeNavigateBack\n");
          }

          @Override
          public void afterNavigateBack(WebDriver driver) {
            log.append("afterNavigateBack\n");
          }

          @Override
          public void beforeNavigateForward(WebDriver driver) {
            log.append("beforeNavigateForward\n");
          }

          @Override
          public void afterNavigateForward(WebDriver driver) {
            log.append("afterNavigateForward\n");
          }

          @Override
          public void beforeNavigateRefresh(WebDriver driver) {
            log.append("beforeNavigateRefresh\n");
          }

          @Override
          public void afterNavigateRefresh(WebDriver driver) {
            log.append("afterNavigateRefresh\n");
          }
        });

    testedDriver.get("http://www.get.com");
    testedDriver.navigate().to("http://www.navigate-to.com");
    testedDriver.navigate().back();
    testedDriver.navigate().forward();
    testedDriver.navigate().refresh();

    assertEquals(
        "beforeNavigateTo http://www.get.com\n" +
            "afterNavigateTo http://www.get.com\n" +
            "beforeNavigateTo http://www.navigate-to.com\n" +
            "afterNavigateTo http://www.navigate-to.com\n" +
            "beforeNavigateBack\n" +
            "afterNavigateBack\n" +
            "beforeNavigateForward\n" +
            "afterNavigateForward\n" +
            "beforeNavigateRefresh\n" +
            "afterNavigateRefresh\n",
        log.toString());

    InOrder order = Mockito.inOrder(mockedDriver, mockedNavigation);
    order.verify(mockedDriver).get("http://www.get.com");
    order.verify(mockedNavigation).to("http://www.navigate-to.com");
    order.verify(mockedNavigation).back();
    order.verify(mockedNavigation).forward();
    order.verify(mockedNavigation).refresh();
    order.verifyNoMoreInteractions();
  }

  @Test
  public void clickEvent() {
    final WebDriver mockedDriver = mock(WebDriver.class);
    final WebElement mockedElement = mock(WebElement.class);
    final StringBuilder log = new StringBuilder();

    when(mockedDriver.findElement(By.name("foo"))).thenReturn(mockedElement);

    EventFiringWebDriver testedDriver =
        new EventFiringWebDriver(mockedDriver).register(new AbstractWebDriverEventListener() {
          @Override
          public void beforeClickOn(WebElement element, WebDriver driver) {
            log.append("beforeClickOn\n");
          }

          @Override
          public void afterClickOn(WebElement element, WebDriver driver) {
            log.append("afterClickOn\n");
          }
        });

    testedDriver.findElement(By.name("foo")).click();

    assertEquals(
        "beforeClickOn\n" +
            "afterClickOn\n",
        log.toString());

    InOrder order = Mockito.inOrder(mockedDriver, mockedElement);
    order.verify(mockedDriver).findElement(By.name("foo"));
    order.verify(mockedElement).click();
    order.verifyNoMoreInteractions();
  }

  @Test
  public void changeValueEvent() {
    final WebDriver mockedDriver = mock(WebDriver.class);
    final WebElement mockedElement = mock(WebElement.class);
    final StringBuilder log = new StringBuilder();

    when(mockedDriver.findElement(By.name("foo"))).thenReturn(mockedElement);

    EventFiringWebDriver testedDriver =
        new EventFiringWebDriver(mockedDriver).register(new AbstractWebDriverEventListener() {
          @Override
          public void beforeChangeValueOf(WebElement element, WebDriver driver,
                                          CharSequence[] keysToSend) {
            log.append("beforeChangeValueOf" + " " + Arrays.toString(keysToSend) + "\n");
          }

          @Override
          public void afterChangeValueOf(WebElement element, WebDriver driver,
                                         CharSequence[] keysToSend) {
            log.append("afterChangeValueOf" + " " + Arrays.toString(keysToSend) + "\n");
          }
        });

    String someText = "some text";

    testedDriver.findElement(By.name("foo")).clear();
    testedDriver.findElement(By.name("foo")).sendKeys(someText);
    testedDriver.findElement(By.name("foo")).click();

    assertEquals(
        "beforeChangeValueOf null\n" +
            "afterChangeValueOf null\n" +
            "beforeChangeValueOf [" + someText +"]\n" +
            "afterChangeValueOf [" + someText +"]\n",
        log.toString());

    InOrder order = Mockito.inOrder(mockedElement);
    order.verify(mockedElement).clear();
    order.verify(mockedElement).sendKeys(someText);
    order.verify(mockedElement).click();
    order.verifyNoMoreInteractions();

    verify(mockedDriver, times(3)).findElement(By.name("foo"));
    verifyNoMoreInteractions(mockedDriver);
  }

  @Test
  public void findByEvent() {
    final WebDriver mockedDriver = mock(WebDriver.class);
    final WebElement mockedElement = mock(WebElement.class);
    final WebElement mockedChildElement = mock(WebElement.class);
    final StringBuilder log = new StringBuilder();

    when(mockedDriver.findElement(By.id("foo"))).thenReturn(mockedElement);
    when(mockedElement.findElement(Mockito.<By>any())).thenReturn(mockedChildElement);

    EventFiringWebDriver testedDriver =
        new EventFiringWebDriver(mockedDriver).register(new AbstractWebDriverEventListener() {
          @Override
          public void beforeFindBy(By by, WebElement element, WebDriver driver) {
            log.append("beforeFindBy from ").append(element == null ? "WebDriver" : "WebElement")
                .append(" ").append(by).append("\n");
          }

          @Override
          public void afterFindBy(By by, WebElement element, WebDriver driver) {
            log.append("afterFindBy from ").append(element == null ? "WebDriver" : "WebElement")
                .append(" ").append(by).append("\n");
          }
        });

    WebElement element = testedDriver.findElement(By.id("foo"));
    element.findElement(By.linkText("bar"));
    element.findElements(By.name("xyz"));
    testedDriver.findElements(By.xpath("//link[@type = 'text/css']"));

    assertEquals(
        "beforeFindBy from WebDriver By.id: foo\n" +
            "afterFindBy from WebDriver By.id: foo\n" +
            "beforeFindBy from WebElement By.linkText: bar\n" +
            "afterFindBy from WebElement By.linkText: bar\n" +
            "beforeFindBy from WebElement By.name: xyz\n" +
            "afterFindBy from WebElement By.name: xyz\n" +
            "beforeFindBy from WebDriver By.xpath: //link[@type = 'text/css']\n" +
            "afterFindBy from WebDriver By.xpath: //link[@type = 'text/css']\n",
        log.toString());

    InOrder order = Mockito.inOrder(mockedElement, mockedDriver);
    order.verify(mockedElement).findElement(By.linkText("bar"));
    order.verify(mockedElement).findElements(By.name("xyz"));
    order.verify(mockedDriver).findElements(By.xpath("//link[@type = 'text/css']"));
    order.verifyNoMoreInteractions();
  }

  @Test
  public void shouldCallListenersWhenAnExceptionIsThrown() {
    final WebDriver mockedDriver = mock(WebDriver.class);
    final StringBuilder log = new StringBuilder();

    final NoSuchElementException exception = new NoSuchElementException("argh");

    when(mockedDriver.findElement(By.id("foo"))).thenThrow(exception);

    EventFiringWebDriver testedDriver =
        new EventFiringWebDriver(mockedDriver).register(new AbstractWebDriverEventListener() {
          @Override
          public void onException(Throwable throwable, WebDriver driver) {
            log.append(throwable.getMessage());
          }
        });

    try {
      testedDriver.findElement(By.id("foo"));
      fail("Expected exception to be propagated");
    } catch (NoSuchElementException e) {
      // Fine
    }

    assertEquals(exception.getMessage(), log.toString());
  }

  @Test
  public void shouldUnpackElementArgsWhenCallingScripts() {
    final WebDriver mockedDriver = mock(WebDriver.class,
                                        withSettings().extraInterfaces(JavascriptExecutor.class));
    final WebElement stubbedElement = mock(WebElement.class);

    when(mockedDriver.findElement(By.id("foo"))).thenReturn(stubbedElement);

    EventFiringWebDriver testedDriver = new EventFiringWebDriver(mockedDriver);
    testedDriver.register(new AbstractWebDriverEventListener() {});

    WebElement element = testedDriver.findElement(By.id("foo"));
    testedDriver.executeScript("foo", element);
    verify((JavascriptExecutor) mockedDriver).executeScript("foo", element);
  }

  @Test
  public void testShouldUnpackListOfElementArgsWhenCallingScripts() {
    final WebDriver mockedDriver = mock(WebDriver.class,
                                        withSettings().extraInterfaces(JavascriptExecutor.class));
    final WebElement mockElement = mock(WebElement.class);

    when(mockedDriver.findElement(By.id("foo"))).thenReturn(mockElement);

    EventFiringWebDriver testedDriver = new EventFiringWebDriver(mockedDriver);
    testedDriver.register(new AbstractWebDriverEventListener() {});

    final WebElement foundElement = testedDriver.findElement(By.id("foo"));
    assertTrue(foundElement instanceof WrapsElement);
    assertSame(mockElement, ((WrapsElement) foundElement).getWrappedElement());

    testedDriver.executeScript("foo", new ArrayList<Object>() {{
      add("before");
      add(foundElement);
      add("after");
    }});

    verify((JavascriptExecutor) mockedDriver).executeScript("foo", new ArrayList<Object>() {{
      add("before");
      add(mockElement);
      add("after");
    }});
  }

  @Test
  public void testShouldUnpackMapOfElementArgsWhenCallingScripts() {
    final WebDriver mockedDriver = mock(WebDriver.class,
                                        withSettings().extraInterfaces(JavascriptExecutor.class));
    final WebElement mockElement = mock(WebElement.class);

    when(mockedDriver.findElement(By.id("foo"))).thenReturn(mockElement);

    EventFiringWebDriver testedDriver = new EventFiringWebDriver(mockedDriver);
    testedDriver.register(new AbstractWebDriverEventListener() {
    });

    final WebElement foundElement = testedDriver.findElement(By.id("foo"));
    assertTrue(foundElement instanceof WrapsElement);
    assertSame(mockElement, ((WrapsElement) foundElement).getWrappedElement());

    testedDriver.executeScript("foo", new HashMap<String, Object>() {{
      put("foo", "bar");
      put("element", foundElement);
      put("nested", new ArrayList<Object>() {{
        add("before");
        add(foundElement);
        add("after");
      }});
    }});

    verify((JavascriptExecutor) mockedDriver).executeScript("foo", new HashMap<String, Object>() {{
      put("foo", "bar");
      put("element", mockElement);
      put("nested", new ArrayList<Object>() {{
        add("before");
        add(mockElement);
        add("after");
      }});
    }});
  }

  @Test
  public void shouldBeAbleToWrapSubclassesOfSomethingImplementingTheWebDriverInterface() {
    try {
      new EventFiringWebDriver(new ChildDriver());
      // We should get this far
    } catch (ClassCastException e) {
      e.printStackTrace();
      fail("Should have been able to wrap the child of a webdriver implementing interface");
    }
  }

  @Test
  public void shouldBeAbleToAccessWrappedInstanceFromEventCalls() {
    final WebDriver stub = mock(WebDriver.class);
    EventFiringWebDriver driver = new EventFiringWebDriver(stub);
    WebDriver wrapped = driver.getWrappedDriver();
    assertEquals(stub, wrapped);

    class MyListener extends AbstractWebDriverEventListener {
      @Override
      public void beforeNavigateTo(String url, WebDriver driver) {
        WebDriver unwrapped = ((WrapsDriver) driver).getWrappedDriver();

        assertEquals(stub, unwrapped);
      }
    }

    driver.register(new MyListener());

    driver.get("http://example.org");
  }

  @Test
  public void shouldBeAbleToAccessWrappedElementInstanceFromEventCalls() {
    final WebElement stubElement = mock(WebElement.class);

    final WebDriver stubDriver = mock(WebDriver.class);
    when(stubDriver.findElement(By.name("stub"))).thenReturn(stubElement);

    EventFiringWebDriver driver = new EventFiringWebDriver(stubDriver);

    class MyListener extends AbstractWebDriverEventListener {
      @Override
      public void beforeClickOn(WebElement element, WebDriver driver) {
        assertEquals(stubElement, ((WrapsElement) element).getWrappedElement());
      }
    }

    driver.register(new MyListener());

    driver.findElement(By.name("stub")).click();
  }

  @Test
  public void shouldReturnLocatorFromToStringMethod() {
    final WebElement stubElement = mock(WebElement.class);
    when(stubElement.toString()).thenReturn("cheese");

    final WebDriver driver = mock(WebDriver.class);
    when(driver.findElement(By.id("ignored"))).thenReturn(stubElement);

    EventFiringWebDriver firingDriver = new EventFiringWebDriver(driver);
    WebElement firingElement = firingDriver.findElement(By.id("ignored"));

    assertEquals(stubElement.toString(), firingElement.toString());
  }

  private static class ChildDriver extends StubDriver {}
}
