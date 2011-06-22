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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.openqa.grid.internal.exception.CapabilityNotPresentOnTheGridException;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.listeners.RegistrationListener;
import org.openqa.grid.internal.listeners.SelfHealingProxy;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;

/**
 * Kernel of the grid. Keeps track of what's happening, what's free/used and
 * assigned resources to incoming requests.
 */
public class Registry {

	public static final String KEY = Registry.class.getName();

	private Prioritizer prioritizer = null;

	private static final Logger log = Logger.getLogger(Registry.class.getName());

	private List<RequestHandler> newSessionRequests = new CopyOnWriteArrayList<RequestHandler>();

	private Hub hub;

	// lock for anything modifying the tests session currently running on this
	// registry.
	private final ReentrantLock lock = new ReentrantLock();
	private final Condition testSessionAvailable = lock.newCondition();

	private final Set<RemoteProxy> proxies = new CopyOnWriteArraySet<RemoteProxy>();
	private final Set<TestSession> activeTestSessions = new CopyOnWriteArraySet<TestSession>();
	private Matcher matcherThread = new Matcher();
	private boolean stop = false;
	private boolean throwOnCapabilityNotPresent = true;
	private int newSessionWaitTimeout;
	
	private GridHubConfiguration configuration;
	

	public Registry() {
		this(null,new GridHubConfiguration());
	}
	public Registry(Hub hub, GridHubConfiguration config) {
		this.hub = hub;
		
		this.newSessionWaitTimeout = config.getNewSessionWaitTimeout();
		this.throwOnCapabilityNotPresent = config.isThrowOnCapabilityNotPresent();
		this.prioritizer = config.getPrioritizer();
		
		this.configuration = config;
		
		matcherThread.start();

		// freynaud : TODO
		// Registry is in a valid state when testSessionAvailable.await(); from
		// assignRequestToProxy is reached. No before.
		try {
			Thread.sleep(250);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}

	public GridHubConfiguration getConfiguration() {
		return configuration;
	}
	/**
	 * how long a session can remains in the newSession queue before being quicked out
	 * @return
	 */
	public int getNewSessionWaitTimeout() {
		return newSessionWaitTimeout;
	}
	public void setNewSessionWaitTimeout(int newSessionWaitTimeout) {
		this.newSessionWaitTimeout = newSessionWaitTimeout;
	}

	/**
	 * iterates the queue of incoming new session request and assign them to
	 * proxy after they've been sorted by priority, with priority defined by the
	 * prioritizer.
	 * 
	 */
	class Matcher extends Thread {
		private boolean cleanState = true;

		@Override
		public void run() {
			try {
				lock.lock();
				assignRequestToProxy();
			} finally {
				lock.unlock();
			}
		}

		/**
		 * let the matcher know that something has been modified in the
		 * registry, and that the current iteration of incoming new session
		 * request should be stop to take the change into account. The change
		 * could be either a new Proxy added, or a session released
		 * 
		 * @param ok
		 */
		public void registryHasBeenModified(boolean ok) {
			this.cleanState = ok;
		}

		/**
		 * @return true if the registry hasn't been modified since the matcher
		 *         started the current iteration.
		 */
		public boolean isRegistryClean() {
			return cleanState;
		}

	}

	public void stop() {
		stop = true;
		matcherThread.interrupt();

		// killing the timeout detection threads.
		for (RemoteProxy proxy : proxies) {
			proxy.teardown();
		}

	}

	public Hub getHub() {
		return hub;
	}

	public void setHub(Hub hub) {
		this.hub = hub;
	}

	public void addNewSessionRequest(RequestHandler request) {
		try {
			lock.lock();

			if (proxies.isEmpty()) {
				if (throwOnCapabilityNotPresent) {
					throw new GridException("Empty pool of VM for setup " + request.getDesiredCapabilities());
				} else {
					log.warning("Empty pool of nodes.");
				}

			}
			if (!contains(request.getDesiredCapabilities())) {

				if (throwOnCapabilityNotPresent) {
					throw new CapabilityNotPresentOnTheGridException(request.getDesiredCapabilities());
				} else {
					log.warning("grid doesn't contain " + request.getDesiredCapabilities() + " at the moment.");
				}

			}
			newSessionRequests.add(request);
			fireEventNewSessionAvailable();
		} finally {
			lock.unlock();
		}
	}

	class QueueIsStateException extends Exception {

		/**
		 * 
		 */
		private static final long serialVersionUID = 1L;

	}

	/**
	 * iterates the list of incoming session request to find a potential match
	 * in the list of proxies. If something changes in the registry, the matcher
	 * iteration is stopped to account for that change.
	 */

	public void assignRequestToProxy() {

		boolean force = false;
		while (!stop) {
			try {
				matcherThread.registryHasBeenModified(true);
				if (force) {
					force = false;
				} else {
					testSessionAvailable.await(5, TimeUnit.SECONDS);
				}
				if (prioritizer != null) {
					Collections.sort(newSessionRequests);
				}
				List<RequestHandler> matched = new ArrayList<RequestHandler>();
				for (RequestHandler request : newSessionRequests) {

					// sort the proxies first, by default by total number of
					// test running, to avoid putting all the load of the first
					// proxies.
					List<RemoteProxy> sorted = new ArrayList<RemoteProxy>(proxies);
					Collections.sort(sorted);

					for (RemoteProxy proxy : sorted) {
						if (!matcherThread.isRegistryClean()) {
							throw new QueueIsStateException();
						}
						TestSession session = proxy.getNewSession(request.getDesiredCapabilities());
						if (session != null) {
							if (!matcherThread.isRegistryClean()) {
								throw new QueueIsStateException();
							}
							matched.add(request);
							boolean ok = activeTestSessions.add(session);
							request.bindSession(session);
							if (!ok) {
								log.severe("Error adding session : " + session);
							}
							break;
						}
					}
				}
				for (RequestHandler req : matched) {
					boolean ok = newSessionRequests.remove(req);
					if (!ok) {
						log.severe("Bug removing request " + req);
					}
				}

			} catch (InterruptedException e) {
				log.info("Shutting down registry.");
			} catch (QueueIsStateException q) {
				log.fine("something modified the queue while the matcher was looking at it.Restarting the iteration from 0.");
				force = true;
			} catch (Throwable t) {
                log.log(Level.SEVERE, "Unhandled exception in Matcher thread.", t);
            }
		}

	}

	/**
	 * mark the session as finished for the registry. The resources that were
	 * associated to it are now free to be reserved by other tests
	 * 
	 * @param session
	 */
	private void release(TestSession session) {
		try {
			lock.lock();
			matcherThread.registryHasBeenModified(false);
			boolean removed = activeTestSessions.remove(session);
			if (removed) {
				fireEventNewSessionAvailable();
			}
		} finally {
			lock.unlock();
		}
	}

	public void release(String internalKey) {
		if (internalKey == null) {
			return;
		}
		for (TestSession session : activeTestSessions) {
			if (internalKey.equals(session.getInternalKey())) {
				release(session);
				return;
			}
		}
		log.warning("Tried to release session with internal key " + internalKey + " but couldn't find it.");
	}

	/**
	 * check if the current proxy pool contains at least one proxy matching the
	 * requested capability
	 * 
	 * @param requestedCapability
	 * @return
	 */
	private boolean contains(Map<String, Object> requestedCapability) {
		for (RemoteProxy proxy : proxies) {
			if (proxy.hasCapability(requestedCapability)) {
				return true;
			}
		}
		return false;
	}

	private List<RemoteProxy> registeringProxies = new CopyOnWriteArrayList<RemoteProxy>();

	/**
	 * Add a proxy to the list of proxy available for the grid to managed and
	 * link the proxy to the registry.
	 * 
	 * @param proxy
	 */
	public void add(RemoteProxy proxy) {
		if (proxy == null){
			return;
		}
		log.fine("adding  " + proxy);
		try {
			lock.lock();

			if (proxies.contains(proxy)) {
				log.warning(String.format("Proxy '%s' was previously registered.  Cleaning up any stale test sessions.", proxy));

				// Find the original proxy. While the supplied one is logically
				// equivalent, it's a fresh object with
				// an empty TestSlot list. Thus there's a disconnection between
				// this proxy and the one associated with
				// any active test sessions.
				for (RemoteProxy p : proxies) {
					if (p.equals(proxy)) {
						proxies.remove(p);
						for (TestSlot slot : p.getTestSlots()) {
							slot.forceRelease();
						}

					}
				}
				// return;
			}

			if (registeringProxies.contains(proxy)) {
				log.warning(String.format("Proxy '%s' is already queued for registration.", proxy));

				return;
			}

			registeringProxies.add(proxy);
			matcherThread.registryHasBeenModified(false);
			fireEventNewSessionAvailable();
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
				fireEventNewSessionAvailable();
			}
		} finally {
			lock.unlock();
		}

	}

	/**
	 * If throwOnCapabilityNotPresent is set to true, the hub will reject test
	 * request for a capability that is not on the grid. No exception will be
	 * thrown if the capability is present but busy.
	 * 
	 * If set to false, the test will be queued hoping a new proxy will register
	 * later offering that capability.
	 * 
	 * @param throwOnCapabilityNotPresent
	 */
	public void setThrowOnCapabilityNotPresent(boolean throwOnCapabilityNotPresent) {
		this.throwOnCapabilityNotPresent = throwOnCapabilityNotPresent;
	}

	public Lock getLock() {
		return lock;
	}

	void fireEventNewSessionAvailable() {
		testSessionAvailable.signalAll();
	}

	public Set<RemoteProxy> getAllProxies() {
		return proxies;
	}

	public List<RemoteProxy> getUsedProxies() {
		List<RemoteProxy> res = new ArrayList<RemoteProxy>();
		for (RemoteProxy proxy : proxies) {
			if (proxy.isBusy()) {
				res.add(proxy);
			}
		}
		return res;
	}

	/**
	 * gets the test session associated to this external key. The external key
	 * is the session used by webdriver.
	 * 
	 * @param externalKey
	 * @return null if the hub doesn't have a node associated to the provided
	 *         externalKey
	 */
	public TestSession getSession(String externalKey) {
		if (externalKey == null) {
			return null;
		}
		for (TestSession session : activeTestSessions) {
			if (externalKey.equals(session.getExternalKey())) {
				return session;
			}
		}
		return null;
	}

	public List<RequestHandler> getNewSessionRequests() {
		return newSessionRequests;
	}

	public Set<TestSession> getActiveSessions() {
		return activeTestSessions;
	}

	public void setPrioritizer(Prioritizer prioritizer) {
		this.prioritizer = prioritizer;
	}

	public Prioritizer getPrioritizer() {
		return prioritizer;
	}

	public RemoteProxy getProxyById(String id) {
		if (id == null) {
			return null;
		}
		for (RemoteProxy p : getAllProxies()) {
			if (id.equals(p.getId())) {
				return p;
			}
		}
		return null;
	}

}
