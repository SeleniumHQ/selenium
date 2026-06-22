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

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.concurrent.ExecutorServices.shutdownGracefully;

import java.io.Closeable;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.concurrent.GuardedRunnable;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.data.SessionRequestCapability;
import org.openqa.selenium.grid.data.SlotMatcher;
import org.openqa.selenium.grid.data.TraceSessionRequest;
import org.openqa.selenium.grid.distributor.config.DistributorOptions;
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.jmx.MBean;
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
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.TraceContext;
import org.openqa.selenium.remote.tracing.Tracer;

/**
 * Stateless, horizontally-scalable implementation of {@link NewSessionQueue} backed by Redis.
 *
 * <p>All queue state — request order, request payloads, per-request deadlines and the completion
 * result — lives in Redis. This lets several SessionQueue replicas share a single logical queue:
 * the Distributor (or several Distributor replicas) can poll and complete requests against any
 * replica.
 *
 * <p>The HTTP thread that calls {@link #addToQueue(SessionRequest)} blocks until the request is
 * completed. Because the completing {@code complete()} call may arrive at a <em>different</em>
 * replica than the one holding the blocked thread, completion is signalled two ways: a JVM-local
 * {@link CountDownLatch} fast-path for same-replica completion, and polling of the Redis result key
 * as the cross-replica fallback. Atomic {@code SET NX} on a per-request completion marker ensures a
 * single winner when a timeout races a successful creation.
 *
 * <p>Configure via:
 *
 * <pre>{@code
 * [sessionqueue]
 * implementation = "org.openqa.selenium.grid.sessionqueue.redis.RedisBackedNewSessionQueue"
 * backend-url = "redis://redis-service:6379"
 * }</pre>
 */
@ManagedService(
    objectName = "org.seleniumhq.grid:type=SessionQueue,name=RedisBackedSessionQueue",
    description = "Stateless Redis-backed new session queue")
public class RedisBackedNewSessionQueue extends NewSessionQueue implements Closeable {

  private static final Logger LOG = Logger.getLogger(RedisBackedNewSessionQueue.class.getName());
  private static final String NAME = "Redis New Session Queue";
  private static final Json JSON = new Json();

  // How often the awaiting thread re-checks Redis for a result written by another replica.
  private static final long POLL_INTERVAL_MS = 25;

  private static final String QUEUE_KEY = "grid:sessionqueue:queue";

  private final SlotMatcher slotMatcher;
  private final Duration requestTimeout;
  private final Duration maximumResponseDelay;
  private final int batchSize;
  private final long keyTtlMillis;
  private final GridRedisClient redis;

  // Flipped on close() so the readiness probe reports not-ready while the instance drains.
  private volatile boolean shuttingDown = false;

  // Same-replica fast-path: wakes the blocked addToQueue thread without waiting for a poll tick.
  private final Map<RequestId, CountDownLatch> waiters = new ConcurrentHashMap<>();
  private final Map<RequestId, TraceContext> contexts = new ConcurrentHashMap<>();

  private final ScheduledExecutorService service =
      Executors.newSingleThreadScheduledExecutor(
          r -> {
            Thread thread = new Thread(r);
            thread.setDaemon(true);
            thread.setName(NAME);
            return thread;
          });

  @Nullable private final MBean jmxBean;

  public RedisBackedNewSessionQueue(
      Tracer tracer,
      SlotMatcher slotMatcher,
      Duration requestTimeoutCheck,
      Duration requestTimeout,
      Duration maximumResponseDelay,
      Secret registrationSecret,
      int batchSize,
      URI redisUri) {
    super(tracer, registrationSecret);

    this.slotMatcher = Require.nonNull("Slot matcher", slotMatcher);
    Require.nonNegative("Retry period", requestTimeoutCheck);

    this.requestTimeout = Require.positive("Request timeout", requestTimeout);
    this.maximumResponseDelay = Require.positive("Maximum response delay", maximumResponseDelay);
    this.batchSize = Require.positive("Batch size", batchSize);

    // Keep keys alive comfortably beyond a request's lifetime so a crashed replica's state
    // eventually self-cleans without leaking.
    this.keyTtlMillis = requestTimeout.toMillis() + Duration.ofMinutes(1).toMillis();

    this.redis = new GridRedisClient(Require.nonNull("Redis URI", redisUri));

    service.scheduleAtFixedRate(
        GuardedRunnable.guard(this::timeoutSessions),
        requestTimeoutCheck.toMillis(),
        requestTimeoutCheck.toMillis(),
        MILLISECONDS);

    this.jmxBean = new JMXHelper().register(this);
  }

  public static NewSessionQueue create(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    NewSessionQueueOptions newSessionQueueOptions = new NewSessionQueueOptions(config);
    SecretOptions secretOptions = new SecretOptions(config);
    SlotMatcher slotMatcher = new DistributorOptions(config).getSlotMatcher();

    URI redisUri =
        newSessionQueueOptions
            .getBackendUri()
            .orElseThrow(
                () ->
                    new ConfigException(
                        "RedisBackedNewSessionQueue requires [sessionqueue] backend-url to be"
                            + " set"));

    return new RedisBackedNewSessionQueue(
        tracer,
        slotMatcher,
        newSessionQueueOptions.getSessionRequestTimeoutPeriod(),
        newSessionQueueOptions.getSessionRequestTimeout(),
        newSessionQueueOptions.getMaximumResponseDelay(),
        secretOptions.getRegistrationSecret(),
        newSessionQueueOptions.getBatchSize(),
        redisUri);
  }

  // ---- Key helpers ----------------------------------------------------------------

  private static String requestKey(RequestId id) {
    return "grid:sessionqueue:request:" + id;
  }

  private static String endTimeKey(RequestId id) {
    return "grid:sessionqueue:endtime:" + id;
  }

  private static String canceledKey(RequestId id) {
    return "grid:sessionqueue:canceled:" + id;
  }

  private static String completedKey(RequestId id) {
    return "grid:sessionqueue:completed:" + id;
  }

  private static String resultStatusKey(RequestId id) {
    return "grid:sessionqueue:result:" + id + ":status";
  }

  private static String resultPayloadKey(RequestId id) {
    return "grid:sessionqueue:result:" + id + ":payload";
  }

  // ---- NewSessionQueue implementation ----------------------------------------------

  @Override
  public boolean peekEmpty() {
    return redis.llen(QUEUE_KEY) == 0;
  }

  @Override
  public HttpResponse addToQueue(SessionRequest request) {
    Require.nonNull("New session request", request);
    Require.nonNull("Request id", request.getRequestId());

    RequestId reqId = request.getRequestId();
    TraceContext context = TraceSessionRequest.extract(tracer, request);
    try (Span ignored = context.createSpan("sessionqueue.add_to_queue")) {
      contexts.put(reqId, context);

      Instant endTime = request.getEnqueued().plus(requestTimeout);
      CountDownLatch latch = new CountDownLatch(1);
      // Register the latch before the request becomes claimable so a completion can never be
      // missed.
      waiters.put(reqId, latch);

      Either<SessionNotCreatedException, CreateSessionResponse> result;
      try {
        redis.setWithTtl(endTimeKey(reqId), String.valueOf(endTime.toEpochMilli()), keyTtlMillis);
        redis.setWithTtl(requestKey(reqId), JSON.toJson(request), keyTtlMillis);
        redis.rpush(QUEUE_KEY, reqId.toString());

        if (isTimedOut(Instant.now(), endTime)) {
          failDueToTimeout(reqId);
        }

        result = awaitResult(reqId, latch, endTime);
      } catch (RuntimeException e) {
        // A failure while enqueuing or awaiting (e.g. a Redis connection reset) must not leak
        // tracking state; report it to the caller as a failed session creation.
        result =
            Either.left(
                new SessionNotCreatedException("Unable to enqueue the new session request", e));
      } finally {
        // Guarantee in-memory tracking is removed on every terminal path, including partial
        // failures while enqueuing. Redis cleanup is best-effort and self-guarded so it can never
        // mask the result returned to the caller.
        waiters.remove(reqId);
        contexts.remove(reqId);
        safelyClearRedisState(reqId);
      }

      HttpResponse res = new HttpResponse();
      if (result.isRight()) {
        res.setContent(Contents.bytes(result.right().getDownstreamEncodedResponse()));
      } else {
        res.setStatus(HTTP_INTERNAL_ERROR)
            .setContent(
                Contents.asJson(
                    Map.of(
                        "value",
                        Map.of(
                            "error", "session not created",
                            "message", result.left().getMessage(),
                            "stacktrace", result.left().getStackTrace()))));
      }

      return res;
    }
  }

  private Either<SessionNotCreatedException, CreateSessionResponse> awaitResult(
      RequestId reqId, CountDownLatch latch, Instant endTime) {
    try {
      while (true) {
        Either<SessionNotCreatedException, CreateSessionResponse> stored = readResult(reqId);
        if (stored != null) {
          return stored;
        }

        long remaining = Duration.between(Instant.now(), endTime).toMillis();
        if (remaining <= 0) {
          // Record a timeout completion (the winner-takes-all marker guards against a concurrent
          // success), then return whatever result ends up stored.
          failDueToTimeout(reqId);
          Either<SessionNotCreatedException, CreateSessionResponse> afterTimeout =
              readResult(reqId);
          return afterTimeout != null
              ? afterTimeout
              : Either.left(new SessionNotCreatedException("New session request timed out"));
        }

        // A countdown means a same-replica complete() fired, so read the freshly written result
        // immediately. Otherwise we loop and poll Redis for a result a different replica may have
        // written.
        if (latch.await(Math.min(remaining, POLL_INTERVAL_MS), MILLISECONDS)) {
          Either<SessionNotCreatedException, CreateSessionResponse> signalled = readResult(reqId);
          if (signalled != null) {
            return signalled;
          }
        }
      }
    } catch (InterruptedException e) {
      // the client will never see the session, ensure the session is disposed
      markCanceled(reqId);
      Thread.currentThread().interrupt();
      return Either.left(
          new SessionNotCreatedException("Interrupted when creating the session", e));
    } catch (RuntimeException e) {
      // the client will never see the session, ensure the session is disposed
      markCanceled(reqId);
      return Either.left(
          new SessionNotCreatedException("An error occurred creating the session", e));
    }
  }

  @Nullable
  private Either<SessionNotCreatedException, CreateSessionResponse> readResult(RequestId reqId) {
    String status = redis.get(resultStatusKey(reqId));
    if (status == null) {
      return null;
    }
    String payload = redis.get(resultPayloadKey(reqId));
    if ("OK".equals(status)) {
      return Either.right(JSON.toType(payload, CreateSessionResponse.class));
    }
    return Either.left(
        new SessionNotCreatedException(payload == null ? "Session not created" : payload));
  }

  @Override
  public boolean retryAddToQueue(SessionRequest request) {
    Require.nonNull("New session request", request);

    RequestId reqId = request.getRequestId();
    TraceContext context = contexts.getOrDefault(reqId, tracer.getCurrentContext());
    try (Span ignored = context.createSpan("sessionqueue.retry")) {
      String endTimeRaw = redis.get(endTimeKey(reqId));
      if (endTimeRaw == null) {
        return false;
      }

      Instant endTime = Instant.ofEpochMilli(Long.parseLong(endTimeRaw));
      if (isTimedOut(Instant.now(), endTime)) {
        // as we try to re-add a session request that has already expired, force session timeout
        failDueToTimeout(reqId);
        // return true to avoid handleNewSessionRequest to call 'complete' an other time
        return true;
      } else if (redis.get(canceledKey(reqId)) != null) {
        failDueToCanceled(reqId);
        // return true to avoid handleNewSessionRequest to call 'complete' an other time
        return true;
      }

      if (queueContains(reqId)) {
        // No need to re-add this
        return true;
      }

      redis.lpush(QUEUE_KEY, reqId.toString());
      return true;
    }
  }

  @Override
  public Optional<SessionRequest> remove(RequestId reqId) {
    Require.nonNull("Request ID", reqId);

    String raw = redis.get(requestKey(reqId));
    long removed = redis.lrem(QUEUE_KEY, reqId.toString());
    if (removed > 0 && raw != null) {
      return Optional.of(JSON.toType(raw, SessionRequest.class));
    }
    return Optional.empty();
  }

  @Override
  public List<SessionRequest> getNextAvailable(Map<Capabilities, Long> stereotypes) {
    Require.nonNull("Stereotypes", stereotypes);

    // use nano time to avoid issues with a jumping clock e.g. on WSL2 or due to time-sync
    long started = System.nanoTime();
    // delay the response to avoid heavy polling via http
    while (maximumResponseDelay.toNanos() > System.nanoTime() - started) {
      if (!peekEmpty()) {
        break;
      }
      try {
        Thread.sleep(10);
      } catch (InterruptedException ex) {
        Thread.currentThread().interrupt();
        break;
      }
    }

    Predicate<Capabilities> matchesStereotype =
        caps ->
            stereotypes.entrySet().stream()
                .filter(entry -> entry.getValue() > 0)
                .anyMatch(
                    entry -> {
                      boolean matches = slotMatcher.matches(entry.getKey(), caps);
                      if (matches) {
                        Long value = entry.getValue();
                        entry.setValue(value - 1);
                      }
                      return matches;
                    });

    List<SessionRequest> availableRequests = new ArrayList<>();
    for (String idStr : redis.lrange(QUEUE_KEY, 0, -1)) {
      if (availableRequests.size() >= batchSize) {
        break;
      }

      RequestId reqId = new RequestId(UUID.fromString(idStr));
      String raw = redis.get(requestKey(reqId));
      if (raw == null) {
        // Request payload expired or was completed elsewhere — drop the stale id.
        redis.lrem(QUEUE_KEY, idStr);
        continue;
      }

      SessionRequest req = JSON.toType(raw, SessionRequest.class);
      if (req.getDesiredCapabilities().stream().anyMatch(matchesStereotype)) {
        // Atomically claim the request: only the caller that removes it from the list owns it.
        if (redis.lrem(QUEUE_KEY, idStr) == 0) {
          continue;
        }
        if (redis.get(canceledKey(reqId)) != null) {
          failDueToCanceled(reqId);
          continue;
        }
        availableRequests.add(req);
      }
    }

    return availableRequests;
  }

  /** Returns true if the session is still valid (not timed out and not canceled) */
  @Override
  public boolean complete(
      RequestId reqId, Either<SessionNotCreatedException, CreateSessionResponse> result) {
    Require.nonNull("New session request", reqId);
    Require.nonNull("Result", result);

    TraceContext context = contexts.getOrDefault(reqId, tracer.getCurrentContext());
    try (Span ignored = context.createSpan("sessionqueue.completed")) {
      boolean tracked = redis.get(endTimeKey(reqId)) != null;

      // Winner-takes-all: the first completion wins. A success that loses to a prior timeout
      // returns false, signalling the Distributor to tear the just-created session down.
      boolean won = redis.setIfAbsent(completedKey(reqId), "1", keyTtlMillis);
      if (!won) {
        return false;
      }

      boolean canceled = redis.get(canceledKey(reqId)) != null;

      // Publish the result so an awaiting thread on any replica can pick it up. Write the payload
      // before the status so a reader that observes the status always finds the payload present.
      writeResult(reqId, result);

      CountDownLatch latch = waiters.get(reqId);
      if (latch != null) {
        latch.countDown();
      }

      redis.lrem(QUEUE_KEY, reqId.toString());
      clearTracking(reqId);
      contexts.remove(reqId);

      return tracked && !canceled;
    }
  }

  private void writeResult(
      RequestId reqId, Either<SessionNotCreatedException, CreateSessionResponse> result) {
    if (result.isRight()) {
      redis.setWithTtl(resultPayloadKey(reqId), JSON.toJson(result.right()), keyTtlMillis);
      redis.setWithTtl(resultStatusKey(reqId), "OK", keyTtlMillis);
    } else {
      String message = result.left().getMessage();
      redis.setWithTtl(resultPayloadKey(reqId), message == null ? "" : message, keyTtlMillis);
      redis.setWithTtl(resultStatusKey(reqId), "ERR", keyTtlMillis);
    }
  }

  @Override
  public int clearQueue() {
    List<String> ids = redis.lrange(QUEUE_KEY, 0, -1);
    int size = ids.size();
    for (String idStr : ids) {
      RequestId reqId = new RequestId(UUID.fromString(idStr));
      complete(reqId, Either.left(new SessionNotCreatedException("Request queue was cleared")));
    }
    redis.del(QUEUE_KEY);
    return size;
  }

  @Override
  public List<SessionRequestCapability> getQueueContents() {
    List<SessionRequestCapability> contents = new ArrayList<>();
    for (String idStr : redis.lrange(QUEUE_KEY, 0, -1)) {
      String raw = redis.get(requestKey(new RequestId(UUID.fromString(idStr))));
      if (raw == null) {
        continue;
      }
      SessionRequest req = JSON.toType(raw, SessionRequest.class);
      contents.add(new SessionRequestCapability(req.getRequestId(), req.getDesiredCapabilities()));
    }
    return contents;
  }

  @ManagedAttribute(name = "NewSessionQueueSize")
  public int getQueueSize() {
    return (int) redis.llen(QUEUE_KEY);
  }

  @Override
  public boolean isReady() {
    // Report not-ready as soon as a shutdown begins so a load balancer / Kubernetes Service
    // drains this instance before its Redis connection is torn down.
    if (shuttingDown) {
      return false;
    }
    try {
      return redis.isOpen();
    } catch (RuntimeException e) {
      return false;
    }
  }

  @Override
  public void close() {
    shuttingDown = true;

    shutdownGracefully(NAME, service);

    if (jmxBean != null) {
      new JMXHelper().unregister(jmxBean.getObjectName());
    }

    redis.close();
  }

  // ---- Helpers --------------------------------------------------------------------

  private void timeoutSessions() {
    Instant now = Instant.now();
    for (String idStr : redis.lrange(QUEUE_KEY, 0, -1)) {
      RequestId reqId = new RequestId(UUID.fromString(idStr));
      String endRaw = redis.get(endTimeKey(reqId));
      if (endRaw == null) {
        continue;
      }
      if (isTimedOut(now, Instant.ofEpochMilli(Long.parseLong(endRaw)))) {
        failDueToTimeout(reqId);
      }
    }
  }

  private boolean isTimedOut(Instant now, Instant endTime) {
    return endTime.isBefore(now);
  }

  private boolean queueContains(RequestId reqId) {
    return redis.lrange(QUEUE_KEY, 0, -1).contains(reqId.toString());
  }

  private void markCanceled(RequestId reqId) {
    redis.setWithTtl(canceledKey(reqId), "1", keyTtlMillis);
  }

  private void failDueToTimeout(RequestId reqId) {
    complete(reqId, Either.left(new SessionNotCreatedException("Timed out creating session")));
  }

  private void failDueToCanceled(RequestId reqId) {
    // this error should never reach the client, as this is a client initiated state
    complete(reqId, Either.left(new SessionNotCreatedException("Client has gone away")));
  }

  /** Removes the request from the retryable/pollable state. Leaves the result for the consumer. */
  private void clearTracking(RequestId reqId) {
    redis.del(endTimeKey(reqId), requestKey(reqId), canceledKey(reqId));
  }

  /**
   * Best-effort removal of the queue entry and the request's tracking keys. The completion marker
   * ({@code completedKey}) and stored result keys are deliberately left to expire by their TTL:
   * they are the SET-NX winner-takes-all guard that keeps {@link #complete} idempotent across late
   * or duplicate completions from other replicas, so deleting them here would re-open the request
   * for a second completion. Any failure is swallowed so it cannot mask the result being returned
   * to the caller; orphaned keys are bounded by their TTL.
   */
  private void safelyClearRedisState(RequestId reqId) {
    try {
      redis.lrem(QUEUE_KEY, reqId.toString());
      clearTracking(reqId);
    } catch (RuntimeException e) {
      LOG.log(
          Level.FINE,
          e,
          () ->
              "Failed to clean up Redis state for request " + reqId + "; keys will expire by TTL");
    }
  }
}
