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
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Logger;

import org.openqa.grid.internal.exception.CapabilityNotPresentOnTheGridException;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.listeners.RegistrationListener;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;

/**
 * Kernel of the grid. Keeps track of what's happening, what's free/used and
 * assigned resources to incoming requests.
 */
public class Registry {

	private Prioritizer prioritizer = null;

	private static final Logger log = Logger.getLogger(Registry.class.getName());

  private List<RequestHandler> newSessionRequests = new ArrayList<RequestHandler>();

	private static Registry INSTANCE = null;// new Registry();
	private Hub hub;

	// lock for anything modifying the tests session currently running on this
	// regitry.
	private final ReentrantLock lock = new ReentrantLock();
	private final Condition testSessionAvailable = lock.newCondition();

	private final Set<RemoteProxy> proxies = new CopyOnWriteArraySet<RemoteProxy>();
	private final Set<TestSession> activeTestSessions = new CopyOnWriteArraySet<TestSession>();
	private Thread matcherThread;
	private boolean stop = false;

	private Registry() {
		matcherThread = new Thread(new Runnable() {
			public void run() {
				try {
					lock.lock();
					assignRequestToProxy();
				} finally {
					lock.unlock();
				}

			}
		});
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

	public void stop() {
		stop = true;
		matcherThread.interrupt();

		// killing the timeout detection threads.
		for (RemoteProxy proxy : proxies) {
			proxy.teardown();
		}

	}

	public static synchronized Registry getInstance() {
		if (INSTANCE == null) {
			INSTANCE = new Registry();
		}
		return INSTANCE;
	}

	public Hub getHub() {
		return hub;
	}

	public static Registry getNewInstanceForTestOnly() {
		return new Registry();
	}

	public void setHub(Hub hub) {
		this.hub = hub;
	}

	public void addNewSessionRequest(RequestHandler request) {
		try {
			lock.lock();

			if (proxies.isEmpty()) {
				throw new GridException("Empty pool of VM for setup " + request.getDesiredCapabilities());
			}
			if (!contains(request.getDesiredCapabilities())) {
				throw new CapabilityNotPresentOnTheGridException(request.getDesiredCapabilities());
			}
			newSessionRequests.add(request);
			fireEventNewSessionAvailable();
		} finally {
			lock.unlock();
		}
	}

	public void assignRequestToProxy() {

		while (!stop) {
			try {
				// testSessionAvailable.await(250,TimeUnit.MILLISECONDS);
				testSessionAvailable.await();
				if (prioritizer != null) {
					Collections.sort(newSessionRequests);
				}
				List<RequestHandler> matched = new ArrayList<RequestHandler>();
				for (RequestHandler request : newSessionRequests) {
					List<RemoteProxy> sorted = new ArrayList<RemoteProxy>(proxies);
					Collections.sort(sorted);
					for (RemoteProxy proxy : sorted) {
						TestSession session = proxy.getNewSession(request.getDesiredCapabilities());
						if (session != null) {
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
		log.fine("adding  " + proxy);
		try {
			lock.lock();
			if (proxies.contains(proxy) || registeringProxies.contains(proxy)) {
				log.warning("proxy " + proxy + " was already present.");
				return;
			} else {
				registeringProxies.add(proxy);
				proxy.setRegistry(this);
				fireEventNewSessionAvailable();
			}
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
				proxies.add(proxy);
				fireEventNewSessionAvailable();
			}
		} finally {
			lock.unlock();
		}

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

}
