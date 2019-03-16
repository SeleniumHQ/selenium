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

package org.openqa.selenium.devtools;

import static com.google.common.collect.ImmutableMap.toImmutableMap;

import com.google.common.collect.ImmutableMap;

import java.util.AbstractMap;
import java.util.Map;
import java.util.Objects;
import java.util.StringJoiner;

public class Event {

  private final String method;
  private final Map<String, Object> params;

  public Event(String method, Map<?, ?> params) {
    this.method = Objects.requireNonNull(method, "Event method must be set.");
    this.params = params == null ?
                  ImmutableMap.of() :
                  params.entrySet().stream()
                      .map(entry -> new AbstractMap.SimpleEntry<String, Object>(
                          String.valueOf(entry.getKey()), entry.getValue()))
                      .collect(toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  @Override
  public String toString() {
    return new StringJoiner(", ", Event.class.getSimpleName() + "[", "]")
        .add("method='" + method + "'")
        .add("params=" + params)
        .toString();
  }
}
