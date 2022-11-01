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

import net.bytebuddy.implementation.bind.annotation.AllArguments;
import net.bytebuddy.implementation.bind.annotation.Origin;
import net.bytebuddy.implementation.bind.annotation.RuntimeType;
import net.bytebuddy.implementation.bind.annotation.SuperCall;
import net.bytebuddy.implementation.bind.annotation.This;

import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.WeakHashMap;
import java.util.concurrent.Callable;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Interceptor {
  private static final Logger logger = Logger.getLogger(Interceptor.class.getName());
  public static final Map<Object, Collection<MethodCallListener>> LISTENERS = new WeakHashMap<>();
  private static final Set<String> OBJECT_METHOD_NAMES = Stream.of(Object.class.getMethods())
    .map(Method::getName)
    .collect(Collectors.toSet());

  @RuntimeType
  public static Object intercept(
    @This Object self,
    @Origin Method method,
    @AllArguments Object[] args,
    @SuperCall Callable<?> callable
  ) throws Throwable {
    if (OBJECT_METHOD_NAMES.contains(method.getName())) {
      return callable.call();
    }
    Collection<MethodCallListener> listeners = LISTENERS.get(self);
    if (listeners == null || listeners.isEmpty()) {
      return callable.call();
    }

    listeners.forEach(listener -> {
      try {
        listener.beforeCall(self, method, args);
      } catch (NotImplementedException e) {
        // ignore
      } catch (Exception e) {
        logger.log(Level.SEVERE, "Got an unexpected error in beforeCall listener", e);
      }
    });

    final UUID noResult = UUID.randomUUID();
    Object result = noResult;
    for (MethodCallListener listener: listeners) {
      try {
        result = listener.call(self, method, args, callable);
        break;
      } catch (NotImplementedException e) {
        // ignore
      } catch (Exception e) {
        try {
          return listener.onError(self, method, args, e);
        } catch (NotImplementedException e1) {
          // ignore
        }
        throw e;
      }
    }
    if (noResult.equals(result)) {
      try {
        result = callable.call();
      } catch (Exception e) {
        for (MethodCallListener listener: listeners) {
          try {
            return listener.onError(self, method, args, e);
          } catch (NotImplementedException e1) {
            // ignore
          }
        }
        throw e;
      }
    }

    final Object endResult = result == noResult ? null : result;
    listeners.forEach(listener -> {
      try {
        listener.afterCall(self, method, args, endResult);
      } catch (NotImplementedException e) {
        // ignore
      } catch (Exception e) {
        logger.log(Level.SEVERE, "Got an unexpected error in afterCall listener", e);
      }
    });
    return endResult;
  }
}
