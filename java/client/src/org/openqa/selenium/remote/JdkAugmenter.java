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

package org.openqa.selenium.remote;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.google.common.reflect.AbstractInvocationHandler;

import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriver;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;

/**
 * Enhance the interfaces implemented by an instance of the
 * {@link org.openqa.selenium.remote.RemoteWebDriver} based on the returned
 * {@link org.openqa.selenium.Capabilities} of the driver.
 *
 * Note: this class is still experimental. Use at your own risk.
 */
@Beta
public class JdkAugmenter extends BaseAugmenter {

  public JdkAugmenter() {
    super();
  }

  @Override
  protected RemoteWebDriver extractRemoteWebDriver(WebDriver driver) {
    if (driver instanceof RemoteWebDriver) {
      return (RemoteWebDriver) driver;
    } else if (Proxy.isProxyClass(driver.getClass())) {
      InvocationHandler handler = Proxy.getInvocationHandler(driver);
      if (handler instanceof JdkHandler) {
        return ((JdkHandler<?>) handler).driver;
      }
    }
    return null;
  }
  @Override
  protected <X> X create(RemoteWebDriver driver, Map<String, AugmenterProvider> augmentors,
      X objectToAugment) {
    Map<String, ?> capabilities = driver.getCapabilities().asMap();
    Map<Method, InterfaceImplementation> augmentationHandlers = Maps.newHashMap();


    Set<Class<?>> proxiedInterfaces = Sets.newHashSet();
    Class<?> superClass = objectToAugment.getClass();

    while (null != superClass) {
      proxiedInterfaces.addAll(Arrays.asList(superClass.getInterfaces()));
      superClass = superClass.getSuperclass();
    }

    for (Map.Entry<String, ?> capabilityName : capabilities.entrySet()) {
      AugmenterProvider augmenter = augmentors.get(capabilityName.getKey());
      if (augmenter == null) {
        continue;
      }

      Object value = capabilityName.getValue();
      if (value instanceof Boolean && !((Boolean) value)) {
        continue;
      }

      Class<?> interfaceProvided = augmenter.getDescribedInterface();
      checkState(interfaceProvided.isInterface(),
          "JdkAugmenter can only augment interfaces. %s is not an interface.", interfaceProvided);
      proxiedInterfaces.add(interfaceProvided);
      InterfaceImplementation augmentedImplementation = augmenter.getImplementation(value);
      for (Method method : interfaceProvided.getMethods()) {
        InterfaceImplementation oldHandler = augmentationHandlers.put(method,
            augmentedImplementation);
        checkState(null == oldHandler, "Both %s and %s attempt to define %s.",
            oldHandler, augmentedImplementation.getClass(), method.getName());
      }
    }

    if (augmentationHandlers.isEmpty()) {
      // If there are no handlers, don't bother proxy'ing.
      return objectToAugment;
    }

    InvocationHandler proxyHandler = new JdkHandler<>(driver,
        objectToAugment, augmentationHandlers);
    X augmentedProxy = (X) Proxy.newProxyInstance(
        getClass().getClassLoader(),
        proxiedInterfaces.toArray(new Class<?>[proxiedInterfaces.size()]),
        proxyHandler);
    return augmentedProxy;
  }

  private static class JdkHandler<X> extends AbstractInvocationHandler
      implements InvocationHandler {
    private final RemoteWebDriver driver;
    private final X realInstance;
    private final Map<Method, InterfaceImplementation> handlers;

    private JdkHandler(RemoteWebDriver driver, X realInstance,
        Map<Method, InterfaceImplementation> handlers) {
      super();
      this.driver = checkNotNull(driver);
      this.realInstance = checkNotNull(realInstance);
      this.handlers = checkNotNull(handlers);
    }

    @Override
    public Object handleInvocation(Object proxy, Method method, Object[] args) throws Throwable {
      InterfaceImplementation handler = handlers.get(method);
      try {
        System.out.println("Method: " + method + "all handlers: " + handlers.keySet());
        if (null == handler) {
          return method.invoke(realInstance, args);
        }
        return handler.invoke(new RemoteExecuteMethod(driver), proxy, method, args);
      } catch (InvocationTargetException i) {
        throw i.getCause();
      }
    }
  }
}
