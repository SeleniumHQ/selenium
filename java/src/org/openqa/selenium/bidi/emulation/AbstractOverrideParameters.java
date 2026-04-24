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

import static java.util.Collections.unmodifiableMap;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;

public abstract class AbstractOverrideParameters implements OverrideParameters {
  private static final String CONTEXTS = "contexts";
  private static final String USER_CONTEXTS = "userContexts";

  protected final Map<String, @Nullable Object> map = new HashMap<>();

  @Override
  public OverrideParameters contexts(List<String> contexts) {
    map.put(CONTEXTS, Require.nonEmpty("Contexts", contexts));
    return this;
  }

  @Override
  public OverrideParameters userContexts(List<String> userContexts) {
    map.put(USER_CONTEXTS, Require.nonEmpty("User contexts", userContexts));
    return this;
  }

  @Override
  public final Map<String, @Nullable Object> toMap() {
    if (map.containsKey(CONTEXTS) == map.containsKey(USER_CONTEXTS)) {
      throw new IllegalStateException(
          String.format("Must specify either %s or %s", CONTEXTS, USER_CONTEXTS));
    }
    return unmodifiableMap(map);
  }

  @Override
  public String toString() {
    return String.format("%s%s", getClass().getSimpleName(), toMap());
  }
}
