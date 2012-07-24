/*
Copyright 2007-2010 Selenium committers

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

import static org.openqa.selenium.remote.CapabilityType.ROTATABLE;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_APPLICATION_CACHE;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_BROWSER_CONNECTION;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_FINDING_BY_CSS;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_LOCATION_CONTEXT;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_SQL_DATABASE;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_WEB_STORAGE;
import static org.openqa.selenium.remote.CapabilityType.TAKES_SCREENSHOT;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.html5.AddApplicationCache;
import org.openqa.selenium.remote.html5.AddBrowserConnection;
import org.openqa.selenium.remote.html5.AddDatabaseStorage;
import org.openqa.selenium.remote.html5.AddLocationContext;
import org.openqa.selenium.remote.html5.AddWebStorage;

import net.sf.cglib.proxy.Enhancer;
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Enhance the interfaces implemented by an instance of the
 * {@link org.openqa.selenium.remote.RemoteWebDriver} based on the returned
 * {@link org.openqa.selenium.Capabilities} of the driver.
 * 
 * Note: this class is still experimental. Use at your own risk.
 */
public class Augmenter {
  private final Map<String, AugmenterProvider> driverAugmentors = Maps.newHashMap();
  private final Map<String, AugmenterProvider> elementAugmentors = Maps.newHashMap();

  public Augmenter() {
    addDriverAugmentation(SUPPORTS_FINDING_BY_CSS, new AddFindsByCss());
    addDriverAugmentation(TAKES_SCREENSHOT, new AddTakesScreenshot());
    addDriverAugmentation(SUPPORTS_SQL_DATABASE, new AddDatabaseStorage());
    addDriverAugmentation(SUPPORTS_LOCATION_CONTEXT, new AddLocationContext());
    addDriverAugmentation(SUPPORTS_APPLICATION_CACHE, new AddApplicationCache());
    addDriverAugmentation(SUPPORTS_BROWSER_CONNECTION, new AddBrowserConnection());
    addDriverAugmentation(SUPPORTS_WEB_STORAGE, new AddWebStorage());
    addDriverAugmentation(ROTATABLE, new AddRotatable());

    addElementAugmentation(SUPPORTS_FINDING_BY_CSS, new AddFindsChildByCss());
  }

  /**
   * Add a mapping between a capability name and the implementation of the interface that name
   * represents for instances of {@link org.openqa.selenium.WebDriver}. For example (@link
   * CapabilityType#TAKES_SCREENSHOT} is represents the interface
   * {@link org.openqa.selenium.TakesScreenshot}, which is implemented via the
   * {@link org.openqa.selenium.remote.AddTakesScreenshot} provider.
   * 
   * Note: This method is still experimental. Use at your own risk.
   * 
   * @param capabilityName The name of the capability to model
   * @param handlerClass The provider of the interface and implementation
   */
  public void addDriverAugmentation(String capabilityName, AugmenterProvider handlerClass) {
    driverAugmentors.put(capabilityName, handlerClass);
  }

  /**
   * Add a mapping between a capability name and the implementation of the interface that name
   * represents for instances of {@link org.openqa.selenium.WebElement}. For example (@link
   * CapabilityType#TAKES_SCREENSHOT} is represents the interface
   * {@link org.openqa.selenium.internal.FindsByCssSelector}, which is implemented via the
   * {@link AddFindsByCss} provider.
   * 
   * Note: This method is still experimental. Use at your own risk.
   * 
   * @param capabilityName The name of the capability to model
   * @param handlerClass The provider of the interface and implementation
   */
  public void addElementAugmentation(String capabilityName, AugmenterProvider handlerClass) {
    elementAugmentors.put(capabilityName, handlerClass);
  }


  /**
   * Enhance the interfaces implemented by this instance of WebDriver iff that instance is a
   * {@link org.openqa.selenium.remote.RemoteWebDriver}.
   * 
   * The WebDriver that is returned may well be a dynamic proxy. You cannot rely on the concrete
   * implementing class to remain constant.
   * 
   * @param driver The driver to enhance
   * @return A class implementing the described interfaces.
   */
  public WebDriver augment(WebDriver driver) {
    // TODO(simon): We should really add a "SelfDescribing" interface for this
    if (!(driver instanceof RemoteWebDriver)) {
      return driver;
    }

    Map<String, AugmenterProvider> augmentors = driverAugmentors;

    CompoundHandler handler = determineAugmentation(driver, augmentors, driver);
    RemoteWebDriver remote = create(handler, (RemoteWebDriver) driver);

    copyFields(driver.getClass(), driver, remote);

    return remote;
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
      throw Throwables.propagate(e);
    }
  }

  /**
   * Enhance the interfaces implemented by this instance of WebElement iff that instance is a
   * {@link org.openqa.selenium.remote.RemoteWebElement}.
   * 
   * The WebElement that is returned may well be a dynamic proxy. You cannot rely on the concrete
   * implementing class to remain constant.
   * 
   * @param element The driver to enhance.
   * @return A class implementing the described interfaces.
   */
  public WebElement augment(RemoteWebElement element) {
    // TODO(simon): We should really add a "SelfDescribing" interface for this
    RemoteWebDriver parent = (RemoteWebDriver) element.getWrappedDriver();
    if (parent == null) {
      return element;
    }
    Map<String, AugmenterProvider> augmentors = elementAugmentors;

    CompoundHandler handler = determineAugmentation(parent, augmentors, element);
    RemoteWebElement remote = create(handler, element);

    copyFields(element.getClass(), element, remote);

    remote.setId(element.getId());
    remote.setParent(parent);

    return remote;
  }

  private CompoundHandler determineAugmentation(WebDriver driver,
      Map<String, AugmenterProvider> augmentors, Object objectToAugment) {
    Map<String, ?> capabilities = ((RemoteWebDriver) driver).getCapabilities().asMap();

    CompoundHandler handler = new CompoundHandler((RemoteWebDriver) driver, objectToAugment);

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
  protected <X> X create(CompoundHandler handler, X from) {
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

    private Map<Method, InterfaceImplementation> handlers =
        new HashMap<Method, InterfaceImplementation>();
    private Set<Class<?>> interfaces = new HashSet<Class<?>>();

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
