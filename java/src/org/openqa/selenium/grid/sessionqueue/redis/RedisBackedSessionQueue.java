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

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import java.io.Closeable;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.concurrent.GuardedRunnable;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.data.SessionRequestCapability;
import org.openqa.selenium.grid.data.SlotMatcher;
import org.openqa.selenium.grid.data.TraceSessionRequest;
import org.openqa.selenium.grid.distributor.config.DistributorOptions;
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
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.TraceContext;
import org.openqa.selenium.remote.tracing.Tracer;

/**
 * A Redis-backed implementation of the list of new session requests.
 *
 * <p>The lifecycle of a request can be described as:
 *
 * <ol>
 *   <li>User adds an item on to the queue using {@link #addToQueue(SessionRequest)}. This will
 *       block until the request completes in some way.
 *   <li>If the session request is completed, then {@link #complete(RequestId, Either)} must be
 *       called. This will ensure that {@link #addToQueue(SessionRequest)} returns.
 *   <li>If the request cannot be handled right now, call {@link #retryAddToQueue(SessionRequest)}
 *       to return the session request to the front of the queue.
 * </ol>
 *
 * <p>There is a background thread that will reap {@link SessionRequest}s that have timed out. This
 * means that a request can either complete by a listener calling {@link #complete(RequestId,
 * Either)} directly, or by being reaped by the thread.
 *
 * <p>Redis persistence ensures that session requests survive restarts and can be processed by
 * multiple Grid instances.
 */
@ManagedService(
    objectName = "org.seleniumhq.grid:type=SessionQueue,name=RedisBackedSessionQueue",
    description = "Redis backed session queue")
public class RedisBackedSessionQueue extends NewSessionQueue implements Closeable {

  private static final Logger LOG = Logger.getLogger(RedisBackedSessionQueue.class.getName());
  private static final String NAME = "Redis Backed New Session Queue";
  private static final Json JSON = new Json();

  // Redis keys
  private static final String QUEUE_KEY = "selenium:session:queue";
  private static final String REQUEST_KEY_PREFIX = "selenium:session:request:";
  private static final String DATA_KEY_PREFIX = "selenium:session:data:";
  private static final String CONTEXT_KEY_PREFIX = "selenium:session:context:";

  private final SlotMatcher slotMatcher;
  private final GridRedisClient redisClient;
  private final URI sessionQueueUri;
  private final Duration requestTimeout;
  private final Duration maximumResponseDelay;
  private final int batchSize;

  // In-memory state management (mirrors LocalNewSessionQueue)
  private final Map<RequestId, Data> requests;
  private final Map<RequestId, TraceContext> contexts;
  private final Deque<SessionRequest> queue;
  private final ReadWriteLock lock = new ReentrantReadWriteLock();

  private final ScheduledExecutorService service =
      Executors.newSingleThreadScheduledExecutor(
          r -> {
            Thread thread = new Thread(r);
            thread.setDaemon(true);
            thread.setName(NAME);
            return thread;
          });

  public RedisBackedSessionQueue(
      Tracer tracer,
      SlotMatcher slotMatcher,
      URI sessionQueueUri,
      Duration requestTimeoutCheck,
      Duration requestTimeout,
      Duration maximumResponseDelay,
      Secret registrationSecret,
      int batchSize) {
    super(tracer, registrationSecret);

    this.slotMatcher = Require.nonNull("Slot matcher", slotMatcher);
    this.sessionQueueUri = Require.nonNull("Redis URI", sessionQueueUri);
    this.redisClient = new GridRedisClient(sessionQueueUri);

    Require.nonNegative("Retry period", requestTimeoutCheck);
    this.requestTimeout = Require.positive("Request timeout", requestTimeout);
    this.maximumResponseDelay = Require.positive("Maximum response delay", maximumResponseDelay);
    this.batchSize = Require.positive("Batch size", batchSize);

    this.requests = new ConcurrentHashMap<>();
    this.queue = new ConcurrentLinkedDeque<>();
    this.contexts = new ConcurrentHashMap<>();

    // Restore state from Redis on startup
    restoreStateFromRedis();

    service.scheduleAtFixedRate(
        GuardedRunnable.guard(this::timeoutSessions),
        requestTimeoutCheck.toMillis(),
        requestTimeoutCheck.toMillis(),
        MILLISECONDS);

    new JMXHelper().register(this);
  }

  public static NewSessionQueue create(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    NewSessionQueueOptions newSessionQueueOptions = new NewSessionQueueOptions(config);
    SecretOptions secretOptions = new SecretOptions(config);

    // Use the factory to create a SlotMatcher to avoid circular dependencies
    SlotMatcher slotMatcher = new DistributorOptions(config).getSlotMatcher();

    return new RedisBackedSessionQueue(
        tracer,
        slotMatcher,
        newSessionQueueOptions.getSessionQueueUri(),
        newSessionQueueOptions.getSessionRequestTimeoutPeriod(),
        newSessionQueueOptions.getSessionRequestTimeout(),
        newSessionQueueOptions.getMaximumResponseDelay(),
        secretOptions.getRegistrationSecret(),
        newSessionQueueOptions.getBatchSize());
  }

  /** Restores in-memory state from Redis on startup */
  private void restoreStateFromRedis() {
    try {
      String queueData = redisClient.get(QUEUE_KEY);
      LOG.info(
          "[RedisBackedSessionQueue.restoreStateFromRedis] Raw queue data from Redis: ["
              + queueData
              + "]");
      if (queueData != null && !queueData.isEmpty()) {
        String[] requestIdArray = queueData.split(",");
        for (String requestIdStr : requestIdArray) {
          if (requestIdStr.trim().isEmpty()) continue;
          try {
            RequestId requestId = new RequestId(java.util.UUID.fromString(requestIdStr.trim()));
            String requestKey = REQUEST_KEY_PREFIX + requestIdStr.trim();
            String dataKey = DATA_KEY_PREFIX + requestIdStr.trim();
            String requestJson = redisClient.get(requestKey);
            String dataJson = redisClient.get(dataKey);
            LOG.info(
                "[restoreStateFromRedis] Read from Redis: requestKey="
                    + requestKey
                    + ", requestJson="
                    + requestJson);
            LOG.info(
                "[restoreStateFromRedis] Read from Redis: dataKey="
                    + dataKey
                    + ", dataJson="
                    + dataJson);
            if (requestJson != null && dataJson != null) {
              SessionRequest request = JSON.toType(requestJson, SessionRequest.class);
              Data data = JSON.toType(dataJson, Data.class); // Deserialize full Data object
              requests.put(requestId, data);
              queue.add(request);
              if (isTimedOut(Instant.now(), data)) {
                failDueToTimeout(requestId);
              }
            }
          } catch (Exception e) {
            LOG.log(Level.WARNING, "Failed to restore request from Redis: " + requestIdStr, e);
            cleanupRedisRequest(requestIdStr.trim());
          }
        }
      }
      LOG.info("Restored " + requests.size() + " session requests from Redis");
    } catch (Exception e) {
      LOG.log(Level.SEVERE, "Failed to restore state from Redis", e);
    }
  }

  /** Persists request state to Redis asynchronously */
  private void persistToRedis(SessionRequest request, Data data) {
    String requestKey = REQUEST_KEY_PREFIX + request.getRequestId();
    String dataKey = DATA_KEY_PREFIX + request.getRequestId();
    String requestJson = JSON.toJson(request);
    String dataJson = JSON.toJson(data);

    // Log what we're about to write
    LOG.info(
        "[persistToRedis] Writing to Redis: requestKey="
            + requestKey
            + ", requestJson="
            + requestJson);
    LOG.info("[persistToRedis] Writing to Redis: dataKey=" + dataKey + ", dataJson=" + dataJson);

    // Use mset to write both keys at once
    Map<String, String> keyValues = new HashMap<>();
    keyValues.put(requestKey, requestJson);
    keyValues.put(dataKey, dataJson);
    redisClient.mset(keyValues);

    // Update the queue key
    StringBuilder queueBuilder = new StringBuilder();
    for (SessionRequest req : queue) {
      queueBuilder.append(req.getRequestId().toString()).append(",");
    }
    String queueString =
        queueBuilder.length() > 0 ? queueBuilder.substring(0, queueBuilder.length() - 1) : "";

    LOG.info(
        "[persistToRedis] Writing to Redis: QUEUE_KEY="
            + QUEUE_KEY
            + ", queueString="
            + queueString);

    // Update queue using mset
    Map<String, String> queueUpdate = new HashMap<>();
    queueUpdate.put(QUEUE_KEY, queueString);
    redisClient.mset(queueUpdate);
  }

  /** Removes request from Redis asynchronously */
  private void removeFromRedis(RequestId requestId) {
    service.execute(
        () -> {
          try {
            String requestIdStr = requestId.toString();
            cleanupRedisRequest(requestIdStr);
          } catch (Exception e) {
            LOG.log(Level.WARNING, "Failed to remove request from Redis: " + requestId, e);
          }
        });
  }

  private void cleanupRedisRequest(String requestIdStr) {
    try {
      String requestKey = REQUEST_KEY_PREFIX + requestIdStr;
      String dataKey = DATA_KEY_PREFIX + requestIdStr;
      String contextKey = CONTEXT_KEY_PREFIX + requestIdStr;

      // Remove all associated data
      redisClient.del(requestKey, dataKey, contextKey);

      // Remove from queue list
      String currentQueue = redisClient.get(QUEUE_KEY);
      if (currentQueue != null && !currentQueue.isEmpty()) {
        String[] requestIds = currentQueue.split(",");
        StringBuilder newQueue = new StringBuilder();
        for (String id : requestIds) {
          if (!id.trim().equals(requestIdStr)) {
            if (newQueue.length() > 0) {
              newQueue.append(",");
            }
            newQueue.append(id.trim());
          }
        }
        Map<String, String> queueUpdate = new HashMap<>();
        queueUpdate.put(QUEUE_KEY, newQueue.toString());
        redisClient.mset(queueUpdate);
        int queueCount = newQueue.toString().isEmpty() ? 0 : newQueue.toString().split(",").length;
        LOG.info(
            "[RedisBackedSessionQueue.cleanupRedisRequest] Queue after removal: ["
                + newQueue
                + "] ("
                + queueCount
                + " requests)");
      }
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Failed to cleanup Redis request: " + requestIdStr, e);
    }
  }

  private void timeoutSessions() {
    Instant now = Instant.now();

    Lock readLock = lock.readLock();
    readLock.lock();
    Set<RequestId> ids;
    try {
      ids =
          requests.entrySet().stream()
              .filter(
                  entry ->
                      queue.stream()
                          .anyMatch(
                              sessionRequest ->
                                  sessionRequest.getRequestId().equals(entry.getKey())))
              .filter(entry -> isTimedOut(now, entry.getValue()))
              .map(Map.Entry::getKey)
              .collect(HashSet::new, Set::add, Set::addAll);
    } finally {
      readLock.unlock();
    }
    ids.forEach(this::failDueToTimeout);
  }

  private boolean isTimedOut(Instant now, Data data) {
    return data.endTime.isBefore(now);
  }

  @Override
  public boolean peekEmpty() {
    Lock readLock = lock.readLock();
    readLock.lock();
    try {
      return requests.isEmpty() && queue.isEmpty();
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public HttpResponse addToQueue(SessionRequest request) {
    Require.nonNull("New session request", request);
    Require.nonNull("Request id", request.getRequestId());

    TraceContext context = TraceSessionRequest.extract(tracer, request);
    try (Span ignored = context.createSpan("sessionqueue.add_to_queue")) {
      contexts.put(request.getRequestId(), context);
      Data data = injectIntoQueue(request);

      if (isTimedOut(Instant.now(), data)) {
        failDueToTimeout(request.getRequestId());
      }

      Either<SessionNotCreatedException, CreateSessionResponse> result;
      try {

        boolean sessionCreated = data.latch.await(requestTimeout.toMillis(), MILLISECONDS);

        if (sessionCreated) {
          result = data.getResult();
        } else {
          result = Either.left(new SessionNotCreatedException("New session request timed out"));
        }
      } catch (InterruptedException e) {
        // the client will never see the session, ensure the session is disposed
        data.cancel();
        Thread.currentThread().interrupt();
        result =
            Either.left(new SessionNotCreatedException("Interrupted when creating the session", e));
      } catch (RuntimeException e) {
        // the client will never see the session, ensure the session is disposed
        data.cancel();
        result =
            Either.left(
                new SessionNotCreatedException("An error occurred creating the session", e));
      }

      Lock writeLock = this.lock.writeLock();
      if (!writeLock.tryLock()) {
        writeLock.lock();
      }
      try {
        requests.remove(request.getRequestId());
        queue.remove(request);
        contexts.remove(request.getRequestId());
      } finally {
        writeLock.unlock();
      }

      // Clean up from Redis
      removeFromRedis(request.getRequestId());

      HttpResponse res = new HttpResponse();
      if (result.isRight()) {
        res.setContent(Contents.bytes(result.right().getDownstreamEncodedResponse()));
      } else {
        res.setStatus(HTTP_INTERNAL_ERROR)
            .setContent(
                Contents.asJson(
                    ImmutableMap.of(
                        "value",
                        ImmutableMap.of(
                            "error", "session not created",
                            "message", result.left().getMessage(),
                            "stacktrace", result.left().getStackTrace()))));
      }

      return res;
    }
  }

  @VisibleForTesting
  Data injectIntoQueue(SessionRequest request) {
    Require.nonNull("Session request", request);

    Data data = new Data(request.getEnqueued(), requestTimeout);

    Lock writeLock = lock.writeLock();
    if (!writeLock.tryLock()) {
      writeLock.lock();
    }
    try {
      requests.put(request.getRequestId(), data);
      queue.addLast(request);
    } finally {
      writeLock.unlock();
    }

    // Persist to Redis asynchronously
    persistToRedis(request, data);

    return data;
  }

  @Override
  public boolean retryAddToQueue(SessionRequest request) {
    Require.nonNull("New session request", request);

    boolean added;
    TraceContext context =
        contexts.getOrDefault(request.getRequestId(), tracer.getCurrentContext());
    try (Span ignored = context.createSpan("sessionqueue.retry")) {
      Lock writeLock = lock.writeLock();
      if (!writeLock.tryLock()) {
        writeLock.lock();
      }
      try {
        if (!requests.containsKey(request.getRequestId())) {
          return false;
        }
        Data data = requests.get(request.getRequestId());
        if (isTimedOut(Instant.now(), data)) {
          // as we try to re-add a session request that has already expired, force session timeout
          failDueToTimeout(request.getRequestId());
          // return true to avoid handleNewSessionRequest to call 'complete' an other time
          return true;
        } else if (data.isCanceled()) {
          failDueToCanceled(request.getRequestId());
          // return true to avoid handleNewSessionRequest to call 'complete' an other time
          return true;
        }

        if (queue.contains(request)) {
          // No need to re-add this
          return true;
        } else {
          added = queue.offerFirst(request);
        }
      } finally {
        writeLock.unlock();
      }

      return added;
    }
  }

  @Override
  public Optional<SessionRequest> remove(RequestId reqId) {
    Require.nonNull("Request ID", reqId);

    Lock writeLock = lock.writeLock();
    if (!writeLock.tryLock()) {
      writeLock.lock();
    }
    try {
      Iterator<SessionRequest> iterator = queue.iterator();
      while (iterator.hasNext()) {
        SessionRequest req = iterator.next();
        if (reqId.equals(req.getRequestId())) {
          iterator.remove();
          // Remove from Redis
          removeFromRedis(reqId);
          return Optional.of(req);
        }
      }
      return Optional.empty();
    } finally {
      writeLock.unlock();
    }
  }

  private volatile long lastNonEmptyQueueTime = System.currentTimeMillis();
  private volatile boolean wasEmpty = false;
  private static final long MAX_BACKOFF_MS = 1000; // Maximum 1 second backoff
  private static final long MIN_BACKOFF_MS = 10; // Minimum 10ms backoff

  @Override
  public List<SessionRequest> getNextAvailable(Map<Capabilities, Long> stereotypes) {
    Require.nonNull("Stereotypes", stereotypes);

    // Convert maximumResponseDelay to milliseconds for easier comparison
    long maxDelayMs = maximumResponseDelay.toMillis();
    long startTime = System.currentTimeMillis();
    long backoffMs = MIN_BACKOFF_MS;

    // delay the response to avoid heavy polling via http
    while (maxDelayMs > System.currentTimeMillis() - startTime) {
      boolean isEmpty = true;

      // Check queue status with read lock
      Lock readLock = lock.readLock();
      readLock.lock();
      try {
        isEmpty = queue.isEmpty();
        if (!isEmpty) {
          lastNonEmptyQueueTime = System.currentTimeMillis();
          wasEmpty = false;
          break; // Exit loop if we found requests to process
        }
      } finally {
        readLock.unlock();
      }

      // If queue is empty, use backoff with jitter
      if (isEmpty) {
        long timeSinceLastNonEmpty = System.currentTimeMillis() - lastNonEmptyQueueTime;

        // If queue has been empty for a while, increase backoff
        if (wasEmpty && timeSinceLastNonEmpty > 100) {
          backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
        } else {
          backoffMs = MIN_BACKOFF_MS;
        }

        // Don't sleep longer than the remaining delay time
        long remainingDelay = maxDelayMs - (System.currentTimeMillis() - startTime);
        if (remainingDelay <= 0) {
          break;
        }

        long sleepTime = Math.min(backoffMs, remainingDelay);
        if (sleepTime <= 0) {
          break;
        }

        // Add jitter to prevent thundering herd (up to 10% of sleep time)
        long jitter = (long) (Math.random() * sleepTime * 0.1);
        wasEmpty = true;

        try {
          Thread.sleep(sleepTime + jitter);
        } catch (InterruptedException ex) {
          Thread.currentThread().interrupt();
          break;
        }
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

    Lock writeLock = lock.writeLock();
    if (!writeLock.tryLock()) {
      writeLock.lock();
    }
    try {
      List<SessionRequest> availableRequests =
          queue.stream()
              .filter(req -> req.getDesiredCapabilities().stream().anyMatch(matchesStereotype))
              .limit(batchSize)
              .collect(Collectors.toList());

      availableRequests.removeIf(
          (req) -> {
            Data data = this.requests.get(req.getRequestId());

            if (data.isCanceled()) {
              failDueToCanceled(req.getRequestId());
              return true;
            }

            this.remove(req.getRequestId());
            return false;
          });

      return availableRequests;
    } finally {
      writeLock.unlock();
    }
  }

  /** Returns true if the session is still valid (not timed out and not canceled) */
  @Override
  public boolean complete(
      RequestId reqId, Either<SessionNotCreatedException, CreateSessionResponse> result) {
    Require.nonNull("New session request", reqId);
    Require.nonNull("Result", result);
    TraceContext context = contexts.getOrDefault(reqId, tracer.getCurrentContext());
    try (Span ignored = context.createSpan("sessionqueue.completed")) {
      Data data;
      Lock writeLock = lock.writeLock();
      if (!writeLock.tryLock()) {
        writeLock.lock();
      }
      try {
        data = requests.remove(reqId);
        queue.removeIf(req -> reqId.equals(req.getRequestId()));
        contexts.remove(reqId);
      } finally {
        writeLock.unlock();
      }

      if (data == null) {
        return false;
      }

      return data.setResult(result);
    }
  }

  @Override
  public int clearQueue() {
    Lock writeLock = lock.writeLock();
    if (!writeLock.tryLock()) {
      writeLock.lock();
    }

    try {
      int size = queue.size();
      queue.clear();
      requests.forEach(
          (reqId, data) ->
              data.setResult(
                  Either.left(new SessionNotCreatedException("Request queue was cleared"))));
      requests.clear();
      // Do not clear contexts for strict alignment
      // Clear Redis asynchronously
      service.execute(
          () -> {
            try {
              redisClient.del(QUEUE_KEY);
            } catch (Exception e) {
              LOG.log(Level.WARNING, "Failed to clear Redis queue", e);
            }
          });

      return size;
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public List<SessionRequestCapability> getQueueContents() {
    Lock readLock = lock.readLock();
    readLock.lock();

    try {
      return queue.stream()
          .map(
              req -> new SessionRequestCapability(req.getRequestId(), req.getDesiredCapabilities()))
          .collect(Collectors.toList());
    } finally {
      readLock.unlock();
    }
  }

  @ManagedAttribute(name = "NewSessionQueueSize")
  public int getQueueSize() {
    return queue.size();
  }

  @ManagedAttribute(name = "SessionQueueUri")
  public String getSessionQueueUri() {
    return sessionQueueUri.toString();
  }

  @Override
  public boolean isReady() {
    try {
      return redisClient.isOpen();
    } catch (Exception e) {
      return false;
    }
  }

  @Override
  public void close() {
    shutdownGracefully(NAME, service);
    try {
      redisClient.close();
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Failed to close Redis connection", e);
    }
  }

  private void failDueToTimeout(RequestId reqId) {
    complete(reqId, Either.left(new SessionNotCreatedException("Timed out creating session")));
  }

  private void failDueToCanceled(RequestId reqId) {
    // this error should never reach the client, as this is a client initiated state
    complete(reqId, Either.left(new SessionNotCreatedException("Client has gone away")));
  }

  private static class Data {
    public Instant endTime;
    private final CountDownLatch latch = new CountDownLatch(1);
    private Either<SessionNotCreatedException, CreateSessionResponse> result;
    private boolean complete;
    private boolean canceled;

    // No-arg constructor for JSON deserialization
    public Data() {
      this.endTime = Instant.now();
      this.complete = false;
      this.canceled = false;
      this.result = Either.left(new SessionNotCreatedException("Session not created"));
    }

    public Data(Instant enqueued, Duration requestTimeout) {
      this.endTime = Instant.now().plus(requestTimeout);
      this.result = Either.left(new SessionNotCreatedException("Session not created"));
    }

    // Constructor for JSON deserialization
    public Data(Instant endTime, boolean complete, boolean canceled) {
      this.endTime = endTime;
      this.complete = complete;
      this.canceled = canceled;
      this.result = Either.left(new SessionNotCreatedException("Session not created"));
    }

    // Add a constructor for full deserialization
    public Data(
        Instant endTime,
        boolean complete,
        boolean canceled,
        Either<SessionNotCreatedException, CreateSessionResponse> result) {
      this.endTime = endTime;
      this.complete = complete;
      this.canceled = canceled;
      this.result = result;
    }

    public synchronized Either<SessionNotCreatedException, CreateSessionResponse> getResult() {
      return result;
    }

    public synchronized void cancel() {
      canceled = true;
    }

    public synchronized boolean isCanceled() {
      return canceled;
    }

    public synchronized boolean setResult(
        Either<SessionNotCreatedException, CreateSessionResponse> result) {
      if (complete || canceled) {
        return false;
      }
      this.result = result;
      complete = true;
      latch.countDown();
      return true;
    }

    // Remove static from fromJson method and make it an instance method
    public Data fromJson(
        Instant endTime, boolean complete, boolean canceled, Map<String, Object> resultMap) {
      Either<SessionNotCreatedException, CreateSessionResponse> result;
      if (resultMap.containsKey("right")) {
        CreateSessionResponse resp = (CreateSessionResponse) resultMap.get("right");
        result = Either.right(resp);
      } else {
        SessionNotCreatedException ex = (SessionNotCreatedException) resultMap.get("left");
        result = Either.left(ex);
      }
      return new Data(endTime, complete, canceled, result);
    }

    // Setters for JSON deserialization
    public void setEndTime(Instant endTime) {
      this.endTime = endTime;
    }

    public void setComplete(boolean complete) {
      this.complete = complete;
    }

    public void setCanceled(boolean canceled) {
      this.canceled = canceled;
    }
  }
}
