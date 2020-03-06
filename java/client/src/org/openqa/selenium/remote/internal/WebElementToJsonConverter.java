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

package org.openqa.selenium.remote.internal;

import com.google.common.base.Function;
import com.google.common.collect.Collections2;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.RemoteWebElement;

import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Converts {@link RemoteWebElement} objects, which may be
 * {@link WrapsElement wrapped}, into their JSON representation as defined by
 * the WebDriver wire protocol. This class will recursively convert Lists and
 * Maps to catch nested references.
 *
 * @see <a href="https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol#webelement-json-object">
 *     WebDriver JSON Wire Protocol</a>
 */
public class WebElementToJsonConverter implements Function<Object, Object> {
  @Override
  public Object apply(Object arg) {
    if (arg == null || arg instanceof String || arg instanceof Boolean ||
        arg instanceof Number) {
      return arg;
    }

    while (arg instanceof WrapsElement) {
      arg = ((WrapsElement) arg).getWrappedElement();
    }

    if (arg instanceof RemoteWebElement) {
      return ImmutableMap.of(
        Dialect.OSS.getEncodedElementKey(), ((RemoteWebElement) arg).getId(),
        Dialect.W3C.getEncodedElementKey(), ((RemoteWebElement) arg).getId());
    }

    if (arg.getClass().isArray()) {
      arg = Arrays.asList((Object[]) arg);
    }

    if (arg instanceof Collection<?>) {
      Collection<?> args = (Collection<?>) arg;
      return Collections2.transform(args, this);
    }

    if (arg instanceof Map<?, ?>) {
      Map<?, ?> args = (Map<?, ?>) arg;
      Map<String, Object> converted = new HashMap<>(args.size());
      for (Map.Entry<?, ?> entry : args.entrySet()) {
        Object key = entry.getKey();
        if (!(key instanceof String)) {
          throw new IllegalArgumentException(
              "All keys in Map script arguments must be strings: " + key.getClass().getName());
        }
        converted.put((String) key, apply(entry.getValue()));
      }
      return converted;
    }

    throw new IllegalArgumentException("Argument is of an illegal type: " +
        arg.getClass().getName());
  }
}
