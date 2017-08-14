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

import org.openqa.selenium.Alert;
import org.openqa.selenium.Beta;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.interactions.Keyboard;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.interactions.TouchScreen;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;
import org.openqa.selenium.logging.Logs;
import org.openqa.selenium.security.Credentials;
import org.openqa.selenium.support.events.internal.EventFiringKeyboard;
import org.openqa.selenium.support.events.internal.EventFiringMouse;
import org.openqa.selenium.support.events.internal.EventFiringTouch;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * A wrapper around an arbitrary {@link WebDriver} instance which supports registering of a
 * {@link WebDriverEventListener}, e&#46;g&#46; for logging purposes.
 */
public class EventFiringWebDriver implements WebDriver, JavascriptExecutor, TakesScreenshot,
    WrapsDriver, HasInputDevices, HasTouchScreen {

  private final WebDriver driver;

  private final List<WebDriverEventListener> eventListeners =
      new ArrayList<>();
  private final WebDriverEventListener dispatcher = (WebDriverEventListener) Proxy
      .newProxyInstance(
          WebDriverEventListener.class.getClassLoader(),
          new Class[] {WebDriverEventListener.class},
          new InvocationHandler() {
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
              try {
              for (WebDriverEventListener eventListener : eventListeners) {
                method.invoke(eventListener, args);
              }
              return null;
              } catch (InvocationTargetException e) {
                throw e.getTargetException();
              }
            }
          }
      );

  public EventFiringWebDriver(final WebDriver driver) {
    Class<?>[] allInterfaces = extractInterfaces(driver);

    this.driver = (WebDriver) Proxy.newProxyInstance(
        WebDriverEventListener.class.getClassLoader(),
        allInterfaces,
        new InvocationHandler() {
          public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            if ("getWrappedDriver".equals(method.getName())) {
              return driver;
            }

            try {
              return method.invoke(driver, args);
            } catch (InvocationTargetException e) {
              dispatcher.onException(e.getTargetException(), driver);
              throw e.getTargetException();
            }
          }
        }
        );
  }

  private Class<?>[] extractInterfaces(Object object) {
    Set<Class<?>> allInterfaces = new HashSet<>();
    allInterfaces.add(WrapsDriver.class);
    if (object instanceof WebElement) {
      allInterfaces.add(WrapsElement.class);
    }
    extractInterfaces(allInterfaces, object.getClass());

    return allInterfaces.toArray(new Class<?>[allInterfaces.size()]);
  }

  private void extractInterfaces(Set<Class<?>> addTo, Class<?> clazz) {
    if (Object.class.equals(clazz)) {
      return; // Done
    }

    Class<?>[] classes = clazz.getInterfaces();
    addTo.addAll(Arrays.asList(classes));
    extractInterfaces(addTo, clazz.getSuperclass());
  }

  /**
   * @param eventListener the event listener to register
   * @return this for method chaining.
   */
  public EventFiringWebDriver register(WebDriverEventListener eventListener) {
    eventListeners.add(eventListener);
    return this;
  }

  /**
   * @param eventListener the event listener to unregister
   * @return this for method chaining.
   */
  public EventFiringWebDriver unregister(WebDriverEventListener eventListener) {
    eventListeners.remove(eventListener);
    return this;
  }


  public WebDriver getWrappedDriver() {
    if (driver instanceof WrapsDriver) {
      return ((WrapsDriver) driver).getWrappedDriver();
    }
    return driver;
  }

  public void get(String url) {
    dispatcher.beforeNavigateTo(url, driver);
    driver.get(url);
    dispatcher.afterNavigateTo(url, driver);
  }

  public String getCurrentUrl() {
    return driver.getCurrentUrl();
  }

  public String getTitle() {
    return driver.getTitle();
  }

  public List<WebElement> findElements(By by) {
    dispatcher.beforeFindBy(by, null, driver);
    List<WebElement> temp = driver.findElements(by);
    dispatcher.afterFindBy(by, null, driver);
    List<WebElement> result = new ArrayList<>(temp.size());
    for (WebElement element : temp) {
      result.add(createWebElement(element));
    }
    return result;
  }

  public WebElement findElement(By by) {
    dispatcher.beforeFindBy(by, null, driver);
    WebElement temp = driver.findElement(by);
    dispatcher.afterFindBy(by, null, driver);
    return createWebElement(temp);
  }

  public String getPageSource() {
    return driver.getPageSource();
  }

  public void close() {
    driver.close();
  }

  public void quit() {
    driver.quit();
  }

  public Set<String> getWindowHandles() {
    return driver.getWindowHandles();
  }

  public String getWindowHandle() {
    return driver.getWindowHandle();
  }

  public Object executeScript(String script, Object... args) {
    if (driver instanceof JavascriptExecutor) {
      dispatcher.beforeScript(script, driver);
      Object[] usedArgs = unpackWrappedArgs(args);
      Object result = ((JavascriptExecutor) driver).executeScript(script, usedArgs);
      dispatcher.afterScript(script, driver);
      return wrapResult(result);
    }
    throw new UnsupportedOperationException(
        "Underlying driver instance does not support executing javascript");
  }

  public Object executeAsyncScript(String script, Object... args) {
    if (driver instanceof JavascriptExecutor) {
      dispatcher.beforeScript(script, driver);
      Object[] usedArgs = unpackWrappedArgs(args);
      Object result = ((JavascriptExecutor) driver).executeAsyncScript(script, usedArgs);
      dispatcher.afterScript(script, driver);
      return result;
    }
    throw new UnsupportedOperationException(
        "Underlying driver instance does not support executing javascript");
  }

  private Object[] unpackWrappedArgs(Object... args) {
    // Walk the args: the various drivers expect unpacked versions of the elements
    Object[] usedArgs = new Object[args.length];
    for (int i = 0; i < args.length; i++) {
      usedArgs[i] = unpackWrappedElement(args[i]);
    }
    return usedArgs;
  }

  private Object unpackWrappedElement(Object arg) {
    if (arg instanceof List<?>) {
      List<?> aList = (List<?>) arg;
      List<Object> toReturn = new ArrayList<>();
      for (Object anAList : aList) {
        toReturn.add(unpackWrappedElement(anAList));
      }
      return toReturn;
    } else if (arg instanceof Map<?, ?>) {
      Map<?, ?> aMap = (Map<?, ?>) arg;
      Map<Object, Object> toReturn = new HashMap<>();
      for (Object key : aMap.keySet()) {
        toReturn.put(key, unpackWrappedElement(aMap.get(key)));
      }
      return toReturn;
    } else if (arg instanceof EventFiringWebElement) {
      return ((EventFiringWebElement) arg).getWrappedElement();
    } else {
      return arg;
    }
  }

  private Object wrapResult(Object result) {
    if (result instanceof WebElement) {
      return new EventFiringWebElement((WebElement) result);
    }
    if (result instanceof List) {
      return ((List) result).stream().map(this::wrapResult).collect(Collectors.toList());
    }
    if (result instanceof Map) {
      return ((Map<String, Object>) result).entrySet().stream().collect(Collectors.toMap(
          e -> e.getKey(), e -> wrapResult(e.getValue())
      ));
    }

    return result;
  }

  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    if (driver instanceof TakesScreenshot) {
      return ((TakesScreenshot) driver).getScreenshotAs(target);
    }

    throw new UnsupportedOperationException(
        "Underlying driver instance does not support taking screenshots");
  }

  public TargetLocator switchTo() {
    return new EventFiringTargetLocator(driver.switchTo());
  }

  public Navigation navigate() {
    return new EventFiringNavigation(driver.navigate());
  }

  public Options manage() {
    return new EventFiringOptions(driver.manage());
  }

  private WebElement createWebElement(WebElement from) {
    return new EventFiringWebElement(from);
  }

  public Keyboard getKeyboard() {
    if (driver instanceof HasInputDevices) {
      return new EventFiringKeyboard(driver, dispatcher);
    }
    throw new UnsupportedOperationException("Underlying driver does not implement advanced"
        + " user interactions yet.");
  }

  public Mouse getMouse() {
    if (driver instanceof HasInputDevices) {
      return new EventFiringMouse(driver, dispatcher);
    }
    throw new UnsupportedOperationException("Underlying driver does not implement advanced"
        + " user interactions yet.");
  }

  public TouchScreen getTouch() {
    if (driver instanceof HasTouchScreen) {
      return new EventFiringTouch(driver, dispatcher);
    }
    throw new UnsupportedOperationException("Underlying driver does not implement advanced"
        + " user interactions yet.");
 }

  private class EventFiringWebElement implements WebElement, WrapsElement, WrapsDriver, Locatable {

    private final WebElement element;
    private final WebElement underlyingElement;

    private EventFiringWebElement(final WebElement element) {
      this.element = (WebElement) Proxy.newProxyInstance(
          WebDriverEventListener.class.getClassLoader(),
          extractInterfaces(element),
          new InvocationHandler() {
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
              if (method.getName().equals("getWrappedElement")) {
                return element;
              }
              try {
                return method.invoke(element, args);
              } catch (InvocationTargetException e) {
                dispatcher.onException(e.getTargetException(), driver);
                throw e.getTargetException();
              }
            }
          }
          );
      this.underlyingElement = element;
    }

    public void click() {
      dispatcher.beforeClickOn(element, driver);
      element.click();
      dispatcher.afterClickOn(element, driver);
    }

    public void submit() {
      element.submit();
    }

    public void sendKeys(CharSequence... keysToSend) {
      dispatcher.beforeChangeValueOf(element, driver, keysToSend);
      element.sendKeys(keysToSend);
      dispatcher.afterChangeValueOf(element, driver, keysToSend);
    }

    public void clear() {
      dispatcher.beforeChangeValueOf(element, driver, null);
      element.clear();
      dispatcher.afterChangeValueOf(element, driver, null);
    }

    public String getTagName() {
      return element.getTagName();
    }

    public String getAttribute(String name) {
      return element.getAttribute(name);
    }

    public boolean isSelected() {
      return element.isSelected();
    }

    public boolean isEnabled() {
      return element.isEnabled();
    }

    public String getText() {
      return element.getText();
    }

    public boolean isDisplayed() {
      return element.isDisplayed();
    }

    public Point getLocation() {
      return element.getLocation();
    }

    public Dimension getSize() {
      return element.getSize();
    }

    public Rectangle getRect() {
      return element.getRect();
    }

    public String getCssValue(String propertyName) {
      return element.getCssValue(propertyName);
    }

    public WebElement findElement(By by) {
      dispatcher.beforeFindBy(by, element, driver);
      WebElement temp = element.findElement(by);
      dispatcher.afterFindBy(by, element, driver);
      return createWebElement(temp);
    }

    public List<WebElement> findElements(By by) {
      dispatcher.beforeFindBy(by, element, driver);
      List<WebElement> temp = element.findElements(by);
      dispatcher.afterFindBy(by, element, driver);
      List<WebElement> result = new ArrayList<>(temp.size());
      for (WebElement element : temp) {
        result.add(createWebElement(element));
      }
      return result;
    }

    public WebElement getWrappedElement() {
      return underlyingElement;
    }

    @Override
    public boolean equals(Object obj) {
      if (!(obj instanceof WebElement)) {
        return false;
      }

      WebElement other = (WebElement) obj;
      if (other instanceof WrapsElement) {
        other = ((WrapsElement) other).getWrappedElement();
      }

      return underlyingElement.equals(other);
    }

    @Override
    public int hashCode() {
      return underlyingElement.hashCode();
    }

    @Override
    public String toString() {
      return underlyingElement.toString();
    }

    public WebDriver getWrappedDriver() {
      return driver;
    }

    public Coordinates getCoordinates() {
      return ((Locatable) underlyingElement).getCoordinates();
    }

    public <X> X getScreenshotAs(OutputType<X> outputType) throws WebDriverException {
      return element.getScreenshotAs(outputType);
    }
  }

  private class EventFiringNavigation implements Navigation {

    private final WebDriver.Navigation navigation;

    EventFiringNavigation(Navigation navigation) {
      this.navigation = navigation;
    }

    public void to(String url) {
      dispatcher.beforeNavigateTo(url, driver);
      navigation.to(url);
      dispatcher.afterNavigateTo(url, driver);
    }

    public void to(URL url) {
      to(String.valueOf(url));
    }

    public void back() {
      dispatcher.beforeNavigateBack(driver);
      navigation.back();
      dispatcher.afterNavigateBack(driver);
    }

    public void forward() {
      dispatcher.beforeNavigateForward(driver);
      navigation.forward();
      dispatcher.afterNavigateForward(driver);
    }

    public void refresh() {
      dispatcher.beforeNavigateRefresh(driver);
      navigation.refresh();
      dispatcher.afterNavigateRefresh(driver);
    }
  }

  private class EventFiringOptions implements Options {

    private Options options;

    private EventFiringOptions(Options options) {
      this.options = options;
    }

    public Logs logs() {
      return options.logs();
    }

    public void addCookie(Cookie cookie) {
      options.addCookie(cookie);
    }

    public void deleteCookieNamed(String name) {
      options.deleteCookieNamed(name);
    }

    public void deleteCookie(Cookie cookie) {
      options.deleteCookie(cookie);
    }

    public void deleteAllCookies() {
      options.deleteAllCookies();
    }

    public Set<Cookie> getCookies() {
      return options.getCookies();
    }

    public Cookie getCookieNamed(String name) {
      return options.getCookieNamed(name);
    }

    public Timeouts timeouts() {
      return new EventFiringTimeouts(options.timeouts());
    }

    public ImeHandler ime() {
      return options.ime();
    }

    @Beta
    public Window window() {
      return new EventFiringWindow(options.window());
    }
  }

  private class EventFiringTimeouts implements Timeouts {

    private final Timeouts timeouts;

    EventFiringTimeouts(Timeouts timeouts) {
      this.timeouts = timeouts;
    }

    public Timeouts implicitlyWait(long time, TimeUnit unit) {
      timeouts.implicitlyWait(time, unit);
      return this;
    }

    public Timeouts setScriptTimeout(long time, TimeUnit unit) {
      timeouts.setScriptTimeout(time, unit);
      return this;
    }

    public Timeouts pageLoadTimeout(long time, TimeUnit unit) {
      timeouts.pageLoadTimeout(time, unit);
      return this;
    }
  }

  private class EventFiringTargetLocator implements TargetLocator {

    private TargetLocator targetLocator;

    private EventFiringTargetLocator(TargetLocator targetLocator) {
      this.targetLocator = targetLocator;
    }

    public WebDriver frame(int frameIndex) {
      return targetLocator.frame(frameIndex);
    }

    public WebDriver frame(String frameName) {
      return targetLocator.frame(frameName);
    }

    public WebDriver frame(WebElement frameElement) {
      return targetLocator.frame(frameElement);
    }

    public WebDriver parentFrame() {
      return targetLocator.parentFrame();
    }

    public WebDriver window(String windowName) {
      return targetLocator.window(windowName);
    }

    public WebDriver defaultContent() {
      return targetLocator.defaultContent();
    }

    public WebElement activeElement() {
      return targetLocator.activeElement();
    }

    public Alert alert() {
      return new EventFiringAlert(this.targetLocator.alert());
    }
  }

  @Beta
  private class EventFiringWindow implements Window {
    private final Window window;

    EventFiringWindow(Window window) {
      this.window = window;
    }

    public void setSize(Dimension targetSize) {
      window.setSize(targetSize);
    }

    public void setPosition(Point targetLocation) {
      window.setPosition(targetLocation);
    }

    public Dimension getSize() {
      return window.getSize();
    }

    public Point getPosition() {
      return window.getPosition();
    }

    public void maximize() {
      window.maximize();
    }

    public void fullscreen() {
      window.fullscreen();
    }
  }

  private class EventFiringAlert implements Alert {
    private final Alert alert;

    private EventFiringAlert(Alert alert) {
      this.alert = alert;
    }

    public void dismiss() {
      dispatcher.beforeAlertDismiss(driver);
      alert.dismiss();
      dispatcher.afterAlertDismiss(driver);
    }

    public void accept() {
      dispatcher.beforeAlertAccept(driver);
      alert.accept();
      dispatcher.afterAlertAccept(driver);
    }

    public String getText() {
      return alert.getText();
    }

    public void sendKeys(String keysToSend) {
      alert.sendKeys(keysToSend);
    }

    public void setCredentials(Credentials credentials) {
      alert.setCredentials(credentials);
    }

    public void authenticateUsing(Credentials credentials) {
      alert.authenticateUsing(credentials);
    }
  }
}
