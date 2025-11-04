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

package org.openqa.selenium.bidi.emulation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class AbstractOverrideParameters implements OverrideParameters {
  protected final Map<String, Object> map = new HashMap<>();

  @Override
  public OverrideParameters contexts(List<String> contexts) {
    if (contexts == null || contexts.isEmpty()) {
      throw new IllegalArgumentException("Contexts cannot be null or empty");
    }
    if (map.containsKey("userContexts")) {
      throw new IllegalArgumentException("Cannot specify both contexts and userContexts");
    }
    map.put("contexts", contexts);
    return this;
  }

  @Override
  public OverrideParameters userContexts(List<String> userContexts) {
    if (userContexts == null || userContexts.isEmpty()) {
      throw new IllegalArgumentException("User contexts cannot be null or empty");
    }
    if (map.containsKey("contexts")) {
      throw new IllegalArgumentException("Cannot specify both contexts and userContexts");
    }
    map.put("userContexts", userContexts);
    return this;
  }

  @Override
  public Map<String, Object> toMap() {
    // Validate that either contexts or userContexts is set
    if (!map.containsKey("contexts") && !map.containsKey("userContexts")) {
      throw new IllegalStateException("Must specify either contexts or userContexts");
    }
    return new HashMap<>(map);
  }
}
