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
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;

import java.io.Closeable;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.concurrent.ExecutorServices;
import org.openqa.selenium.concurrent.GuardedRunnable;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
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

class HandleSession implements HttpHandler, Closeable {

  private static final Logger LOG = Logger.getLogger(HandleSession.class.getName());

  static final Duration READ_TIMEOUT_BUFFER = Duration.ofSeconds(30);

  /**
   * Cache key combining the Node URI and the effective read-timeout. Sessions that target the same
   * Node and have the same effective timeout share a connection-pooled {@link HttpClient}, while
   * sessions with a longer {@code pageLoad} timeout get their own client so the Router never cuts
   * off a legitimate long-running navigation.
   */
  private static final class NodeClientKey {
    private final URI uri;
    private final Duration readTimeout;

    NodeClientKey(URI uri, Duration readTimeout) {
      this.uri = uri;
      this.readTimeout = readTimeout;
    }

    @Override
    public boolean equals(Object o) {
      if (!(o instanceof NodeClientKey)) return false;
      NodeClientKey k = (NodeClientKey) o;
      return Objects.equals(uri, k.uri) && Objects.equals(readTimeout, k.readTimeout);
    }

    @Override
    public int hashCode() {
      return Objects.hash(uri, readTimeout);
    }
  }

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
      // must not call super.close() here, to ensure the HttpClient stays alive
      // set the last use here, to ensure we have to calculate the real inactivity of the client
      entry.lastUse = Instant.now();
      entry.inUse.decrementAndGet();
    }
  }

  private final Tracer tracer;
  private final HttpClient.Factory httpClientFactory;
  private final SessionMap sessions;
  // Caches the Node's own session-timeout (from /se/grid/node/status) so the HTTP
  // call is made at most once per Node URI rather than once per session.
  private final ConcurrentMap<URI, Duration> nodeTimeoutCache;
  // Keyed by (nodeUri, effectiveReadTimeout) so sessions with the same timeout on
  // the same Node share a pooled HttpClient while sessions with a longer pageLoad
  // timeout get a client sized to their actual value.
  private final ConcurrentMap<NodeClientKey, CacheEntry> httpClients;
  private final ScheduledExecutorService cleanUpHttpClientsCacheService;

  HandleSession(Tracer tracer, HttpClient.Factory httpClientFactory, SessionMap sessions) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.httpClientFactory = Require.nonNull("HTTP client factory", httpClientFactory);
    this.sessions = Require.nonNull("Sessions", sessions);

    this.nodeTimeoutCache = new ConcurrentHashMap<>();
    this.httpClients = new ConcurrentHashMap<>();

    Runnable cleanUpHttpClients =
        () -> {
          Instant staleBefore = Instant.now().minus(2, ChronoUnit.MINUTES);

          // Use removeIf for safe and efficient removal from ConcurrentHashMap
          httpClients
              .entrySet()
              .removeIf(
                  entry -> {
                    CacheEntry cacheEntry = entry.getValue();
                    if (cacheEntry.inUse.get() != 0) {
                      // the client is currently in use
                      return false;
                    }
                    if (!cacheEntry.lastUse.isBefore(staleBefore)) {
                      // the client was recently used
                      return false;
                    }
                    // the client has not been used for a while, close and remove it
                    try {
                      cacheEntry.httpClient.close();
                    } catch (Exception ex) {
                      LOG.log(Level.WARNING, "failed to close a stale httpclient", ex);
                    }
                    return true;
                  });
        };

    this.cleanUpHttpClientsCacheService =
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
          // Retrieve the full Session so we can read the WebDriver timeouts from capabilities.
          // SessionMap.get() is the same call that getUri() delegates to internally, so there is
          // no extra network round-trip compared to the previous getUri()-only approach.
          Session session = sessions.get(id);
          URI sessionUri = session.getUri();

          // Use the pageLoad timeout (plus a buffer) so the Router never cuts off a legitimate
          // long-running navigation. Fall back to the Node's own sessionTimeout when it is larger,
          // as it represents the Grid operator's upper bound for command duration.
          Duration pageLoadTimeout = sessionReadTimeout(session.getCapabilities());
          // Only cache successful fetches so that a transient error on the first command
          // does not permanently lock in the fallback default for the node's timeout.
          // computeIfAbsent skips storing when the mapping function returns null, so a
          // failed fetch is retried on the next command rather than cached forever.
          Duration fetchedNodeTimeout =
              nodeTimeoutCache.computeIfAbsent(
                  sessionUri, uri -> fetchNodeTimeout(uri).orElse(null));
          Duration nodeTimeout =
              fetchedNodeTimeout != null
                  ? fetchedNodeTimeout
                  : ClientConfig.defaultConfig().readTimeout();
          Duration base =
              pageLoadTimeout.compareTo(nodeTimeout) >= 0 ? pageLoadTimeout : nodeTimeout;
          Duration effectiveTimeout = base.plus(READ_TIMEOUT_BUFFER);

          LOG.fine(
              () ->
                  String.format(
                      "Session %s: pageLoad=%ds, node=%ds → read timeout=%ds",
                      id,
                      pageLoadTimeout.toSeconds(),
                      nodeTimeout.toSeconds(),
                      effectiveTimeout.toSeconds()));

          NodeClientKey key = new NodeClientKey(sessionUri, effectiveTimeout);
          CacheEntry cacheEntry =
              httpClients.compute(
                  key,
                  (k, entry) -> {
                    if (entry != null) {
                      entry.inUse.incrementAndGet();
                      return entry;
                    }

                    ClientConfig config =
                        ClientConfig.defaultConfig()
                            .baseUri(sessionUri)
                            .readTimeout(effectiveTimeout)
                            .withRetries();
                    return new CacheEntry(httpClientFactory.createClient(config), 1);
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

  /**
   * Returns the effective read-timeout derived from the session's WebDriver timeouts. Only {@code
   * pageLoad} (navigation) is considered — it is the command type that can block the Router for
   * extended periods. Falls back to {@link ClientConfig#defaultConfig()}'s read timeout when the
   * value is absent.
   */
  static Duration sessionReadTimeout(Capabilities caps) {
    Object timeoutsObj = caps.getCapability("timeouts");
    if (timeoutsObj instanceof Map) {
      Map<?, ?> timeouts = (Map<?, ?>) timeoutsObj;
      long pageLoadMs = longFrom(timeouts.get("pageLoad"));
      if (pageLoadMs > 0) {
        return Duration.ofMillis(pageLoadMs);
      }
    }
    return ClientConfig.defaultConfig().readTimeout();
  }

  private static long longFrom(Object value) {
    if (value instanceof Long) return (Long) value;
    if (value instanceof Number) return ((Number) value).longValue();
    return 0L;
  }

  /**
   * Fetches the Node's own session-timeout from {@code /se/grid/node/status}. Returns empty on any
   * failure so the caller can skip caching and retry on the next command.
   */
  private Optional<Duration> fetchNodeTimeout(URI uri) {
    ClientConfig config = ClientConfig.defaultConfig().baseUri(uri);
    try (HttpClient httpClient = httpClientFactory.createClient(config)) {
      HttpResponse res = httpClient.execute(new HttpRequest(GET, "/se/grid/node/status"));
      NodeStatus nodeStatus = new Json().toType(string(res), NodeStatus.class);
      if (nodeStatus != null) {
        return Optional.of(nodeStatus.getSessionTimeout());
      }
    } catch (Exception e) {
      LOG.fine("Unable to fetch node status for " + uri);
    }
    return Optional.empty();
  }

  @Override
  public void close() {
    ExecutorServices.shutdownGracefully(
        "HandleSession - Clean up http clients cache", cleanUpHttpClientsCacheService);
    httpClients
        .values()
        .removeIf(
            (entry) -> {
              entry.httpClient.close();
              return true;
            });
  }
}
