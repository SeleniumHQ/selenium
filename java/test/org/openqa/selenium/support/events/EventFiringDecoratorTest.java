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
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.remote.RemoteWebDriver;

@Tag("UnitTests")
class EventFiringDecoratorTest {

  static class CollectorListener implements WebDriverListener {

    protected final StringBuilder acc = new StringBuilder();

    @Override
    public void beforeAnyCall(Object target, Method method, Object[] args) {
      acc.append("beforeAnyCall ").append(method.getName()).append("\n");
    }

    @Override
    public void afterAnyCall(Object target, Method method, Object[] args, Object result) {
      acc.append("afterAnyCall ").append(method.getName()).append("\n");
    }

    @Override
    public void beforeAnyWebDriverCall(WebDriver driver, Method method, Object[] args) {
      acc.append("beforeAnyWebDriverCall ").append(method.getName()).append("\n");
    }

    @Override
    public void afterAnyWebDriverCall(
        WebDriver driver, Method method, Object[] args, Object result) {
      acc.append("afterAnyWebDriverCall ").append(method.getName()).append("\n");
    }
  }

  @Test
  void shouldFireWebDriverEvents() {
    WebDriver driver = mock(WebDriver.class);
    CollectorListener listener =
        new CollectorListener() {
          @Override
          public void beforeAnyCall(Object target, Method method, Object[] args) {}

          @Override
          public void afterAnyCall(Object target, Method method, Object[] args, Object result) {}

          @Override
          public void beforeGet(WebDriver driver, String url) {
            acc.append("beforeGet\n");
          }

          @Override
          public void afterGet(WebDriver driver, String url) {
            acc.append("afterGet\n");
          }

          @Override
          public void beforeGetCurrentUrl(WebDriver driver) {
            acc.append("beforeGetCurrentUrl\n");
          }

          @Override
          public void afterGetCurrentUrl(WebDriver driver, String result) {
            acc.append("afterGetCurrentUrl\n");
          }

          @Override
          public void beforeGetTitle(WebDriver driver) {
            acc.append("beforeGetTitle\n");
          }

          @Override
          public void afterGetTitle(WebDriver driver, String result) {
            acc.append("afterGetTitle\n");
          }

          @Override
          public void beforeFindElement(WebDriver driver, By locator) {
            acc.append("beforeFindElement\n");
          }

          @Override
          public void afterFindElement(WebDriver driver, By locator, WebElement result) {
            acc.append("afterFindElement\n");
          }

          @Override
          public void beforeFindElements(WebDriver driver, By locator) {
            acc.append("beforeFindElements\n");
          }

          @Override
          public void afterFindElements(WebDriver driver, By locator, List<WebElement> result) {
            acc.append("afterFindElements\n");
          }

          @Override
          public void beforeGetPageSource(WebDriver driver) {
            acc.append("beforeGetPageSource\n");
          }

          @Override
          public void afterGetPageSource(WebDriver driver, String result) {
            acc.append("afterGetPageSource\n");
          }

          @Override
          public void beforeClose(WebDriver driver) {
            acc.append("beforeClose\n");
          }

          @Override
          public void afterClose(WebDriver driver) {
            acc.append("afterClose\n");
          }

          @Override
          public void beforeQuit(WebDriver driver) {
            acc.append("beforeQuit\n");
          }

          @Override
          public void afterQuit(WebDriver driver) {
            acc.append("afterQuit\n");
          }

          @Override
          public void beforeGetWindowHandle(WebDriver driver) {
            acc.append("beforeGetWindowHandle\n");
          }

          @Override
          public void afterGetWindowHandle(WebDriver driver, String result) {
            acc.append("afterGetWindowHandle\n");
          }

          @Override
          public void beforeGetWindowHandles(WebDriver driver) {
            acc.append("beforeGetWindowHandles\n");
          }

          @Override
          public void afterGetWindowHandles(WebDriver driver, Set<String> result) {
            acc.append("afterGetWindowHandles\n");
          }
        };
    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    decorated.get("http://example.com/");
    decorated.getCurrentUrl();
    decorated.getTitle();
    decorated.findElement(By.id("test"));
    decorated.findElements(By.id("test"));
    decorated.getPageSource();
    decorated.getWindowHandle();
    decorated.getWindowHandles();
    decorated.close();
    decorated.quit();

    assertThat(listener.acc.toString().trim())
        .isEqualTo(
            String.join(
                "\n",
                "beforeAnyWebDriverCall get",
                "beforeGet",
                "afterGet",
                "afterAnyWebDriverCall get",
                "beforeAnyWebDriverCall getCurrentUrl",
                "beforeGetCurrentUrl",
                "afterGetCurrentUrl",
                "afterAnyWebDriverCall getCurrentUrl",
                "beforeAnyWebDriverCall getTitle",
                "beforeGetTitle",
                "afterGetTitle",
                "afterAnyWebDriverCall getTitle",
                "beforeAnyWebDriverCall findElement",
                "beforeFindElement",
                "afterFindElement",
                "afterAnyWebDriverCall findElement",
                "beforeAnyWebDriverCall findElements",
                "beforeFindElements",
                "afterFindElements",
                "afterAnyWebDriverCall findElements",
                "beforeAnyWebDriverCall getPageSource",
                "beforeGetPageSource",
                "afterGetPageSource",
                "afterAnyWebDriverCall getPageSource",
                "beforeAnyWebDriverCall getWindowHandle",
                "beforeGetWindowHandle",
                "afterGetWindowHandle",
                "afterAnyWebDriverCall getWindowHandle",
                "beforeAnyWebDriverCall getWindowHandles",
                "beforeGetWindowHandles",
                "afterGetWindowHandles",
                "afterAnyWebDriverCall getWindowHandles",
                "beforeAnyWebDriverCall close",
                "beforeClose",
                "afterClose",
                "afterAnyWebDriverCall close",
                "beforeAnyWebDriverCall quit",
                "beforeQuit",
                "afterQuit",
                "afterAnyWebDriverCall quit"));
  }

  @Test
  void shouldFireWebDriverActionEvents() {
    WebDriver driver = mock(RemoteWebDriver.class);
    CollectorListener listener =
        new CollectorListener() {
          @Override
          public void beforePerform(WebDriver driver, Collection<Sequence> actions) {
            acc.append("beforePerform\n");
          }

          @Override
          public void afterPerform(WebDriver driver, Collection<Sequence> actions) {
            acc.append("afterPerform\n");
          }
        };
    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);
    Actions actions = new Actions(decorated);
    actions.perform();

    assertThat(listener.acc.toString().trim())
        .isEqualTo(
            String.join(
                "\n",
                "beforeAnyCall perform",
                "beforeAnyWebDriverCall perform",
                "beforePerform",
                "afterPerform",
                "afterAnyWebDriverCall perform",
                "afterAnyCall perform"));
  }

  @Test
  void shouldFireWebElementEvents() {
    WebDriver driver = mock(WebDriver.class);
    WebElement element = mock(WebElement.class);
    when(driver.findElement(any())).thenReturn(element);

    CollectorListener listener =
        new CollectorListener() {
          @Override
          public void beforeAnyCall(Object target, Method method, Object[] args) {}

          @Override
          public void afterAnyCall(Object target, Method method, Object[] args, Object result) {}

          @Override
          public void beforeFindElement(WebDriver driver, By locator) {
            acc.append("beforeFindElement").append("\n");
          }

          @Override
          public void afterFindElement(WebDriver driver, By locator, WebElement result) {
            acc.append("afterFindElement").append("\n");
          }

          @Override
          public void beforeAnyWebElementCall(WebElement element, Method method, Object[] args) {
            acc.append("beforeAnyWebElementCall ").append(method.getName()).append("\n");
          }

          @Override
          public void afterAnyWebElementCall(
              WebElement element, Method method, Object[] args, Object result) {
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

          @Override
          public void beforeSubmit(WebElement element) {
            acc.append("beforeSubmit").append("\n");
          }

          @Override
          public void afterSubmit(WebElement element) {
            acc.append("afterSubmit").append("\n");
          }

          @Override
          public void beforeSendKeys(WebElement element, CharSequence... keysToSend) {
            acc.append("beforeSendKeys").append("\n");
          }

          @Override
          public void afterSendKeys(WebElement element, CharSequence... keysToSend) {
            acc.append("afterSendKeys").append("\n");
          }

          @Override
          public void beforeClear(WebElement element) {
            acc.append("beforeClear").append("\n");
          }

          @Override
          public void afterClear(WebElement element) {
            acc.append("afterClear").append("\n");
          }

          @Override
          public void beforeGetTagName(WebElement element) {
            acc.append("beforeGetTagName").append("\n");
          }

          @Override
          public void afterGetTagName(WebElement element, String result) {
            acc.append("afterGetTagName").append("\n");
          }

          @Override
          public void beforeGetText(WebElement element) {
            acc.append("beforeGetText").append("\n");
          }

          @Override
          public void afterGetText(WebElement element, String result) {
            acc.append("afterGetText").append("\n");
          }

          @Override
          public void beforeIsDisplayed(WebElement element) {
            acc.append("beforeIsDisplayed").append("\n");
          }

          @Override
          public void afterIsDisplayed(WebElement element, boolean result) {
            acc.append("afterIsDisplayed").append("\n");
          }

          @Override
          public void beforeIsSelected(WebElement element) {
            acc.append("beforeIsSelected").append("\n");
          }

          @Override
          public void afterIsSelected(WebElement element, boolean result) {
            acc.append("afterIsSelected").append("\n");
          }

          @Override
          public void beforeGetAttribute(WebElement element, String name) {
            acc.append("beforeGetAttribute").append("\n");
          }

          @Override
          public void afterGetAttribute(WebElement element, String name, String result) {
            acc.append("afterGetAttribute").append("\n");
          }

          @Override
          public void beforeIsEnabled(WebElement element) {
            acc.append("beforeIsEnabled").append("\n");
          }

          @Override
          public void afterIsEnabled(WebElement element, boolean result) {
            acc.append("afterIsEnabled").append("\n");
          }

          @Override
          public void beforeFindElement(WebElement element, By locator) {
            acc.append("beforeFindElement").append("\n");
          }

          @Override
          public void afterFindElement(WebElement element, By locator, WebElement result) {
            acc.append("afterFindElement").append("\n");
          }

          @Override
          public void beforeFindElements(WebElement element, By locator) {
            acc.append("beforeFindElements").append("\n");
          }

          @Override
          public void afterFindElements(WebElement element, By locator, List<WebElement> result) {
            acc.append("afterFindElements").append("\n");
          }

          @Override
          public void beforeGetLocation(WebElement element) {
            acc.append("beforeGetLocation").append("\n");
          }

          @Override
          public void afterGetLocation(WebElement element, Point result) {
            acc.append("afterGetLocation").append("\n");
          }

          @Override
          public void beforeGetSize(WebElement element) {
            acc.append("beforeGetSize").append("\n");
          }

          @Override
          public void afterGetSize(WebElement element, Dimension result) {
            acc.append("afterGetSize").append("\n");
          }

          @Override
          public void beforeGetCssValue(WebElement element, String propertyName) {
            acc.append("beforeGetCssValue").append("\n");
          }

          @Override
          public void afterGetCssValue(WebElement element, String propertyName, String result) {
            acc.append("afterGetCssValue").append("\n");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    WebElement element1 = decorated.findElement(By.id("test"));
    element1.click();
    element1.submit();
    element1.sendKeys("test");
    element1.getText();
    element1.getTagName();
    element1.getAttribute("test");
    element1.isEnabled();
    element1.findElement(By.id("test"));
    element1.findElements(By.id("test"));
    element1.getLocation();
    element1.getSize();
    element1.getCssValue("test");
    element1.clear();

    assertThat(listener.acc.toString().trim())
        .isEqualTo(
            String.join(
                "\n",
                "beforeAnyWebDriverCall findElement",
                "beforeFindElement",
                "afterFindElement",
                "afterAnyWebDriverCall findElement",
                "beforeAnyWebElementCall click",
                "beforeClick",
                "afterClick",
                "afterAnyWebElementCall click",
                "beforeAnyWebElementCall submit",
                "beforeSubmit",
                "afterSubmit",
                "afterAnyWebElementCall submit",
                "beforeAnyWebElementCall sendKeys",
                "beforeSendKeys",
                "afterSendKeys",
                "afterAnyWebElementCall sendKeys",
                "beforeAnyWebElementCall getText",
                "beforeGetText",
                "afterGetText",
                "afterAnyWebElementCall getText",
                "beforeAnyWebElementCall getTagName",
                "beforeGetTagName",
                "afterGetTagName",
                "afterAnyWebElementCall getTagName",
                "beforeAnyWebElementCall getAttribute",
                "beforeGetAttribute",
                "afterGetAttribute",
                "afterAnyWebElementCall getAttribute",
                "beforeAnyWebElementCall isEnabled",
                "beforeIsEnabled",
                "afterIsEnabled",
                "afterAnyWebElementCall isEnabled",
                "beforeAnyWebElementCall findElement",
                "beforeFindElement",
                "afterFindElement",
                "afterAnyWebElementCall findElement",
                "beforeAnyWebElementCall findElements",
                "beforeFindElements",
                "afterFindElements",
                "afterAnyWebElementCall findElements",
                "beforeAnyWebElementCall getLocation",
                "beforeGetLocation",
                "afterGetLocation",
                "afterAnyWebElementCall getLocation",
                "beforeAnyWebElementCall getSize",
                "beforeGetSize",
                "afterGetSize",
                "afterAnyWebElementCall getSize",
                "beforeAnyWebElementCall getCssValue",
                "beforeGetCssValue",
                "afterGetCssValue",
                "afterAnyWebElementCall getCssValue",
                "beforeAnyWebElementCall clear",
                "beforeClear",
                "afterClear",
                "afterAnyWebElementCall clear"));
  }

  @Test
  void shouldFireNavigationEvents() throws MalformedURLException {
    WebDriver driver = mock(WebDriver.class);
    WebDriver.Navigation navigation = mock(WebDriver.Navigation.class);
    when(driver.navigate()).thenReturn(navigation);

    CollectorListener listener =
        new CollectorListener() {
          @Override
          public void beforeAnyNavigationCall(
              WebDriver.Navigation navigation, Method method, Object[] args) {}

          @Override
          public void afterAnyNavigationCall(
              WebDriver.Navigation navigation, Method method, Object[] args, Object result) {}

          @Override
          public void beforeBack(WebDriver.Navigation navigation) {
            acc.append("beforeBack").append("\n");
          }

          @Override
          public void afterBack(WebDriver.Navigation navigation) {
            acc.append("afterBack").append("\n");
          }

          @Override
          public void beforeTo(WebDriver.Navigation navigation, String url) {
            acc.append("beforeTo String").append("\n");
          }

          @Override
          public void afterTo(WebDriver.Navigation navigation, String url) {
            acc.append("afterTo String").append("\n");
          }

          @Override
          public void beforeTo(WebDriver.Navigation navigation, URL url) {
            acc.append("beforeTo URL").append("\n");
          }

          @Override
          public void afterTo(WebDriver.Navigation navigation, URL url) {
            acc.append("afterTo URL").append("\n");
          }

          @Override
          public void beforeRefresh(WebDriver.Navigation navigation) {
            acc.append("beforeRefresh").append("\n");
          }

          @Override
          public void afterRefresh(WebDriver.Navigation navigation) {
            acc.append("afterRefresh").append("\n");
          }

          @Override
          public void beforeForward(WebDriver.Navigation navigation) {
            acc.append("beforeForward").append("\n");
          }

          @Override
          public void afterForward(WebDriver.Navigation navigation) {
            acc.append("afterForward").append("\n");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    WebDriver.Navigation nav = decorated.navigate();
    nav.back();
    nav.forward();
    nav.refresh();

    String url = "http://example.com/";

    nav.to(url);
    nav.to(new URL(url));

    assertThat(listener.acc.toString().trim())
        .isEqualTo(
            String.join(
                "\n",
                "beforeAnyCall navigate",
                "beforeAnyWebDriverCall navigate",
                "afterAnyWebDriverCall navigate",
                "afterAnyCall navigate",
                "beforeAnyCall back",
                "beforeBack",
                "afterBack",
                "afterAnyCall back",
                "beforeAnyCall forward",
                "beforeForward",
                "afterForward",
                "afterAnyCall forward",
                "beforeAnyCall refresh",
                "beforeRefresh",
                "afterRefresh",
                "afterAnyCall refresh",
                "beforeAnyCall to",
                "beforeTo String",
                "afterTo String",
                "afterAnyCall to",
                "beforeAnyCall to",
                "beforeTo URL",
                "afterTo URL",
                "afterAnyCall to"));
  }

  @Test
  void shouldFireAlertEvents() {
    WebDriver driver = mock(WebDriver.class);
    WebDriver.TargetLocator switchTo = mock(WebDriver.TargetLocator.class);
    Alert alert = mock(Alert.class);
    when(driver.switchTo()).thenReturn(switchTo);
    when(switchTo.alert()).thenReturn(alert);

    CollectorListener listener =
        new CollectorListener() {
          @Override
          public void beforeAnyAlertCall(Alert alert, Method method, Object[] args) {
            acc.append("beforeAnyAlertCall ").append(method.getName()).append("\n");
          }

          @Override
          public void afterAnyAlertCall(Alert alert, Method method, Object[] args, Object result) {
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

          @Override
          public void beforeAccept(Alert alert) {
            acc.append("beforeAccept").append("\n");
          }

          @Override
          public void afterAccept(Alert alert) {
            acc.append("afterAccept").append("\n");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    Alert alert1 = decorated.switchTo().alert();
    alert1.dismiss();

    assertThat(listener.acc.toString().trim())
        .isEqualTo(
            String.join(
                "\n",
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
  void shouldAllowToExecuteJavaScript() {
    WebDriver driver =
        mock(WebDriver.class, withSettings().extraInterfaces(JavascriptExecutor.class));
    when(((JavascriptExecutor) driver).executeScript("sum", "2", "2")).thenReturn("4");

    CollectorListener listener =
        new CollectorListener() {
          @Override
          public void beforeExecuteScript(WebDriver driver, String script, Object[] args) {
            acc.append(script).append("(");
            acc.append(Stream.of(args).map(Object::toString).collect(Collectors.joining(", ")));
            acc.append(")\n");
          }

          @Override
          public void afterExecuteScript(
              WebDriver driver, String script, Object[] args, Object result) {
            acc.append(script).append("(");
            acc.append(Stream.of(args).map(Object::toString).collect(Collectors.joining(", ")));
            acc.append(") = ").append(result).append("\n");
          }

          @Override
          public void beforeExecuteAsyncScript(WebDriver driver, String script, Object[] args) {
            acc.append("beforeExecuteAsyncScript\n");
          }

          @Override
          public void afterExecuteAsyncScript(
              WebDriver driver, String script, Object[] args, Object result) {
            acc.append("afterExecuteAsyncScript\n");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    ((JavascriptExecutor) decorated).executeScript("sum", "2", "2");
    ((JavascriptExecutor) decorated).executeAsyncScript("sum", "2", "2");

    assertThat(listener.acc.toString().trim())
        .isEqualTo(
            String.join(
                "\n",
                "beforeAnyCall executeScript",
                "beforeAnyWebDriverCall executeScript",
                "sum(2, 2)",
                "sum(2, 2) = 4",
                "afterAnyWebDriverCall executeScript",
                "afterAnyCall executeScript",
                "beforeAnyCall executeAsyncScript",
                "beforeAnyWebDriverCall executeAsyncScript",
                "beforeExecuteAsyncScript",
                "afterExecuteAsyncScript",
                "afterAnyWebDriverCall executeAsyncScript",
                "afterAnyCall executeAsyncScript"));
  }

  @Test
  void shouldFireTargetLocatorEvents() {
    WebDriver driver = mock();
    WebDriver.TargetLocator targetLocator = mock();
    when(driver.switchTo()).thenReturn(targetLocator);

    CollectorListener listener =
        new CollectorListener() {
          @Override
          public void beforeAnyTargetLocatorCall(
              WebDriver.TargetLocator targetLocator, Method method, Object[] args) {
            acc.append("beforeAnyTargetLocatorCall ").append(method.getName()).append("\n");
          }

          @Override
          public void afterAnyTargetLocatorCall(
              WebDriver.TargetLocator targetLocator, Method method, Object[] args, Object result) {
            acc.append("afterAnyTargetLocatorCall ").append(method.getName()).append("\n");
          }

          @Override
          public void beforeFrame(WebDriver.TargetLocator targetLocator, int index) {
            acc.append("beforeFrame ").append(index).append("\n");
          }

          @Override
          public void afterFrame(
              WebDriver.TargetLocator targetLocator, int index, WebDriver driver) {
            acc.append("afterFrame ").append(index).append("\n");
          }

          @Override
          public void beforeFrame(WebDriver.TargetLocator targetLocator, String nameOrId) {
            acc.append("beforeFrame ").append(nameOrId).append("\n");
          }

          @Override
          public void afterFrame(
              WebDriver.TargetLocator targetLocator, String nameOrId, WebDriver driver) {
            acc.append("afterFrame ").append(nameOrId).append("\n");
          }

          @Override
          public void beforeFrame(WebDriver.TargetLocator targetLocator, WebElement frameElement) {
            acc.append("beforeFrame ").append(frameElement).append("\n");
          }

          @Override
          public void afterFrame(
              WebDriver.TargetLocator targetLocator, WebElement frameElement, WebDriver driver) {
            acc.append("afterFrame ").append(frameElement).append("\n");
          }

          @Override
          public void beforeParentFrame(WebDriver.TargetLocator targetLocator) {
            acc.append("beforeParentFrame").append("\n");
          }

          @Override
          public void afterParentFrame(WebDriver.TargetLocator targetLocator, WebDriver driver) {
            acc.append("afterParentFrame").append("\n");
          }

          @Override
          public void beforeWindow(WebDriver.TargetLocator targetLocator, String windowName) {
            acc.append("beforeWindow ").append(windowName).append("\n");
          }

          @Override
          public void afterWindow(
              WebDriver.TargetLocator targetLocator, String windowName, WebDriver driver) {
            acc.append("afterWindow ").append(windowName).append("\n");
          }

          @Override
          public void beforeNewWindow(WebDriver.TargetLocator targetLocator, WindowType typeHint) {
            acc.append("beforeNewWindow ").append(typeHint).append("\n");
          }

          @Override
          public void afterNewWindow(
              WebDriver.TargetLocator targetLocator, WindowType typeHint, WebDriver driver) {
            acc.append("afterNewWindow ").append(typeHint).append("\n");
          }

          @Override
          public void beforeDefaultContent(WebDriver.TargetLocator targetLocator) {
            acc.append("beforeDefaultContent").append("\n");
          }

          @Override
          public void afterDefaultContent(WebDriver.TargetLocator targetLocator, WebDriver driver) {
            acc.append("afterDefaultContent").append("\n");
          }

          @Override
          public void beforeActiveElement(WebDriver.TargetLocator targetLocator) {
            acc.append("beforeActiveElement").append("\n");
          }

          @Override
          public void afterActiveElement(WebDriver.TargetLocator targetLocator, WebDriver driver) {
            acc.append("afterActiveElement").append("\n");
          }

          @Override
          public void beforeAlert(WebDriver.TargetLocator targetLocator) {
            acc.append("beforeAlert").append("\n");
          }

          @Override
          public void afterAlert(WebDriver.TargetLocator targetLocator, Alert alert) {
            acc.append("afterAlert").append("\n");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);
    WebDriver.TargetLocator decoratedTargetLocator = decorated.switchTo();

    decoratedTargetLocator.frame(3);
    decoratedTargetLocator.frame("frame-id");
    WebElement frameElement = mock();
    decoratedTargetLocator.frame(frameElement);
    decoratedTargetLocator.parentFrame();
    decoratedTargetLocator.window("windowName");
    decoratedTargetLocator.newWindow(WindowType.TAB);
    decoratedTargetLocator.defaultContent();
    decoratedTargetLocator.activeElement();
    decoratedTargetLocator.alert();

    assertThat(listener.acc.toString().trim())
        .isEqualTo(
            String.join(
                "\n",
                "beforeAnyCall switchTo",
                "beforeAnyWebDriverCall switchTo",
                "afterAnyWebDriverCall switchTo",
                "afterAnyCall switchTo",
                "beforeAnyCall frame",
                "beforeAnyTargetLocatorCall frame",
                "beforeFrame 3",
                "afterFrame 3",
                "afterAnyTargetLocatorCall frame",
                "afterAnyCall frame",
                "beforeAnyCall frame",
                "beforeAnyTargetLocatorCall frame",
                "beforeFrame frame-id",
                "afterFrame frame-id",
                "afterAnyTargetLocatorCall frame",
                "afterAnyCall frame",
                "beforeAnyCall frame",
                "beforeAnyTargetLocatorCall frame",
                "beforeFrame " + frameElement,
                "afterFrame " + frameElement,
                "afterAnyTargetLocatorCall frame",
                "afterAnyCall frame",
                "beforeAnyCall parentFrame",
                "beforeAnyTargetLocatorCall parentFrame",
                "beforeParentFrame",
                "afterParentFrame",
                "afterAnyTargetLocatorCall parentFrame",
                "afterAnyCall parentFrame",
                "beforeAnyCall window",
                "beforeAnyTargetLocatorCall window",
                "beforeWindow windowName",
                "afterWindow windowName",
                "afterAnyTargetLocatorCall window",
                "afterAnyCall window",
                "beforeAnyCall newWindow",
                "beforeAnyTargetLocatorCall newWindow",
                "beforeNewWindow tab",
                "afterNewWindow tab",
                "afterAnyTargetLocatorCall newWindow",
                "afterAnyCall newWindow",
                "beforeAnyCall defaultContent",
                "beforeAnyTargetLocatorCall defaultContent",
                "beforeDefaultContent",
                "afterDefaultContent",
                "afterAnyTargetLocatorCall defaultContent",
                "afterAnyCall defaultContent",
                "beforeAnyCall activeElement",
                "beforeAnyTargetLocatorCall activeElement",
                "beforeActiveElement",
                "afterActiveElement",
                "afterAnyTargetLocatorCall activeElement",
                "afterAnyCall activeElement",
                "beforeAnyCall alert",
                "beforeAnyTargetLocatorCall alert",
                "beforeAlert",
                "afterAlert",
                "afterAnyTargetLocatorCall alert",
                "afterAnyCall alert"));
  }

  @Test
  void shouldSuppressExceptionInBeforeAnyCall() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener =
        new WebDriverListener() {
          @Override
          public void beforeAnyCall(Object target, Method method, Object[] args) {
            throw new RuntimeException("listener");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  void shouldSuppressExceptionInBeforeClassMethodCall() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener =
        new WebDriverListener() {
          @Override
          public void beforeAnyWebDriverCall(WebDriver driver, Method method, Object[] args) {
            throw new RuntimeException("listener");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  void shouldSuppressExceptionInBeforeMethod() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener =
        new WebDriverListener() {
          @Override
          public void beforeGetWindowHandle(WebDriver driver) {
            throw new RuntimeException("listener");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  void shouldSuppressExceptionInAfterAnyCall() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener =
        new WebDriverListener() {
          @Override
          public void afterAnyCall(Object target, Method method, Object[] args, Object result) {
            throw new RuntimeException("listener");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  void shouldSuppressExceptionInAfterClassMethodCall() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener =
        new WebDriverListener() {
          @Override
          public void afterAnyWebDriverCall(
              WebDriver driver, Method method, Object[] args, Object result) {
            throw new RuntimeException("listener");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  void shouldSuppressExceptionInAfterMethod() {
    WebDriver driver = mock(WebDriver.class);
    WebDriverListener listener =
        new WebDriverListener() {
          @Override
          public void afterGetWindowHandle(WebDriver driver, String result) {
            throw new RuntimeException("listener");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    assertThatNoException().isThrownBy(decorated::getWindowHandle);
  }

  @Test
  void shouldSuppressExceptionInOnError() {
    WebDriver driver = mock(WebDriver.class);
    when(driver.getWindowHandle()).thenThrow(new WebDriverException());
    WebDriverListener listener =
        new WebDriverListener() {
          @Override
          public void onError(
              Object target, Method method, Object[] args, InvocationTargetException e) {
            throw new RuntimeException("listener");
          }
        };

    WebDriver decorated = new EventFiringDecorator<>(listener).decorate(driver);

    assertThatExceptionOfType(WebDriverException.class).isThrownBy(decorated::getWindowHandle);
  }

  @Test
  void shouldBeAbleToDecorateAChildClassOfWebDriver() {
    RemoteWebDriver driver = mock(RemoteWebDriver.class);
    when(driver.getCapabilities()).thenReturn(new ImmutableCapabilities("browserName", "firefox"));

    WebDriverListener listener =
        new WebDriverListener() {
          @Override
          public void onError(
              Object target, Method method, Object[] args, InvocationTargetException e) {
            throw new RuntimeException("listener");
          }
        };

    RemoteWebDriver decorated =
        new EventFiringDecorator<>(RemoteWebDriver.class, listener).decorate(driver);

    Capabilities caps = decorated.getCapabilities();

    assertThat(caps.getBrowserName()).isEqualTo("firefox");
  }

  @Test
  void shouldBeAbleToCallDecoratedMethodForDecoratedChildClass() {
    RemoteWebDriver driver = mock(RemoteWebDriver.class);
    when(driver.getWindowHandle()).thenThrow(new WebDriverException());

    WebDriverListener listener =
        new WebDriverListener() {
          @Override
          public void onError(
              Object target, Method method, Object[] args, InvocationTargetException e) {
            throw new RuntimeException("listener");
          }
        };

    RemoteWebDriver decorated =
        new EventFiringDecorator<>(RemoteWebDriver.class, listener).decorate(driver);

    assertThatExceptionOfType(WebDriverException.class).isThrownBy(decorated::getWindowHandle);
  }

  @Test
  public void ensureListenersAreInvokedWhenUsingDecoratedSubClasses() {
    RemoteWebDriver originalDriver = mock(RemoteWebDriver.class);
    doNothing().when(originalDriver).get(any());
    AtomicInteger invocationCount = new AtomicInteger(0);
    WebDriverListener listener =
        new WebDriverListener() {
          @Override
          public void beforeAnyCall(Object target, Method method, Object[] args) {
            invocationCount.incrementAndGet();
          }
        };
    RemoteWebDriver rem =
        new EventFiringDecorator<>(RemoteWebDriver.class, listener).decorate(originalDriver);
    rem.get("http://localhost:4444");
    assertThat(invocationCount.get()).isEqualTo(1);
  }
}
