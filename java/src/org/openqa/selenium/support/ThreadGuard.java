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
package org.openqa.selenium.support;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

/**
 * Multithreaded client code should use this to assert that it accesses webdriver in a thread-safe
 * manner.
 *
 * <p>Wrap WebDriver instances as follows:
 *
 * <pre class="code">
 * WebDriver driver = ThreadGuard.protect(new FirefoxDriver());
 * </pre>
 *
 * Threading issues related to incorrect client threading may have mysterious and hard to diagnose
 * errors. Using this wrapper prevents this category of errors. It is recommended for all
 * multithreaded usage. This class has no overhead of any importance.
 */
public class ThreadGuard {

  public static WebDriver protect(WebDriver actualWebDriver) {
    WebDriverInvocationHandler invocationHandler = new WebDriverInvocationHandler(actualWebDriver);
    return (WebDriver)
        java.lang.reflect.Proxy.newProxyInstance(
            actualWebDriver.getClass().getClassLoader(),
            getInterfaces(actualWebDriver),
            invocationHandler);
  }

  private static Class<?>[] getInterfaces(Object target) {
    Class<?> base = target.getClass();
    Set<Class<?>> interfaces = new HashSet<>();
    if (base.isInterface()) {
      interfaces.add(base);
    }
    while (base != null && !Object.class.equals(base)) {
      interfaces.addAll(Arrays.asList(base.getInterfaces()));
      base = base.getSuperclass();
    }
    return interfaces.toArray(new Class[0]);
  }

  static class WebDriverInvocationHandler implements InvocationHandler {

    private final long threadId;
    private final Object underlying;
    private final String threadName;

    public WebDriverInvocationHandler(Object underlyingWebDriver) {
      Thread thread = Thread.currentThread();
      this.threadId = thread.getId();
      this.threadName = thread.getName();
      this.underlying = underlyingWebDriver;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
      try {
        if (Thread.currentThread().getId() != threadId) {
          Thread currentThread = Thread.currentThread();
          throw new WebDriverException(
              String.format(
                  "Thread safety error; this instance of WebDriver was constructed on "
                      + "thread %s (id %d) and is being accessed by thread %s (id %d)"
                      + "This is not permitted and *will* cause undefined behaviour",
                  threadName, threadId, currentThread.getName(), currentThread.getId()));
        }
        return invokeUnderlying(method, args);
      } catch (InvocationTargetException e) {
        throw e.getTargetException();
      }
    }

    protected Object invokeUnderlying(Method method, Object[] args)
        throws IllegalAccessException, InvocationTargetException {
      return method.invoke(underlying, args);
    }
  }
}
