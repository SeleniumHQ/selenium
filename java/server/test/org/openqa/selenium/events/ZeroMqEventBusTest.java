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

package org.openqa.selenium.events;

import org.assertj.core.api.Assertions;
import org.junit.Test;
import org.openqa.selenium.events.zeromq.ZeroMqEventBus;
import org.openqa.selenium.grid.security.Secret;
import org.zeromq.ZContext;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;

public class ZeroMqEventBusTest {

  @Test
  public void shouldEnsureMessagesRequireSecret() throws InterruptedException, ExecutionException, TimeoutException {
    String publish = "inproc://zmqebt-publish";
    String subscribe = "inproc://zmqebt-subscribe";

    ZContext context = new ZContext();
    EventBus good = ZeroMqEventBus.create(context, publish, subscribe, true, new Secret("cheese"));
    EventBus alsoGood = ZeroMqEventBus.create(context, publish, subscribe, false, new Secret("cheese"));
    EventBus bad = ZeroMqEventBus.create(context, publish, subscribe, false, new Secret("peas"));

    RuntimeException errorException = new RuntimeException("oh noes!");
    EventName eventName = new EventName("evt");
    CompletableFuture<String> future = new CompletableFuture<>();
    good.addListener(new EventListener<>(eventName, String.class, future::complete));
    good.addListener(ZeroMqEventBus.onRejectedEvent(evt -> future.completeExceptionally(errorException)));

    alsoGood.fire(new Event(eventName, "tasty"));

    String value = future.get(5, SECONDS);
    assertThat(value).isEqualTo("tasty");

    CompletableFuture<String> badFuture = new CompletableFuture<>();
    good.addListener(new EventListener<>(eventName, String.class, badFuture::complete));
    good.addListener(ZeroMqEventBus.onRejectedEvent(evt -> badFuture.completeExceptionally(errorException)));
    bad.fire(new Event(eventName, "not tasty"));

    Assertions.assertThatThrownBy(() -> badFuture.get(5, SECONDS)).getCause().isSameAs(errorException);
  }

}
