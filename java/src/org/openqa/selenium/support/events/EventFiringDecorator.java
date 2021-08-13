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

import com.google.common.primitives.Primitives;

import org.openqa.selenium.Alert;
import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.decorators.Decorated;
import org.openqa.selenium.support.decorators.WebDriverDecorator;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This decorator creates a wrapper around an arbitrary {@link WebDriver} instance that notifies
 * registered listeners about events happening in this WebDriver and derived objects, such as
 * {@link WebElement}s and {@link Alert}.
 * <p>
 * Listeners should implement {@link WebDriverListener}. It supports three types of events:
 * <ul>
 *   <li>"before"-event: a method is about to be called;</li>
 *   <li>"after"-event: a method was called successfully and returned some result;</li>
 *   <li>"error"-event: a method was called and thrown an exception.</li>
 * </ul>
 * To use this decorator you have to prepare a listener, create a decorator using this listener,
 * decorate the original WebDriver instance with this decorator and use the new WebDriver
 * instance created by the decorator instead of the original one:
 * <code>
 *   WebDriver original = new FirefoxDriver();
 *   WebDriverListener listener = new MyListener();
 *   WebDriver decorated = new EventFiringDecorator(listener).decorate(original);
 *   decorated.get("http://example.com/");
 *   WebElement header = decorated.findElement(By.tagName("h1"));
 *   String headerText = header.getText();
 * </code>
 * <p>
 * The instance of WebDriver created by the decorator implements all the same interfaces as
 * the original driver.
 * <p>
 * A listener can subscribe to "specific" or "generic" events (or both). A "specific" event
 * correspond to a single specific method, a "generic" event correspond to any method called in
 * a class or in any class.
 * <p>
 * To subscribe to a "specific" event a listener should implement a method with a name derived from
 * the target method to be watched. The listener methods for "before"-events receive the parameters
 * passed to the decorated method. The listener methods for "after"-events receive the parameters
 * passed to the decorated method as well as the result returned by this method.
 * <code>
 *   WebDriverListener listener = new WebDriverListener() {
 *     @Override
 *     public void beforeGet(WebDriver driver, String url) {
 *       logger.log("About to open a page %s", url);
 *     }
 *     @Override
 *     public void afterGetText(WebElement element, String result) {
 *       logger.log("Element %s has text '%s'", element, result);
 *     }
 *   };
 * </code>
 * <p>
 * To subscribe to a "generic" event a listener should implement a method with a name derived from
 * the class to be watched:
 * <code>
 *   WebDriverListener listener = new WebDriverListener() {
 *     @Override
 *     public void beforeAnyWebElementCall(WebElement element, Method method, Object[] args) {
 *       logger.log("About to call a method %s in element %s with parameters %s",
 *                  method, element, args);
 *     }
 *     @Override
 *     public void afterAnyWebElementCall(WebElement element, Method method, Object[] args, Object result) {
 *       logger.log("Method %s called in element %s with parameters %s returned %s",
 *                  method, element, args, result);
 *     }
 *   };
 * </code>
 * <p>
 * There are also listener methods for "super-generic" events:
 * <code>
 *   WebDriverListener listener = new WebDriverListener() {
 *     @Override
 *     public void beforeAnyCall(Object target, Method method, Object[] args) {
 *       logger.log("About to call a method %s in %s with parameters %s",
 *                  method, target, args);
 *     }
 *     @Override
 *     public void afterAnyCall(Object target, Method method, Object[] args, Object result) {
 *       logger.log("Method %s called in %s with parameters %s returned %s",
 *                  method, target, args, result);
 *     }
 *   };
 * </code>
 * <p>
 * A listener can subscribe to both "specific" and "generic" events at the same time. In this case
 * "before"-events are fired in order from the most generic to the most specific,
 * and "after"-events are fired in the opposite order, for example:
 * <code>
 *   beforeAnyCall
 *   beforeAnyWebDriverCall
 *   beforeGet
 *   // the actual call to the decorated method here
 *   afterGet
 *   afterAnyWebDriverCall
 *   afterAnyCall
 * </code>
 * <p>
 * One of the most obvious use of this decorator is logging. But it can be used to modify behavior
 * of the original driver to some extent because listener methods are executed in the same thread
 * as the original driver methods.
 * <p>
 * For example, a listener can be used to slow down execution for demonstration purposes, just
 * make a listener that adds a pause before some operations:
 * <code>
 *   WebDriverListener listener = new WebDriverListener() {
 *     @Override
 *     public void beforeClick(WebElement element) {
 *       try {
 *         Thread.sleep(3000);
 *       } catch (InterruptedException e) {
 *         Thread.currentThread().interrupt();
 *       }
 *     }
 *   };
 * </code>
 * <p>
 * Just be careful to not block the current thread in a listener method!
 * <p>
 * Listeners can't affect driver behavior too much. They can't throw any exceptions
 * (they can, but the decorator suppresses these exceptions), can't prevent execution of
 * the decorated methods, can't modify parameters and results of the methods.
 * <p>
 * Decorators that modify the behaviour of the underlying drivers should be implemented by
 * extending {@link WebDriverDecorator}, not by creating sophisticated listeners.
 */
@Beta
public class EventFiringDecorator extends WebDriverDecorator  {

  private static final Logger logger = Logger.getLogger(EventFiringDecorator.class.getName());

  private final List<WebDriverListener> listeners;

  public EventFiringDecorator(WebDriverListener... listeners) {
    this.listeners = Arrays.asList(listeners);
  }

  @Override
  public void beforeCall(Decorated<?> target, Method method, Object[] args) {
    listeners.forEach(listener -> fireBeforeEvents(listener, target, method, args));
    super.beforeCall(target, method, args);
  }

  @Override
  public void afterCall(Decorated<?> target, Method method, Object[] args, Object result) {
    super.afterCall(target, method, args, result);
    listeners.forEach(listener -> fireAfterEvents(listener, target, method, result, args));
  }

  @Override
  public Object onError(Decorated<?> target, Method method, Object[] args,
                        InvocationTargetException e) throws Throwable {
    listeners.forEach(listener -> {
      try {
        listener.onError(target.getOriginal(), method, args, e);
      } catch (Throwable t) {
        logger.log(Level.WARNING, t.getMessage(), t);
      }
    });
    return super.onError(target, method, args, e);
  }

  private void fireBeforeEvents(WebDriverListener listener, Decorated<?> target, Method method, Object[] args) {
    try {
      listener.beforeAnyCall(target.getOriginal(), method, args);
    } catch (Throwable t) {
      logger.log(Level.WARNING, t.getMessage(), t);
    }

    try {
      if (target.getOriginal() instanceof WebDriver) {
        listener.beforeAnyWebDriverCall((WebDriver) target.getOriginal(), method, args);
      } else if (target.getOriginal() instanceof WebElement) {
        listener.beforeAnyWebElementCall((WebElement) target.getOriginal(), method, args);
      } else if (target.getOriginal() instanceof WebDriver.Navigation) {
        listener.beforeAnyNavigationCall((WebDriver.Navigation) target.getOriginal(), method, args);
      } else if (target.getOriginal() instanceof Alert) {
        listener.beforeAnyAlertCall((Alert) target.getOriginal(), method, args);
      } else if (target.getOriginal() instanceof WebDriver.Options) {
        listener.beforeAnyOptionsCall((WebDriver.Options) target.getOriginal(), method, args);
      } else if (target.getOriginal() instanceof WebDriver.Timeouts) {
        listener.beforeAnyTimeoutsCall((WebDriver.Timeouts) target.getOriginal(), method, args);
      } else if (target.getOriginal() instanceof WebDriver.Window) {
        listener.beforeAnyWindowCall((WebDriver.Window) target.getOriginal(), method, args);
      }
    } catch (Throwable t) {
      logger.log(Level.WARNING, t.getMessage(), t);
    }

    String methodName = createEventMethodName("before", method.getName());

    int argsLength = args != null ? args.length : 0;
    Object[] args2 = new Object[argsLength + 1];
    args2[0] = target.getOriginal();
    for (int i = 0; i < argsLength; i++) {
      args2[i + 1] = args[i];
    }

    Method m = findMatchingMethod(listener, methodName, args2);
    if (m != null) {
      callListenerMethod(m, listener, args2);
    }
  }

  private void fireAfterEvents(WebDriverListener listener, Decorated<?> target, Method method, Object res, Object[] args) {
    String methodName = createEventMethodName("after", method.getName());

    boolean isVoid = method.getReturnType() == Void.TYPE
                     || method.getReturnType() == WebDriver.Timeouts.class;
    int argsLength = args != null ? args.length : 0;
    Object[] args2 = new Object[argsLength + 1 + (isVoid  ? 0 : 1)];
    args2[0] = target.getOriginal();
    for (int i = 0; i < argsLength; i++) {
      args2[i + 1] = args[i];
    }
    if (! isVoid) {
      args2[args2.length - 1] = res;
    }

    Method m = findMatchingMethod(listener, methodName, args2);
    if (m != null) {
      callListenerMethod(m, listener, args2);
    }

    try {
      if (target.getOriginal() instanceof WebDriver) {
        listener.afterAnyWebDriverCall((WebDriver) target.getOriginal(), method, args, res);
      } else if (target.getOriginal() instanceof WebElement) {
        listener.afterAnyWebElementCall((WebElement) target.getOriginal(), method, args, res);
      } else if (target.getOriginal() instanceof WebDriver.Navigation) {
        listener.afterAnyNavigationCall((WebDriver.Navigation) target.getOriginal(), method, args,
                                        res);
      } else if (target.getOriginal() instanceof Alert) {
        listener.afterAnyAlertCall((Alert) target.getOriginal(), method, args, res);
      } else if (target.getOriginal() instanceof WebDriver.Options) {
        listener.afterAnyOptionsCall((WebDriver.Options) target.getOriginal(), method, args, res);
      } else if (target.getOriginal() instanceof WebDriver.Timeouts) {
        listener.afterAnyTimeoutsCall((WebDriver.Timeouts) target.getOriginal(), method, args, res);
      } else if (target.getOriginal() instanceof WebDriver.Window) {
        listener.afterAnyWindowCall((WebDriver.Window) target.getOriginal(), method, args, res);
      }
    } catch (Throwable t) {
      logger.log(Level.WARNING, t.getMessage(), t);
    }

    try {
      listener.afterAnyCall(target.getOriginal(), method, args, res);
    } catch (Throwable t) {
      logger.log(Level.WARNING, t.getMessage(), t);
    }
  }

  private String createEventMethodName(String prefix, String originalMethodName) {
    return prefix + originalMethodName.substring(0, 1).toUpperCase() + originalMethodName.substring(1);
  }

  private Method findMatchingMethod(WebDriverListener listener, String methodName, Object[] args) {
    for (Method m : listener.getClass().getMethods()) {
      if (m.getName().equals(methodName) && parametersMatch(m, args)) {
        return m;
      }
    }
    return null;
  }

  private boolean parametersMatch(Method m, Object[] args) {
    Class<?>[] params = m.getParameterTypes();
    if (params.length != args.length) {
      return false;
    }
    for (int i = 0; i < params.length; i++) {
      if (args[i] != null && ! Primitives.wrap(params[i]).isAssignableFrom(args[i].getClass())) {
        return false;
      }
    }
    return true;
  }

  private void callListenerMethod(Method m, WebDriverListener listener, Object[] args) {
    try {
      m.invoke(listener, args);
    } catch (Throwable t) {
      logger.log(Level.WARNING, t.getMessage(), t);
    }
  }
}
