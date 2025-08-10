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
import com.github.benmanes.caffeine.cache.RemovalListener;
import java.io.Closeable;
import java.io.Reader;
import java.net.URI;
import java.time.Duration;
import java.util.concurrent.Callable;
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

public class HandleSession implements HttpHandler, Closeable {

  private static final Logger LOG = Logger.getLogger(HandleSession.class.getName());

  private static class ReverseProxyHandlerCloseable extends ReverseProxyHandler
      implements Closeable {

    public ReverseProxyHandlerCloseable(Tracer tracer, HttpClient httpClient) {
      super(tracer, httpClient);
    }

    @Override
    public void close() {
      // No operation needed - cache management is handled by Cache builder
    }
  }

  private final Tracer tracer;
  private final HttpClient.Factory httpClientFactory;
  private final SessionMap sessions;
  private final Cache<URI, CacheEntry> httpClientCache;

  /**
   * Wrapper class to store HttpClient along with its configuration for dynamic cache expiration
   * based on HttpClient's read timeout.
   */
  private static class CacheEntry {
    private final HttpClient httpClient;
    private final ClientConfig config;
    private final long creationTime;

    CacheEntry(HttpClient httpClient, ClientConfig config) {
      this.httpClient = Require.nonNull("HttpClient", httpClient);
      this.config = Require.nonNull("ClientConfig", config);
      this.creationTime = System.currentTimeMillis();
    }

    HttpClient getHttpClient() {
      return httpClient;
    }

    ClientConfig getConfig() {
      return config;
    }

    /**
     * Check if this cache entry has expired based on the HttpClient's read timeout. Method is used
     * by Cache builder to determine if an entry should be evicted.
     *
     * @param lastAccessTime the last time this entry was accessed
     * @return true if the entry should be evicted
     */
    boolean isExpired(long lastAccessTime) {
      long readTimeoutMs = config.readTimeout().toMillis();
      long timeSinceLastAccess = System.currentTimeMillis() - lastAccessTime;
      boolean expired = timeSinceLastAccess > readTimeoutMs;
      if (expired) {
        LOG.fine(
            String.format(
                "Connection for %s has expired (read timeout: %d seconds)",
                config.baseUri(), config.readTimeout().toSeconds()));
      }
      return expired;
    }

    /**
     * Close the HTTP client associated with this cache entry. Method is used by Cache builder to
     * close expired entries.
     */
    void close() {
      try {
        httpClient.close();
        LOG.fine(String.format("Closed expired connection for %s", config.baseUri()));
      } catch (Exception ex) {
        LOG.warning(String.format("Failed to close expired connection for %s", config.baseUri()));
      }
    }
  }

  HandleSession(Tracer tracer, HttpClient.Factory httpClientFactory, SessionMap sessions) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.httpClientFactory = Require.nonNull("HTTP client factory", httpClientFactory);
    this.sessions = Require.nonNull("Sessions", sessions);

    // Create Cache with dynamic expiry based on HttpClient read timeout
    // and a removal listener to close HTTP clients
    this.httpClientCache =
        Caffeine.newBuilder()
            .expireAfter(
                new Expiry<URI, CacheEntry>() {
                  @Override
                  public long expireAfterCreate(URI uri, CacheEntry cacheEntry, long currentTime) {
                    // Use the HttpClient's read timeout for initial expiration
                    LOG.fine(
                        String.format(
                            "Set (read timeout: %d seconds) as initial expiration for %s in cache",
                            cacheEntry.getConfig().readTimeout().toSeconds(), uri));
                    return cacheEntry.getConfig().readTimeout().toNanos();
                  }

                  @Override
                  public long expireAfterUpdate(
                      URI uri, CacheEntry cacheEntry, long currentTime, long currentDuration) {
                    // Use the HttpClient's read timeout for expiration after update
                    LOG.fine(
                        String.format(
                            "Set (read timeout: %d seconds) as expiration after update for %s in"
                                + " cache",
                            cacheEntry.getConfig().readTimeout().toSeconds(), uri));
                    return cacheEntry.getConfig().readTimeout().toNanos();
                  }

                  @Override
                  public long expireAfterRead(
                      URI uri, CacheEntry cacheEntry, long currentTime, long currentDuration) {
                    // Use the HttpClient's read timeout for expiration after read
                    LOG.fine(
                        String.format(
                            "Set (read timeout: %d seconds) as expiration after read for %s in"
                                + " cache",
                            cacheEntry.getConfig().readTimeout().toSeconds(), uri));
                    return cacheEntry.getConfig().readTimeout().toNanos();
                  }
                })
            .removalListener(
                (RemovalListener<URI, CacheEntry>)
                    (uri, cacheEntry, cause) -> {
                      if (cacheEntry != null) {
                        try {
                          Duration readTimeout = cacheEntry.getConfig().readTimeout();
                          LOG.fine(
                              "Closing HTTP client for "
                                  + uri
                                  + " (read timeout: "
                                  + readTimeout.toSeconds()
                                  + " seconds), removal cause: "
                                  + cause);
                          cacheEntry.close();
                        } catch (Exception ex) {
                          LOG.log(Level.WARNING, "Failed to close HTTP client for " + uri, ex);
                        }
                      }
                    })
            .build();
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
        try (ReverseProxyHandlerCloseable handler = loadSessionId(tracer, span, id).call()) {
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

  private Callable<ReverseProxyHandlerCloseable> loadSessionId(
      Tracer tracer, Span span, SessionId id) {
    return span.wrap(
        () -> {
          URI sessionUri = sessions.getUri(id);

          // Get or create the HTTP client from cache (this also updates the "last access" time)
          CacheEntry cacheEntry =
              httpClientCache.get(
                  sessionUri,
                  uri -> {
                    LOG.fine("Creating new HTTP client for " + uri);
                    ClientConfig config = fetchNodeSessionTimeout(uri);
                    HttpClient httpClient = httpClientFactory.createClient(config);
                    LOG.fine(
                        "Created connection for "
                            + uri
                            + " (read timeout: "
                            + config.readTimeout().toSeconds()
                            + " seconds)");
                    return new CacheEntry(httpClient, config);
                  });

          try {
            return new ReverseProxyHandlerCloseable(tracer, cacheEntry.getHttpClient());
          } catch (Throwable t) {
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
    // This will trigger the removal listener for all entries, which will close all HTTP clients
    httpClientCache.invalidateAll();
    httpClientCache.cleanUp();
  }
}
