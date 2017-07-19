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


import com.google.common.collect.ImmutableList;
import com.google.common.collect.Sets;

import net.sf.cglib.proxy.Enhancer;
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import org.openqa.selenium.WebDriver;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

/**
 * Enhance the interfaces implemented by an instance of the
 * {@link org.openqa.selenium.remote.RemoteWebDriver} based on the returned
 * {@link org.openqa.selenium.Capabilities} of the driver.
 *
 * Note: this class is still experimental. Use at your own risk.
 */
public class Augmenter extends BaseAugmenter {

  private static final Logger logger = Logger.getLogger(Augmenter.class.getName());

  @Override
  protected <X> X create(RemoteWebDriver driver,
      Map<String, AugmenterProvider> augmentors, X objectToAugment) {
    CompoundHandler handler = determineAugmentation(driver, augmentors, objectToAugment);

    X augmented = performAugmentation(handler, objectToAugment);

    copyFields(objectToAugment.getClass(), objectToAugment, augmented);

    return augmented;
  }

  @Override
  protected RemoteWebDriver extractRemoteWebDriver(WebDriver driver) {
    if (driver.getClass().isAnnotationPresent(Augmentable.class) ||
        driver.getClass().getName().startsWith(
            "org.openqa.selenium.remote.RemoteWebDriver$$EnhancerByCGLIB")) {
      return (RemoteWebDriver) driver;

    }
    logger.warning("Augmenter should be applied to the instances of @Augmentable classes " +
        "or previously augmented instances only (instance class was: " + driver.getClass() + ")");
    return null;
  }

  private void copyFields(Class<?> clazz, Object source, Object target) {
    if (Object.class.equals(clazz)) {
      // Stop!
      return;
    }

    for (Field field : clazz.getDeclaredFields()) {
      copyField(source, target, field);
    }

    copyFields(clazz.getSuperclass(), source, target);
  }

  private void copyField(Object source, Object target, Field field) {
    if (Modifier.isFinal(field.getModifiers())) {
      return;
    }

    if (field.getName().startsWith("CGLIB$")) {
      return;
    }

    try {
      field.setAccessible(true);
      Object value = field.get(source);
      field.set(target, value);
    } catch (IllegalAccessException e) {
      throw new RuntimeException(e);
    }
  }

  private CompoundHandler determineAugmentation(RemoteWebDriver driver,
      Map<String, AugmenterProvider> augmentors, Object objectToAugment) {
    Map<String, ?> capabilities = driver.getCapabilities().asMap();

    CompoundHandler handler = new CompoundHandler(driver, objectToAugment);

    for (Map.Entry<String, ?> capabilityName : capabilities.entrySet()) {
      AugmenterProvider augmenter = augmentors.get(capabilityName.getKey());
      if (augmenter == null) {
        continue;
      }

      Object value = capabilityName.getValue();
      if (value instanceof Boolean && !((Boolean) value)) {
        continue;
      }

      handler.addCapabilityHander(augmenter.getDescribedInterface(),
          augmenter.getImplementation(value));
    }
    return handler;
  }

  @SuppressWarnings({"unchecked"})
  protected <X> X performAugmentation(CompoundHandler handler, X from) {
    if (handler.isNeedingApplication()) {
      Class<?> superClass = from.getClass();
      while (Enhancer.isEnhanced(superClass)) {
        superClass = superClass.getSuperclass();
      }

      Enhancer enhancer = new Enhancer();
      enhancer.setCallback(handler);
      enhancer.setSuperclass(superClass);

      Set<Class<?>> interfaces = Sets.newHashSet();
      interfaces.addAll(ImmutableList.copyOf(from.getClass().getInterfaces()));
      interfaces.addAll(handler.getInterfaces());
      enhancer.setInterfaces(interfaces.toArray(new Class<?>[interfaces.size()]));

      return (X) enhancer.create();
    }

    return from;
  }

  private class CompoundHandler implements MethodInterceptor {

    private Map<Method, InterfaceImplementation> handlers = new HashMap<>();
    private Set<Class<?>> interfaces = new HashSet<>();

    private final RemoteWebDriver driver;
    private final Object originalInstance;

    private CompoundHandler(RemoteWebDriver driver, Object originalInstance) {
      this.driver = driver;
      this.originalInstance = originalInstance;
    }

    public void addCapabilityHander(Class<?> fromInterface, InterfaceImplementation handledBy) {
      if (fromInterface.isInterface()) {
        interfaces.add(fromInterface);
      }
      for (Method method : fromInterface.getDeclaredMethods()) {
        handlers.put(method, handledBy);
      }
    }

    public Set<Class<?>> getInterfaces() {
      return interfaces;
    }

    public boolean isNeedingApplication() {
      return !handlers.isEmpty();
    }

    public Object intercept(Object self, Method method, Object[] args, MethodProxy methodProxy)
        throws Throwable {
      InterfaceImplementation handler = handlers.get(method);

      if (handler == null) {
        try {
          return method.invoke(originalInstance, args);
        } catch (InvocationTargetException e) {
          throw e.getTargetException();
        }
      }

      return handler.invoke(new RemoteExecuteMethod(driver), self, method, args);
    }
  }
}
