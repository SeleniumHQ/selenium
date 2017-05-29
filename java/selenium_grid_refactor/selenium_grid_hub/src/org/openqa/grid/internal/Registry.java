/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.grid.internal;

import com.google.common.base.Predicate;

import net.jcip.annotations.ThreadSafe;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.listeners.RegistrationListener;
import org.openqa.grid.internal.listeners.SelfHealingProxy;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.web.HubInterface;
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
 * Kernel of the grid. Keeps track of what's happening, what's free/used and
 * assigned resources to incoming requests.
 */
@ThreadSafe
public class Registry implements HubRegistryInterface {

  private static final Logger log = Logger.getLogger(Registry.class.getName());

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
  private final List<RemoteProxy> registeringProxies = new CopyOnWriteArrayList<RemoteProxy>();
  private final CapabilityMatcher capabilityMatcher;

  private volatile boolean stop = false;
  // The following three variables need to be volatile because we expose a
  // public setters
  private volatile int newSessionWaitTimeout;
  private volatile Prioritizer prioritizer;
  private volatile HubInterface hub;

  private Registry(HubInterface hub, GridHubConfiguration config) {
    this.hub = hub;
    this.capabilityMatcher = config.getCapabilityMatcher();
    this.newSessionWaitTimeout = config.getNewSessionWaitTimeout();
    this.prioritizer = config.getPrioritizer();
    this.newSessionQueue = new NewSessionRequestQueue();
    this.configuration = config;
    this.httpClientFactory = new HttpClientFactory();
    proxies = new ProxySet(config.isThrowOnCapabilityNotPresent());
    this.matcherThread
        .setUncaughtExceptionHandler(new UncaughtExceptionHandler());
  }

  @SuppressWarnings({ "NullableProblems" })
  public static HubRegistryInterface newInstance() {
    return newInstance(null, new GridHubConfiguration());
  }

  public static HubRegistryInterface newInstance(HubInterface hub,
      GridHubConfiguration config) {
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

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.grid.internal.HubRegistryInterface#getConfiguration()
   */
  @Override
  public GridHubConfiguration getConfiguration() {
    return configuration;
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#getNewSessionWaitTimeout()
   */
  @Override
  public int getNewSessionWaitTimeout() {
    return newSessionWaitTimeout;
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#setNewSessionWaitTimeout(int)
   */
  @Override
  public void setNewSessionWaitTimeout(int newSessionWaitTimeout) {
    this.newSessionWaitTimeout = newSessionWaitTimeout;
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#terminate(org.openqa.grid
   * .internal.TestSession, org.openqa.grid.internal.SessionTerminationReason)
   */
  @Override
  public void terminate(final TestSession session,
      final SessionTerminationReason reason) {
    new Thread(new Runnable() { // Thread safety reviewed
          @Override
          public void run() {
            _release(session.getSlot(), reason);
          }
        }).start();
  }

  /**
   * Release the test slot. Free the resource on the slot itself and the
   * registry. If also invokes the
   * {@link org.openqa.grid.internal.listeners.TestSessionListener#afterSession(TestSession)}
   * if applicable.
   *
   * @param testSlot
   *          The slot to release
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
    _release(testSession.getSlot(),
        SessionTerminationReason.CLIENT_STOPPED_SESSION);
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#removeIfPresent(org.openqa
   * .grid.internal.RemoteProxy)
   */
  @Override
  public void removeIfPresent(RemoteProxy proxy) {
    // Find the original proxy. While the supplied one is logically equivalent,
    // it may be a fresh object with
    // an empty TestSlot list, which doesn't figure into the proxy equivalence
    // check. Since we want to free up
    // those test sessions, we need to operate on that original object.
    if (proxies.contains(proxy)) {
      log.warning(String
          .format(
              "Proxy '%s' was previously registered.  Cleaning up any stale test sessions.",
              proxy));

      final RemoteProxy p = proxies.remove(proxy);
      for (TestSlot slot : p.getTestSlots()) {
        forceRelease(slot, SessionTerminationReason.PROXY_REREGISTRATION);
      }
      p.teardown();
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#forceRelease(org.openqa.grid
   * .internal.TestSlot, org.openqa.grid.internal.SessionTerminationReason)
   */
  @Override
  public void forceRelease(TestSlot testSlot, SessionTerminationReason reason) {
    if (testSlot.getSession() == null) {
      return;
    }

    String internalKey = testSlot.getInternalKey();
    release(internalKey, reason);
    testSlot.doFinishRelease();
  }

  /**
   * iterates the queue of incoming new session request and assign them to proxy
   * after they've been sorted by priority, with priority defined by the
   * prioritizer.
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

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.grid.internal.HubRegistryInterface#stop()
   */
  @Override
  public void stop() {
    stop = true;
    matcherThread.interrupt();
    newSessionQueue.stop();
    proxies.teardown();
    httpClientFactory.close();

  }

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.grid.internal.HubRegistryInterface#getHub()
   */
  @Override
  public HubInterface getHub() {
    return hub;
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#setHub(org.openqa.grid.web
   * .Hub)
   */
  @Override
  @SuppressWarnings({ "UnusedDeclaration" })
  public void setHub(HubInterface hub) {
    this.hub = hub;
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#addNewSessionRequest(org.
   * openqa.grid.web.servlet.handler.RequestHandler)
   */
  @Override
  public void addNewSessionRequest(RequestHandler handler) {
    try {
      lock.lock();

      proxies.verifyAbilityToHandleDesiredCapabilities(handler.getRequest()
          .getDesiredCapabilities());
      newSessionQueue.add(handler);
      fireMatcherStateChanged();
    } finally {
      lock.unlock();
    }

  }

  /**
   * iterates the list of incoming session request to find a potential match in
   * the list of proxies. If something changes in the registry, the matcher
   * iteration is stopped to account for that change.
   */

  private void assignRequestToProxy() {
    while (!stop) {
      try {
        testSessionAvailable.await(5, TimeUnit.SECONDS);

        newSessionQueue.processQueue(new Predicate<RequestHandler>() {
          @Override
          public boolean apply(RequestHandler input) {
            return takeRequestHandler(input);
          }
        }, prioritizer);
        // Just make sure we delete anything that is logged on this thread from
        // memory
        LoggingManager.perSessionLogHandler().clearThreadTempLogs();
      } catch (InterruptedException e) {
        log.info("Shutting down registry.");
      } catch (Throwable t) {
        log.log(Level.SEVERE, "Unhandled exception in Matcher thread.", t);
      }
    }

  }

  private boolean takeRequestHandler(RequestHandler handler) {
    final TestSession session = proxies.getNewSession(handler.getRequest()
        .getDesiredCapabilities());
    final boolean sessionCreated = session != null;
    if (sessionCreated) {
      activeTestSessions.add(session);
      handler.bindSession(session);
    }
    return sessionCreated;
  }

  /**
   * mark the session as finished for the registry. The resources that were
   * associated to it are now free to be reserved by other tests
   *
   * @param session
   *          The session
   * @param reason
   *          the reason for the release
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
    final TestSession session1 = activeTestSessions
        .findSessionByInternalKey(internalKey);
    if (session1 != null) {
      release(session1, reason);
      return;
    }
    log.warning("Tried to release session with internal key " + internalKey
        + " but couldn't find it.");
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#add(org.openqa.grid.internal
   * .RemoteProxy)
   */
  @Override
  public void add(RemoteProxy proxy) {
    if (proxy == null) {
      return;
    }
    log.fine("adding  " + proxy);
    try {
      lock.lock();

      removeIfPresent(proxy);

      if (registeringProxies.contains(proxy)) {
        log.warning(String.format(
            "Proxy '%s' is already queued for registration.", proxy));

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
      log.severe("Error running the registration listener on " + proxy + ", "
          + t.getMessage());
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

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#setThrowOnCapabilityNotPresent
   * (boolean)
   */
  @Override
  public void setThrowOnCapabilityNotPresent(boolean throwOnCapabilityNotPresent) {
    proxies.setThrowOnCapabilityNotPresent(throwOnCapabilityNotPresent);
  }

  private void fireMatcherStateChanged() {
    testSessionAvailable.signalAll();
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.grid.internal.HubRegistryInterface#getAllProxies()
   */
  @Override
  public ProxySet getAllProxies() {
    return proxies;
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.grid.internal.HubRegistryInterface#getUsedProxies()
   */
  @Override
  public List<RemoteProxy> getUsedProxies() {
    return proxies.getBusyProxies();
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#getSession(org.openqa.grid
   * .internal.ExternalSessionKey)
   */
  @Override
  public TestSession getSession(ExternalSessionKey externalKey) {
    return activeTestSessions.findSessionByExternalKey(externalKey);
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#getExistingSession(org.openqa
   * .grid.internal.ExternalSessionKey)
   */
  @Override
  public TestSession getExistingSession(ExternalSessionKey externalKey) {
    return activeTestSessions.getExistingSession(externalKey);
  }

  /*
   * May race.
   */
  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#getNewSessionRequestCount()
   */
  @Override
  public int getNewSessionRequestCount() {
    return newSessionQueue.getNewSessionRequestCount();
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#clearNewSessionRequests()
   */
  @Override
  public void clearNewSessionRequests() {
    newSessionQueue.clearNewSessionRequests();
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#removeNewSessionRequest(org
   * .openqa.grid.web.servlet.handler.RequestHandler)
   */
  @Override
  public boolean removeNewSessionRequest(RequestHandler request) {
    return newSessionQueue.removeNewSessionRequest(request);
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.grid.internal.HubRegistryInterface#getDesiredCapabilities()
   */
  @Override
  public Iterable<DesiredCapabilities> getDesiredCapabilities() {
    return newSessionQueue.getDesiredCapabilities();
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.grid.internal.HubRegistryInterface#getActiveSessions()
   */
  @Override
  public Set<TestSession> getActiveSessions() {
    return activeTestSessions.unmodifiableSet();
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#setPrioritizer(org.openqa
   * .grid.internal.listeners.Prioritizer)
   */
  @Override
  public void setPrioritizer(Prioritizer prioritizer) {
    this.prioritizer = prioritizer;
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.grid.internal.HubRegistryInterface#getPrioritizer()
   */
  @Override
  public Prioritizer getPrioritizer() {
    return prioritizer;
  }

  /*
   * (non-Javadoc)
   * 
   * @see
   * org.openqa.grid.internal.HubRegistryInterface#getProxyById(java.lang.String
   * )
   */
  @Override
  public RemoteProxy getProxyById(String id) {
    return proxies.getProxyById(id);
  }

  public HttpClientFactory getHttpClientFactory() {
    return httpClientFactory;
  }

  private static class UncaughtExceptionHandler implements
      Thread.UncaughtExceptionHandler {

    @Override
    public void uncaughtException(Thread t, Throwable e) {
      log.log(Level.SEVERE, "Matcher thread dying due to unhandled exception.",
          e);
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.grid.internal.HubRegistryInterface#getCapabilityMatcher()
   */
  @Override
  public CapabilityMatcher getCapabilityMatcher() {
    return capabilityMatcher;
  }

}
