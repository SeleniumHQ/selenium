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

package org.openqa.selenium.grid.node;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.RejectedExecutionException;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.RetrySessionRequestException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;

class RemoteNodeTest {

  private static final Secret SECRET = new Secret("test");
  private static final URI NODE_URI = URI.create("http://localhost:5555");

  /**
   * Regression test: mirrors the exact exception chain observed in production traces when the JDK
   * HTTP client's internal executor shuts down while a session request is in flight.
   *
   * <pre>
   *   UncheckedIOException                      ← JdkHttpClient.execute0()
   *     Caused by: IOException                  ← HttpClientImpl.send() wraps rejection
   *       Caused by: RejectedExecutionException ← ThreadPoolExecutor$AbortPolicy
   * </pre>
   *
   * With the fix, it is converted to {@link RetrySessionRequestException} so the distributor
   * retries on a healthy node.
   */
  @Test
  void newSessionShouldRetryWhenNodeHttpClientExecutorIsShuttingDown() {
    // Mirrors ThreadPoolExecutor$AbortPolicy.rejectedExecution() message format
    String rejectionMessage =
        "Task jdk.internal.net.http.common.SequentialScheduler$SchedulableTask@5affbf0"
            + " rejected from java.util.concurrent.ThreadPoolExecutor@60c48c82"
            + "[Shutting down, pool size = 2, active threads = 2, queued tasks = 0,"
            + " completed tasks = 84]";
    RejectedExecutionException rejection = new RejectedExecutionException(rejectionMessage);

    // Mirrors HttpClientImpl.send(): new IOException(e.getMessage(), e)
    IOException ioException = new IOException(rejection.getMessage(), rejection);

    // Mirrors JdkHttpClient.execute0(): new UncheckedIOException(cause)
    UncheckedIOException unchecked = new UncheckedIOException(ioException);

    RemoteNode node = remoteNodeWithClient(config -> throwingClient(unchecked));

    CreateSessionRequest request =
        new CreateSessionRequest(
            Set.of(Dialect.W3C), new ImmutableCapabilities("browserName", "chrome"), Map.of());

    Either<?, ?> result = node.newSession(request);

    assertThat(result.isLeft()).isTrue();
    assertThat(result.left()).isInstanceOf(RetrySessionRequestException.class);
    assertThat(((Exception) result.left()).getMessage())
        .contains(NODE_URI.toString())
        .contains("restarting or shutting down");
  }

  @Test
  void newSessionShouldNotRetryOnUnrelatedUncheckedIOException() {
    // A plain UncheckedIOException with no RejectedExecutionException in the cause chain
    // (e.g. connection refused, TLS error) must not be silently swallowed as a retry.
    UncheckedIOException unchecked =
        new UncheckedIOException(new IOException("Connection refused"));

    RemoteNode node = remoteNodeWithClient(config -> throwingClient(unchecked));

    CreateSessionRequest request =
        new CreateSessionRequest(
            Set.of(Dialect.W3C), new ImmutableCapabilities("browserName", "chrome"), Map.of());

    assertThatThrownBy(() -> node.newSession(request))
        .isInstanceOf(UncheckedIOException.class)
        .hasMessageContaining("Connection refused");
  }

  private static RemoteNode remoteNodeWithClient(HttpClient.Factory factory) {
    return new RemoteNode(
        DefaultTestTracer.createTracer(),
        factory,
        new NodeId(UUID.randomUUID()),
        NODE_URI,
        SECRET,
        Duration.ofSeconds(30),
        List.of(new ImmutableCapabilities("browserName", "chrome")));
  }

  /** Returns an HttpClient whose execute() always throws the given UncheckedIOException. */
  private static HttpClient throwingClient(UncheckedIOException toThrow) {
    return new HttpClient() {
      @Override
      public HttpResponse execute(HttpRequest req) {
        throw toThrow;
      }

      @Override
      public WebSocket openSocket(HttpRequest req, WebSocket.Listener listener) {
        throw new UnsupportedOperationException();
      }

      @Override
      public <T>
          java.util.concurrent.CompletableFuture<java.net.http.HttpResponse<T>> sendAsyncNative(
              java.net.http.HttpRequest request,
              java.net.http.HttpResponse.BodyHandler<T> handler) {
        throw new UnsupportedOperationException();
      }

      @Override
      public <T> java.net.http.HttpResponse<T> sendNative(
          java.net.http.HttpRequest request, java.net.http.HttpResponse.BodyHandler<T> handler) {
        throw new UnsupportedOperationException();
      }
    };
  }
}
