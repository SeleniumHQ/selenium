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

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class DefaultDecorated<T> implements Decorated<T> {

  private final T original;
  private final WebDriverDecorator<?> decorator;

  public DefaultDecorated(final T original, final WebDriverDecorator<?> decorator) {
    this.original = original;
    this.decorator = decorator;
  }

  public final T getOriginal() {
    return original;
  }

  public final WebDriverDecorator<?> getDecorator() {
    return decorator;
  }

  @Override
  public void beforeCall(Method method, Object[] args) {
    getDecorator().beforeCall(this, method, args);
  }

  @Override
  public Object call(Method method, Object[] args) throws Throwable {
    return getDecorator().call(this, method, args);
  }

  @Override
  public void afterCall(Method method, Object result, Object[] args) {
    getDecorator().afterCall(this, method, args, result);
  }

  @Override
  public Object onError(Method method, InvocationTargetException e, Object[] args) throws Throwable {
    return getDecorator().onError(this, method, args, e);
  }

  @Override
  public String toString() {
    return String.format("Decorated {%s}", original);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;

    if (o instanceof Decorated) {
      Decorated<?> that = (Decorated<?>) o;
      return original.equals(that.getOriginal());

    } else {
      return this.original.equals(o);
    }
  }

  @Override
  public int hashCode() {
    return original.hashCode();
  }
}
