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

package org.openqa.selenium.remote.session;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

import java.util.Map;
import java.util.Objects;

public class SafariFilter implements CapabilitiesFilter {
  @Override
  public Map<String, Object> apply(Map<String, Object> unmodifiedCaps) {
    ImmutableMap<String, Object> caps = unmodifiedCaps.entrySet().parallelStream()
      .filter(entry ->
                (CapabilityType.BROWSER_NAME.equals(entry.getKey()) && BrowserType.SAFARI.equals(entry.getValue())) ||
                "safari.options".equals(entry.getKey()))
      .distinct()
      .filter(entry -> Objects.nonNull(entry.getValue()))
      .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    return caps.isEmpty() ? null : caps;
  }
}
