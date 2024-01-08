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

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Consumer;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.network.BeforeRequestSent;
import org.openqa.selenium.bidi.network.ResponseDetails;
import org.openqa.selenium.internal.Require;

public class Network implements AutoCloseable {

  private final Set<String> browsingContextIds;

  private final BiDi bidi;

  private final Event<BeforeRequestSent> beforeRequestSentEvent =
      new Event<>("network.beforeRequestSent", BeforeRequestSent::fromJsonMap);

  private final Event<ResponseDetails> responseStarted =
      new Event<>("network.responseStarted", ResponseDetails::fromJsonMap);

  private final Event<ResponseDetails> responseCompleted =
      new Event<>("network.responseStarted", ResponseDetails::fromJsonMap);

  private final Event<ResponseDetails> authRequired =
      new Event<>("network.authRequired", ResponseDetails::fromJsonMap);

  public Network(WebDriver driver) {
    this(new HashSet<>(), driver);
  }

  public Network(String browsingContextId, WebDriver driver) {
    this(Collections.singleton(Require.nonNull("Browsing context id", browsingContextId)), driver);
  }

  public Network(Set<String> browsingContextIds, WebDriver driver) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing context id list", browsingContextIds);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.browsingContextIds = browsingContextIds;
  }

  public void onBeforeRequestSent(Consumer<BeforeRequestSent> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(beforeRequestSentEvent, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, beforeRequestSentEvent, consumer);
    }
  }

  public void onResponseStarted(Consumer<ResponseDetails> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(responseStarted, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, responseStarted, consumer);
    }
  }

  public void onResponseCompleted(Consumer<ResponseDetails> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(responseCompleted, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, responseStarted, consumer);
    }
  }

  public void onAuthRequired(Consumer<ResponseDetails> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(authRequired, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, authRequired, consumer);
    }
  }

  @Override
  public void close() {
    this.bidi.clearListener(beforeRequestSentEvent);
    this.bidi.clearListener(responseStarted);
    this.bidi.clearListener(responseCompleted);
    this.bidi.clearListener(authRequired);
  }
}
