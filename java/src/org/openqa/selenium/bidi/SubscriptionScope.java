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

package org.openqa.selenium.bidi;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;

/**
 * Where a subscription applies: globally, or scoped to browsing contexts and/or user contexts. Part
 * of the transport layer, not generated — the remote end decides which combinations are valid.
 */
@Beta
public final class SubscriptionScope {

  private Set<String> contexts = Set.of();
  private Set<String> userContexts = Set.of();

  public SubscriptionScope contexts(Set<String> contexts) {
    this.contexts = Require.nonNull("Browsing context ids", contexts);
    return this;
  }

  public SubscriptionScope userContexts(Set<String> userContexts) {
    this.userContexts = Require.nonNull("User context ids", userContexts);
    return this;
  }

  Map<String, Object> toMap() {
    Map<String, Object> params = new HashMap<>();
    if (!contexts.isEmpty()) {
      params.put("contexts", contexts);
    }
    if (!userContexts.isEmpty()) {
      params.put("userContexts", userContexts);
    }
    return params;
  }
}
