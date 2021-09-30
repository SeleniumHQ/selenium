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
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.WrapsDriver;
import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.interactions.Coordinates;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.interactions.Interactive;
import org.openqa.selenium.interactions.Keyboard;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.interactions.Sequence;
import org.openqa.selenium.interactions.TouchScreen;
import org.openqa.selenium.logging.Logs;
import org.openqa.selenium.support.events.internal.EventFiringKeyboard;
import org.openqa.selenium.support.events.internal.EventFiringMouse;
import org.openqa.selenium.support.events.internal.EventFiringTouch;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Proxy;
import java.net.URL;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
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
 * @deprecated Use {@link EventFiringDecorator} and {@link WebDriverListener} instead
 */
@Deprecated
public class EventFiringWebDriver implements
  WebDriver,
  JavascriptExecutor,
  TakesScreenshot,
  WrapsDriver,
  HasInputDevices,
  HasTouchScreen,
  Interactive,
  HasCapabilities {

  private final WebDriver driver;

  private final List<WebDriverEventListener> eventListeners =
      new ArrayList<>();
  private final WebDriverEventListener dispatcher = (WebDriverEventListener) Proxy
      .newProxyInstance(
          WebDriverEventListener.class.getClassLoader(),
          new Class[] {WebDriverEventListener.class},
          (proxy, method, args) -> {
            try {
            for (WebDriverEventListener eventListener : eventListeners) {
              method.invoke(eventListener, args);
            }
            return null;
            } catch (InvocationTargetException e) {
              throw e.getTargetException();
            }
          }
      );

  public EventFiringWebDriver(final WebDriver driver) {
    Class<?>[] allInterfaces = extractInterfaces(driver);

    this.driver = (WebDriver) Proxy.newProxyInstance(
        WebDriverEventListener.class.getClassLoader(),
        allInterfaces,
        (proxy, method, args) -> {
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
    );
  }

  private Class<?>[] extractInterfaces(Object object) {
    Set<Class<?>> allInterfaces = new HashSet<>();
    allInterfaces.add(WrapsDriver.class);
    if (object instanceof WebElement) {
      allInterfaces.add(WrapsElement.class);
    }
    extractInterfaces(allInterfaces, object.getClass());

    return allInterfaces.toArray(new Class<?>[0]);
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


  @Override
  public WebDriver getWrappedDriver() {
    if (driver instanceof WrapsDriver) {
      return ((WrapsDriver) driver).getWrappedDriver();
    }
    return driver;
  }

  @Override
  public void get(String url) {
    dispatcher.beforeNavigateTo(url, driver);
    driver.get(url);
    dispatcher.afterNavigateTo(url, driver);
  }

  @Override
  public String getCurrentUrl() {
    return driver.getCurrentUrl();
  }

  @Override
  public String getTitle() {
    return driver.getTitle();
  }

  @Override
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

  @Override
  public WebElement findElement(By by) {
    dispatcher.beforeFindBy(by, null, driver);
    WebElement temp = driver.findElement(by);
    dispatcher.afterFindBy(by, temp, driver);
    return createWebElement(temp);
  }

  @Override
  public String getPageSource() {
    return driver.getPageSource();
  }

  @Override
  public void close() {
    driver.close();
  }

  @Override
  public void quit() {
    driver.quit();
  }

  @Override
  public Set<String> getWindowHandles() {
    return driver.getWindowHandles();
  }

  @Override
  public String getWindowHandle() {
    return driver.getWindowHandle();
  }

  @Override
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

  @Override
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
      for (Map.Entry<?, ?> entry : aMap.entrySet()) {
        toReturn.put(entry.getKey(), unpackWrappedElement(entry.getValue()));
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
      return ((List<?>) result).stream().map(this::wrapResult).collect(Collectors.toList());
    }
    if (result instanceof Map) {
      return ((Map<?, ?>) result).entrySet().stream().collect(
          HashMap::new,
          (m, e) -> m.put(e.getKey(), e.getValue()),
          Map::putAll);
    }

    return result;
  }

   @Override
   public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
     if (driver instanceof TakesScreenshot) {
        dispatcher.beforeGetScreenshotAs(target);
        X screenshot = ((TakesScreenshot) driver).getScreenshotAs(target);
        dispatcher.afterGetScreenshotAs(target, screenshot);
        return screenshot;
     }

    throw new UnsupportedOperationException(
        "Underlying driver instance does not support taking screenshots");
  }

  @Override
  public TargetLocator switchTo() {
    return new EventFiringTargetLocator(driver.switchTo());
  }

  @Override
  public Navigation navigate() {
    return new EventFiringNavigation(driver.navigate());
  }

  @Override
  public Options manage() {
    return new EventFiringOptions(driver.manage());
  }

  private WebElement createWebElement(WebElement from) {
    return new EventFiringWebElement(from);
  }

  @Override
  public Keyboard getKeyboard() {
    if (driver instanceof HasInputDevices) {
      return new EventFiringKeyboard(driver, dispatcher);
    }
    throw new UnsupportedOperationException("Underlying driver does not implement advanced"
        + " user interactions yet.");
  }

  @Override
  public Mouse getMouse() {
    if (driver instanceof HasInputDevices) {
      return new EventFiringMouse(driver, dispatcher);
    }
    throw new UnsupportedOperationException("Underlying driver does not implement advanced"
        + " user interactions yet.");
  }

  @Override
  public TouchScreen getTouch() {
    if (driver instanceof HasTouchScreen) {
      return new EventFiringTouch(driver, dispatcher);
    }
    throw new UnsupportedOperationException("Underlying driver does not implement advanced"
        + " user interactions yet.");
 }

  @Override
  public void perform(Collection<Sequence> actions) {
    if (driver instanceof Interactive) {
      ((Interactive) driver).perform(actions);
      return;
    }
    throw new UnsupportedOperationException("Underlying driver does not implement advanced"
                                            + " user interactions yet.");

  }

  @Override
  public void resetInputState() {
    if (driver instanceof Interactive) {
      ((Interactive) driver).resetInputState();
      return;
    }
    throw new UnsupportedOperationException("Underlying driver does not implement advanced"
                                            + " user interactions yet.");

  }

  @Override
  public Capabilities getCapabilities() {
    if (driver instanceof HasCapabilities) {
      return ((HasCapabilities) driver).getCapabilities();
    }
    throw new UnsupportedOperationException(
        "Underlying driver does not implement getting capabilities yet.");
  }


  private class EventFiringWebElement implements WebElement, WrapsElement, WrapsDriver,
                                                 org.openqa.selenium.interactions.Locatable {

    private final WebElement element;
    private final WebElement underlyingElement;

    private EventFiringWebElement(final WebElement element) {
      this.element = (WebElement) Proxy.newProxyInstance(
          WebDriverEventListener.class.getClassLoader(),
          extractInterfaces(element),
          (proxy, method, args) -> {
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
      );
      this.underlyingElement = element;
    }

    @Override
    public void click() {
      dispatcher.beforeClickOn(element, driver);
      element.click();
      dispatcher.afterClickOn(element, driver);
    }

    @Override
    public void submit() {
      element.submit();
    }

    @Override
    public void sendKeys(CharSequence... keysToSend) {
      dispatcher.beforeChangeValueOf(element, driver, keysToSend);
      element.sendKeys(keysToSend);
      dispatcher.afterChangeValueOf(element, driver, keysToSend);
    }

    @Override
    public void clear() {
      dispatcher.beforeChangeValueOf(element, driver, null);
      element.clear();
      dispatcher.afterChangeValueOf(element, driver, null);
    }

    @Override
    public String getTagName() {
      return element.getTagName();
    }

    @Override
    public String getAttribute(String name) {
      return element.getAttribute(name);
    }

    @Override
    public String getDomAttribute(String name) {
      return element.getDomAttribute(name);
    }

    @Override
    public boolean isSelected() {
      return element.isSelected();
    }

    @Override
    public boolean isEnabled() {
      return element.isEnabled();
    }

    @Override
    public String getText() {
      dispatcher.beforeGetText(element, driver);
      String text = element.getText();
      dispatcher.afterGetText(element, driver, text);
      return text;
    }

    @Override
    public boolean isDisplayed() {
      return element.isDisplayed();
    }

    @Override
    public Point getLocation() {
      return element.getLocation();
    }

    @Override
    public Dimension getSize() {
      return element.getSize();
    }

    @Override
    public Rectangle getRect() {
      return element.getRect();
    }

    @Override
    public String getCssValue(String propertyName) {
      return element.getCssValue(propertyName);
    }

    @Override
    public WebElement findElement(By by) {
      dispatcher.beforeFindBy(by, element, driver);
      WebElement temp = element.findElement(by);
      dispatcher.afterFindBy(by, element, driver);
      return createWebElement(temp);
    }

    @Override
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

    @Override
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

    @Override
    public WebDriver getWrappedDriver() {
      return driver;
    }

    @Override
    public Coordinates getCoordinates() {
      return ((Locatable) underlyingElement).getCoordinates();
    }

    @Override
    public <X> X getScreenshotAs(OutputType<X> outputType) throws WebDriverException {
      return element.getScreenshotAs(outputType);
    }
  }

  private class EventFiringNavigation implements Navigation {

    private final WebDriver.Navigation navigation;

    EventFiringNavigation(Navigation navigation) {
      this.navigation = navigation;
    }

    @Override
    public void to(String url) {
      dispatcher.beforeNavigateTo(url, driver);
      navigation.to(url);
      dispatcher.afterNavigateTo(url, driver);
    }

    @Override
    public void to(URL url) {
      to(String.valueOf(url));
    }

    @Override
    public void back() {
      dispatcher.beforeNavigateBack(driver);
      navigation.back();
      dispatcher.afterNavigateBack(driver);
    }

    @Override
    public void forward() {
      dispatcher.beforeNavigateForward(driver);
      navigation.forward();
      dispatcher.afterNavigateForward(driver);
    }

    @Override
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

    @Override
    public Logs logs() {
      return options.logs();
    }

    @Override
    public void addCookie(Cookie cookie) {
      options.addCookie(cookie);
    }

    @Override
    public void deleteCookieNamed(String name) {
      options.deleteCookieNamed(name);
    }

    @Override
    public void deleteCookie(Cookie cookie) {
      options.deleteCookie(cookie);
    }

    @Override
    public void deleteAllCookies() {
      options.deleteAllCookies();
    }

    @Override
    public Set<Cookie> getCookies() {
      return options.getCookies();
    }

    @Override
    public Cookie getCookieNamed(String name) {
      return options.getCookieNamed(name);
    }

    @Override
    public Timeouts timeouts() {
      return new EventFiringTimeouts(options.timeouts());
    }

    @Override
    public ImeHandler ime() {
      return options.ime();
    }

    @Override
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

    @Deprecated
    @Override
    public Timeouts implicitlyWait(long time, TimeUnit unit) {
      return implicitlyWait(Duration.ofMillis(unit.toMillis(time)));
    }

    @Override
    public Timeouts implicitlyWait(Duration duration) {
      timeouts.implicitlyWait(duration);
      return this;
    }

    @Override
    public Duration getImplicitWaitTimeout() {
      return timeouts.getImplicitWaitTimeout();
    }

    @Deprecated
    @Override
    public Timeouts setScriptTimeout(long time, TimeUnit unit) {
      return setScriptTimeout(Duration.ofMillis(unit.toMillis(time)));
    }

    @Override
    public Timeouts setScriptTimeout(Duration duration) {
      timeouts.setScriptTimeout(duration);
      return this;
    }

    @Override
    public Duration getScriptTimeout() {
      return timeouts.getScriptTimeout();
    }

    @Deprecated
    @Override
    public Timeouts pageLoadTimeout(long time, TimeUnit unit) {
      return pageLoadTimeout(Duration.ofMillis(unit.toMillis(time)));
    }

    @Override
    public Timeouts pageLoadTimeout(Duration duration) {
      timeouts.pageLoadTimeout(duration);
      return this;
    }

    @Override
    public Duration getPageLoadTimeout() {
      return timeouts.getPageLoadTimeout();
    }
  }

  private class EventFiringTargetLocator implements TargetLocator {

    private TargetLocator targetLocator;

    private EventFiringTargetLocator(TargetLocator targetLocator) {
      this.targetLocator = targetLocator;
    }

    @Override
    public WebDriver frame(int frameIndex) {
      return targetLocator.frame(frameIndex);
    }

    @Override
    public WebDriver frame(String frameName) {
      return targetLocator.frame(frameName);
    }

    @Override
    public WebDriver frame(WebElement frameElement) {
      return targetLocator.frame(frameElement);
    }

    @Override
    public WebDriver parentFrame() {
      return targetLocator.parentFrame();
    }

    @Override
    public WebDriver window(String windowName) {
      dispatcher.beforeSwitchToWindow(windowName, driver);
      WebDriver driverToReturn = targetLocator.window(windowName);
      dispatcher.afterSwitchToWindow(windowName, driver);
      return driverToReturn;
    }

    @Override
    public WebDriver newWindow(WindowType typeHint) {
      dispatcher.beforeSwitchToWindow(null, driver);
      WebDriver driverToReturn = targetLocator.newWindow(typeHint);
      dispatcher.afterSwitchToWindow(null, driver);
      return driverToReturn;
    }

    @Override
    public WebDriver defaultContent() {
      return targetLocator.defaultContent();
    }

    @Override
    public WebElement activeElement() {
      return targetLocator.activeElement();
    }

    @Override
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

    @Override
    public void setSize(Dimension targetSize) {
      window.setSize(targetSize);
    }

    @Override
    public void setPosition(Point targetLocation) {
      window.setPosition(targetLocation);
    }

    @Override
    public Dimension getSize() {
      return window.getSize();
    }

    @Override
    public Point getPosition() {
      return window.getPosition();
    }

    @Override
    public void maximize() {
      window.maximize();
    }

    @Override
    public void minimize() {
      window.minimize();
    }

    @Override
    public void fullscreen() {
      window.fullscreen();
    }
  }

  private class EventFiringAlert implements Alert {
    private final Alert alert;

    private EventFiringAlert(Alert alert) {
      this.alert = alert;
    }

    @Override
    public void dismiss() {
      dispatcher.beforeAlertDismiss(driver);
      alert.dismiss();
      dispatcher.afterAlertDismiss(driver);
    }

    @Override
    public void accept() {
      dispatcher.beforeAlertAccept(driver);
      alert.accept();
      dispatcher.afterAlertAccept(driver);
    }

    @Override
    public String getText() {
      return alert.getText();
    }

    @Override
    public void sendKeys(String keysToSend) {
      alert.sendKeys(keysToSend);
    }
  }
}
