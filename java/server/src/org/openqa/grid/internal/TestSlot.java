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

import java.security.InvalidParameterException;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Logger;

import org.openqa.grid.internal.listeners.TestSessionListener;
import org.openqa.grid.internal.utils.CapabilityMatcher;

/**
 * The entity on a proxy that can host a test session. A test slot has only 1
 * desired capabilities ( firefox or chrome for instance, but if a remoteproxy
 * needs to support both, the remoteproxy will need 2 TestSlots ) A TestSlot can
 * host 1 TestSession max at a time.
 * 
 * The listener ({@link TestSessionListener} attached to the test session of
 * this test slot is thread safe. If 2 threads are trying to execute the before
 * / after session, only 1 will be executed.The other one will be discarded.
 * 
 * 
 */
public class TestSlot {

	private static final Logger log = Logger.getLogger(TestSlot.class.getName());

	private final Map<String, Object> capabilities;
	private final RemoteProxy proxy;
	private final CapabilityMatcher matcher;
	private TestSession currentSession;

	private final Lock lock = new ReentrantLock();
	boolean beingReleased = false;

	public TestSlot(RemoteProxy proxy, Map<String, Object> capabilities) {
		this.proxy = proxy;
		CapabilityMatcher c = proxy.getCapabilityHelper();
		if (c == null) {
			throw new InvalidParameterException("the proxy needs to have a valid " + "capabilityMatcher to support have some testslots attached to it");
		}
		matcher = proxy.getCapabilityHelper();
		this.capabilities = capabilities;

	}

	public Map<String, Object> getCapabilities() {
		return capabilities;
	}

	/**
	 * 
	 * @return the RemoteProxy that hosts this slot.
	 */
	public RemoteProxy getProxy() {
		return proxy;
	}

	/**
	 * Try to get a new session for the test slot for the desired capability. To
	 * define if the testslot can host the desired capabilites,
	 * {@link CapabilityMatcher#matches(Map, Map)} is invoked.
	 * 
	 * Use {@link RemoteProxy#setCapabilityHelper(CapabilityMatcher)} on the
	 * proxy histing the test slot to modify the definition of match
	 * 
	 * @param desiredCapabilities
	 * @return a new session linked to that testSlot if possible, null
	 *         otherwise.
	 */
	public TestSession getNewSession(Map<String, Object> desiredCapabilities) {
		try {
			lock.lock();
			if (currentSession != null) {
				return null;
			} else {
				if (matches(desiredCapabilities)) {
					TestSession session = new TestSession(this, desiredCapabilities);
					currentSession = session;
					return session;
				} else {
					return null;
				}
			}
		} finally {
			lock.unlock();
		}

	}

	/**
	 * 
	 * @param desiredCapabilities
	 * @return true if the desired capabilties matches for the
	 *         {@link RemoteProxy#getCapabilityHelper()}
	 */
	boolean matches(Map<String, Object> desiredCapabilities) {
		return matcher.matches(capabilities, desiredCapabilities);
	}

	/**
	 * get the test session currently executed on this test slot.
	 * 
	 * @return the session. Null if the slot is not used at the moment.
	 */
	public TestSession getSession() {
		return currentSession;
	}

	/**
	 * Starts the release process for the TestSlot. Once the release process has
	 * started, the clients can't access the testslot any more, but the slot
	 * can't be reserved for another test until finishReleaseProcess is called.
	 * 
	 * That gives time to run exactly once the cleanup operation needed using @see
	 * {@link TestSessionListener#afterSession(TestSession)}
	 * 
	 * @see TestSlot#finishReleaseProcess()
	 * 
	 * @return true if that's the first thread trying to release this test slot,
	 *         false otherwise.
	 */
	private boolean startReleaseProcess() {
		try {
			lock.lock();
			if (beingReleased) {
				return false;
			} else {
				beingReleased = true;
				return true;
			}
		} finally {
			lock.unlock();
		}
	}

	/**
	 * releasing all the resources. The slot can now be reused.
	 */
	private void finishReleaseProcess() {
		try {
			lock.lock();
			currentSession = null;
			beingReleased = false;
		} finally {
			lock.unlock();
		}
	}

	private boolean showWarning = false;

	/**
	 * Release the test slot. Free the resource on the slot itself and the
	 * registry. If also invokes the
	 * {@link TestSessionListener#afterSession(TestSession)} if applicable.
	 */
	void _release() {
		if (currentSession == null) {
			return;
		}

		boolean okToContinue = startReleaseProcess();
		if (!okToContinue) {
			return;
		}
		// run the pre-release listener
		try {
			if (proxy instanceof TestSessionListener) {
				if (showWarning && proxy.getMaxNumberOfConcurrentTestSessions() != 1) {
					log.warning("WARNING : using a afterSession on a proxy that can support multiple tests is risky.");
					showWarning = false;
				}
				((TestSessionListener) proxy).afterSession(currentSession);
			}
		} catch (Throwable t) {
			log.severe("Error running afterSession for " + currentSession + " the test slot is now dead.");
			t.printStackTrace();
			return;
		}

		// forceRelease doesn't check anything and wll set currentSession to
		// null.
		String internalKey = currentSession == null ? null : currentSession.getInternalKey();

		try {
			proxy.getRegistry().getLock().lock();
			// release resources on the test slot.
			finishReleaseProcess();
			// update the registry.
			proxy.getRegistry().release(internalKey);
		} finally {
			proxy.getRegistry().getLock().unlock();
		}

	}

	/**
	 * releasing the testslot, WITHOUT running any listener.
	 */
	public void forceRelease() {
		if (currentSession == null) {
			return;
		}

		String internalKey = currentSession.getInternalKey();
		currentSession = null;
		proxy.getRegistry().release(internalKey);
		beingReleased = false;

	}

	/**
	 * releasing the test slot, running the afterSession listener if specified.
	 */
	public void release() {
		new Thread(new Runnable() {
			public void run() {
				_release();
			}
		}).start();
	}

	@Override
	public String toString() {
		return currentSession == null ? "no session" : currentSession.toString();
	}

}
