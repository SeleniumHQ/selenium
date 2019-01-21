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

package org.openqa.selenium.grid.router;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.remote.tracing.Span;

import java.io.IOException;
import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.ExecutionException;

class HandleSession implements CommandHandler {

  private final LoadingCache<SessionId, CommandHandler> knownSessions;
  private final DistributedTracer tracer;

  public HandleSession(
      DistributedTracer tracer,
      HttpClient.Factory httpClientFactory,
      SessionMap sessions) {
    this.tracer = Objects.requireNonNull(tracer);
    Objects.requireNonNull(sessions);

    this.knownSessions = CacheBuilder.newBuilder()
        .expireAfterAccess(Duration.ofMinutes(1))
        .build(new CacheLoader<SessionId, CommandHandler>() {
          @Override
          public CommandHandler load(SessionId id) throws Exception {
            Session session = sessions.get(id);
            if (session instanceof CommandHandler) {
              return (CommandHandler) session;
            }
            HttpClient client = httpClientFactory.createClient(session.getUri().toURL());
            return new ReverseProxyHandler(client);
          }
        });
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    try (Span span = tracer.createSpan("router.webdriver-command", tracer.getActiveSpan())) {
      span.addTag("http.method", req.getMethod());
      span.addTag("http.url", req.getUri());

      String[] split = req.getUri().split("/", 4);
      SessionId id = new SessionId(split[2]);

      span.addTag("session.id", id);

      try {
        knownSessions.get(id).execute(req, resp);
        span.addTag("http.status", resp.getStatus());
      } catch (ExecutionException e) {
        span.addTag("exception", e.getMessage());

        Throwable cause = e.getCause();
        if (cause instanceof RuntimeException) {
          throw (RuntimeException) cause;
        }
        throw new RuntimeException(cause);
      }
    }
  }
}
