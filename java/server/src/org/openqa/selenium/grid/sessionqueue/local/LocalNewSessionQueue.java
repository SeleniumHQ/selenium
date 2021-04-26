package org.openqa.selenium.grid.sessionqueue.local;

import com.google.common.annotations.VisibleForTesting;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NewSessionErrorResponse;
import org.openqa.selenium.grid.data.NewSessionRejectedEvent;
import org.openqa.selenium.grid.data.NewSessionRequestEvent;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.jmx.ManagedAttribute;
import org.openqa.selenium.grid.jmx.ManagedService;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.SessionRequest;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.grid.sessionqueue.config.SessionRequestOptions;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.Closeable;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Deque;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.util.concurrent.TimeUnit.MILLISECONDS;

/**
 * An in-memory implementation of the list of new session requests.
 * <p>
 * The lifecycle of a request can be described as:
 * <ol>
 *   <li>User adds an item on to the queue using {@link #addToQueue(SessionRequest)}. This
 *       will block until the request completes in some way.
 *   <li>After being added, a {@link NewSessionRequestEvent} is fired. Listeners should use
 *       this as an indication to call {@link #remove(RequestId)} to get the session request.
 *   <li>If the session request is completed, then {@link #complete(RequestId, Either)} must
 *       be called. This will not only ensure that {@link #addToQueue(SessionRequest)}
 *       returns, but will also fire a {@link NewSessionRejectedEvent} if the session was
 *       rejected. Positive completions of events are assumed to be notified on the event bus
 *       by other listeners.
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

  private final EventBus bus;
  private final Duration requestTimeout;
  private final Map<RequestId, Data> requests;
  private final Deque<SessionRequest> queue;
  private final ReadWriteLock lock = new ReentrantReadWriteLock();
  private final ScheduledExecutorService service = Executors.newSingleThreadScheduledExecutor(r -> {
    Thread thread = new Thread(r);
    thread.setDaemon(true);
    thread.setName("Local New Session Queue");
    return thread;
  });

  public LocalNewSessionQueue(
    Tracer tracer,
    EventBus bus,
    Duration retryPeriod,
    Duration requestTimeout,
    Secret registrationSecret) {
    super(tracer, registrationSecret);

    this.bus = Require.nonNull("Event bus", bus);
    Require.nonNull("Retry period", retryPeriod);
    if (retryPeriod.isNegative() || retryPeriod.isZero()) {
      throw new IllegalArgumentException("Retry period must be positive");
    }

    this.requestTimeout = Require.nonNull("Request timeout", requestTimeout);
    if (requestTimeout.isNegative() || requestTimeout.isZero()) {
      throw new IllegalArgumentException("Request timeout must be positive");
    }

    this.requests = new ConcurrentHashMap<>();
    this.queue = new ConcurrentLinkedDeque<>();

    service.scheduleAtFixedRate(this::timeoutSessions, retryPeriod.toMillis(), retryPeriod.toMillis(), MILLISECONDS);

    new JMXHelper().register(this);
  }

  public static NewSessionQueue create(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    EventBusOptions eventBusOptions = new EventBusOptions(config);
    SessionRequestOptions requestOptions = new SessionRequestOptions(config);
    SecretOptions secretOptions = new SecretOptions(config);

    return new LocalNewSessionQueue(
      tracer,
      eventBusOptions.getEventBus(),
      requestOptions.getSessionRequestRetryInterval(),
      requestOptions.getSessionRequestTimeout(),
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
        .collect(Collectors.toSet());
    } finally {
      readLock.unlock();
    }

    Lock writeLock = lock.writeLock();
    try {
      for (RequestId id : ids) {
        failDueToTimeout(id);
      }
    } finally {
      writeLock.unlock();
    }
  }

  private boolean isTimedOut(Instant now, Data data) {
    return data.endTime.isBefore(now);
  }

  @Override
  public HttpResponse addToQueue(SessionRequest request) {
    Require.nonNull("New session request", request);
    Require.nonNull("Request id", request.getRequestId());

    Data data = injectIntoQueue(request);
    CompletableFuture<Either<SessionNotCreatedException, CreateSessionResponse>> future = data.future;

    if (isTimedOut(Instant.now(), data)) {
      System.out.println("Timing out request!");
      failDueToTimeout(request.getRequestId());
    }

    Either<SessionNotCreatedException, CreateSessionResponse> result;
    try {
      result = future.get(requestTimeout.toMillis(), MILLISECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      result = Either.left(new SessionNotCreatedException("Interrupted when creating the session", e));
    } catch (ExecutionException e) {
      Throwable cause = e.getCause();
      result = Either.left(new SessionNotCreatedException(
        cause == null ? e.getMessage() : cause.getMessage(),
        cause == null ? e : cause));
    } catch (TimeoutException e) {
      result = Either.left(new SessionNotCreatedException("New session request timed out"));
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
        .setContent(Contents.asJson(Collections.singletonMap("value", result.left())));
    }

    return res;
  }

  @VisibleForTesting
  Data injectIntoQueue(SessionRequest request) {
    Require.nonNull("Session request", request);

    CompletableFuture<Either<SessionNotCreatedException, CreateSessionResponse>> future = new CompletableFuture<>();
    Data data = new Data(future, request.getEnqueued());

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      requests.put(request.getRequestId(), data);
      queue.addLast(request);
    } finally {
      writeLock.unlock();
    }

    bus.fire(new NewSessionRequestEvent(request.getRequestId()));

    return data;
  }

  @Override
  public boolean retryAddToQueue(SessionRequest request) {
    Require.nonNull("New session request", request);

    boolean added;

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

    if (added) {
      bus.fire(new NewSessionRequestEvent(request.getRequestId()));
    }
    return added;
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
  public void complete(RequestId reqId, Either<SessionNotCreatedException, CreateSessionResponse> result) {
    Require.nonNull("New session request", reqId);
    Require.nonNull("Result", result);

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
    } finally {
      writeLock.unlock();
    }

    if (result.isLeft()) {
      bus.fire(new NewSessionRejectedEvent(new NewSessionErrorResponse(reqId, result.left().getMessage())));
    }
    data.future.complete(result);
  }

  @Override
  public int clearQueue() {
    Lock writeLock = lock.writeLock();
    writeLock.lock();

    try {
      System.out.println(requests);

      int size = queue.size();
      queue.clear();
      requests.forEach((reqId, data) -> {
        data.future.complete(Either.left(new SessionNotCreatedException("Request queue was cleared")));
        bus.fire(new NewSessionRejectedEvent(
          new NewSessionErrorResponse(reqId, "New session queue was forcibly cleared")));
      });
      requests.clear();
      return size;
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public List<Set<Capabilities>> getQueueContents() {
    Lock readLock = lock.readLock();
    readLock.lock();

    try {
      return queue.stream()
        .map(SessionRequest::getDesiredCapabilities)
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
    service.shutdownNow();
  }

  private void failDueToTimeout(RequestId reqId) {
    complete(reqId, Either.left(new SessionNotCreatedException("Timed out creating session")));
  }

  private class Data {
    public final Instant endTime;
    public final CompletableFuture<Either<SessionNotCreatedException, CreateSessionResponse>> future;

    public Data(CompletableFuture<Either<SessionNotCreatedException, CreateSessionResponse>> future, Instant enqueud) {
      this.future = future;
      this.endTime = enqueud.plus(requestTimeout);
    }
  }
}
