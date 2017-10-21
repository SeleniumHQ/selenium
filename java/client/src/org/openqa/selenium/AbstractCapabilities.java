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

package org.openqa.selenium;

import java.util.Collection;
import java.util.Comparator;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

abstract class AbstractCapabilities implements Capabilities {

  protected final Map<String, Object> caps = new TreeMap<>();

  @Override
  public String toString() {
    Map<Object, String> seen = new IdentityHashMap<>();
    return "Capabilities " + abbreviate(seen, caps);
  }

  private String abbreviate(Map<Object, String> seen, Object stringify) {
    if (stringify == null) {
      return "null";
    }

    StringBuilder value = new StringBuilder();

    if (stringify.getClass().isArray()) {
      value.append("[");
      value.append(
          Stream.of((Object[]) stringify)
              .map(item -> abbreviate(seen, item))
              .collect(Collectors.joining(", ")));
      value.append("]");
    } else if (stringify instanceof Collection) {
      value.append("[");
      value.append(
          ((Collection<?>) stringify).stream()
              .map(item -> abbreviate(seen, item))
              .collect(Collectors.joining(", ")));
      value.append("]");
    } else if (stringify instanceof Map) {
      value.append("{");
      value.append(
          ((Map<?, ?>) stringify).entrySet().stream()
              .sorted(Comparator.comparing(entry -> String.valueOf(entry.getKey())))
              .map(entry -> String.valueOf(entry.getKey()) + ": " + abbreviate(seen, entry.getValue()))
              .collect(Collectors.joining(", ")));
      value.append("}");
    } else {
      String s = String.valueOf(stringify);
      if (s.length() > 30) {
        value.append(s.substring(0, 27)).append("...");
      } else {
        value.append(s);
      }
    }

    seen.put(stringify, value.toString());
    return value.toString();
  }

}
