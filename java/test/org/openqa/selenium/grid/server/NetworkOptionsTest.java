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

package org.openqa.selenium.grid.server;

import static java.util.Collections.emptyList;
import static java.util.Collections.emptyMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.netty.server.SimpleHttpServer;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

class NetworkOptionsTest {
  /**
   * An initial version of our wrapper around OpenTracing caused exceptions to be thrown when spans
   * were closed prematurely and out of order. This test was written to both demonstrate that
   * problem and to resolve it.
   */
  @Test
  void triggerFailureInTracing()
      throws URISyntaxException, InterruptedException, MalformedURLException {
    // I better explain this. The only hint that we have that our use of
    // OpenTelemetry is wrong is found in the log message that the
    // io.grpc.Context generates when `Context.detach` is called in an
    // "unbalanced" way. So, what we'll do is add a new log handler that
    // will record all messages during the test (filtered by logger name)
    // and after the fact make sure that the list of warnings at the
    // appropriate level is empty.
    //
    // This means this test is remarkably brittle and fragile. If there
    // were a way to replace the storage engine in `Context`, I'd have done
    // that for this test run, but of course there is not.

    Logger rootLogger = LogManager.getLogManager().getLogger("");

    CapturingHandler handler = new CapturingHandler("io.grpc");
    rootLogger.addHandler(handler);

    try {
      Config config = new MapConfig(emptyMap());
      Tracer tracer = DefaultTestTracer.createTracer();
      HttpClient.Factory clientFactory = new NetworkOptions(config).getHttpClientFactory(tracer);

      SimpleHttpServer server = new SimpleHttpServer(new BaseServerOptions(config).getPort());
      server.registerEndpoint(GET, "/version", null, null);

      try (HttpClient client = clientFactory.createClient(server.baseUri().toURL())) {
        client.execute(new HttpRequest(GET, "/version"));
      }
    } finally {
      rootLogger.removeHandler(handler);
    }

    List<String> messages = handler.getMessages(Level.SEVERE);
    assertThat(messages).isEmpty();
  }

  private static class CapturingHandler extends Handler {

    private final String loggerNamePrefix;
    private final Map<Level, List<String>> recordedMessages = new HashMap<>();

    public CapturingHandler(String loggerNamePrefix) {
      this.loggerNamePrefix = loggerNamePrefix;
    }

    @Override
    public void publish(LogRecord record) {
      if (record.getLoggerName().startsWith(loggerNamePrefix)) {
        recordedMessages
            .computeIfAbsent(record.getLevel(), level -> new ArrayList<>())
            .add(record.getMessage());
      }
    }

    @Override
    public void flush() {
      // no-op
    }

    @Override
    public void close() throws SecurityException {
      // no-op
    }

    public List<String> getMessages(Level level) {
      return recordedMessages.getOrDefault(level, emptyList());
    }
  }
}
