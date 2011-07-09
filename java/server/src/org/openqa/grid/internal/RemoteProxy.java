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

import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;

import java.lang.reflect.Constructor;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.listeners.TimeoutListener;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultHtmlRenderer;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.selenium.remote.DesiredCapabilities;

/**
 * Proxy to a remote server executing the tests.
 * <p/>
 * The proxy keeps a state of what is happening on the remote server and knows
 * if a new test can be run on the remote server. There are several reasons why
 * a test could not be run on the specified remote server, for instance: if the
 * RemoteProxy decides the remote server has reached the maximum number of
 * concurrent sessions, or if the client has requested DesiredCapabilities we
 * don't support e.g. asking for Chrome when we only support Firefox.
 */
public class RemoteProxy implements Comparable<RemoteProxy> {

  private RegistrationRequest request;
  private String id;
  // how many ms between 2 cycle checking if there are some session that have
  // timed out. -1 means we never run the cleanup cycle. By default there is
  // no timeout
  private int cleanUpCycle = -1;
  private int timeOut = -1;

  private static final Logger log = Logger.getLogger(RemoteProxy.class.getName());

  // the URL the remote listen on.
  protected URL remoteURL;

  private Map<String, Object> config;

  // list of the type of test the remote can run.
  private List<TestSlot> testSlots = new ArrayList<TestSlot>();

  public List<TestSlot> getTestSlots() {
    return testSlots;
  }

  // maximum number of tests that can run at a given time on the remote.
  private int maxConcurrentSession = 0;
  private Registry registry;

  private CapabilityMatcher capabilityHelper = new DefaultCapabilityMatcher();

  public Registry getRegistry() {
    return registry;
  }

  public CapabilityMatcher getCapabilityHelper() {
    return capabilityHelper;
  }

  public void setCapabilityHelper(CapabilityMatcher capabilityHelper) {
    this.capabilityHelper = capabilityHelper;
  }

  /**
   * Create the proxy from the info sent by the remote.
   * <p/>
   * If maxSession is not specified, default to 1 = max number of tests
   * running at a given time will be 1.
   * <p/>
   * For each capability, maxInstances is defaulted to 1 if not specified =
   * max number of test of each capability running at a time will be 1.
   * maxInstances for firefox can be > 1. IE won't support it.
   *
   * @param request
   */
  public RemoteProxy(RegistrationRequest request, Registry registry) {
    this.request = request;
    this.registry = registry;
    this.config = mergeConfig(registry.getConfiguration().getAllParams(), request.getConfiguration());
    String url = (String) config.get(REMOTE_URL);
    if (url == null) {
      // no URL isn't always a problem.
      // The remote proxy only knows where the remote is if the remote
      // itself initiate the registration process. In a virtual
      // environment for instance, the IP of the host where the remote is
      // will only be available after the host has been started.
      this.remoteURL = null;
      log.warning("URL was null. Not a problem if you set a meaningful ID.");
    } else {
      try {
        this.remoteURL = new URL(url);
        this.id = remoteURL.toExternalForm();
      } catch (MalformedURLException e) {
        // should only happen when a bad config is sent.
        throw new GridException("Not a correct url to register a remote : " + url);
      }
    }

    maxConcurrentSession = (Integer) this.config.get(RegistrationRequest.MAX_SESSION);
    cleanUpCycle = (Integer) this.config.get(RegistrationRequest.CLEAN_UP_CYCLE);
    timeOut = (Integer) this.config.get(RegistrationRequest.TIME_OUT);

    List<DesiredCapabilities> capabilities = request.getCapabilities();

    for (DesiredCapabilities capability : capabilities) {
      Object maxInstance = capability.getCapability(MAX_INSTANCES);
      if (maxInstance == null) {
        log.warning("Max instance not specified. Using default = 1 instance");
        maxInstance = "1";
      }
      int value = Integer.parseInt(maxInstance.toString());
      for (int i = 0; i < value; i++) {
        Map<String, Object> c = new HashMap<String, Object>();
        for (String k : capability.asMap().keySet()) {
          c.put(k, capability.getCapability(k));
        }
        testSlots.add(new TestSlot(this, c));
      }
    }

    if (this instanceof TimeoutListener) {
      if (cleanUpCycle > 0 && timeOut > 0) {
        log.fine("starting cleanup thread");
        new Thread(new CleanUpThread(this)).start();
      }
    }
  }

  /**
   * merge the param from config 1 and 2. If a param is present in both,
   * config2 value is used.
   *
   * @param configuration1
   * @param configuration2
   * @return
   */
  private Map<String, Object> mergeConfig(Map<String, Object> configuration1, Map<String, Object> configuration2) {
    Map<String, Object> res = new HashMap<String, Object>();
    res.putAll(configuration1);
    for (String key : configuration2.keySet()) {
      res.put(key, configuration2.get(key));
    }
    return res;
  }

  /**
   * get the unique id for the node. Usually the url it listen on is a good
   * id. If the network keeps changing and the IP of the node is updated, you
   * need to define nodes with a different id.
   *
   * @return
   */
  public String getId() {
    if (id == null) {
      throw new RuntimeException("Bug. Trying to use the id on a proxy but it hasn't been set.");
    }
    return id;
  }

  protected void setId(String id) {
    this.id = id;
  }

  private boolean stop = false;

  public void teardown() {
    stop = true;
  }

  private class CleanUpThread implements Runnable {
    private RemoteProxy proxy;

    public CleanUpThread(RemoteProxy proxy) {
      this.proxy = proxy;
    }

    public void run() {

      log.fine("cleanup thread starting...");
      while (!proxy.stop) {
        try {
          Thread.sleep(cleanUpCycle);
        } catch (InterruptedException e) {
          log.severe("clean up thread died. " + e.getMessage());
        }

        for (TestSlot slot : testSlots) {
          try {
            TestSession session = slot.getSession();
            if (session != null) {
              long inactivity = session.getInactivityTime();
              boolean hasTimedOut = inactivity > timeOut;
              if (hasTimedOut) {
                log.warning("session " + session + " has TIMED OUT and will be released");
                ((TimeoutListener) proxy).beforeRelease(session);
                session.terminate();
              }

              if (session.isOrphaned()) {
                log.warning("session " + session + " has been ORPHANED and will be released");
                ((TimeoutListener) proxy).beforeRelease(session);
                session.terminate();
              }
            }
          } catch (Throwable t) {
            log.warning("Error executing the timeout when cleaning up slot " + slot + t.getMessage());
          }
        }
      }
    }
  }

  public Map<String, Object> getConfig() {
    return config;
  }

  /**
   * return the registration request that created the proxy in the first
   * place.
   *
   * @return
   */
  public RegistrationRequest getOriginalRegistrationRequest() {
    return request;
  }

  /**
   * return the max number of tests that can run on this remote at a given
   * time.
   */
  public int getMaxNumberOfConcurrentTestSessions() {
    return maxConcurrentSession;
  }

  /**
   * @return the URL the remote listens on.
   */
  public URL getRemoteURL() {
    return remoteURL;
  }

  /**
   * return a new test session if the current proxy has the resources and is
   * ready to run the test.
   *
   * @param requestedCapability
   * @return a new TestSession if possible, null otherwise
   */
  public TestSession getNewSession(Map<String, Object> requestedCapability) {
    if (!hasCapability(requestedCapability)) {
      return null;
    }
    // any slot left at all?
    int totalUsed = getTotalUsed();
    if (totalUsed >= maxConcurrentSession) {
      return null;
    }
    // any slot left for the given app ?
    for (TestSlot testslot : testSlots) {
      TestSession session = testslot.getNewSession(requestedCapability);
      if (session != null) {
        return session;
      }
    }
    return null;
  }

  /**
   * returns the total number of test slots used on this proxy
   *
   * @return
   */
  public int getTotalUsed() {
    int totalUsed = 0;
    for (TestSlot slot : testSlots) {
      if (slot.getSession() != null) {
        totalUsed++;
      }
    }
    return totalUsed;
  }

  /**
   * Return true if the remote control has the capability requested.
   * <p/>
   * the definition of "has" is defined by
   * {@link CapabilityMatcher#matches(Map, Map)}
   * <p/>
   * hasCapability = true doesn't mean the test cast start just now, only that
   * the proxy will be able to run a test requireing that capability at some
   * point.
   *
   * @param requestedCapability
   * @return
   */
  boolean hasCapability(Map<String, Object> requestedCapability) {
    for (TestSlot slot : testSlots) {
      if (slot.matches(requestedCapability)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @return true if the remote does something. busy = true doesn't prevent
   *         the remote from accepting more tasks.
   */
  protected boolean isBusy() {
    return getTotalUsed() != 0;
  }

  /**
   * Takes a registration request and return the RemoteProxy associated to it.
   * It can be any class extending RemoteProxy.
   *
   * @param <T>
   * @param request
   * @return a new instance built from the request.
   */
  @SuppressWarnings("unchecked")
  public static final <T extends RemoteProxy> T getNewInstance(RegistrationRequest request, Registry registry) {
    try {
      String proxyClass = request.getRemoteProxyClass();
      if (proxyClass == null) {
        log.fine("No proxy class. Using default");
        proxyClass = RemoteProxy.class.getCanonicalName();
      }
      Class<?> clazz = Class.forName(proxyClass);
      log.fine("Using class " + clazz.getName());
      Object[] args = new Object[]{request, registry};
      Class<?>[] argsClass = new Class[]{RegistrationRequest.class, Registry.class};
      Constructor<?> c = clazz.getConstructor(argsClass);
      Object proxy = c.newInstance(args);
      if (proxy instanceof RemoteProxy) {
        return (T) proxy;
      } else {
        throw new InvalidParameterException("Error:" + proxy.getClass() + " isn't a remote proxy");
      }
    } catch (Exception e) {
      e.printStackTrace();
      throw new InvalidParameterException("Error:" + e.getMessage());
    }
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((id == null) ? 0 : id.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    RemoteProxy other = (RemoteProxy) obj;
    if (getId() == null) {
      if (other.getId() != null)
        return false;
    } else if (!getId().equals(other.getId()))
      return false;
    return true;
  }

  // less busy to more busy.
  public int compareTo(RemoteProxy o) {
    if (o == null) {
      return -1;
    }
    return getTotalUsed() - o.getTotalUsed();
  }

  @Override
  public String toString() {
    return "URL :" + getRemoteURL() + (timeOut != -1 ? " time out : " + timeOut : "");
  }

  private final HtmlRenderer renderer = new DefaultHtmlRenderer(this);

  public HtmlRenderer getHtmlRender() {
    return renderer;
  }

  /**
   * im millis
   *
   * @return
   */
  public int getTimeOut() {
    return timeOut;
  }

}
