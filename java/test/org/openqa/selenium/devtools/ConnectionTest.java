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

package org.openqa.selenium.devtools;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.internal.Debug;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.WebSocket;

@Tag("UnitTests")
class ConnectionTest {

  private String oldDebugProperty;
  private Level oldLoggerLevel;

  @BeforeEach
  void storeSystemProperty() {
    oldDebugProperty = System.getProperty("selenium.debug");
    oldLoggerLevel = seleniumLogger().getLevel();
    System.clearProperty("selenium.debug");
  }

  @AfterEach
  void restoreSystemProperty() {
    if (oldDebugProperty != null) {
      System.setProperty("selenium.debug", oldDebugProperty);
    } else {
      System.clearProperty("selenium.debug");
    }
    // Re-sync configureLogger's internal state/handler with the now-restored property so a
    // handler installed by this test never leaks into the next.
    Debug.configureLogger();
    seleniumLogger().setLevel(oldLoggerLevel);
  }

  private static Logger seleniumLogger() {
    return Logger.getLogger("org.openqa.selenium");
  }

  @Test
  void constructingConnectionDirectlyConfiguresTheSeleniumLoggerWhenDebugging() {
    // devtools.Connection is sometimes constructed directly rather than through RemoteWebDriver or
    // DriverFinder -- neither of which would run in that path to trigger Debug.configureLogger()
    // otherwise. No test previously constructed a Connection directly and checked that its own
    // constructor actually configures the shared org.openqa.selenium logger.
    System.setProperty("selenium.debug", "true");

    try (Connection connection =
        new Connection(
            new NoOpHttpClient(),
            "ws://localhost:9222/devtools/page/1",
            ClientConfig.defaultConfig())) {
      assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);
    }
  }

  /** Minimal real (not mocked) {@link HttpClient} whose socket never talks to the network. */
  private static class NoOpHttpClient implements HttpClient {
    @Override
    public HttpResponse execute(HttpRequest request) {
      throw new UnsupportedOperationException("execute");
    }

    @Override
    public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
      return new WebSocket() {
        @Override
        public WebSocket send(Message message) {
          return this;
        }

        @Override
        public void close() {}
      };
    }

    @Override
    public <T> java.util.concurrent.CompletableFuture<java.net.http.HttpResponse<T>>
        sendAsyncNative(
            java.net.http.HttpRequest request, java.net.http.HttpResponse.BodyHandler<T> handler) {
      throw new UnsupportedOperationException("sendAsyncNative");
    }

    @Override
    public <T> java.net.http.HttpResponse<T> sendNative(
        java.net.http.HttpRequest request, java.net.http.HttpResponse.BodyHandler<T> handler) {
      throw new UnsupportedOperationException("sendNative");
    }
  }
}
