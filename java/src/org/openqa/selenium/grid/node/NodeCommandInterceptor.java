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

import java.io.Closeable;
import java.io.IOException;
import java.util.concurrent.Callable;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

/**
 * SPI for intercepting WebDriver commands executed through the Node. Implementations are discovered
 * at runtime via {@link java.util.ServiceLoader} and may be provided at startup via {@code --ext}.
 *
 * <p>Interceptors are called in the order they are loaded. Each interceptor receives a {@code next}
 * callable that, when invoked, advances to the next interceptor or executes the actual command.
 *
 * <p>The lifecycle of an enabled interceptor mirrors the {@code LocalNode} that hosts it: {@link
 * #initialize} is called once at node startup and {@link #close} is called once when the node shuts
 * down. Implementations that hold resources (thread pools, file handles, network connections)
 * should release them in {@code close()}.
 *
 * <p>Typical usage — subscribe to session-lifecycle events in {@link #initialize} (via the {@code
 * bus}), then annotate or observe each command in {@link #intercept}:
 *
 * <pre>{@code
 * public void initialize(Config config, EventBus bus) {
 *   bus.addListener(SessionCreatedEvent.listener(data -> onSessionStarted(data)));
 *   bus.addListener(SessionClosedEvent.listener(data -> onSessionStopped(data)));
 * }
 *
 * public HttpResponse intercept(SessionId id, HttpRequest req, Callable<HttpResponse> next)
 *     throws Exception {
 *   before(id, req);
 *   HttpResponse response = next.call();
 *   after(id, req, response);
 *   return response;
 * }
 * }</pre>
 */
public interface NodeCommandInterceptor extends Closeable {

  /** Returns {@code true} when this interceptor should be activated for the given config. */
  boolean isEnabled(Config config);

  /**
   * Called once during node startup after {@link #isEnabled} returns {@code true}. Implementations
   * should subscribe to session-lifecycle events on the {@code bus} here.
   */
  void initialize(Config config, EventBus bus);

  /**
   * Called once when the {@code LocalNode} shuts down. Implementations should release any resources
   * acquired in {@link #initialize} (thread pools, open files, network connections).
   *
   * <p>The default implementation is a no-op; override only when cleanup is needed.
   */
  @Override
  default void close() throws IOException {}

  /**
   * Wraps execution of a single WebDriver HTTP command. Implementations MUST call {@code
   * next.call()} exactly once and return its result (possibly augmented).
   *
   * @param id the session ID extracted from the request URI
   * @param req the incoming HTTP request
   * @param next callable that advances to the next interceptor or executes the command
   * @return the HTTP response to return to the caller
   */
  HttpResponse intercept(SessionId id, HttpRequest req, Callable<HttpResponse> next)
      throws Exception;
}
