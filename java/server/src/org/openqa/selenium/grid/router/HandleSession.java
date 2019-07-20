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
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.net.Urls;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.remote.tracing.Span;

import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.ExecutionException;

import static org.openqa.selenium.remote.HttpSessionId.getSessionId;

class HandleSession implements HttpHandler {

  private final LoadingCache<SessionId, HttpHandler> knownSessions;
  private final DistributedTracer tracer;

  public HandleSession(
      DistributedTracer tracer,
      HttpClient.Factory httpClientFactory,
      SessionMap sessions) {
    this.tracer = Objects.requireNonNull(tracer);
    Objects.requireNonNull(sessions);

    this.knownSessions = CacheBuilder.newBuilder()
        .expireAfterAccess(Duration.ofMinutes(1))
        .build(new CacheLoader<SessionId, HttpHandler>() {
          @Override
          public HttpHandler load(SessionId id) {
            Session session = sessions.get(id);
            if (session instanceof HttpHandler) {
              return (HttpHandler) session;
            }
            HttpClient client = httpClientFactory.createClient(Urls.fromUri(session.getUri()));
            return new ReverseProxyHandler(client);
          }
        });
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    try (Span span = tracer.createSpan("router.webdriver-command", tracer.getActiveSpan())) {
      span.addTag("http.method", req.getMethod());
      span.addTag("http.url", req.getUri());

      SessionId id = getSessionId(req.getUri()).map(SessionId::new)
          .orElseThrow(() -> new NoSuchSessionException("Cannot find session: " + req));

      span.addTag("session.id", id);

      try {
        HttpResponse resp = knownSessions.get(id).execute(req);
        span.addTag("http.status", resp.getStatus());
        return resp;
      } catch (ExecutionException e) {
        span.addTag("exception", e.getMessage());

        Throwable cause = e.getCause();
        if (cause instanceof RuntimeException) {
          throw (RuntimeException) cause;
        }
        throw new RuntimeException(cause);
      }
    }
  };
}
