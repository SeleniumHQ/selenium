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

import static org.openqa.selenium.remote.HttpSessionId.getSessionId;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID_EVENT;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;

import java.io.Closeable;
import java.net.URI;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Iterator;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.concurrent.GuardedRunnable;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.ErrorCodec;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.AttributeMap;
import org.openqa.selenium.remote.tracing.HttpTracing;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

class HandleSession implements HttpHandler {

  private static final Logger LOG = Logger.getLogger(HandleSession.class.getName());

  private static class CacheEntry {
    private final HttpClient httpClient;
    private final AtomicLong inUse;
    // volatile as the ConcurrentMap will not take care of synchronization
    private volatile Instant lastUse;

    public CacheEntry(HttpClient httpClient, long initialUsage) {
      this.httpClient = httpClient;
      this.inUse = new AtomicLong(initialUsage);
      this.lastUse = Instant.now();
    }
  }

  private static class UsageCountingReverseProxyHandler extends ReverseProxyHandler
      implements Closeable {
    private final CacheEntry entry;

    public UsageCountingReverseProxyHandler(
        Tracer tracer, HttpClient httpClient, CacheEntry entry) {
      super(tracer, httpClient);

      this.entry = entry;
    }

    @Override
    public void close() {
      // set the last use here, to ensure we have to calculate the real inactivity of the client
      entry.lastUse = Instant.now();
      entry.inUse.decrementAndGet();
    }
  }

  private final Tracer tracer;
  private final HttpClient.Factory httpClientFactory;
  private final SessionMap sessions;
  private final ConcurrentMap<URI, CacheEntry> httpClients;

  HandleSession(Tracer tracer, HttpClient.Factory httpClientFactory, SessionMap sessions) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.httpClientFactory = Require.nonNull("HTTP client factory", httpClientFactory);
    this.sessions = Require.nonNull("Sessions", sessions);

    this.httpClients = new ConcurrentHashMap<>();

    Runnable cleanUpHttpClients =
        () -> {
          Instant staleBefore = Instant.now().minus(2, ChronoUnit.MINUTES);
          Iterator<CacheEntry> iterator = httpClients.values().iterator();

          while (iterator.hasNext()) {
            CacheEntry entry = iterator.next();

            if (entry.inUse.get() != 0) {
              // the client is currently in use
              return;
            } else if (!entry.lastUse.isBefore(staleBefore)) {
              // the client was recently used
              return;
            } else {
              // the client has not been used for a while, remove it from the cache
              iterator.remove();

              try {
                entry.httpClient.close();
              } catch (Exception ex) {
                LOG.log(Level.WARNING, "failed to close a stale httpclient", ex);
              }
            }
          }
        };

    ScheduledExecutorService cleanUpHttpClientsCacheService =
        Executors.newSingleThreadScheduledExecutor(
            r -> {
              Thread thread = new Thread(r);
              thread.setDaemon(true);
              thread.setName("HandleSession - Clean up http clients cache");
              return thread;
            });
    cleanUpHttpClientsCacheService.scheduleAtFixedRate(
        GuardedRunnable.guard(cleanUpHttpClients), 1, 1, TimeUnit.MINUTES);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    try (Span span = HttpTracing.newSpanAsChildOf(tracer, req, "router.handle_session")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      attributeMap.put(AttributeKey.HTTP_HANDLER_CLASS.getKey(), getClass().getName());

      HTTP_REQUEST.accept(span, req);
      HTTP_REQUEST_EVENT.accept(attributeMap, req);

      SessionId id =
          getSessionId(req.getUri())
              .map(SessionId::new)
              .orElseThrow(
                  () -> {
                    NoSuchSessionException exception =
                        new NoSuchSessionException("Cannot find session: " + req);
                    EXCEPTION.accept(attributeMap, exception);
                    attributeMap.put(
                        AttributeKey.EXCEPTION_MESSAGE.getKey(),
                        "Unable to execute request for an existing session: "
                            + exception.getMessage());
                    span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
                    return exception;
                  });

      SESSION_ID.accept(span, id);
      SESSION_ID_EVENT.accept(attributeMap, id);

      try {
        HttpTracing.inject(tracer, span, req);
        HttpResponse res;
        try (UsageCountingReverseProxyHandler handler = loadSessionId(tracer, span, id).call()) {
          res = handler.execute(req);
        }

        HTTP_RESPONSE.accept(span, res);

        return res;
      } catch (Exception e) {
        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.CANCELLED);

        String errorMessage =
            "Unable to execute request for an existing session: " + e.getMessage();
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(), errorMessage);
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        if (e instanceof NoSuchSessionException) {
          HttpResponse response = new HttpResponse();
          response.setStatus(404);
          response.setContent(asJson(ErrorCodec.createDefault().encode(e)));
          return response;
        }

        Throwable cause = e.getCause();
        if (cause instanceof RuntimeException) {
          throw (RuntimeException) cause;
        } else if (cause != null) {
          throw new RuntimeException(errorMessage, cause);
        } else if (e instanceof RuntimeException) {
          throw (RuntimeException) e;
        }
        throw new RuntimeException(errorMessage, e);
      }
    }
  }

  private Callable<UsageCountingReverseProxyHandler> loadSessionId(
      Tracer tracer, Span span, SessionId id) {
    return span.wrap(
        () -> {
          CacheEntry cacheEntry =
              httpClients.compute(
                  sessions.getUri(id),
                  (sessionUri, entry) -> {
                    if (entry != null) {
                      entry.inUse.incrementAndGet();
                      return entry;
                    }

                    ClientConfig config =
                        ClientConfig.defaultConfig().baseUri(sessionUri).withRetries();
                    HttpClient httpClient = httpClientFactory.createClient(config);

                    return new CacheEntry(httpClient, 1);
                  });

          try {
            return new UsageCountingReverseProxyHandler(tracer, cacheEntry.httpClient, cacheEntry);
          } catch (Throwable t) {
            // ensure we do not keep the http client when an unexpected throwable is raised
            cacheEntry.inUse.decrementAndGet();
            throw t;
          }
        });
  }
}
