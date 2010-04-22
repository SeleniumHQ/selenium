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

package org.openqa.selenium.support.events;

import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.Speed;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;

import java.awt.*;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * A wrapper around an arbitrary {@link WebDriver} instance
 * which supports registering of a {@link WebDriverEventListener},
 * e&#46;g&#46; for logging purposes.
 *
 * @author Michael Tamm
 */
public class EventFiringWebDriver implements WebDriver, JavascriptExecutor, WrapsDriver {

    private final WebDriver driver;
    private final List<WebDriverEventListener> eventListeners = new ArrayList<WebDriverEventListener>();
    private final WebDriverEventListener dispatcher = (WebDriverEventListener) Proxy.newProxyInstance(
        WebDriverEventListener.class.getClassLoader(),
        new Class[] { WebDriverEventListener.class },
        new InvocationHandler() {
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                for (WebDriverEventListener eventListener : eventListeners) {
                    method.invoke(eventListener, args);
                }
                return null;
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

  private Class<?>[] extractInterfaces(WebDriver driver) {
    Set<Class<?>> allInterfaces = new HashSet<Class<?>>();
    extractInterfaces(allInterfaces, driver.getClass());

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
     * @return this for method chaining.
     */
    public EventFiringWebDriver register(WebDriverEventListener eventListener) {
        eventListeners.add(eventListener);
        return this;
    }

    /**
     * @return this for method chaining.
     */
    public EventFiringWebDriver unregister(WebDriverEventListener eventListener) {
        eventListeners.remove(eventListener);
        return this;
    }


  public WebDriver getWrappedDriver() {
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
        List<WebElement> result = new ArrayList<WebElement>(temp.size());
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
            return result;
        }
        throw new UnsupportedOperationException("Underlying driver instance does not support executing javascript");
    }

  public boolean isJavascriptEnabled() {
    if (driver instanceof JavascriptExecutor) {
      return ((JavascriptExecutor) driver).isJavascriptEnabled();
    }

    throw new UnsupportedOperationException("Underlying driver instance does not support executing javascript");
  }

  private Object[] unpackWrappedArgs(Object... args) {
    // Walk the args: the various drivers expect unpacked versions of the elements
    Object[] usedArgs = new Object[args.length];
    for (int i = 0; i < args.length; i++) {
      if (args[i] instanceof EventFiringWebElement) {
        usedArgs[i] = ((EventFiringWebElement) args[i]).getWrappedElement();
      } else {
        usedArgs[i] = args[i];
      }
    }
    return usedArgs;
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
      return from instanceof RenderedWebElement ?
          new EventFiringRenderedWebElement(from) : new EventFiringWebElement(from);
    }

    private class EventFiringWebElement implements WebElement, WrapsElement {
        private final WebElement element;
        private final WebElement underlyingElement;

      private EventFiringWebElement(final WebElement element) {
        this.element = (WebElement) Proxy.newProxyInstance(
            WebDriverEventListener.class.getClassLoader(),
            element.getClass().getInterfaces(),
            new InvocationHandler() {
              public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
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

        public String getValue() {
            return element.getValue();
        }

        public void sendKeys(CharSequence... keysToSend) {
            dispatcher.beforeChangeValueOf(element, driver);
            element.sendKeys(keysToSend);
            dispatcher.afterChangeValueOf(element, driver);
        }

        public void clear() {
            dispatcher.beforeChangeValueOf(element, driver);
            element.clear();
            dispatcher.afterChangeValueOf(element, driver);
        }

        public String getTagName() {
            return element.getTagName();
        }

      public String getAttribute(String name) {
            return element.getAttribute(name);
        }

        public boolean toggle() {
            dispatcher.beforeChangeValueOf(element, driver);
            boolean result = element.toggle();
            dispatcher.afterChangeValueOf(element, driver);
            return result;
        }

        public boolean isSelected() {
            return element.isSelected();
        }

        public void setSelected() {
            element.setSelected();
        }

        public boolean isEnabled() {
            return element.isEnabled();
        }

        public String getText() {
            return element.getText();
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
            List<WebElement> result = new ArrayList<WebElement>(temp.size());
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
    }

    private class EventFiringRenderedWebElement extends EventFiringWebElement implements RenderedWebElement {
      private final RenderedWebElement delegate;

      public EventFiringRenderedWebElement(WebElement element) {
        super(element);
        delegate = (RenderedWebElement) element;
      }

      public boolean isDisplayed() {
        return delegate.isDisplayed();
      }

      public void hover() {
        delegate.hover();
      }

      public Point getLocation() {
        return delegate.getLocation();
      }

      public Dimension getSize() {
        return delegate.getSize();
      }

      public void dragAndDropBy(int moveRightBy, int moveDownBy) {
        delegate.dragAndDropBy(moveRightBy, moveDownBy);
      }

      public void dragAndDropOn(RenderedWebElement element) {
        delegate.dragAndDropOn(element);
      }

      public String getValueOfCssProperty(String propertyName) {
        return delegate.getValueOfCssProperty(propertyName);
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
            navigation.refresh();
        }
    }

    private class EventFiringOptions implements Options {
        private Options options;

        private EventFiringOptions(Options options) {
            this.options = options;
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

      public Speed getSpeed() {
            return options.getSpeed();
        }

        public void setSpeed(Speed speed) {
            options.setSpeed(speed);
        }

      public Timeouts timeouts() {
        return new EventFiringTimeouts(options.timeouts());
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

        public WebDriver window(String windowName) {
            return targetLocator.window(windowName);
        }

      public WebDriver defaultContent() {
            return targetLocator.defaultContent();
        }

        public WebElement activeElement() {
            return targetLocator.activeElement();
        }
    }
}
