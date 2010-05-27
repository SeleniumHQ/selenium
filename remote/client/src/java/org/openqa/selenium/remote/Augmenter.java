/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium.remote;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.html5.AddApplicationCache;
import org.openqa.selenium.remote.html5.AddBrowserConnection;
import org.openqa.selenium.remote.html5.AddDatabaseStorage;
import org.openqa.selenium.remote.html5.AddLocationContext;
import org.openqa.selenium.browserlaunchers.CapabilityType;

/**
 * Enhance the interfaces implemented by an instance of the
 * {@link org.openqa.selenium.remote.RemoteWebDriver} based on the returned
 * {@link org.openqa.selenium.Capabilities} of the driver.
 *
 * Note: this class is still experimental. Use at your own risk.
 */
public class Augmenter {
  private final Map<String, AugmenterProvider> augmentors =
      new HashMap<String, AugmenterProvider>();

  public Augmenter() {
    addAugmentation(CapabilityType.TAKES_SCREENSHOT, new AddTakesScreenshot());
    addAugmentation(CapabilityType.SUPPORTS_SQL_DATABASE, new AddDatabaseStorage());
    addAugmentation(CapabilityType.SUPPORTS_LOCATION_CONTEXT, new AddLocationContext());
    addAugmentation(CapabilityType.SUPPORTS_APPLICATION_CACHE, new AddApplicationCache());
    addAugmentation(CapabilityType.SUPPORTS_BROWSER_CONNECTION, new AddBrowserConnection());
  }

  /**
   * Add a mapping between a capability name and the implementation of the
   * interface that name represents. For example
   * (@link CapabilityType#TAKES_SCREENSHOT} is represents the interface
   * {@link org.openqa.selenium.TakesScreenshot}, which is implemented via the
   * {@link org.openqa.selenium.remote.AddTakesScreenshot} provider.
   *
   * Note: This method is still experimental. Use at your own risk.
   *
   * @param capabilityName The name of the capability to model
   * @param handlerClass The provider of the interface and implementation
   */
  public void addAugmentation(String capabilityName, AugmenterProvider handlerClass) {
    augmentors.put(capabilityName, handlerClass);
  }

  /**
   * Enhance the interfaces implemented by this instance of WebDriver iff that
   * instance is a {@link org.openqa.selenium.remote.RemoteWebDriver}.
   *
   * The WebDriver that is returned may well be a dynamic proxy. You cannot
   * rely on the concrete implementing class to remain constant.
   *
   * @param driver The driver to enhance
   * @return A class implementing the described interfaces.
   */
  public WebDriver augment(WebDriver driver) {
    // TODO(simon): We should really add a "SelfDescribing" interface for this
    if (!(driver instanceof RemoteWebDriver)) {
      return driver;
    }

    Map<String, ?> capabilities = ((RemoteWebDriver) driver).getCapabilities().asMap();

    CompoundHandler handler = new CompoundHandler((RemoteWebDriver) driver);

    for (Map.Entry<String, ?> capablityName : capabilities.entrySet()) {
      AugmenterProvider augmenter = augmentors.get(capablityName.getKey());
      if (augmenter == null) {
        continue;
      }

      Object value = capablityName.getValue();
      if (value instanceof Boolean && !((Boolean) value).booleanValue()) {
        continue;
      }

      handler.addCapabilityHander(augmenter.getDescribedInterface(),
          augmenter.getImplementation(value));
    }

    if (handler.isNeedingApplication()) {
      // Gather the existing interfaces
      Set<Class<?>> interfaces = new HashSet<Class<?>>();
      interfaces.addAll(handler.getInterfaces());
      interfaces.addAll(getInterfacesFrom(driver.getClass()));

      return (WebDriver) Proxy.newProxyInstance(getClass().getClassLoader(),
          interfaces.toArray(new Class<?>[interfaces.size()]), handler);
    }

    return driver;
  }

  private Set<Class<?>> getInterfacesFrom(Class<?> clazz) {
    Set<Class<?>> toReturn = new HashSet<Class<?>>();

    if (clazz == null || Object.class.equals(clazz)) {
      return toReturn;
    }

    Class<?>[] interfaces = clazz.getInterfaces();
    for (Class<?> face : interfaces) {
      toReturn.add(face);
      toReturn.addAll(getInterfacesFrom(face));
    }
    toReturn.addAll(getInterfacesFrom(clazz.getSuperclass()));

    return toReturn;
  }

  private class CompoundHandler implements InvocationHandler {
    private Map<Method, InterfaceImplementation> handlers =
        new HashMap<Method, InterfaceImplementation>();
    private Set<Class<?>> interfaces = new HashSet<Class<?>>();
    private final RemoteWebDriver driver;

    private CompoundHandler(RemoteWebDriver driver) {
      this.driver = driver;
    }

    public void addCapabilityHander(Class<?> fromInterface, InterfaceImplementation handledBy) {
      interfaces.add(fromInterface);
      for (Method method : fromInterface.getDeclaredMethods()) {
          handlers.put(method, handledBy);
      }
    }
    
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
      InterfaceImplementation handler = handlers.get(method);

      try {
        if (handler == null) {
          return method.invoke(driver, args);
        } else {
          return handler.invoke(new ExecuteMethod(driver), method, args);
        }
      } catch (InvocationTargetException e) {
        throw unwrapException(e);
      }
    }

    private Throwable unwrapException(Throwable e) {
      Throwable cause = e.getCause();
      if (cause == null) {
        return e;
      }

      if (cause.getClass().getName().startsWith("java.lang.reflect")) {
        return unwrapException(cause);
      }

      return cause;
    }

    public Set<Class<?>> getInterfaces() {
      return interfaces;
    }

    public boolean isNeedingApplication() {
      return interfaces.size() > 0;
    }
  }
}
