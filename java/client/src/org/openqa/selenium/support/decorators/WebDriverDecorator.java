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

package org.openqa.selenium.support.decorators;

import org.openqa.selenium.Alert;
import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticator;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Beta
public class WebDriverDecorator {

  private Decorated<WebDriver> decorated;

  public final WebDriver decorate(WebDriver original) {
    Require.nonNull("WebDriver", original);

    decorated = createDecorated(original);
    return createProxy(decorated);
  }

  public Decorated<WebDriver> getDecoratedDriver() {
    return decorated;
  }

  public Decorated<WebDriver> createDecorated(WebDriver driver) {
    return new DefaultDecorated<>(driver, this);
  }

  public Decorated<WebElement> createDecorated(WebElement original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<WebDriver.TargetLocator> createDecorated(WebDriver.TargetLocator original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<WebDriver.Navigation> createDecorated(WebDriver.Navigation original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<WebDriver.Options> createDecorated(WebDriver.Options original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<WebDriver.Timeouts> createDecorated(WebDriver.Timeouts original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<WebDriver.Window> createDecorated(WebDriver.Window original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<Alert> createDecorated(Alert original) {
    return new DefaultDecorated<>(original, this);
  }

  public Decorated<VirtualAuthenticator> createDecorated(VirtualAuthenticator original) {
    return new DefaultDecorated<>(original, this);
  }

  public void beforeCallGlobal(Decorated<?> target, Method method, Object[] args) {}

  public Object callGlobal(Decorated<?> target, Method method, Object[] args) throws Throwable {
    return decorateResult(method.invoke(target.getOriginal(), args));
  }

  public void afterCallGlobal(Decorated<?> target, Method method, Object res, Object[] args) {}

  public Object onErrorGlobal(Decorated<?> target, Method method, InvocationTargetException e, Object[] args) throws Throwable {
    throw e.getTargetException();
  }

  private Object decorateResult(Object toDecorate) {
    if (toDecorate instanceof WebDriver) {
      return createProxy(getDecoratedDriver());
    }
    if (toDecorate instanceof WebElement) {
      return createProxy(createDecorated((WebElement) toDecorate));
    }
    if (toDecorate instanceof Alert) {
      return createProxy(createDecorated((Alert) toDecorate));
    }
    if (toDecorate instanceof VirtualAuthenticator) {
      return createProxy(createDecorated((VirtualAuthenticator) toDecorate));
    }
    if (toDecorate instanceof WebDriver.Navigation) {
      return createProxy(createDecorated((WebDriver.Navigation) toDecorate));
    }
    if (toDecorate instanceof WebDriver.Options) {
      return createProxy(createDecorated((WebDriver.Options) toDecorate));
    }
    if (toDecorate instanceof WebDriver.TargetLocator) {
      return createProxy(createDecorated((WebDriver.TargetLocator) toDecorate));
    }
    if (toDecorate instanceof WebDriver.Timeouts) {
      return createProxy(createDecorated((WebDriver.Timeouts) toDecorate));
    }
    if (toDecorate instanceof WebDriver.Window) {
      return createProxy(createDecorated((WebDriver.Window) toDecorate));
    }
    if (toDecorate instanceof List) {
      return ((List<?>) toDecorate).stream()
        .map(this::decorateResult)
        .collect(Collectors.toList());
    }
    return toDecorate;
  }

  protected final <Z> Z createProxy(final Decorated<Z> decorated) {
    Set<Class<?>> decoratedInterfaces = extractInterfaces(decorated);
    Set<Class<?>> originalInterfaces = extractInterfaces(decorated.getOriginal());

    final InvocationHandler handler = (proxy, method, args) -> {
      try {
        if (method.getDeclaringClass().equals(Object.class)
            || decoratedInterfaces.contains(method.getDeclaringClass())) {
          return method.invoke(decorated, args);
        }
        if (originalInterfaces.contains(method.getDeclaringClass())) {
          decorated.beforeCall(method, args);
          Object result = decorated.call(method, args);
          decorated.afterCall(method, result, args);
          return result;
        }
        return method.invoke(decorated.getOriginal(), args);
      } catch (InvocationTargetException e) {
        return decorated.onError(method, e, args);
      }
    };

    Set<Class<?>> allInterfaces = new HashSet<>();
    allInterfaces.addAll(decoratedInterfaces);
    allInterfaces.addAll(originalInterfaces);
    Class<?>[] allInterfacesArray = allInterfaces.toArray(new Class<?>[0]);

    return (Z) Proxy.newProxyInstance(
      this.getClass().getClassLoader(), allInterfacesArray, handler);
  }

  static Set<Class<?>> extractInterfaces(final Object object) {
    return extractInterfaces(object.getClass());
  }

  private static Set<Class<?>> extractInterfaces(final Class<?> clazz) {
    Set<Class<?>> allInterfaces = new HashSet<>();
    extractInterfaces(allInterfaces, clazz);

    return allInterfaces;
  }

  private static void extractInterfaces(final Set<Class<?>> collector, final Class<?> clazz) {
    if (clazz == null || Object.class.equals(clazz)) {
      return;
    }

    final Class<?>[] classes = clazz.getInterfaces();
    for (Class<?> interfaceClass : classes) {
      collector.add(interfaceClass);
      for (Class<?> superInterface : interfaceClass.getInterfaces()) {
        collector.add(superInterface);
        extractInterfaces(collector, superInterface);
      }
    }
    extractInterfaces(collector, clazz.getSuperclass());
  }
}
