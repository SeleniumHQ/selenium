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


import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class ImmutableCapabilities implements Capabilities, Serializable {

  private static final long serialVersionUID = 665766108972704060L;

  private final Map<String, Object> caps = new HashMap<>();

  public ImmutableCapabilities(Capabilities other) {
    this(other.asMap());
  }

  public ImmutableCapabilities(Map<String, ?> capabilities) {
    capabilities.forEach((key, value) -> {
      if (value != null) {
        caps.put(key, value);
      }
    });
  }

  @Override
  public Object getCapability(String capabilityName) {
    return caps.get(capabilityName);
  }

  @Override
  public Map<String, ?> asMap() {
    return Collections.unmodifiableMap(caps);
  }
}
