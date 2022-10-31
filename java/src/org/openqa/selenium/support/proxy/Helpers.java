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

package org.openqa.selenium.support.proxy;

import com.google.common.base.Preconditions;
import net.bytebuddy.ByteBuddy;
import net.bytebuddy.dynamic.loading.ClassLoadingStrategy;
import net.bytebuddy.implementation.MethodDelegation;
import net.bytebuddy.matcher.ElementMatchers;

import java.util.Collection;
import java.util.Collections;

public class Helpers {
  /**
   * Creates a transparent proxy instance for the given class.
   * It is possible to provide one or more method execution listeners
   * or replace particular method calls completely. Callbacks
   * defined in these listeners are going to be called when any
   * **public** method of the given class is invoked. Overridden callbacks
   * are expected to be skipped if they throw
   * {@link org.openqa.selenium.support.proxy.NotImplementedException}.
   *
   * @param cls the class to which the proxy should be created.
   *            Must not be an interface.
   * @param constructorArgs Array of constructor arguments. Could be an
   *                        empty array if the class provides a constructor without arguments.
   * @param constructorArgTypes Array of constructor argument types. Must
   *                            represent types of constructorArgs.
   * @param listeners One or more method invocation listeners.
   * @return Proxy instance
   * @param <T> Any class derived from Object
   */
  public static <T> T createProxy(
    Class<T> cls,
    Object[] constructorArgs,
    Class<?>[] constructorArgTypes,
    Collection<MethodCallListener> listeners
  ) {
    Preconditions.checkArgument(constructorArgs.length == constructorArgTypes.length,
      String.format(
        "Constructor arguments array length %d must be equal to the types array length %d",
        constructorArgs.length, constructorArgTypes.length
      )
    );
    Preconditions.checkArgument(!listeners.isEmpty(), "The collection of listeners must not be empty");
    Preconditions.checkArgument(cls != null, "Class must not be null");
    Preconditions.checkArgument(!cls.isInterface(), "Class must not be an interface");

    //noinspection resource
    Class<?> proxy = new ByteBuddy()
      .subclass(cls)
      .method(ElementMatchers.isPublic()
        .and(ElementMatchers.not(
            ElementMatchers.isDeclaredBy(Object.class)
              .or(ElementMatchers.isOverriddenFrom(Object.class))
          )))
      .intercept(MethodDelegation.to(Interceptor.class))
      .make()
      .load(cls.getClassLoader(), ClassLoadingStrategy.Default.WRAPPER)
      .getLoaded()
      .asSubclass(cls);

    try {
      //noinspection unchecked
      T instance = (T) proxy
        .getConstructor(constructorArgTypes)
        .newInstance(constructorArgs);
      Interceptor.LISTENERS.put(instance, listeners);
      return instance;
    } catch (SecurityException | ReflectiveOperationException e) {
      throw new IllegalStateException(String.format("Unable to create a proxy of %s", cls.getName()), e);
    }
  }

  /**
   * Creates a transparent proxy instance for the given class.
   * It is possible to provide one or more method execution listeners
   * or replace particular method calls completely. Callbacks
   * defined in these listeners are going to be called when any
   * **public** method of the given class is invoked. Overridden callbacks
   * are expected to be skipped if they throw NotImplementedException.
   *
   * @param cls the class to which the proxy should be created.
   *            Must not be an interface. Must expose a constructor
   *            without arguments.
   * @param listeners One or more method invocation listeners.
   * @return Proxy instance
   * @param <T> Any class derived from Object
   */
  public static <T> T createProxy(Class<T> cls, Collection<MethodCallListener> listeners) {
    return createProxy(cls, new Object[]{}, new Class[] {}, listeners);
  }

  /**
   * Creates a transparent proxy instance for the given class.
   * It is possible to provide one or more method execution listeners
   * or replace particular method calls completely. Callbacks
   * defined in these listeners are going to be called when any
   * **public** method of the given class is invoked. Overridden callbacks
   * are expected to be skipped if they throw NotImplementedException.
   *
   * @param cls the class to which the proxy should be created.
   *            Must not be an interface. Must expose a constructor
   *            without arguments.
   * @param listener Method invocation listener.
   * @return Proxy instance
   * @param <T> Any class derived from Object
   */
  public static <T> T createProxy(Class<T> cls, MethodCallListener listener) {
    return createProxy(cls, new Object[]{}, new Class[] {}, Collections.singletonList(listener));
  }

  /**
   * Creates a transparent proxy instance for the given class.
   * It is possible to provide one or more method execution listeners
   * or replace particular method calls completely. Callbacks
   * defined in these listeners are going to be called when any
   * **public** method of the given class is invoked. Overridden callbacks
   * are expected to be skipped if they throw NotImplementedException.
   *
   * @param cls the class to which the proxy should be created.
   *            Must not be an interface.
   * @param constructorArgs Array of constructor arguments. Could be an
   *                        empty array if the class provides a constructor without arguments.
   * @param constructorArgTypes Array of constructor argument types. Must
   *                            represent types of constructorArgs.
   * @param listener Method invocation listener.
   * @return Proxy instance
   * @param <T> Any class derived from Object
   */
  public static <T> T createProxy(
    Class<T> cls,
    Object[] constructorArgs,
    Class<?>[] constructorArgTypes,
    MethodCallListener listener
  ) {
    return createProxy(cls, constructorArgs, constructorArgTypes, Collections.singletonList(listener));
  }
}
