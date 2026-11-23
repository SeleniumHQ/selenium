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

package org.openqa.selenium.bidi.protocol.module;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.protocol.network.AddInterceptParameters;
import org.openqa.selenium.bidi.protocol.network.AddInterceptResult;
import org.openqa.selenium.bidi.protocol.network.BeforeRequestSentParameters;
import org.openqa.selenium.bidi.protocol.network.InterceptPhase;
import org.openqa.selenium.bidi.protocol.network.RemoveInterceptParameters;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

class NetworkModuleTest extends JupiterTestBase {

  @Test
  @NeedsFreshDriver
  void canAddAndRemoveInterceptThroughTheGeneratedModule() {
    Network network = new Network(driver);

    AddInterceptResult result =
        network.addIntercept(new AddInterceptParameters(List.of(InterceptPhase.BEFOREREQUESTSENT)));

    assertThat(result.getIntercept()).isNotNull();

    network.removeIntercept(new RemoveInterceptParameters(result.getIntercept()));
  }

  @Test
  @NeedsFreshDriver
  void canSubscribeReceiveAndUnsubscribeFromAGeneratedEvent() throws Exception {
    // Deliberately no interception here: this test is only about proving the subscribe ->
    // receive -> unsubscribe lifecycle works, not about the intercept/continue command flow
    // (covered separately in canAddAndRemoveInterceptThroughTheGeneratedModule). Combining
    // both in one test means every beforeRequestSent request blocks until explicitly continued,
    // which turns "did the event arrive" into a much harder, unrelated problem to get right.
    Network network = new Network(driver);
    CompletableFuture<BeforeRequestSentParameters> future = new CompletableFuture<>();

    String subscriptionId = network.subscribe(Network.BEFORE_REQUEST_SENT, future::complete);
    assertThat(subscriptionId).isNotNull();

    driver.get(appServer.whereIs("/bidi/logEntryAdded.html"));

    BeforeRequestSentParameters event = future.get(5, TimeUnit.SECONDS);
    assertThat(event.getContext()).isEqualTo(driver.getWindowHandle());
    assertThat(event.getRequest().getMethod()).isEqualToIgnoringCase("get");
    assertThat(event.getRequest().getUrl()).isNotNull();

    network.unsubscribe(subscriptionId);
  }
}
