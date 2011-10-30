/*
 * Copyright 2007-2011 WebDriver committers
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package org.openqa.grid.internal;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.SeleniumProtocol;
import org.openqa.grid.internal.listeners.TimeoutListener;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultHtmlRenderer;
import org.openqa.grid.internal.utils.HtmlRenderer;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.internal.HttpClientFactory;

import java.lang.reflect.Constructor;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;
import static org.openqa.grid.common.RegistrationRequest.PATH;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_HOST;
import static org.openqa.grid.common.RegistrationRequest.SELENIUM_PROTOCOL;

/**
 * Proxy to a remote server executing the tests.
 * <p/>
 * The proxy keeps a state of what is happening on the remote server and knows if a new test can be
 * run on the remote server. There are several reasons why a test could not be run on the specified
 * remote server, for instance: if the RemoteProxy decides the remote server has reached the maximum
 * number of concurrent sessions, or if the client has requested DesiredCapabilities we don't
 * support e.g. asking for Chrome when we only support Firefox.
 */
public class RemoteProxy implements Comparable<RemoteProxy> {

  private final RegistrationRequest request;
  // how many ms between 2 cycle checking if there are some session that have
  // timed out. -1 means we never run the cleanup cycle. By default there is
  // no timeout
  private final int cleanUpCycle;
  private final int timeOut;

  private static final Logger log = Logger.getLogger(RemoteProxy.class.getName());

  // the host the remote listen on.The final URL will be proxy.host + slot.path
  protected volatile URL remoteHost;

  private final Map<String, Object> config;

  // list of the type of test the remote can run.
  private final List<TestSlot> testSlots;

  // maximum number of tests that can run at a given time on the remote.
  private final int maxConcurrentSession;
  private final Registry registry;

  private volatile CapabilityMatcher capabilityHelper = new DefaultCapabilityMatcher();

  private String id;

  private volatile boolean stop = false;


  public List<TestSlot> getTestSlots() {
    return testSlots;
  }

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
   * If maxSession is not specified, default to 1 = max number of tests running at a given time will
   * be 1.
   * <p/>
   * For each capability, maxInstances is defaulted to 1 if not specified = max number of test of
   * each capability running at a time will be 1. maxInstances for firefox can be > 1. IE won't
   * support it.
   * 
   * @param request The request
   * @param registry The registry to use
   */
  public RemoteProxy(RegistrationRequest request, Registry registry) {
    this.request = request;
    this.registry = registry;
    this.config =
        mergeConfig(registry.getConfiguration().getAllParams(), request.getConfiguration());
    String url = (String) config.get(REMOTE_HOST);
    if (url == null) {
      // no URL isn't always a problem.
      // The remote proxy only knows where the remote is if the remote
      // itself initiate the registration process. In a virtual
      // environment for instance, the IP of the host where the remote is
      // will only be available after the host has been started.
      this.remoteHost = null;
      log.warning("URL was null. Not a problem if you set a meaningful ID.");
    } else {
      try {
        this.remoteHost = new URL(url);
        this.id = remoteHost.toExternalForm();
      } catch (MalformedURLException e) {
        // should only happen when a bad config is sent.
        throw new GridException("Not a correct url to register a remote : " + url);
      }
    }

    maxConcurrentSession = (Integer) this.config.get(RegistrationRequest.MAX_SESSION);
    cleanUpCycle = (Integer) this.config.get(RegistrationRequest.CLEAN_UP_CYCLE);
    timeOut = (Integer) this.config.get(RegistrationRequest.TIME_OUT);

    List<DesiredCapabilities> capabilities = request.getCapabilities();

    List<TestSlot> slots = new ArrayList<TestSlot>();
    for (DesiredCapabilities capability : capabilities) {
      Object maxInstance = capability.getCapability(MAX_INSTANCES);


      SeleniumProtocol protocol = getProtocol(capability);
      String path = getPath(capability);

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
        slots.add(new TestSlot(this, protocol, path, c));
      }
    }
    this.testSlots = Collections.unmodifiableList( slots);
  }

  private SeleniumProtocol getProtocol(DesiredCapabilities capability) {
    String type = (String) capability.getCapability(SELENIUM_PROTOCOL);

    SeleniumProtocol protocol;
    if (type == null) {
      protocol = SeleniumProtocol.WebDriver;
    } else {
      try {
        protocol = SeleniumProtocol.valueOf(type);
      } catch (IllegalArgumentException e) {
        throw new GridException(type
            + " isn't a valid protocol type for grid. See SeleniumProtocol enim.", e);
      }
    }
    return protocol;
  }

  private String getPath(DesiredCapabilities capability) {
    String type = (String) capability.getCapability(PATH);
    if (type == null) {
      switch (getProtocol(capability)) {
        case Selenium:
          return "/selenium-server/driver";
        case WebDriver:
          return "/wd/hub";
        default:
          throw new GridException("Protocol not supported.");
      }
    } else {
      return type;
    }
  }

  public void setupTimeoutListener() {
    if (this instanceof TimeoutListener) {
      if (cleanUpCycle > 0 && timeOut > 0) {
        log.fine("starting cleanup thread");
        new Thread(new CleanUpThread(this), "RemoteProxy CleanUpThread").start(); // Thread safety reviewed (hopefully ;)
      }
    }
  }

  /**
   * merge the param from config 1 and 2. If a param is present in both, config2 value is used.
   * 
   * @param configuration1 The first configuration to merge (recessive)
   * @param configuration2 The second configuration to merge (dominant)
   * @return The merged collection
   */
  private Map<String, Object> mergeConfig(Map<String, Object> configuration1,
      Map<String, Object> configuration2) {
    Map<String, Object> res = new HashMap<String, Object>();
    res.putAll(configuration1);
    for (String key : configuration2.keySet()) {
      res.put(key, configuration2.get(key));
    }
    return res;
  }

  /**
   * get the unique id for the node. Usually the url it listen on is a good id. If the network keeps
   * changing and the IP of the node is updated, you need to define nodes with a different id.
   * 
   * @return the id
   */
  public String getId() {
    if (id == null) {
      throw new RuntimeException("Bug. Trying to use the id on a proxy but it hasn't been set.");
    }
    return id;
  }


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
                registry.terminate( session);
              }

              if (session.isOrphaned()) {
                log.warning("session " + session + " has been ORPHANED and will be released");
                ((TimeoutListener) proxy).beforeRelease(session);
                registry.terminate( session);
              }
            }
          } catch (Throwable t) {
            log.warning("Error executing the timeout when cleaning up slot " + slot
                + t.getMessage());
          }
        }
      }
    }
  }

  public Map<String, Object> getConfig() {
    return config;
  }

  /**
   * return the registration request that created the proxy in the first place.
   * 
   * @return a RegistrationRequest, doh!
   */
  public RegistrationRequest getOriginalRegistrationRequest() {
    return request;
  }

  /**
   * return the max number of tests that can run on this remote at a given time.
   * 
   * @return an int, doh!
   */
  public int getMaxNumberOfConcurrentTestSessions() {
    return maxConcurrentSession;
  }

  /**
   * Get the host the node is on. This is different from the URL used to communicate with the
   * driver. For a local node that support both selenium1 and webdriver protocol,
   * remoteHost=http://localhost:5555 , but the underlying server with respond on urls
   * http://localhost:5555/wd/hub ( proxy.host + slot.path where slot is a webdriver slot ) and
   * http://localhost:5555/selenium-server/driver ( proxy.host + slot.path where slot is a selenium1
   * slot )
   * 
   * 
   * @return the host the remote listens on.
   */
  public URL getRemoteHost() {
    return remoteHost;
  }

  /**
   * return a new test session if the current proxy has the resources and is ready to run the test.
   * 
   * @param requestedCapability .
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
   * @return an int
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
   * the definition of "has" is defined by {@link CapabilityMatcher#matches(Map, Map)}
   * <p/>
   * hasCapability = true doesn't mean the test cast start just now, only that the proxy will be
   * able to run a test requireing that capability at some point.
   * 
   * @param requestedCapability The requestedCapability
   * @return true if present
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
   * @return true if the remote does something. busy = true doesn't prevent the remote from
   *         accepting more tasks.
   */
  protected boolean isBusy() {
    return getTotalUsed() != 0;
  }

  /**
   * Takes a registration request and return the RemoteProxy associated to it. It can be any class
   * extending RemoteProxy.
   * 
   * @param request The request
   * @param registry The registry to use
   * @return a new instance built from the request.
   */
  @SuppressWarnings("unchecked")
  public static <T extends RemoteProxy> T getNewInstance(RegistrationRequest request,
      Registry registry) {
    try {
      String proxyClass = request.getRemoteProxyClass();
      if (proxyClass == null) {
        log.fine("No proxy class. Using default");
        proxyClass = RemoteProxy.class.getCanonicalName();
      }
      Class<?> clazz = Class.forName(proxyClass);
      log.fine("Using class " + clazz.getName());
      Object[] args = new Object[] {request, registry};
      Class<?>[] argsClass = new Class[] {RegistrationRequest.class, Registry.class};
      Constructor<?> c = clazz.getConstructor(argsClass);
      Object proxy = c.newInstance(args);
      if (proxy instanceof RemoteProxy) {
        ((RemoteProxy) proxy).setupTimeoutListener();
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
    if (this == obj) return true;
    if (obj == null) return false;
    if (getClass() != obj.getClass()) return false;
    RemoteProxy other = (RemoteProxy) obj;
    if (getId() == null) {
      if (other.getId() != null) return false;
    } else if (!getId().equals(other.getId())) return false;
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
    return "host :" + getRemoteHost() + (timeOut != -1 ? " time out : " + timeOut : "");
  }

  private final HtmlRenderer renderer = new DefaultHtmlRenderer(this);

  public HtmlRenderer getHtmlRender() {
    return renderer;
  }

  /**
   * im millis
   * 
   * @return an int
   */
  public int getTimeOut() {
    return timeOut;
  }


  public HttpClientFactory getHttpClientFactory() {
    return getRegistry().getHttpClientFactory();
  }
}
