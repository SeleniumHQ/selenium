package org.openqa.selenium.grid.sessionqueue.local;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

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
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.TraceContext;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.Closeable;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
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
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.concurrent.ExecutorServices.shutdownGracefully;

/**
 * An in-memory implementation of the list of new session requests.
 * <p>
 * The lifecycle of a request can be described as:
 * <ol>
 *   <li>User adds an item on to the queue using {@link #addToQueue(SessionRequest)}. This
 *       will block until the request completes in some way.
 *   <li>If the session request is completed, then {@link #complete(RequestId, Either)} must
 *       be called. This will ensure that {@link #addToQueue(SessionRequest)}
 *       returns.
 *   <li>If the request cannot be handled right now, call
 *       {@link #retryAddToQueue(SessionRequest)} to return the session request to the front
 *       of the queue.
 * </ol>
 * <p>
 * There is a background thread that will reap {@link SessionRequest}s that have timed out.
 * This means that a request can either complete by a listener calling
 * {@link #complete(RequestId, Either)} directly, or by being reaped by the thread.
 */
@ManagedService(objectName = "org.seleniumhq.grid:type=SessionQueue,name=LocalSessionQueue",
  description = "New session queue")
public class LocalNewSessionQueue extends NewSessionQueue implements Closeable {

  private static final String NAME = "Local New Session Queue";
  private final SlotMatcher slotMatcher;
  private final Duration requestTimeout;
  private final Map<RequestId, Data> requests;
  private final Map<RequestId, TraceContext> contexts;
  private final Deque<SessionRequest> queue;
  private final ReadWriteLock lock = new ReentrantReadWriteLock();
  private final ScheduledExecutorService service = Executors.newSingleThreadScheduledExecutor(r -> {
    Thread thread = new Thread(r);
    thread.setDaemon(true);
    thread.setName(NAME);
    return thread;
  });

  public LocalNewSessionQueue(
    Tracer tracer,
    SlotMatcher slotMatcher,
    Duration retryPeriod,
    Duration requestTimeout,
    Secret registrationSecret) {
    super(tracer, registrationSecret);

    this.slotMatcher = Require.nonNull("Slot matcher", slotMatcher);
    Require.nonNegative("Retry period", retryPeriod);

    this.requestTimeout = Require.positive("Request timeout", requestTimeout);

    this.requests = new ConcurrentHashMap<>();
    this.queue = new ConcurrentLinkedDeque<>();
    this.contexts = new ConcurrentHashMap<>();

    service.scheduleAtFixedRate(
      GuardedRunnable.guard(this::timeoutSessions),
      retryPeriod.toMillis(),
      retryPeriod.toMillis(),
      MILLISECONDS);

    new JMXHelper().register(this);
  }

  public static NewSessionQueue create(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    NewSessionQueueOptions newSessionQueueOptions = new NewSessionQueueOptions(config);
    SecretOptions secretOptions = new SecretOptions(config);
    SlotMatcher slotMatcher = new DistributorOptions(config).getSlotMatcher();

    return new LocalNewSessionQueue(
      tracer,
      slotMatcher,
      newSessionQueueOptions.getSessionRequestRetryInterval(),
      newSessionQueueOptions.getSessionRequestTimeout(),
      secretOptions.getRegistrationSecret());
  }

  private void timeoutSessions() {
    Instant now = Instant.now();

    Lock readLock = lock.readLock();
    readLock.lock();
    Set<RequestId> ids;
    try {
      ids = requests.entrySet().stream()
        .filter(entry -> isTimedOut(now, entry.getValue()))
        .map(Map.Entry::getKey)
        .collect(ImmutableSet.toImmutableSet());
    } finally {
      readLock.unlock();
    }
    ids.forEach(this::failDueToTimeout);
  }

  private boolean isTimedOut(Instant now, Data data) {
    return data.endTime.isBefore(now);
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
        if (data.latch.await(requestTimeout.toMillis(), MILLISECONDS)) {
          result = data.result;
        } else {
          result = Either.left(new SessionNotCreatedException("New session request timed out"));
        }
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        result = Either.left(new SessionNotCreatedException("Interrupted when creating the session", e));
      } catch (RuntimeException e) {
        result = Either.left(new SessionNotCreatedException("An error occurred creating the session", e));
      }

      Lock writeLock = this.lock.writeLock();
      writeLock.lock();
      try {
        requests.remove(request.getRequestId());
        queue.remove(request);
      } finally {
        writeLock.unlock();
      }

      HttpResponse res = new HttpResponse();
      if (result.isRight()) {
        res.setContent(Contents.bytes(result.right().getDownstreamEncodedResponse()));
      } else {
        res.setStatus(HTTP_INTERNAL_ERROR)
          .setContent(Contents.asJson(ImmutableMap.of(
            "value", ImmutableMap.of("error", "session not created",
                                     "message", result.left().getMessage(),
                                     "stacktrace", result.left().getStackTrace()))));
      }

      return res;
    }
  }

  @VisibleForTesting
  Data injectIntoQueue(SessionRequest request) {
    Require.nonNull("Session request", request);

    Data data = new Data(request.getEnqueued());

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      requests.put(request.getRequestId(), data);
      queue.addLast(request);
    } finally {
      writeLock.unlock();
    }

    return data;
  }

  @Override
  public boolean retryAddToQueue(SessionRequest request) {
    Require.nonNull("New session request", request);

    boolean added;
    TraceContext context = contexts.getOrDefault(request.getRequestId(), tracer.getCurrentContext());
    try (Span ignored = context.createSpan("sessionqueue.retry")) {
      Lock writeLock = lock.writeLock();
      writeLock.lock();
      try {
        if (!requests.containsKey(request.getRequestId())) {
          return false;
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
    writeLock.lock();
    try {
      Iterator<SessionRequest> iterator = queue.iterator();
      while (iterator.hasNext()) {
        SessionRequest req = iterator.next();
        if (reqId.equals(req.getRequestId())) {
          iterator.remove();

          return Optional.of(req);
        }
      }
      return Optional.empty();
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public Optional<SessionRequest> getNextAvailable(Set<Capabilities> stereotypes) {
    Require.nonNull("Stereotypes", stereotypes);

    Predicate<Capabilities> matchesStereotype =
      caps -> stereotypes.stream().anyMatch(stereotype -> slotMatcher.matches(stereotype, caps));

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Optional<SessionRequest> maybeRequest =
          queue.stream()
              .filter(req -> req.getDesiredCapabilities().stream().anyMatch(matchesStereotype))
              .findFirst();

      maybeRequest.ifPresent(req -> this.remove(req.getRequestId()));

      return maybeRequest;
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public void complete(RequestId reqId, Either<SessionNotCreatedException, CreateSessionResponse> result) {
    Require.nonNull("New session request", reqId);
    Require.nonNull("Result", result);
    TraceContext context = contexts.getOrDefault(reqId, tracer.getCurrentContext());
    try (Span ignored = context.createSpan("sessionqueue.completed")) {
      Lock readLock = lock.readLock();
      readLock.lock();
      Data data;
      try {
        data = requests.get(reqId);
      } finally {
        readLock.unlock();
      }

      if (data == null) {
        return;
      }

      Lock writeLock = lock.writeLock();
      writeLock.lock();
      try {
        requests.remove(reqId);
        queue.removeIf(req -> reqId.equals(req.getRequestId()));
        contexts.remove(reqId);
      } finally {
        writeLock.unlock();
      }

      data.setResult(result);
    }
  }

  @Override
  public int clearQueue() {
    Lock writeLock = lock.writeLock();
    writeLock.lock();

    try {
      int size = queue.size();
      queue.clear();
      requests.forEach(
        (reqId, data) ->
          data.setResult(Either.left(new SessionNotCreatedException("Request queue was cleared"))));
      requests.clear();
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
        .map(req ->
          new SessionRequestCapability(req.getRequestId(), req.getDesiredCapabilities()))
        .collect(Collectors.toList());
    } finally {
      readLock.unlock();
    }
  }

  @ManagedAttribute(name = "NewSessionQueueSize")
  public int getQueueSize() {
    return queue.size();
  }

  @Override
  public boolean isReady() {
    return true;
  }

  @Override
  public void close() throws IOException {
    shutdownGracefully(NAME, service);
  }

  private void failDueToTimeout(RequestId reqId) {
    complete(reqId, Either.left(new SessionNotCreatedException("Timed out creating session")));
  }

  private class Data {

    public final Instant endTime;
    private final CountDownLatch latch = new CountDownLatch(1);
    public Either<SessionNotCreatedException, CreateSessionResponse> result;
    private boolean complete;

    public Data(Instant enqueued) {
      this.endTime = enqueued.plus(requestTimeout);
      this.result = Either.left(new SessionNotCreatedException("Session not created"));
    }

    public synchronized void setResult(Either<SessionNotCreatedException, CreateSessionResponse> result) {
      if (complete) {
        return;
      }
      this.result = result;
      complete = true;
      latch.countDown();
    }
  }
}
