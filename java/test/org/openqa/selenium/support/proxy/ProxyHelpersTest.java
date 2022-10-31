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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.UnreachableBrowserException;

import java.lang.reflect.Method;
import java.util.Collections;
import java.util.concurrent.Callable;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.openqa.selenium.support.proxy.Helpers.createProxy;

public class ProxyHelpersTest {

  @Test
  void shouldFireBeforeAndAfterEvents() {
    final StringBuilder acc = new StringBuilder();
    MethodCallListener listener = new MethodCallListener() {
      @Override
      public void beforeCall(Object target, Method method, Object[] args) {
        acc.append("beforeCall ").append(method.getName()).append("\n");
        // should be ignored
        throw new IllegalStateException();
      }

      @Override
      public void afterCall(Object target, Method method, Object[] args, Object result) {
        acc.append("afterCall ").append(method.getName()).append("\n");
        // should be ignored
        throw new IllegalStateException();
      }
    };
    RemoteWebDriver driver = createProxy(RemoteWebDriver.class, Collections.singletonList(listener));

    assertThrows(
      UnreachableBrowserException.class,
      () -> driver.get("http://example.com/")
    );

    assertThat(acc.toString().trim()).isEqualTo(
      String.join("\n",
        "beforeCall get",
          "beforeCall getSessionId",
          "afterCall getSessionId",
          "beforeCall getCapabilities",
          "afterCall getCapabilities",
          "beforeCall getCapabilities",
          "afterCall getCapabilities")
    );
  }

  @Test
  void shouldFireErrorEvents() {
    MethodCallListener listener = new MethodCallListener() {
      @Override
      public Object onError(Object obj, Method method, Object[] args, Throwable e) {
        throw new IllegalStateException();
      }
    };
    RemoteWebDriver driver = createProxy(RemoteWebDriver.class, Collections.singletonList(listener));

    assertThrows(
      IllegalStateException.class,
      () -> driver.get("http://example.com/")
    );
  }

  @Test
  void shouldFireCallEvents() {
    final StringBuilder acc = new StringBuilder();
    MethodCallListener listener = new MethodCallListener() {
      @Override
      public Object call(Object obj, Method method, Object[] args, Callable<?> original) {
        acc.append("onCall ").append(method.getName()).append("\n");
        throw new IllegalStateException();
      }

      @Override
      public Object onError(Object obj, Method method, Object[] args, Throwable e) throws Throwable {
        acc.append("onError ").append(method.getName()).append("\n");
        throw e;
      }
    };
    RemoteWebDriver driver = createProxy(RemoteWebDriver.class, Collections.singletonList(listener));

    assertThrows(
      IllegalStateException.class,
      () -> driver.get("http://example.com/")
    );

    assertThat(acc.toString().trim()).isEqualTo(
      String.join("\n",
        "onCall get",
        "onError get")
    );
  }
}
