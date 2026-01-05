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
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import org.openqa.selenium.By;

/**
 * Compatibility adapter that delegates to {@link
 * org.openqa.selenium.support.pagefactory.AbstractFindByBuilder}.
 *
 * @deprecated Use {@link org.openqa.selenium.support.pagefactory.AbstractFindByBuilder} instead.
 */
@Deprecated(forRemoval = false)
public abstract class AbstractFindByBuilder<T>
    extends org.openqa.selenium.support.pagefactory.AbstractFindByBuilder<T> {

  protected By buildByFromFindBy(FindBy findBy) {
    return super.buildByFromFindBy(adapt(findBy));
  }

  protected void assertValidFindBys(FindBys findBys) {
    for (FindBy findBy : findBys.value()) {
      super.assertValidFindBy(adapt(findBy));
    }
  }

  protected void assertValidFindBy(FindBy findBy) {
    super.assertValidFindBy(adapt(findBy));
  }

  protected void assertValidFindAll(FindAll findBys) {
    for (FindBy findBy : findBys.value()) {
      super.assertValidFindBy(adapt(findBy));
    }
  }

  private org.openqa.selenium.support.pagefactory.FindBy adapt(final FindBy findBy) {
    return (org.openqa.selenium.support.pagefactory.FindBy)
        Proxy.newProxyInstance(
            org.openqa.selenium.support.pagefactory.FindBy.class.getClassLoader(),
            new Class[] {org.openqa.selenium.support.pagefactory.FindBy.class},
            new InvocationHandler() {
              @Override
              public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                if ("how".equals(method.getName())) {
                  return org.openqa.selenium.support.pagefactory.How.valueOf(findBy.how().name());
                }
                if ("annotationType".equals(method.getName())) {
                  return org.openqa.selenium.support.pagefactory.FindBy.class;
                }
                // For all other methods (id, name, etc.), they return String and match exactly.
                // We delegate to the 'findBy' instance.
                try {
                  return findBy.annotationType().getMethod(method.getName()).invoke(findBy);
                } catch (NoSuchMethodException e) {
                  // Handle equals/hashCode/toString if necessary, though usually not called in
                  // builder logic
                  if ("equals".equals(method.getName())) {
                    return proxy == args[0];
                  }
                  if ("hashCode".equals(method.getName())) {
                    return System.identityHashCode(proxy);
                  }
                  if ("toString".equals(method.getName())) {
                    return "Proxy for " + findBy.toString();
                  }
                  throw e;
                }
              }
            });
  }
}
