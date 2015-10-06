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
import org.openqa.selenium.support.events.listeners.AlertEventListener;
import org.openqa.selenium.support.events.listeners.ElementEventListener;
import org.openqa.selenium.support.events.listeners.JavaScriptEventListener;
import org.openqa.selenium.support.events.listeners.KeyboardEventListener;
import org.openqa.selenium.support.events.listeners.ListensToException;
import org.openqa.selenium.support.events.listeners.MouseEventListener;
import org.openqa.selenium.support.events.listeners.NavigationEventListener;
import org.openqa.selenium.support.events.listeners.SearchingEventListener;
import org.openqa.selenium.support.events.listeners.TouchEventLitener;
import org.openqa.selenium.support.events.listeners.WindowEventListener;
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

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * A wrapper around an arbitrary {@link WebDriver} instance which supports
 * registering of a {@link }, {@link AlertEventListener},
 * {@link ElementEventListener}, {@link JavaScriptEventListener},
 * {@link KeyboardEventListener}, {@link ListensToException},
 * {@link NavigationEventListener}, {@link SearchingEventListener},
 * {@link WindowEventListener}, {@link MouseEventListener},
 * {@link TouchEventLitener} e&#46;g&#46; for logging purposes.
 */
public class EventFiringWebDriver implements WebDriver, JavascriptExecutor,
    TakesScreenshot, WrapsDriver, HasInputDevices, HasTouchScreen {

  private final WebDriver driver;
  private static final List<Class<?>> LISTENERS = new ArrayList<Class<?>>() {
    private static final long serialVersionUID = 1L;
    {
      add(AlertEventListener.class);
      add(ElementEventListener.class);
      add(JavaScriptEventListener.class);
      add(KeyboardEventListener.class);
      add(ListensToException.class);
      add(NavigationEventListener.class);
      add(SearchingEventListener.class);
      add(WindowEventListener.class);
      add(MouseEventListener.class);
      add(TouchEventLitener.class);
    }
  };
  private static final String WRAPS_DRIVER_METHOD = "getWrappedDriver";

  private final List<Object> eventListeners = new ArrayList<>();
  private final Object dispatcher = Proxy.newProxyInstance(
      ListensToException.class.getClassLoader(),
      LISTENERS.toArray(new Class<?>[] {}), new InvocationHandler() {
        public Object invoke(Object proxy, Method method, Object[] args)
            throws Throwable {
          try {
            for (Object eventListener : eventListeners) {
              if (method.getDeclaringClass().isAssignableFrom(
                  eventListener.getClass()))
                method.invoke(eventListener, args);
            }
          } catch (InvocationTargetException e) {
            throw e.getTargetException();
          }
          return null;
        }
      });

  private <T extends Object> T castDispatcher(Class<T> target) {
    return target.cast(dispatcher);
  }

  public EventFiringWebDriver(final WebDriver webDriver) {
    Class<?>[] allInterfaces = extractInterfaces(webDriver);

    this.driver = (WebDriver) Proxy.newProxyInstance(WebDriver.class
        .getClassLoader(), allInterfaces, new EventFiringInvocationHandler(
        castDispatcher(ListensToException.class), webDriver, webDriver) {
      @Override
      public Object invoke(Object proxy, Method method, Object[] args)
          throws Throwable {
        if (WrapsDriver.class.isAssignableFrom(method.getDeclaringClass()) 
            && method.getName().equals(WRAPS_DRIVER_METHOD))
          return webDriver;
        return super.invoke(proxy, method, args);
      }
    });
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
   * It is strongly recommended to pass through this method instances
   * of classes which implement one/few of these interfaces:</br> -
   * {@link AlertEventListener} </br> - {@link ElementEventListener}
   * </br> - {@link JavaScriptEventListener}</br> -
   * {@link KeyboardEventListener}</br> - {@link ListensToException}
   * </br> - {@link NavigationEventListener}</br> -
   * {@link SearchingEventListener}</br> - {@link WindowEventListener}
   * </br> - {@link MouseEventListener}</br> -
   * {@link TouchEventLitener}</br> </br></br>or
   * {@link WebDriverEventListener} which already combines some from
   * the list above.
   * @return this for method chaining.
   */
  public EventFiringWebDriver register(Object eventListener) {
    checkNotNull(eventListener);
    eventListeners.add(eventListener);
    return this;
  }

  /**
   * @param eventListener the event listener to unregister
   * @return this for method chaining.
   */
  public EventFiringWebDriver unregister(Object eventListener) {
    eventListeners.remove(eventListener);
    return this;
  }

  public WebDriver getWrappedDriver() {
    if (driver instanceof WrapsDriver) {
      return ((WrapsDriver) driver).getWrappedDriver();
    } else {
      return driver;
    }
  }

  public void get(String url) {
    castDispatcher(NavigationEventListener.class).beforeNavigateTo(url, driver);
    driver.get(url);
    castDispatcher(NavigationEventListener.class).afterNavigateTo(url, driver);
  }

  public String getCurrentUrl() {
    return driver.getCurrentUrl();
  }

  public String getTitle() {
    return driver.getTitle();
  }

  public List<WebElement> findElements(By by) {
    castDispatcher(SearchingEventListener.class).beforeFindBy(by, null, driver);
    List<WebElement> temp = driver.findElements(by);
    castDispatcher(SearchingEventListener.class).afterFindBy(by, null, driver);
    List<WebElement> result = new ArrayList<>(temp.size());
    for (WebElement element : temp) {
      result.add(createWebElement(element));
    }
    return result;
  }

  public WebElement findElement(By by) {
    castDispatcher(SearchingEventListener.class).beforeFindBy(by, null, driver);
    WebElement temp = driver.findElement(by);
    castDispatcher(SearchingEventListener.class).afterFindBy(by, null, driver);
    return createWebElement(temp);
  }

  public String getPageSource() {
    return driver.getPageSource();
  }

  public void close() {
    castDispatcher(WindowEventListener.class).beforeWindowIsClosed(driver);
    driver.close();
    castDispatcher(WindowEventListener.class).afterWindowIsClosed(driver);
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
      castDispatcher(JavaScriptEventListener.class)
          .beforeScript(script, driver);
      Object[] usedArgs = unpackWrappedArgs(args);
      Object result = ((JavascriptExecutor) driver).executeScript(script,
          usedArgs);
      castDispatcher(JavaScriptEventListener.class).afterScript(script, driver);
      return result;
    }
    throw new UnsupportedOperationException(
        "Underlying driver instance does not support executing javascript");
  }

  public Object executeAsyncScript(String script, Object... args) {
    if (driver instanceof JavascriptExecutor) {
      castDispatcher(JavaScriptEventListener.class)
          .beforeScript(script, driver);
      Object[] usedArgs = unpackWrappedArgs(args);
      Object result = ((JavascriptExecutor) driver).executeAsyncScript(script,
          usedArgs);
      castDispatcher(JavaScriptEventListener.class).afterScript(script, driver);
      return result;
    }
    throw new UnsupportedOperationException(
        "Underlying driver instance does not support executing javascript");
  }

  private Object[] unpackWrappedArgs(Object... args) {
    // Walk the args: the various drivers expect unpacked versions of the
    // elements
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
      return new EventFiringKeyboard(driver,
          castDispatcher(KeyboardEventListener.class));
    } else {
      throw new UnsupportedOperationException(
          "Underlying driver does not implement advanced"
              + " user interactions yet.");
    }
  }

  public Mouse getMouse() {
    if (driver instanceof HasInputDevices) {
      return new EventFiringMouse(driver,
          castDispatcher(MouseEventListener.class));
    } else {
      throw new UnsupportedOperationException(
          "Underlying driver does not implement advanced"
              + " user interactions yet.");
    }
  }

  public TouchScreen getTouch() {
    if (driver instanceof HasTouchScreen) {
      return new EventFiringTouch(driver,
          castDispatcher(TouchEventLitener.class));
    } else {
      throw new UnsupportedOperationException(
          "Underlying driver does not implement advanced"
              + " user interactions yet.");
    }
  }

  private class EventFiringAlert implements Alert {
    private final Alert alert;

    public EventFiringAlert(Alert alert) {
      this.alert = (Alert) Proxy.newProxyInstance(Alert.class.getClassLoader(),
          new Class[] { Alert.class }, new EventFiringInvocationHandler(
              castDispatcher(ListensToException.class), driver, alert));
    }

    @Override
    public void dismiss() {
      castDispatcher(AlertEventListener.class)
          .beforeAlertDismiss(driver, alert);
      alert.dismiss();
      castDispatcher(AlertEventListener.class).afterAlertDismiss(driver, alert);
    }

    @Override
    public void accept() {
      castDispatcher(AlertEventListener.class).beforeAlertAccept(driver, alert);
      alert.accept();
      castDispatcher(AlertEventListener.class).afterAlertAccept(driver, alert);
    }

    @Override
    public String getText() {
      return alert.getText();
    }

    @Override
    public void sendKeys(String keysToSend) {
      castDispatcher(AlertEventListener.class).beforeAlertSendKeys(driver,
          alert, keysToSend);
      alert.accept();
      castDispatcher(AlertEventListener.class).afterAlertSendKeys(driver,
          alert, keysToSend);
    }

    @Override
    public void setCredentials(Credentials credentials) {
      castDispatcher(AlertEventListener.class).beforeAuthentication(driver,
          alert, credentials);
      alert.setCredentials(credentials);
      castDispatcher(AlertEventListener.class).afterAuthentication(driver,
          alert, credentials);
    }

    @Override
    public void authenticateUsing(Credentials credentials) {
      castDispatcher(AlertEventListener.class).beforeAuthentication(driver,
          alert, credentials);
      alert.authenticateUsing(credentials);
      castDispatcher(AlertEventListener.class).afterAuthentication(driver,
          alert, credentials);
    }

  }

  private class EventFiringWebElement implements WebElement, WrapsElement,
      WrapsDriver, Locatable {
    private static final String WRAPS_ELEMENT_METHOD = "getWrappedElement";

    private final WebElement element;
    private final WebElement underlyingElement;

    private EventFiringWebElement(final WebElement webElement) {
      this.element = (WebElement) Proxy.newProxyInstance(WebElement.class
          .getClassLoader(), extractInterfaces(webElement),
          new EventFiringInvocationHandler(
              castDispatcher(ListensToException.class), driver, webElement) {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args)
                throws Throwable {
              if (WrapsElement.class.isAssignableFrom(method
                  .getDeclaringClass()) && method.getName().equals(WRAPS_ELEMENT_METHOD))
                return webElement;
              return super.invoke(proxy, method, args);
            }
          });
      this.underlyingElement = webElement;
    }

    public void click() {
      castDispatcher(ElementEventListener.class).beforeClickOn(element, driver);
      element.click();
      castDispatcher(ElementEventListener.class).afterClickOn(element, driver);
    }

    public void submit() {
      element.submit();
    }

    public void sendKeys(CharSequence... keysToSend) {
      castDispatcher(ElementEventListener.class).beforeChangeValueOf(element,
          driver);
      element.sendKeys(keysToSend);
      castDispatcher(ElementEventListener.class).afterChangeValueOf(element,
          driver);
    }

    public void clear() {
      castDispatcher(ElementEventListener.class).beforeChangeValueOf(element,
          driver);
      element.clear();
      castDispatcher(ElementEventListener.class).afterChangeValueOf(element,
          driver);
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

    public String getCssValue(String propertyName) {
      return element.getCssValue(propertyName);
    }

    public WebElement findElement(By by) {
      castDispatcher(SearchingEventListener.class).beforeFindBy(by, element,
          driver);
      WebElement temp = element.findElement(by);
      castDispatcher(SearchingEventListener.class).afterFindBy(by, element,
          driver);
      return createWebElement(temp);
    }

    public List<WebElement> findElements(By by) {
      castDispatcher(SearchingEventListener.class).beforeFindBy(by, element,
          driver);
      List<WebElement> temp = element.findElements(by);
      castDispatcher(SearchingEventListener.class).afterFindBy(by, element,
          driver);
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

    public <X> X getScreenshotAs(OutputType<X> outputType)
        throws WebDriverException {
      return element.getScreenshotAs(outputType);
    }
  }

  private class EventFiringNavigation implements Navigation {

    private final WebDriver.Navigation navigation;

    EventFiringNavigation(Navigation navigation) {
      this.navigation = (Navigation) Proxy.newProxyInstance(Navigation.class
          .getClassLoader(), new Class[] { Navigation.class },
          new EventFiringInvocationHandler(
              castDispatcher(ListensToException.class), driver, navigation));
    }

    public void to(String url) {
      castDispatcher(NavigationEventListener.class).beforeNavigateTo(url,
          driver);
      navigation.to(url);
      castDispatcher(NavigationEventListener.class)
          .afterNavigateTo(url, driver);
    }

    public void to(URL url) {
      to(String.valueOf(url));
    }

    public void back() {
      castDispatcher(NavigationEventListener.class).beforeNavigateBack(driver);
      navigation.back();
      castDispatcher(NavigationEventListener.class).afterNavigateBack(driver);
    }

    public void forward() {
      castDispatcher(NavigationEventListener.class).beforeNavigateForward(
          driver);
      navigation.forward();
      castDispatcher(NavigationEventListener.class)
          .afterNavigateForward(driver);
    }

    public void refresh() {
      navigation.refresh();
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
      throw new UnsupportedOperationException(
          "Driver does not support IME interactions");
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
      return new EventFiringAlert(targetLocator.alert());
    }
  }

  @Beta
  private class EventFiringWindow implements Window {
    private final Window window;

    EventFiringWindow(Window window) {
      this.window = (Window) Proxy.newProxyInstance(Window.class
          .getClassLoader(), new Class[] { Window.class },
          new EventFiringInvocationHandler(
              castDispatcher(ListensToException.class), driver, window));
    }

    public void setSize(Dimension targetSize) {
      castDispatcher(WindowEventListener.class).beforeWindowChangeSize(driver,
          window, targetSize);
      window.setSize(targetSize);
      castDispatcher(WindowEventListener.class).afterWindowChangeSize(driver,
          window, targetSize);
    }

    public void setPosition(Point targetLocation) {
      castDispatcher(WindowEventListener.class).beforeWindowIsMoved(driver,
          window, targetLocation);
      window.setPosition(targetLocation);
      castDispatcher(WindowEventListener.class).afterWindowIsMoved(driver,
          window, targetLocation);
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
  }
}
