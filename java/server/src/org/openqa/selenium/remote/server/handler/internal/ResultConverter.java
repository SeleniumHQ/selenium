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

package org.openqa.selenium.remote.server.handler.internal;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.server.KnownElements;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Converts an object to be sent as JSON according to the wire protocol.
 */
public class ResultConverter implements Function<Object, Object> {
  private final KnownElements knownElements;

  public ResultConverter(KnownElements knownElements) {
    this.knownElements = knownElements;
  }

  @Override
  public Object apply(Object result) {
    if (result instanceof WebElement) {
      String elementId = knownElements.add((WebElement) result);
      return ImmutableMap.of("ELEMENT", elementId);
    }

    if (result instanceof List) {
      @SuppressWarnings("unchecked")
      List<Object> resultAsList = (List<Object>) result;
      return Lists.newArrayList(Iterables.transform(resultAsList, this));
    }

    if (result instanceof Map<?, ?>) {
      Map<?, ?> resultAsMap = (Map<?, ?>) result;
      Map<Object, Object> converted = new HashMap<>(resultAsMap.size());
      for (Map.Entry<?, ?> entry : resultAsMap.entrySet()) {
        converted.put(entry.getKey(), apply(entry.getValue()));
      }
      return converted;
    }

    return result;
  }
}
