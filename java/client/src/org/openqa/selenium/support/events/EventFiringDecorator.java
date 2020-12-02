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

import com.google.common.base.Throwables;
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

@Beta
public class EventFiringDecorator extends WebDriverDecorator  {

  private final List<WebDriverListener> listeners;

  public EventFiringDecorator(WebDriverListener... listeners) {
    this.listeners = Arrays.asList(listeners);
  }

  @Override
  public void beforeCallGlobal(Decorated<?> target, Method method, Object[] args) {
    listeners.forEach(listener -> fireBeforeEvents(listener, target, method, args));
    super.beforeCallGlobal(target, method, args);
  }

  @Override
  public void afterCallGlobal(Decorated<?> target, Method method, Object result, Object[] args) {
    super.afterCallGlobal(target, method, result, args);
    listeners.forEach(listener -> fireAfterEvents(listener, target, method, result, args));
  }

  @Override
  public Object onErrorGlobal(Decorated<?> target, Method method, InvocationTargetException e, Object[] args) throws Throwable {
    listeners.forEach(listener -> listener.onError(target.getOriginal(), method, e, args));
    return super.onErrorGlobal(target, method, e, args);
  }

  private void fireBeforeEvents(WebDriverListener listener, Decorated<?> target, Method method, Object[] args) {
    listener.beforeAnyCall(target.getOriginal(), method, args);
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
    listener.afterAnyCall(target.getOriginal(), method, res, args);
    if (target.getOriginal() instanceof WebDriver) {
      listener.afterAnyWebDriverCall((WebDriver) target.getOriginal(), method, res, args);
    } else if (target.getOriginal() instanceof WebElement) {
      listener.afterAnyWebElementCall((WebElement) target.getOriginal(), method, res, args);
    } else if (target.getOriginal() instanceof WebDriver.Navigation) {
      listener.afterAnyNavigationCall((WebDriver.Navigation) target.getOriginal(), method, res, args);
    } else if (target.getOriginal() instanceof Alert) {
      listener.afterAnyAlertCall((Alert) target.getOriginal(), method, res, args);
    } else if (target.getOriginal() instanceof WebDriver.Options) {
      listener.afterAnyOptionsCall((WebDriver.Options) target.getOriginal(), method, res, args);
    } else if (target.getOriginal() instanceof WebDriver.Timeouts) {
      listener.afterAnyTimeoutsCall((WebDriver.Timeouts) target.getOriginal(), method, res, args);
    } else if (target.getOriginal() instanceof WebDriver.Window) {
      listener.afterAnyWindowCall((WebDriver.Window) target.getOriginal(), method, res, args);
    }

    String methodName = createEventMethodName("after", method.getName());

    boolean isVoid = method.getReturnType() == Void.TYPE
                     || method.getReturnType() == WebDriver.Timeouts.class;
    int shift = isVoid  ? 0 : 1;

    int argsLength = args != null ? args.length : 0;
    Object[] args2 = new Object[argsLength + 1 + shift];
    if (! isVoid) {
      args2[0] = res;
    }
    args2[shift] = target.getOriginal();
    for (int i = 0; i < argsLength; i++) {
      args2[i + 1 + shift] = args[i];
    }

    Method m = findMatchingMethod(listener, methodName, args2);
    if (m != null) {
      callListenerMethod(m, listener, args2);
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
      if (! Primitives.wrap(params[i]).isAssignableFrom(args[i].getClass())) {
        return false;
      }
    }
    return true;
  }

  private void callListenerMethod(Method m, WebDriverListener listener, Object[] args) {
    try {
      m.invoke(listener, args);
    } catch (IllegalAccessException e) {
      throw new RuntimeException(e);
    } catch (InvocationTargetException e) {
      Throwables.throwIfUnchecked(e.getCause());
      throw new RuntimeException(e.getCause());
    }
  }
}
