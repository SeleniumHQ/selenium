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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.UnitTests;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

@Category(UnitTests.class)
public class EventFiringDecoratorTest {

  static class CollectorListener implements WebDriverListener {

    StringBuffer acc = new StringBuffer();

    @Override
    public void beforeAnyCall(Object target, Method method, Object[] args) {
      acc.append("beforeAnyCall ").append(method.getName()).append("\n");
    }

    @Override
    public void afterAnyCall(Object target, Method method, Object result, Object[] args) {
      acc.append("afterAnyCall ").append(method.getName()).append("\n");
    }

    @Override
    public void beforeAnyWebDriverCall(WebDriver driver, Method method, Object[] args) {
      acc.append("beforeAnyWebDriverCall ").append(method.getName()).append("\n");
    }

    @Override
    public void afterAnyWebDriverCall(WebDriver driver, Method method, Object result, Object[] args) {
      acc.append("afterAnyWebDriverCall ").append(method.getName()).append("\n");
    }
  }

  @Test
  public void shouldFireWebDriverEvents() {
    WebDriver driver = mock(WebDriver.class);
    CollectorListener listener = new CollectorListener() {
      @Override
      public void beforeGet(WebDriver driver, String url) {
        acc.append("beforeGet\n");
      }

      @Override
      public void afterGet(WebDriver driver, String url) {
        acc.append("afterGet\n");
      }
    };
    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    decorated.get("http://example.com/");

    assertThat(listener.acc.toString().trim()).isEqualTo(
      String.join("\n",
                  "beforeAnyCall get",
                  "beforeAnyWebDriverCall get",
                  "beforeGet",
                  "afterGet",
                  "afterAnyWebDriverCall get",
                  "afterAnyCall get"));
  }

  @Test
  public void shouldFireWeElementEvents() {
    WebDriver driver = mock(WebDriver.class);
    WebElement element = mock(WebElement.class);
    when(driver.findElement(any())).thenReturn(element);

    CollectorListener listener = new CollectorListener() {
      @Override
      public void beforeFindElement(WebDriver driver, By locator) {
        acc.append("beforeFindElement").append("\n");
      }

      @Override
      public void afterFindElement(WebElement result, WebDriver driver, By locator) {
        acc.append("afterFindElement").append("\n");
      }

      @Override
      public void beforeAnyWebElementCall(WebElement element, Method method, Object[] args) {
        acc.append("beforeAnyWebElementCall ").append(method.getName()).append("\n");
      }

      @Override
      public void afterAnyWebElementCall(WebElement element, Method method, Object result, Object[] args) {
        acc.append("afterAnyWebElementCall ").append(method.getName()).append("\n");
      }

      @Override
      public void beforeClick(WebElement element) {
        acc.append("beforeClick").append("\n");
      }

      @Override
      public void afterClick(WebElement element) {
        acc.append("afterClick").append("\n");
      }
    };

    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    decorated.findElement(By.id("test")).click();

    assertThat(listener.acc.toString().trim()).isEqualTo(
      String.join("\n",
                  "beforeAnyCall findElement",
                  "beforeAnyWebDriverCall findElement",
                  "beforeFindElement",
                  "afterFindElement",
                  "afterAnyWebDriverCall findElement",
                  "afterAnyCall findElement",
                  "beforeAnyCall click",
                  "beforeAnyWebElementCall click",
                  "beforeClick",
                  "afterClick",
                  "afterAnyWebElementCall click",
                  "afterAnyCall click"));
  }

  @Test
  public void shouldFireNavigationEvents() {
    WebDriver driver = mock(WebDriver.class);
    WebDriver.Navigation navigation = mock(WebDriver.Navigation.class);
    when(driver.navigate()).thenReturn(navigation);

    CollectorListener listener = new CollectorListener() {
      @Override
      public void beforeAnyNavigationCall(WebDriver.Navigation navigation, Method method, Object[] args) {
        acc.append("beforeAnyNavigationCall ").append(method.getName()).append("\n");
      }

      @Override
      public void afterAnyNavigationCall(WebDriver.Navigation navigation, Method method, Object result, Object[] args) {
        acc.append("afterAnyNavigationCall ").append(method.getName()).append("\n");
      }

      @Override
      public void beforeBack(WebDriver.Navigation navigation) {
        acc.append("beforeBack").append("\n");
      }

      @Override
      public void afterBack(WebDriver.Navigation navigation) {
        acc.append("afterBack").append("\n");
      }
    };

    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    decorated.navigate().back();

    assertThat(listener.acc.toString().trim()).isEqualTo(
      String.join("\n",
                  "beforeAnyCall navigate",
                  "beforeAnyWebDriverCall navigate",
                  "afterAnyWebDriverCall navigate",
                  "afterAnyCall navigate",
                  "beforeAnyCall back",
                  "beforeAnyNavigationCall back",
                  "beforeBack",
                  "afterBack",
                  "afterAnyNavigationCall back",
                  "afterAnyCall back"));
  }

  @Test
  public void shouldFireAlertEvents() {
    WebDriver driver = mock(WebDriver.class);
    WebDriver.TargetLocator switchTo = mock(WebDriver.TargetLocator.class);
    Alert alert = mock(Alert.class);
    when(driver.switchTo()).thenReturn(switchTo);
    when(switchTo.alert()).thenReturn(alert);

    CollectorListener listener = new CollectorListener() {
      @Override
      public void beforeAnyAlertCall(Alert alert, Method method, Object[] args) {
        acc.append("beforeAnyAlertCall ").append(method.getName()).append("\n");
      }

      @Override
      public void afterAnyAlertCall(Alert alert, Method method, Object result, Object[] args) {
        acc.append("afterAnyAlertCall ").append(method.getName()).append("\n");
      }

      @Override
      public void beforeDismiss(Alert alert) {
        acc.append("beforeDismiss").append("\n");
      }

      @Override
      public void afterDismiss(Alert alert) {
        acc.append("afterDismiss").append("\n");
      }
    };

    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    decorated.switchTo().alert().dismiss();

    assertThat(listener.acc.toString().trim()).isEqualTo(
      String.join("\n",
                  "beforeAnyCall switchTo",
                  "beforeAnyWebDriverCall switchTo",
                  "afterAnyWebDriverCall switchTo",
                  "afterAnyCall switchTo",
                  "beforeAnyCall alert",
                  "afterAnyCall alert",
                  "beforeAnyCall dismiss",
                  "beforeAnyAlertCall dismiss",
                  "beforeDismiss",
                  "afterDismiss",
                  "afterAnyAlertCall dismiss",
                  "afterAnyCall dismiss"));
  }

  @Test
  public void shouldSuppressExceptionInBeforeAnyCall() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener = new WebDriverListener() {
      @Override
      public void beforeAnyCall(Object target, Method method, Object[] args) {
        throw new RuntimeException("listener");
      }
    };

    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  public void shouldSuppressExceptionInBeforeClassMethodCall() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener = new WebDriverListener() {
      @Override
      public void beforeAnyWebDriverCall(WebDriver driver, Method method, Object[] args) {
        throw new RuntimeException("listener");
      }
    };

    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  public void shouldSuppressExceptionInBeforeMethod() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener = new WebDriverListener() {
      @Override
      public void beforeGetWindowHandle(WebDriver driver) {
        throw new RuntimeException("listener");
      }
    };

    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  public void shouldSuppressExceptionInAfterAnyCall() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener = new WebDriverListener() {
      @Override
      public void afterAnyCall(Object target, Method method, Object result, Object[] args) {
        throw new RuntimeException("listener");
      }
    };

    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  public void shouldSuppressExceptionInAfterClassMethodCall() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener = new WebDriverListener() {
      @Override
      public void afterAnyWebDriverCall(WebDriver driver, Method method, Object result, Object[] args) {
        throw new RuntimeException("listener");
      }
    };

    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  public void shouldSuppressExceptionInAfterMethod() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener = new WebDriverListener() {
      @Override
      public void afterGetWindowHandle(String result, WebDriver driver) {
        throw new RuntimeException("listener");
      }
    };

    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  public void shouldSuppressExceptionInOnError() {
    WebDriver driver = mock(WebDriver.class);
    when(driver.getWindowHandle()).thenThrow(new WebDriverException());
    WebDriverListener listener = new WebDriverListener() {
      @Override
      public void onError(Object target, Method method, InvocationTargetException e, Object[] args) {
        throw new RuntimeException("listener");
      }
    };

    WebDriver decorated = new EventFiringDecorator(listener).decorate(driver);

    assertThatExceptionOfType(WebDriverException.class)
      .isThrownBy(decorated::getWindowHandle);
  }
}
