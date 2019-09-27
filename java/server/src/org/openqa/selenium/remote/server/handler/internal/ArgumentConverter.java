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
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.server.KnownElements;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ArgumentConverter implements Function<Object, Object> {
  private final KnownElements knownElements;

  public ArgumentConverter(KnownElements knownElements) {
    this.knownElements = knownElements;
  }

  @Override
  public Object apply(Object arg) {
    if (arg instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> paramAsMap = (Map<String, Object>) arg;
      if (paramAsMap.containsKey("ELEMENT")) {
        KnownElements.ProxiedElement element = (KnownElements.ProxiedElement) knownElements
            .get((String) paramAsMap.get("ELEMENT"));
        return element.getWrappedElement();
      }

      Map<String, Object> converted = new HashMap<>(paramAsMap.size());
      for (Map.Entry<String, Object> entry : paramAsMap.entrySet()) {
        converted.put(entry.getKey(), apply(entry.getValue()));
      }
      return converted;
    }

    if (arg instanceof RemoteWebElement) {
      return knownElements.get(((RemoteWebElement) arg).getId());
    }

    if (arg instanceof List<?>) {
      return Lists.newArrayList(Iterables.transform((List<?>) arg, this));
    }

    return arg;
  }
}
