/*
Copyright 2007-2011 WebDriver committers

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
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.internal.HttpClientFactory;

import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
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

  private Prioritizer prioritizer;

  private static final Logger log = Logger.getLogger(Registry.class.getName());

  private final NewSessionRequestQueue newSessionQueue;

  private Hub hub;

  // lock for anything modifying the tests session currently running on this
  // registry.
  private final ReentrantLock lock = new ReentrantLock();
  private final Condition testSessionAvailable = lock.newCondition();

  private final ProxySet proxies;
  private final ActiveTestSessions activeTestSessions = new ActiveTestSessions();
  private Matcher matcherThread = new Matcher();
  private volatile boolean stop = false;
  private int newSessionWaitTimeout;

  private final GridHubConfiguration configuration;
  private final HttpClientFactory httpClientFactory;


  private Registry(Hub hub, GridHubConfiguration config) {
    this.hub = hub;
    this.newSessionWaitTimeout = config.getNewSessionWaitTimeout();
    this.prioritizer = config.getPrioritizer();
    this.newSessionQueue = new NewSessionRequestQueue();
    this.configuration = config;
    this.httpClientFactory = new HttpClientFactory();
    proxies = new ProxySet(config.isThrowOnCapabilityNotPresent());
  }

  @SuppressWarnings({"NullableProblems"})
  public static Registry newInstance() {
    return newInstance(null, new GridHubConfiguration());
  }

  public static Registry newInstance(Hub hub, GridHubConfiguration config) {
    Registry registry = new Registry(hub, config);
    registry.matcherThread.setUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
      public void uncaughtException(Thread t, Throwable e) {
        log.log(Level.SEVERE, "Matcher thread dying due to unhandled exception.", e);
      }
    });

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
   * how long a session can remains in the newSession queue before being quicked out
   *
   * @return the new session wait timeout
   */
  public int getNewSessionWaitTimeout() {
    return newSessionWaitTimeout;
  }

  public void setNewSessionWaitTimeout(int newSessionWaitTimeout) {
    this.newSessionWaitTimeout = newSessionWaitTimeout;
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

  public void addNewSessionRequest(RequestHandler request) {
    try {
      lock.lock();

      proxies.verifyAbilityToHandleDesiredCapabilities(request.getDesiredCapabilities());
      newSessionQueue.add(request);
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
        }, prioritizer);
      } catch (InterruptedException e) {
        log.info("Shutting down registry.");
      } catch (Throwable t) {
        log.log(Level.SEVERE, "Unhandled exception in Matcher thread.", t);
      }
    }

  }

  private boolean takeRequestHandler(RequestHandler request) {
    final TestSession session = proxies.getNewSession(request.getDesiredCapabilities());
    if (session != null) {
      boolean ok = activeTestSessions.add(session);
      request.bindSession(session);
      if (!ok) {
        log.severe("Error adding session : " + session);
      }
      return true;
    }
    return false;
  }

  /**
   * mark the session as finished for the registry. The resources that were associated to it are now
   * free to be reserved by other tests
   *
   * @param session The session
   */
  private void release(TestSession session) {
    try {
      lock.lock();
      boolean removed = activeTestSessions.remove(session);
      if (removed) {
        fireMatcherStateChanged();
      }
    } finally {
      lock.unlock();
    }
  }

  public void release(String internalKey) {
    if (internalKey == null) {
      return;
    }
    final TestSession session1 = activeTestSessions.findSessionByInternalKey(internalKey);
    if (session1 != null) {
      release(session1);
      return;
    }
    log.warning("Tried to release session with internal key " + internalKey +
                " but couldn't find it.");
  }

  private List<RemoteProxy> registeringProxies = new CopyOnWriteArrayList<RemoteProxy>();

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
    log.fine("adding  " + proxy);
    try {
      lock.lock();

      proxies.removeIfPresent(proxy);

      if (registeringProxies.contains(proxy)) {
        log.warning(String.format("Proxy '%s' is already queued for registration.", proxy));

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
      log.severe("Error running the registration listener on " + proxy + ", " + t.getMessage());
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
   * but busy. <p/> If set to false, the test will be queued hoping a new proxy will register later
   * offering that capability.
   *
   * @param throwOnCapabilityNotPresent true to throw if capability not present
   */
  public void setThrowOnCapabilityNotPresent(boolean throwOnCapabilityNotPresent) {
    proxies.setThrowOnCapabilityNotPresent(throwOnCapabilityNotPresent);
  }

  public Lock getLock() {
    return lock;
  }

  void fireMatcherStateChanged() {
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

  public void setPrioritizer(Prioritizer prioritizer) {
    this.prioritizer = prioritizer;
  }

  public Prioritizer getPrioritizer() {
    return prioritizer;
  }

  public RemoteProxy getProxyById(String id) {
    return proxies.getProxyById(id);
  }

  HttpClientFactory getHttpClientFactory() {
    return httpClientFactory;
  }
}
