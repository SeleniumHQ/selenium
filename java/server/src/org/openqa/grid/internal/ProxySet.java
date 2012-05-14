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

import net.jcip.annotations.ThreadSafe;

import org.openqa.grid.common.exception.CapabilityNotPresentOnTheGridException;
import org.openqa.grid.common.exception.GridException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.logging.Logger;

/**
 * A set of RemoteProxies.
 *
 * Obeys the iteration guarantees of CopyOnWriteArraySet
 */
@ThreadSafe
public class ProxySet implements Iterable<RemoteProxy> {

  private final Set<RemoteProxy> proxies = new CopyOnWriteArraySet<RemoteProxy>();

  private static final Logger log = Logger.getLogger(ProxySet.class.getName());
  private volatile boolean throwOnCapabilityNotPresent = true;

  public ProxySet(boolean throwOnCapabilityNotPresent) {
    this.throwOnCapabilityNotPresent = throwOnCapabilityNotPresent;
  }

  /**
   * killing the timeout detection threads.
   */
  public void teardown() {
    for (RemoteProxy proxy : proxies) {
      proxy.teardown();
    }
  }

  public boolean hasCapability(Map<String, Object> requestedCapability) {
    for (RemoteProxy proxy : proxies) {
      if (proxy.hasCapability(requestedCapability)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the specified instance from the proxySet
   * @param proxy The proxy to remove, must be present in this set
   * @return The instance that was removed. Not null.
   */
  public RemoteProxy remove(RemoteProxy proxy) {
    // Find the original proxy. While the supplied one is logically equivalent, it may be a fresh object with
    // an empty TestSlot list, which doesn't figure into the proxy equivalence check.  Since we want to free up
    // those test sessions, we need to operate on that original object.
    for (RemoteProxy p : proxies) {
      if (p.equals(proxy)) {
        proxies.remove(p);
        return p;
      }
    }
    throw new IllegalStateException("Did not contain proxy" + proxy);
  }

  public void add(RemoteProxy proxy) {
    proxies.add(proxy);
  }

  public boolean contains(RemoteProxy o) {
    return proxies.contains(o);
  }

  public List<RemoteProxy> getBusyProxies() {
    List<RemoteProxy> res = new ArrayList<RemoteProxy>();
    for (RemoteProxy proxy : proxies) {
      if (proxy.isBusy()) {
        res.add(proxy);
      }
    }
    return res;
  }

  public RemoteProxy getProxyById(String id) {
    if (id == null) {
      return null;
    }
    for (RemoteProxy p : proxies) {
      if (id.equals(p.getId())) {
        return p;
      }
    }
    return null;
  }


  public boolean isEmpty() {
    return proxies.isEmpty();
  }

  private List<RemoteProxy> getSorted() {
    List<RemoteProxy> sorted = new ArrayList<RemoteProxy>(proxies);
    Collections.sort(sorted);
    return sorted;
  }

  public TestSession getNewSession(Map<String, Object> desiredCapabilities) {
    // sort the proxies first, by default by total number of
    // test running, to avoid putting all the load of the first
    // proxies.
    List<RemoteProxy> sorted = getSorted();

    for (RemoteProxy proxy : sorted) {
      TestSession session = proxy.getNewSession(desiredCapabilities);
      if (session != null) {
        return session;
      }
    }
    return null;
  }

  public Iterator<RemoteProxy> iterator() {
    return proxies.iterator();
  }

  public int size() {
    return proxies.size();
  }

  public void verifyAbilityToHandleDesiredCapabilities(Map<String, Object> desiredCapabilities) {
    if (proxies.isEmpty()) {
      if (throwOnCapabilityNotPresent) {
        throw new GridException("Empty pool of VM for setup " + desiredCapabilities);
      } else {
        log.warning("Empty pool of nodes.");
      }

    }
    if (!hasCapability(desiredCapabilities)) {
      if (throwOnCapabilityNotPresent) {
        throw new CapabilityNotPresentOnTheGridException(desiredCapabilities);
      } else {
        log.warning("grid doesn't contain " + desiredCapabilities +
                    " at the moment.");
      }

    }
  }

  public void setThrowOnCapabilityNotPresent(boolean throwOnCapabilityNotPresent) {
    this.throwOnCapabilityNotPresent = throwOnCapabilityNotPresent;
  }
}
