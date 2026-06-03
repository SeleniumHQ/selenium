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

package org.openqa.selenium.bidi.module;

import static java.util.Collections.emptySet;

import java.util.Collections;
import java.util.Set;
import java.util.function.Consumer;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Event;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.speculation.PrefetchStatusUpdatedParameters;
import org.openqa.selenium.bidi.speculation.Speculation;
import org.openqa.selenium.internal.Require;

public class SpeculationInspector implements AutoCloseable {
  private final Event<PrefetchStatusUpdatedParameters> prefetchStatusUpdatedEvent;
  private final Set<String> browsingContextIds;

  private final BiDi bidi;

  public SpeculationInspector(WebDriver driver) {
    this(emptySet(), driver);
  }

  public SpeculationInspector(String browsingContextId, WebDriver driver) {
    this(Collections.singleton(Require.nonNull("Browsing context id", browsingContextId)), driver);
  }

  public SpeculationInspector(Set<String> browsingContextIds, WebDriver driver) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing context id list", browsingContextIds);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.browsingContextIds = browsingContextIds;
    this.prefetchStatusUpdatedEvent = Speculation.prefetchStatusUpdated();
  }

  public long onPrefetchStatusUpdated(Consumer<PrefetchStatusUpdatedParameters> consumer) {
    if (browsingContextIds.isEmpty()) {
      return this.bidi.addListener(this.prefetchStatusUpdatedEvent, consumer);
    } else {
      return this.bidi.addListener(browsingContextIds, this.prefetchStatusUpdatedEvent, consumer);
    }
  }

  public void removeListener(long subscriptionId) {
    this.bidi.removeListener(subscriptionId);
  }

  public void clearListener(String browsingContextId) {
    Require.nonNull("Browsing context id", browsingContextId);
    clearListeners(Collections.singleton(browsingContextId));
  }

  public void clearListeners(Set<String> browsingContextIds) {
    Require.nonNull("Browsing context id list", browsingContextIds);
    this.bidi.clearListener(browsingContextIds, this.prefetchStatusUpdatedEvent);
  }

  @Override
  public void close() {
    this.bidi.clearListener(this.prefetchStatusUpdatedEvent);
  }
}
