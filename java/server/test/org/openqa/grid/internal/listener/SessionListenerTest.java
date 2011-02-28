package org.openqa.grid.internal.listener;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.CLEAN_UP_CYCLE;
import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.TIME_OUT;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.TestSessionListener;
import org.openqa.grid.internal.listeners.TimeoutListener;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import org.testng.internal.thread.ThreadTimeoutException;

public class SessionListenerTest {

	class MyRemoteProxy extends RemoteProxy implements TestSessionListener {

		public MyRemoteProxy(RegistrationRequest request) {
			super(request);
		}

		public void afterSession(TestSession session) {
			session.put("FLAG", false);

		}

		public void beforeSession(TestSession session) {
			session.put("FLAG", true);
		}
	}

	RegistrationRequest req = null;
	Map<String, Object> app1 = new HashMap<String, Object>();
	Map<String, Object> app2 = new HashMap<String, Object>();

	@BeforeClass(alwaysRun = true)
	public void prepare() {
		app1.put(APP, "app1");
		Map<String, Object> config = new HashMap<String, Object>();
		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.setConfiguration(config);

	}

	@Test
	public void beforeAfterRan() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		registry.add(new MyRemoteProxy(req));

		MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, app1);
		req.process();
		TestSession session = req.getTestSession();
		Assert.assertEquals(session.get("FLAG"), true);
		session.terminate();
		try {
			Thread.sleep(250);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		Assert.assertEquals(session.get("FLAG"), false);
	}

	/**
	 * buggy proxy that will throw an exception the first time beforeSession is
	 * called.
	 * 
	 * @author Franзois Reynaud
	 * 
	 */
	class MyBuggyBeforeRemoteProxy extends RemoteProxy implements TestSessionListener {

		private boolean firstCall = true;

		public MyBuggyBeforeRemoteProxy(RegistrationRequest request) {
			super(request);
		}

		public void afterSession(TestSession session) {
		}

		public void beforeSession(TestSession session) {
			if (firstCall) {
				firstCall = false;
				throw new NullPointerException();
			}
		}
	}

	/**
	 * if before throws an exception, the resources are released for other tests
	 * to use.
	 * @throws InterruptedException 
	 */
	@Test(timeOut=5000)
	public void buggyBefore() throws InterruptedException {
		Registry registry = Registry.getNewInstanceForTestOnly();
		registry.add(new MyBuggyBeforeRemoteProxy(req));

		MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, app1);
		req.process();
		// reserve throws an exception, that calls session.terminate, which is
		// in a separate thread. Gives some time for this thread to finish
		// before doing the validations
		while (registry.getActiveSessions().size()!=0){
			Thread.sleep(250);
		}
		
		Assert.assertEquals(registry.getActiveSessions().size(), 0);

		req.process();
		
		TestSession session = req.getTestSession();
		Assert.assertNotNull(session);
		Assert.assertEquals(registry.getActiveSessions().size(), 1);

	}

	/**
	 * buggy proxy that will throw an exception the first time beforeSession is
	 * called.
	 * 
	 * @author Franзois Reynaud
	 * 
	 */
	class MyBuggyAfterRemoteProxy extends RemoteProxy implements TestSessionListener {

		public MyBuggyAfterRemoteProxy(RegistrationRequest request) {
			super(request);
		}

		public void afterSession(TestSession session) {
			throw new NullPointerException();
		}

		public void beforeSession(TestSession session) {
		}
	}

	/**
	 * if after throws an exception, the resources are NOT released got other
	 * tests to use.
	 */
	@Test(timeOut = 500, expectedExceptions = ThreadTimeoutException.class)
	public void buggyAfter() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		registry.add(new MyBuggyAfterRemoteProxy(req));

		MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, app1);
		req.process();
		TestSession session = req.getTestSession();
		Assert.assertEquals(registry.getActiveSessions().size(), 1);
		Assert.assertNotNull(session);
		session.terminate();
		try {
			Thread.sleep(250);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		
		MockedNewSessionRequestHandler req2 = new MockedNewSessionRequestHandler(registry, app1);
		req2.process();
		session = req2.getTestSession();
		
	}

	class SlowAfterSession extends RemoteProxy implements TestSessionListener, TimeoutListener {

		private Lock lock = new ReentrantLock();
		private boolean firstTime = true;

		public SlowAfterSession(RegistrationRequest request) {
			super(request);
		}

		public void afterSession(TestSession session) {
			session.put("after", true);
			try {
				lock.lock();
				if (firstTime) {
					firstTime = false;
				} else {
					session.put("ERROR", "called twice ..");
				}

			} finally {
				lock.unlock();
			}

			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}

		public void beforeSession(TestSession session) {
		}

		public void beforeRelease(TestSession session) {
			session.terminate();
		}
	}

	/**
	 * using a proxy that times out instantly and spends a long time in the
	 * after method. check aftermethod cannot be excecuted twice for a session.
	 * 
	 * @throws InterruptedException
	 */
	@Test
	public void doubleRelease() throws InterruptedException {
		RegistrationRequest req = new RegistrationRequest();
		Map<String, Object> cap = new HashMap<String, Object>();
		cap.put(APP, "app1");

		Map<String, Object> config = new HashMap<String, Object>();
		config.put(TIME_OUT, 1);
		config.put(CLEAN_UP_CYCLE, 1);
		config.put(MAX_SESSION, 2);

		req.addDesiredCapabilitiy(cap);
		req.setConfiguration(config);

		Registry registry = Registry.getNewInstanceForTestOnly();
		registry.add(new SlowAfterSession(req));


		MockedNewSessionRequestHandler r = new MockedNewSessionRequestHandler(registry, app1);
		r.process();
		TestSession session = r.getTestSession();
		
		Thread.sleep(150);
		// the session has timed out -> doing the long after method.
		Assert.assertEquals(session.get("after"), true);

		// manually closing the session, starting a 2nd release process.
		session.terminate();

		// the 2nd release process shouldn't be executed as one is already
		// processed.
		Assert.assertNull(session.get("ERROR"));

	}

}
