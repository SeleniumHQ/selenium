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

package org.openqa.selenium.grid.sessionqueue.redis;

import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

import com.google.common.collect.ImmutableMap;
import io.lettuce.core.KeyValue;
import java.io.Closeable;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.data.SessionRequestCapability;
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.jmx.ManagedAttribute;
import org.openqa.selenium.grid.jmx.ManagedService;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.redis.GridRedisClient;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.AttributeMap;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

/**
 * A Redis-backed implementation of {@link NewSessionQueue} that stores session requests in Redis
 * for distributed session queue management across multiple Grid instances.
 */
@ManagedService(
    objectName = "org.seleniumhq.grid:type=SessionQueue,name=RedisBackedSessionQueue",
    description = "Redis backed session queue")
public class RedisBackedSessionQueue extends NewSessionQueue implements Closeable {

  private static final Logger LOG = Logger.getLogger(RedisBackedSessionQueue.class.getName());
  private static final Json JSON = new Json();
  private static final String QUEUE_KEY = "session:queue";
  private static final String REQUEST_KEY_PREFIX = "session:request:";
  private static final String ENQUEUE_TIME_KEY_PREFIX = "session:enqueue_time:";

  // Redis operation attribute keys
  private static final String REDIS_OPERATION = "redis.operation";
  private static final String REDIS_KEY = "redis.key";
  private static final String REDIS_VALUE = "redis.value";
  private static final String REDIS_URI = "redis.uri";

  private final GridRedisClient connection;
  private final URI redisUri;

  public RedisBackedSessionQueue(Tracer tracer, Secret registrationSecret, URI redisUri) {
    super(tracer, registrationSecret);
    this.redisUri = Require.nonNull("Redis URI", redisUri);
    this.connection = createRedisClient(redisUri);

    new JMXHelper().register(this);
  }

  /**
   * Protected constructor for testing that allows dependency injection.
   *
   * @param tracer the tracer for observability
   * @param registrationSecret the registration secret
   * @param redisUri the Redis URI
   * @param redisClient the Redis client to use (for testing)
   */
  protected RedisBackedSessionQueue(
      Tracer tracer, Secret registrationSecret, URI redisUri, GridRedisClient redisClient) {
    super(tracer, registrationSecret);
    this.redisUri = Require.nonNull("Redis URI", redisUri);
    this.connection = redisClient;

    new JMXHelper().register(this);
  }

  /**
   * Protected constructor for testing that allows dependency injection and JMX registration
   * control.
   *
   * @param tracer the tracer for observability
   * @param registrationSecret the registration secret
   * @param redisUri the Redis URI
   * @param redisClient the Redis client to use (for testing)
   * @param skipJmxRegistration whether to skip JMX registration (for testing)
   */
  protected RedisBackedSessionQueue(
      Tracer tracer,
      Secret registrationSecret,
      URI redisUri,
      GridRedisClient redisClient,
      boolean skipJmxRegistration) {
    super(tracer, registrationSecret);
    this.redisUri = Require.nonNull("Redis URI", redisUri);
    this.connection = redisClient;

    if (!skipJmxRegistration) {
      new JMXHelper().register(this);
    }
  }

  /**
   * Creates a new GridRedisClient. This method can be overridden in tests to provide a mock Redis
   * client.
   *
   * @param redisUri the Redis URI
   * @return the GridRedisClient instance
   */
  protected GridRedisClient createRedisClient(URI redisUri) {
    return new GridRedisClient(redisUri);
  }

  /**
   * Creates a new RedisBackedSessionQueue from configuration. This is the factory method used by
   * Selenium Grid's configuration system.
   *
   * @param config the configuration object
   * @return a new RedisBackedSessionQueue instance
   */
  public static NewSessionQueue create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    Secret secret = new SecretOptions(config).getRegistrationSecret();
    NewSessionQueueOptions queueOptions = new NewSessionQueueOptions(config);

    // For RedisBackedSessionQueue, always construct a Redis URI from hostname/port
    // This ensures we get redis:// scheme instead of http:// scheme
    URI redisUri = queueOptions.getRedisUri();

    return new RedisBackedSessionQueue(tracer, secret, redisUri);
  }

  @Override
  public boolean isReady() {
    return getRedisClient().isOpen();
  }

  /**
   * Gets the Redis client connection. This method can be overridden in tests to provide a mock
   * Redis client.
   *
   * @return the GridRedisClient instance
   */
  protected GridRedisClient getRedisClient() {
    return connection;
  }

  @Override
  public boolean peekEmpty() {
    try (Span span = tracer.getCurrentContext().createSpan("LLEN " + QUEUE_KEY)) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);

      span.setAttribute(REDIS_OPERATION, "LLEN");
      span.setAttribute(REDIS_KEY, QUEUE_KEY);
      attributeMap.put(REDIS_OPERATION, "LLEN");
      attributeMap.put(REDIS_KEY, QUEUE_KEY);

      try {
        Long queueLength = getRedisClient().getConnection().sync().llen(QUEUE_KEY);
        boolean isEmpty = queueLength == 0;

        attributeMap.put("queue.empty", isEmpty);
        attributeMap.put("queue.length", queueLength);
        span.addEvent("Checked queue emptiness", attributeMap);

        return isEmpty;
      } catch (Exception e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(
            AttributeKey.EXCEPTION_MESSAGE.getKey(),
            "Unable to check if queue is empty: " + e.getMessage());
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        LOG.log(Level.SEVERE, "Failed to check if queue is empty", e);
        return false;
      }
    }
  }

  @Override
  public HttpResponse addToQueue(SessionRequest request) {
    Require.nonNull("SessionRequest to add", request);

    try (Span span =
        tracer.getCurrentContext().createSpan("LPUSH " + QUEUE_KEY + " and MSET request data")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);

      String requestId = request.getRequestId().toString();
      String requestKey = REQUEST_KEY_PREFIX + requestId;
      String enqueueTimeKey = ENQUEUE_TIME_KEY_PREFIX + requestId;
      String requestJson = JSON.toJson(request);
      String enqueueTime = request.getEnqueued().toString();

      span.setAttribute(REDIS_OPERATION, "LPUSH+MSET");
      span.setAttribute(REDIS_KEY, QUEUE_KEY);
      span.setAttribute(REDIS_VALUE, requestId);
      attributeMap.put(REDIS_OPERATION, "LPUSH+MSET");
      attributeMap.put(REDIS_KEY, QUEUE_KEY);
      attributeMap.put(REDIS_VALUE, requestId);
      attributeMap.put("request.id", requestId);

      try {
        // Store request data and enqueue time
        getRedisClient()
            .mset(
                ImmutableMap.of(
                    requestKey, requestJson,
                    enqueueTimeKey, enqueueTime));

        // Add request ID to the queue
        Long queueLength = getRedisClient().getConnection().sync().lpush(QUEUE_KEY, requestId);

        attributeMap.put("queue.length", queueLength);
        span.addEvent("Added request to queue", attributeMap);

        HttpResponse resp = new HttpResponse();
        resp.setStatus(200);
        return resp;
      } catch (Exception e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(
            AttributeKey.EXCEPTION_MESSAGE.getKey(),
            "Unable to add session request to Redis: " + e.getMessage());
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        LOG.log(Level.SEVERE, "Failed to add session request to queue", e);

        HttpResponse resp = new HttpResponse();
        resp.setStatus(500);
        return resp;
      }
    }
  }

  @Override
  public boolean retryAddToQueue(SessionRequest request) {
    HttpResponse response = addToQueue(request);
    return response.getStatus() == 200;
  }

  @Override
  public Optional<SessionRequest> remove(RequestId requestId) {
    Require.nonNull("RequestId to remove", requestId);

    try (Span span = tracer.getCurrentContext().createSpan("LREM and GET request data")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);

      String requestIdStr = requestId.toString();
      String requestKey = REQUEST_KEY_PREFIX + requestIdStr;
      String enqueueTimeKey = ENQUEUE_TIME_KEY_PREFIX + requestIdStr;

      span.setAttribute(REDIS_OPERATION, "GET+LREM+DEL");
      span.setAttribute(REDIS_KEY, requestKey);
      attributeMap.put(REDIS_OPERATION, "GET+LREM+DEL");
      attributeMap.put(REDIS_KEY, requestKey);
      attributeMap.put("request.id", requestIdStr);

      try {
        // Get the request data first
        String requestJson = getRedisClient().get(requestKey);

        if (requestJson != null) {
          // Remove from queue and delete associated data
          Long removedCount =
              getRedisClient().getConnection().sync().lrem(QUEUE_KEY, 1, requestIdStr);
          getRedisClient().del(requestKey, enqueueTimeKey);

          attributeMap.put("removed.count", removedCount);
          span.addEvent("Removed request from queue", attributeMap);

          return Optional.of(JSON.toType(requestJson, SessionRequest.class));
        } else {
          attributeMap.put("request.found", false);
          span.addEvent("Session request not found in queue", attributeMap);
        }
      } catch (Exception e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(
            AttributeKey.EXCEPTION_MESSAGE.getKey(),
            "Unable to remove session request from queue: " + e.getMessage());
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        LOG.log(Level.SEVERE, "Failed to remove session request from queue", e);
      }
    }
    return Optional.empty();
  }

  @Override
  public List<SessionRequest> getNextAvailable(Map<Capabilities, Long> stereotypes) {
    try (Span span = tracer.getCurrentContext().createSpan("RPOP and GET next available request")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);

      span.setAttribute(REDIS_OPERATION, "RPOP+GET");
      span.setAttribute(REDIS_KEY, QUEUE_KEY);
      attributeMap.put(REDIS_OPERATION, "RPOP+GET");
      attributeMap.put(REDIS_KEY, QUEUE_KEY);

      try {
        // Get the next request ID from the queue (FIFO - right pop from left push)
        String requestIdStr = getRedisClient().getConnection().sync().rpop(QUEUE_KEY);

        if (requestIdStr != null) {
          String requestKey = REQUEST_KEY_PREFIX + requestIdStr;
          String requestJson = getRedisClient().get(requestKey);

          if (requestJson != null) {
            SessionRequest request = JSON.toType(requestJson, SessionRequest.class);
            attributeMap.put("requests.found", 1);
            attributeMap.put("request.id", requestIdStr);
            span.addEvent("Retrieved next available session request", attributeMap);
            return List.of(request);
          } else {
            // Request data is missing, log warning but continue
            LOG.log(Level.WARNING, "Request data missing for ID: " + requestIdStr);
          }
        }

        attributeMap.put("requests.found", 0);
        span.addEvent("No session requests available", attributeMap);
      } catch (Exception e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(
            AttributeKey.EXCEPTION_MESSAGE.getKey(),
            "Unable to get next available session request: " + e.getMessage());
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        LOG.log(Level.SEVERE, "Failed to get next available session request", e);
      }
    }
    return List.of();
  }

  @Override
  public boolean complete(
      RequestId reqId, Either<SessionNotCreatedException, CreateSessionResponse> result) {
    // For Redis implementation, we just need to remove the request from storage
    // The request was already removed from the queue in getNextAvailable()
    String requestIdStr = reqId.toString();
    String requestKey = REQUEST_KEY_PREFIX + requestIdStr;
    String enqueueTimeKey = ENQUEUE_TIME_KEY_PREFIX + requestIdStr;

    try {
      getRedisClient().del(requestKey, enqueueTimeKey);
      return true;
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Failed to clean up completed request: " + requestIdStr, e);
      return false;
    }
  }

  @Override
  public int clearQueue() {
    try (Span span =
        tracer.getCurrentContext().createSpan("Clear all session requests from queue")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);

      span.setAttribute(REDIS_OPERATION, "LRANGE+DEL");
      span.setAttribute(REDIS_KEY, QUEUE_KEY);
      attributeMap.put(REDIS_OPERATION, "LRANGE+DEL");
      attributeMap.put(REDIS_KEY, QUEUE_KEY);

      try {
        // Get all request IDs from the queue
        List<String> requestIds = getRedisClient().getConnection().sync().lrange(QUEUE_KEY, 0, -1);
        int requestCount = requestIds.size();

        if (requestCount > 0) {
          // Delete all request data
          List<String> keysToDelete = new ArrayList<>();
          for (String requestId : requestIds) {
            keysToDelete.add(REQUEST_KEY_PREFIX + requestId);
            keysToDelete.add(ENQUEUE_TIME_KEY_PREFIX + requestId);
          }

          // Delete the queue and all request data
          keysToDelete.add(QUEUE_KEY);
          getRedisClient().del(keysToDelete.toArray(new String[0]));
        }

        attributeMap.put("requests.cleared", requestCount);
        span.addEvent("Cleared all session requests from queue", attributeMap);
        return requestCount;
      } catch (Exception e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(
            AttributeKey.EXCEPTION_MESSAGE.getKey(),
            "Unable to clear session queue: " + e.getMessage());
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        LOG.log(Level.SEVERE, "Failed to clear session queue", e);
        return 0;
      }
    }
  }

  @Override
  public List<SessionRequestCapability> getQueueContents() {
    try (Span span = tracer.getCurrentContext().createSpan("Get all session requests from queue")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);

      span.setAttribute(REDIS_OPERATION, "LRANGE+MGET");
      span.setAttribute(REDIS_KEY, QUEUE_KEY);
      attributeMap.put(REDIS_OPERATION, "LRANGE+MGET");
      attributeMap.put(REDIS_KEY, QUEUE_KEY);

      try {
        // Get all request IDs from the queue (in order)
        List<String> requestIds = getRedisClient().getConnection().sync().lrange(QUEUE_KEY, 0, -1);
        List<SessionRequestCapability> contents = new ArrayList<>();

        if (!requestIds.isEmpty()) {
          // Get all request data in batch
          String[] requestKeys =
              requestIds.stream().map(id -> REQUEST_KEY_PREFIX + id).toArray(String[]::new);

          List<KeyValue<String, String>> requestData = getRedisClient().mget(requestKeys);

          for (int i = 0; i < requestIds.size(); i++) {
            String requestIdStr = requestIds.get(i);
            KeyValue<String, String> keyValue = requestData.get(i);

            if (keyValue != null && keyValue.hasValue()) {
              try {
                RequestId requestId = new RequestId(UUID.fromString(requestIdStr));
                SessionRequest request = JSON.toType(keyValue.getValue(), SessionRequest.class);

                SessionRequestCapability capability =
                    new SessionRequestCapability(requestId, request.getDesiredCapabilities());
                contents.add(capability);
              } catch (Exception e) {
                LOG.log(
                    Level.WARNING,
                    "Failed to parse session request from queue: " + requestIdStr,
                    e);
              }
            }
          }
        }

        attributeMap.put("queue.contents.size", contents.size());
        span.addEvent("Retrieved queue contents", attributeMap);
        return contents;
      } catch (Exception e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(
            AttributeKey.EXCEPTION_MESSAGE.getKey(),
            "Unable to get queue contents: " + e.getMessage());
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        LOG.log(Level.SEVERE, "Failed to get queue contents", e);
      }
    }
    return List.of();
  }

  @Override
  public void close() {
    try {
      getRedisClient().close();
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Failed to close Redis connection for SessionQueue", e);
    }
  }

  @ManagedAttribute(name = "RedisUri")
  public String getRedisUri() {
    return redisUri.toString();
  }

  @ManagedAttribute(name = "QueueSize")
  public long getQueueSize() {
    try {
      return getRedisClient().getConnection().sync().llen(QUEUE_KEY);
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Failed to get queue size", e);
      return -1;
    }
  }

  private void setCommonSpanAttributes(Span span) {
    span.setAttribute("span.kind", Span.Kind.CLIENT.toString());
    span.setAttribute(REDIS_URI, redisUri.toString());
  }

  private void setCommonEventAttributes(AttributeMap attributeMap) {
    attributeMap.put(REDIS_URI, redisUri.toString());
  }
}
