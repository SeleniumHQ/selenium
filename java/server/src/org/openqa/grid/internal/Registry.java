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

package org.openqa.grid.internal;

import com.google.common.base.Predicate;

import net.jcip.annotations.ThreadSafe;

import org.openqa.grid.internal.listeners.RegistrationListener;
import org.openqa.grid.internal.listeners.SelfHealingProxy;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.internal.HttpClientFactory;
import org.openqa.selenium.remote.server.log.LoggingManager;

import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Kernel of the grid. Keeps track of what's happening, what's free/used and assigned resources to
 * incoming requests.
 */
@ThreadSafe
public class Registry {

  public static final String KEY = Registry.class.getName();
  private static final Logger LOG = Logger.getLogger(Registry.class.getName());

  // lock for anything modifying the tests session currently running on this
  // registry.
  private final ReentrantLock lock = new ReentrantLock();
  private final Condition testSessionAvailable = lock.newCondition();
  private final ProxySet proxies;
  private final ActiveTestSessions activeTestSessions = new ActiveTestSessions();
  private final GridHubConfiguration configuration;
  private final HttpClientFactory httpClientFactory;
  private final NewSessionRequestQueue newSessionQueue;
  private final Matcher matcherThread = new Matcher();
  private final List<RemoteProxy> registeringProxies = new CopyOnWriteArrayList<>();

  private volatile boolean stop = false;
  // The following three variables need to be volatile because we expose a public setters
  private volatile Hub hub;

  private Registry(Hub hub, GridHubConfiguration config) {
    this.hub = hub;
    this.newSessionQueue = new NewSessionRequestQueue();
    this.configuration = config;
    this.httpClientFactory = new HttpClientFactory();
    proxies = new ProxySet(config.throwOnCapabilityNotPresent);
    this.matcherThread.setUncaughtExceptionHandler(new UncaughtExceptionHandler());
  }


  @SuppressWarnings({"NullableProblems"})
  public static Registry newInstance() {
    return newInstance(null, new GridHubConfiguration());
  }

  public static Registry newInstance(Hub hub, GridHubConfiguration config) {
    Registry registry = new Registry(hub, config);
    registry.matcherThread.start();

    // freynaud : TODO
    // Registry is in a valid state when testSessionAvailable.await(); from
    // assignRequestToProxy is reached. No before.
    try {
      Thread.sleep(250);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    return registry;
  }

  public GridHubConfiguration getConfiguration() {
    return configuration;
  }

  /**
   * Ends this test session for the hub, releasing the resources in the hub / registry. It does not
   * release anything on the remote. The resources are released in a separate thread, so the call
   * returns immediately. It allows release with long duration not to block the test while the hub is
   * releasing the resource.
   *
   * @param session The session to terminate
   * @param reason  the reason for termination
   */
  public void terminate(final TestSession session, final SessionTerminationReason reason) {
    new Thread(new Runnable() { // Thread safety reviewed
      public void run() {
        _release(session.getSlot(), reason);
      }
    }).start();
  }

  /**
   * Release the test slot. Free the resource on the slot itself and the registry. If also invokes
   * the {@link org.openqa.grid.internal.listeners.TestSessionListener#afterSession(TestSession)} if
   * applicable.
   *
   * @param testSlot The slot to release
   */
  private void _release(TestSlot testSlot, SessionTerminationReason reason) {
    if (!testSlot.startReleaseProcess()) {
      return;
    }

    if (!testSlot.performAfterSessionEvent()) {
      return;
    }

    final String internalKey = testSlot.getInternalKey();

    try {
      lock.lock();
      testSlot.finishReleaseProcess();
      release(internalKey, reason);
    } finally {
      lock.unlock();
    }
  }

  void terminateSynchronousFOR_TEST_ONLY(TestSession testSession) {
    _release(testSession.getSlot(), SessionTerminationReason.CLIENT_STOPPED_SESSION);
  }

  public void removeIfPresent(RemoteProxy proxy) {
    // Find the original proxy. While the supplied one is logically equivalent, it may be a fresh object with
    // an empty TestSlot list, which doesn't figure into the proxy equivalence check.  Since we want to free up
    // those test sessions, we need to operate on that original object.
    if (proxies.contains(proxy)) {
      LOG.warning(String.format(
        "Cleaning up stale test sessions on the unregistered node %s", proxy));

      final RemoteProxy p = proxies.remove(proxy);
      for (TestSlot slot : p.getTestSlots()) {
        forceRelease(slot, SessionTerminationReason.PROXY_REREGISTRATION);
      }
      p.teardown();
    }
  }

  /**
   * Releases the test slot, WITHOUT running any listener.
   * @param testSlot test slot to be released
   * @param reason reason for termination
   */
  public void forceRelease(TestSlot testSlot, SessionTerminationReason reason) {
    if (testSlot.getSession() == null) {
      return;
    }

    String internalKey = testSlot.getInternalKey();
    release(internalKey, reason);
    testSlot.doFinishRelease();
  }


  /**
   * iterates the queue of incoming new session request and assign them to proxy after they've been
   * sorted by priority, with priority defined by the prioritizer.
   */
  class Matcher extends Thread { // Thread safety reviewed

    Matcher() {
      super("Matcher thread");
    }

    @Override
    public void run() {
      try {
        lock.lock();
        assignRequestToProxy();
      } finally {
        lock.unlock();
      }
    }

  }

  public void stop() {
    stop = true;
    matcherThread.interrupt();
    newSessionQueue.stop();
    proxies.teardown();
    httpClientFactory.close();

  }

  public Hub getHub() {
    return hub;
  }

  @SuppressWarnings({"UnusedDeclaration"})
  public void setHub(Hub hub) {
    this.hub = hub;
  }

  public void addNewSessionRequest(RequestHandler handler) {
    try {
      lock.lock();

      proxies.verifyAbilityToHandleDesiredCapabilities(handler.getRequest().getDesiredCapabilities());
      newSessionQueue.add(handler);
      fireMatcherStateChanged();
    } finally {
      lock.unlock();
    }

  }

  /**
   * iterates the list of incoming session request to find a potential match in the list of proxies.
   * If something changes in the registry, the matcher iteration is stopped to account for that
   * change.
   */

  private void assignRequestToProxy() {
    while (!stop) {
      try {
        testSessionAvailable.await(5, TimeUnit.SECONDS);

        newSessionQueue.processQueue(new Predicate<RequestHandler>() {
          public boolean apply(RequestHandler input) {
            return takeRequestHandler(input);
          }
        }, configuration.prioritizer);
        // Just make sure we delete anything that is logged on this thread from memory
        LoggingManager.perSessionLogHandler().clearThreadTempLogs();
      } catch (InterruptedException e) {
        LOG.info("Shutting down registry.");
      } catch (Throwable t) {
        LOG.log(Level.SEVERE, "Unhandled exception in Matcher thread.", t);
      }
    }

  }

  private boolean takeRequestHandler(RequestHandler handler) {
    final TestSession session = proxies.getNewSession(handler.getRequest().getDesiredCapabilities());
    final boolean sessionCreated = session != null;
    if (sessionCreated) {
      activeTestSessions.add(session);
      handler.bindSession(session);
    }
    return sessionCreated;
  }

  /**
   * mark the session as finished for the registry. The resources that were associated to it are now
   * free to be reserved by other tests
   *
   * @param session The session
   * @param reason  the reason for the release
   */
  private void release(TestSession session, SessionTerminationReason reason) {
    try {
      lock.lock();
      boolean removed = activeTestSessions.remove(session, reason);
      if (removed) {
        fireMatcherStateChanged();
      }
    } finally {
      lock.unlock();
    }
  }

  private void release(String internalKey, SessionTerminationReason reason) {
    if (internalKey == null) {
      return;
    }
    final TestSession session1 = activeTestSessions.findSessionByInternalKey(internalKey);
    if (session1 != null) {
      release(session1, reason);
      return;
    }
    LOG.warning("Tried to release session with internal key " + internalKey +
                " but couldn't find it.");
  }

  /**
   * Add a proxy to the list of proxy available for the grid to managed and link the proxy to the
   * registry.
   *
   * @param proxy The proxy to add
   */
  public void add(RemoteProxy proxy) {
    if (proxy == null) {
      return;
    }
    LOG.info("Registered a node " + proxy);
    try {
      lock.lock();

      removeIfPresent(proxy);

      if (registeringProxies.contains(proxy)) {
        LOG.warning(String.format("Proxy '%s' is already queued for registration.", proxy));

        return;
      }

      registeringProxies.add(proxy);
      fireMatcherStateChanged();
    } finally {
      lock.unlock();
    }

    boolean listenerOk = true;
    try {
      if (proxy instanceof RegistrationListener) {
        ((RegistrationListener) proxy).beforeRegistration();
      }
    } catch (Throwable t) {
      LOG.severe("Error running the registration listener on " + proxy + ", " + t.getMessage());
      t.printStackTrace();
      listenerOk = false;
    }

    try {
      lock.lock();
      registeringProxies.remove(proxy);
      if (listenerOk) {
        if (proxy instanceof SelfHealingProxy) {
          ((SelfHealingProxy) proxy).startPolling();
        }
        proxies.add(proxy);
        fireMatcherStateChanged();
      }
    } finally {
      lock.unlock();
    }

  }

  /**
   * If throwOnCapabilityNotPresent is set to true, the hub will reject test request for a
   * capability that is not on the grid. No exception will be thrown if the capability is present
   * but busy. <p> If set to false, the test will be queued hoping a new proxy will register later
   * offering that capability.
   *
   * @param throwOnCapabilityNotPresent true to throw if capability not present
   */
  public void setThrowOnCapabilityNotPresent(boolean throwOnCapabilityNotPresent) {
    proxies.setThrowOnCapabilityNotPresent(throwOnCapabilityNotPresent);
  }

  private void fireMatcherStateChanged() {
    testSessionAvailable.signalAll();
  }

  public ProxySet getAllProxies() {
    return proxies;
  }

  public List<RemoteProxy> getUsedProxies() {
    return proxies.getBusyProxies();
  }

  /**
   * gets the test session associated to this external key. The external key is the session used by
   * webdriver.
   *
   * @param externalKey the external session key
   * @return null if the hub doesn't have a node associated to the provided externalKey
   */
  public TestSession getSession(ExternalSessionKey externalKey) {
    return activeTestSessions.findSessionByExternalKey(externalKey);
  }

  /**
   * gets the test existing session associated to this external key. The external key is the session
   * used by webdriver.
   *
   * This method will log complaints and reasons if the key cannot be found
   *
   * @param externalKey the external session key
   * @return null if the hub doesn't have a node associated to the provided externalKey
   */
  public TestSession getExistingSession(ExternalSessionKey externalKey) {
    return activeTestSessions.getExistingSession(externalKey);
  }

  /*
   * May race.
   */
  public int getNewSessionRequestCount() {
    return newSessionQueue.getNewSessionRequestCount();
  }

  public void clearNewSessionRequests() {
    newSessionQueue.clearNewSessionRequests();
  }

  public boolean removeNewSessionRequest(RequestHandler request) {
    return newSessionQueue.removeNewSessionRequest(request);
  }

  public Iterable<DesiredCapabilities> getDesiredCapabilities() {
    return newSessionQueue.getDesiredCapabilities();
  }

  public Set<TestSession> getActiveSessions() {
    return activeTestSessions.unmodifiableSet();
  }

  public RemoteProxy getProxyById(String id) {
    return proxies.getProxyById(id);
  }

  HttpClientFactory getHttpClientFactory() {
    return httpClientFactory;
  }

  private static class UncaughtExceptionHandler implements Thread.UncaughtExceptionHandler {

    public void uncaughtException(Thread t, Throwable e) {
      LOG.log(Level.SEVERE, "Matcher thread dying due to unhandled exception.", e);
    }
  }

}
