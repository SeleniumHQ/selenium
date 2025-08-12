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
import static org.openqa.selenium.remote.http.Contents.reader;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.Expiry;
import com.github.benmanes.caffeine.cache.RemovalCause;
import com.github.benmanes.caffeine.cache.RemovalListener;
import com.github.benmanes.caffeine.cache.Weigher;
import java.io.Closeable;
import java.io.Reader;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
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

  /**
   * Cache entry that tracks HttpClient usage and timing for connection reuse. Connection reuse
   * criteria: - inUse must be 0 (no active requests) - lastUse must be older than readTimeout
   * duration
   */
  private static class CacheEntry {
    private final HttpClient httpClient;
    private final AtomicLong inUse;
    private final Duration readTimeout;
    // volatile as the cache will access this from multiple threads
    private volatile Instant lastUse;

    public CacheEntry(HttpClient httpClient, Duration readTimeout, long initialUsage) {
      this.httpClient = httpClient;
      this.readTimeout = readTimeout;
      this.inUse = new AtomicLong(initialUsage);
      this.lastUse = Instant.now();
    }

    /**
     * Checks if this connection can be reused based on usage and timeout criteria.
     *
     * @return true if connection is idle (inUse=0) and over readTimeout
     */
    public boolean canBeReused() {
      return inUse.get() == 0 && lastUse.isBefore(Instant.now().minus(readTimeout));
    }

    /**
     * Checks if this connection should be expired based on usage and timeout criteria.
     *
     * @return true if connection is idle (inUse=0) and over readTimeout
     */
    public boolean shouldExpire() {
      return canBeReused(); // Same criteria for now
    }

    /**
     * Attempts to reuse this connection if criteria are met.
     *
     * @return true if connection was successfully reused, false otherwise
     */
    public boolean tryReuse() {
      // Double-check criteria under potential race conditions
      if (canBeReused()) {
        // Try to increment usage atomically - if successful, connection is reused
        long currentUsage = inUse.get();
        if (currentUsage == 0 && inUse.compareAndSet(0, 1)) {
          LOG.fine("Reusing idle connection: " + httpClient);
          return true;
        }
      }
      return false;
    }

    /** Updates the last use time - called when connection is accessed */
    public void updateLastUse() {
      this.lastUse = Instant.now();
    }
  }

  /**
   * Custom expiry policy that considers inUse count and lastUse time with readTimeout. This ensures
   * entries are expired when they meet our reuse criteria.
   */
  private static class ConnectionExpiry implements Expiry<URI, CacheEntry> {

    @Override
    public long expireAfterCreate(URI key, CacheEntry value, long currentTime) {
      // Initial expiration time based on readTimeout
      return value.readTimeout.toNanos();
    }

    @Override
    public long expireAfterUpdate(
        URI key, CacheEntry value, long currentTime, long currentDuration) {
      // Reset expiration time when entry is updated (connection reused)
      return value.readTimeout.toNanos();
    }

    @Override
    public long expireAfterRead(URI key, CacheEntry value, long currentTime, long currentDuration) {
      // Check if connection should expire based on our criteria
      if (value.shouldExpire()) {
        return 0; // Expire immediately
      }

      // Calculate remaining time until expiration
      Instant expireTime = value.lastUse.plus(value.readTimeout);
      Duration remaining = Duration.between(Instant.now(), expireTime);

      if (remaining.isNegative() || remaining.isZero()) {
        return 0; // Expire immediately
      }

      return remaining.toNanos();
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
      // Update last use time and decrement usage count
      entry.lastUse = Instant.now();
      entry.inUse.decrementAndGet();
    }
  }

  /**
   * Custom weigher that implements "pinning" by assigning very high weight to entries with inUse >
   * 0. This prevents Caffeine from evicting active connections during size-based eviction.
   *
   * <p>Weight Strategy: - inUse == 0: Weight = 1 (normal, can be evicted) - inUse > 0: Weight =
   * Integer.MAX_VALUE (effectively pinned, won't be evicted)
   */
  private static class InUseWeigher implements Weigher<URI, CacheEntry> {
    @Override
    public int weigh(URI key, CacheEntry value) {
      long inUse = value.inUse.get();
      int weight = inUse == 0 ? 1 : Integer.MAX_VALUE;

      LOG.finest(
          "Weighing cache entry: "
              + key
              + ", inUse: "
              + inUse
              + ", weight: "
              + (weight == Integer.MAX_VALUE ? "PINNED" : weight));

      return weight;
    }
  }

  /**
   * Enhanced removal listener that provides detailed information about eviction causes and tracks
   * when pinned entries are removed.
   */
  private static class DetailedRemovalListener implements RemovalListener<URI, CacheEntry> {
    @Override
    public void onRemoval(URI key, CacheEntry entry, RemovalCause cause) {
      if (entry != null) {
        boolean wasPinned = entry.inUse.get() > 0;

        LOG.info(
            "Removing HttpClient from cache: "
                + key
                + ", cause: "
                + cause
                + ", inUse: "
                + entry.inUse.get()
                + ", lastUse: "
                + entry.lastUse
                + ", wasPinned: "
                + wasPinned
                + (wasPinned && cause == RemovalCause.SIZE
                    ? " [WARNING: Pinned entry evicted!]"
                    : ""));

        try {
          entry.httpClient.close();
        } catch (Exception ex) {
          LOG.log(Level.WARNING, "Failed to close HttpClient during cache removal", ex);
        }
      }
    }
  }

  private final Tracer tracer;
  private final HttpClient.Factory httpClientFactory;
  private final SessionMap sessions;
  private final Cache<URI, CacheEntry> httpClientsCache;
  private final ScheduledExecutorService cleanupExecutor;

  HandleSession(Tracer tracer, HttpClient.Factory httpClientFactory, SessionMap sessions) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.httpClientFactory = Require.nonNull("HTTP client factory", httpClientFactory);
    this.sessions = Require.nonNull("Sessions", sessions);

    // Configure Caffeine cache with custom expiry and connection reuse support
    this.httpClientsCache =
        Caffeine.newBuilder()
            .maximumWeight(1000) // Maximum weight to prevent eviction of in-use entries
            .weigher(new InUseWeigher()) // Weigher to prevent eviction of in-use entries
            .expireAfter(new ConnectionExpiry()) // Custom expiry based on inUse and readTimeout
            .removalListener(new DetailedRemovalListener()) // Detailed removal listener
            .build();

    // Schedule periodic cleanup to actively check for expired entries
    this.cleanupExecutor =
        Executors.newSingleThreadScheduledExecutor(
            r -> {
              Thread thread = new Thread(r);
              thread.setDaemon(true);
              thread.setName("HandleSession - Connection Cleanup");
              return thread;
            });

    // Run cleanup every 30 seconds to actively expire stale connections
    cleanupExecutor.scheduleAtFixedRate(
        () -> {
          try {
            LOG.fine("Running periodic connection cleanup");

            // Force cache maintenance - this will trigger expiry checks
            httpClientsCache.cleanUp();

            // Additional manual check for entries that should be expired
            httpClientsCache
                .asMap()
                .entrySet()
                .removeIf(
                    entry -> {
                      CacheEntry cacheEntry = entry.getValue();
                      if (cacheEntry.shouldExpire()) {
                        LOG.fine(
                            "Manually expiring connection: "
                                + entry.getKey()
                                + ", inUse: "
                                + cacheEntry.inUse.get()
                                + ", lastUse: "
                                + cacheEntry.lastUse);
                        return true;
                      }
                      return false;
                    });

            LOG.fine(
                "Connection cleanup completed. Cache size: " + httpClientsCache.estimatedSize());
          } catch (Exception e) {
            LOG.log(Level.WARNING, "Error during connection cleanup", e);
          }
        },
        120,
        60,
        TimeUnit.SECONDS);
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
          URI sessionUri = sessions.getUri(id);

          // Try to get existing entry and reuse connection if possible
          CacheEntry cacheEntry = httpClientsCache.getIfPresent(sessionUri);

          if (cacheEntry != null && cacheEntry.tryReuse()) {
            // Successfully reused existing idle connection - update last use
            cacheEntry.updateLastUse();
            LOG.fine("Reusing idle connection for session: " + id);
            return new UsageCountingReverseProxyHandler(tracer, cacheEntry.httpClient, cacheEntry);
          }

          // Need to create new connection or existing one couldn't be reused
          ClientConfig config = fetchNodeSessionTimeout(sessionUri);
          HttpClient httpClient = httpClientFactory.createClient(config);

          // Create new cache entry with usage count of 1
          CacheEntry newEntry = new CacheEntry(httpClient, config.readTimeout(), 1);

          // Put in cache (this might evict old entries)
          httpClientsCache.put(sessionUri, newEntry);

          LOG.fine(
              "Created new HttpClient for session: "
                  + id
                  + ", readTimeout: "
                  + config.readTimeout().toSeconds()
                  + "s");

          try {
            return new UsageCountingReverseProxyHandler(tracer, newEntry.httpClient, newEntry);
          } catch (Throwable t) {
            // Ensure we don't keep the http client when an unexpected throwable is raised
            newEntry.inUse.decrementAndGet();
            throw t;
          }
        });
  }

  private ClientConfig fetchNodeSessionTimeout(URI uri) {
    ClientConfig config = ClientConfig.defaultConfig().baseUri(uri).withRetries();
    Duration sessionTimeout = config.readTimeout();
    HttpClient httpClient = httpClientFactory.createClient(config);
    HttpRequest statusRequest = new HttpRequest(GET, "/status");
    try {
      HttpResponse res = httpClient.execute(statusRequest);
      Reader reader = reader(res);
      Json JSON = new Json();
      JsonInput in = JSON.newInput(reader);
      in.beginObject();
      // Skip everything until we find "value"
      while (in.hasNext()) {
        if ("value".equals(in.nextName())) {
          in.beginObject();
          while (in.hasNext()) {
            if ("node".equals(in.nextName())) {
              NodeStatus nodeStatus = in.read(NodeStatus.class);
              sessionTimeout = nodeStatus.getSessionTimeout();
              LOG.fine(
                  "Detected session timeout from node status (read timeout: "
                      + sessionTimeout.toSeconds()
                      + " seconds)");
            } else {
              in.skipValue();
            }
          }
          in.endObject();
        } else {
          in.skipValue();
        }
      }
    } catch (Exception e) {
      LOG.fine(
          "Use default from ClientConfig (read timeout: "
              + config.readTimeout().toSeconds()
              + " seconds)");
    }
    config = config.readTimeout(sessionTimeout);
    return config;
  }

  @Override
  public void close() {
    // Shutdown cleanup executor
    if (cleanupExecutor != null && !cleanupExecutor.isShutdown()) {
      cleanupExecutor.shutdown();
      try {
        if (!cleanupExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
          cleanupExecutor.shutdownNow();
        }
      } catch (InterruptedException e) {
        cleanupExecutor.shutdownNow();
        Thread.currentThread().interrupt();
      }
    }

    // Clean shutdown of the cache - this will trigger removal listeners
    httpClientsCache.invalidateAll();
    httpClientsCache.cleanUp();
  }
}
