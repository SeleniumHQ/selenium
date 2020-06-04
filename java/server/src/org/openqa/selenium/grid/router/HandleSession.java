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

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.net.Urls;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.HttpTracing;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;

import static org.openqa.selenium.remote.HttpSessionId.getSessionId;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;

class HandleSession implements HttpHandler {

  private final Tracer tracer;
  private final HttpClient.Factory httpClientFactory;
  private final SessionMap sessions;
  private final Cache<SessionId, HttpHandler> knownSessions;

  HandleSession(
    Tracer tracer,
    HttpClient.Factory httpClientFactory,
    SessionMap sessions) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.httpClientFactory = Require.nonNull("HTTP client factory", httpClientFactory);
    this.sessions = Require.nonNull("Sessions", sessions);

    this.knownSessions = CacheBuilder.newBuilder()
      .expireAfterAccess(Duration.ofMinutes(1))
      .build();
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    try (Span span = HttpTracing.newSpanAsChildOf(tracer, req, "router.handle_session")) {
      HTTP_REQUEST.accept(span, req);

      SessionId id = getSessionId(req.getUri()).map(SessionId::new)
        .orElseThrow(() -> new NoSuchSessionException("Cannot find session: " + req));

      SESSION_ID.accept(span, id);

      try {
        HttpTracing.inject(tracer, span, req);
        HttpResponse res = knownSessions.get(id, loadSessionId(tracer, span, id)).execute(req);

        HTTP_RESPONSE.accept(span, res);

        return res;
      } catch (ExecutionException e) {
        span.setAttribute("error", true);
        span.setAttribute("error.message", e.getMessage());

        Throwable cause = e.getCause();
        if (cause instanceof RuntimeException) {
          throw (RuntimeException) cause;
        }
        throw new RuntimeException(cause);
      }
    }
  }

  private Callable<HttpHandler> loadSessionId(Tracer tracer, Span span, SessionId id) {
    return span.wrap(
      () -> {
        Session session = sessions.get(id);
          if (session instanceof HttpHandler) {
            return (HttpHandler) session;
          }
          HttpClient client = httpClientFactory.createClient(Urls.fromUri(session.getUri()));
          return new ReverseProxyHandler(tracer, client);
      }
    );
  }
}
