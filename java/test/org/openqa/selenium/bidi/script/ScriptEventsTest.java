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
package org.openqa.selenium.bidi.script;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;
import static org.openqa.selenium.testing.drivers.Browser.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.Pages;

public class ScriptEventsTest extends JupiterTestBase {
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @Test
  void canListenToChannelMessage()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (Script script = new Script(driver)) {
      CompletableFuture<Message> future = new CompletableFuture<>();
      script.onMessage(future::complete);

      script.callFunctionInBrowsingContext(
          driver.getWindowHandle(),
          "(channel) => channel('foo')",
          false,
          Optional.of(List.of(LocalValue.channelValue("channel_name"))),
          Optional.empty(),
          Optional.empty());

      Message message = future.get(5, TimeUnit.SECONDS);
      assertThat(message.getChannel()).isEqualTo("channel_name");
      assertThat(message.getData().getType()).isEqualTo("string");
      assertThat(message.getData().getValue().isPresent()).isTrue();
      assertThat(message.getData().getValue().get()).isEqualTo("foo");
      assertThat(message.getSource().getRealm()).isNotNull();
      assertThat(message.getSource().getBrowsingContext().isPresent()).isTrue();
      assertThat(message.getSource().getBrowsingContext().get())
          .isEqualTo(driver.getWindowHandle());
    }
  }

  @Test
  void canListenToRealmCreatedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (Script script = new Script(driver)) {
      CompletableFuture<RealmInfo> future = new CompletableFuture<>();
      script.onRealmCreated(future::complete);

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());

      context.navigate(new Pages(server).blankPage);
      RealmInfo realmInfo = future.get(5, TimeUnit.SECONDS);
      assertThat(realmInfo.getRealmId()).isNotNull();
      assertThat(realmInfo.getRealmType()).isEqualTo(RealmType.WINDOW);
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  @NotYetImplemented(FIREFOX)
  void canListenToRealmDestroyedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (Script script = new Script(driver)) {
      CompletableFuture<RealmInfo> future = new CompletableFuture<>();
      script.onRealmDestroyed(future::complete);

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());

      context.close();
      RealmInfo realmInfo = future.get(5, TimeUnit.SECONDS);
      assertThat(realmInfo.getRealmId()).isNotNull();
      assertThat(realmInfo.getRealmType()).isEqualTo(RealmType.WINDOW);
    }
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
