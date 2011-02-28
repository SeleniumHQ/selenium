package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.CLEAN_UP_CYCLE;
import static org.openqa.grid.common.RegistrationRequest.TIME_OUT;

import java.util.HashMap;
import java.util.Map;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.listeners.TimeoutListener;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.testng.internal.thread.ThreadTimeoutException;

@Test(timeOut = 10000)
public class SessionTimesOutTest {

	RegistrationRequest req = new RegistrationRequest();
	Map<String, Object> app1 = new HashMap<String, Object>();

	// create a request for a proxy that times out after 0.5 sec.
	@BeforeClass
	public void setup() {

		app1.put(APP, "app1");
		req.addDesiredCapabilitiy(app1);

		Map<String, Object> config = new HashMap<String, Object>();
		// a test is timed out is inactive for more than 0.5 sec.
		config.put(TIME_OUT, 50);

		// every 0.5 sec, the proxy check is something has timed out.
		config.put(CLEAN_UP_CYCLE, 400);

		req.setConfiguration(config);
	}

	class MyRemoteProxyTimeout extends RemoteProxy implements TimeoutListener {

		public MyRemoteProxyTimeout(RegistrationRequest request) {
			super(request);
		}

		public void beforeRelease(TestSession session) {
			return;
		}
	}

	/**
	 * check that the proxy is freed after it times out.
	 * 
	 * @throws InterruptedException
	 */
	@Test(timeOut = 2000)
	public void testTimeout() throws InterruptedException {

		RemoteProxy p1 = new MyRemoteProxyTimeout(req);

		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);
			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);

			newSessionRequest.process();
			TestSession session = newSessionRequest.getTestSession();
			// wait for a timeout
			Thread.sleep(500);

			MockedRequestHandler newSessionRequest2 = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest2.process();
			TestSession session2 = newSessionRequest2.getTestSession();
			Assert.assertNotNull(session2);
			Assert.assertNotSame(session, session2);
		} finally {
			registry.stop();
		}
	}

	private static boolean timeoutDone = false;

	class MyRemoteProxyTimeoutSlow extends RemoteProxy implements TimeoutListener {

		public MyRemoteProxyTimeoutSlow(RegistrationRequest request) {
			super(request);
		}

		public void beforeRelease(TestSession session) {
			try {
				Thread.sleep(1000);
				timeoutDone = true;
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}

	}

	@Test(timeOut = 5000)
	public void testTimeoutSlow() throws InterruptedException {
		RemoteProxy p1 = new MyRemoteProxyTimeoutSlow(req);

		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest.process();
			TestSession session = newSessionRequest.getTestSession();
			// timeout cleanup will start
			Thread.sleep(500);
			// but the session finishes before the timeout cleanup finishes
			session.terminate();

			// wait to have the slow time out process finished
			int i = 0;
			while (timeoutDone == false) {
				if (i >= 4) {
					throw new RuntimeException("should be true");
				}
				Thread.sleep(250);
			}
			Assert.assertTrue(timeoutDone);

			MockedRequestHandler newSessionRequest2 = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest2.process();
			TestSession session2 = newSessionRequest2.getTestSession();
			Assert.assertNotNull(session2);
			Assert.assertTrue(session.equals(session));
			Assert.assertFalse(session2.equals(session));

		} finally {
			registry.stop();
		}
	}

	class MyBuggyRemoteProxyTimeout extends RemoteProxy implements TimeoutListener {

		public MyBuggyRemoteProxyTimeout(RegistrationRequest request) {
			super(request);
		}

		public void beforeRelease(TestSession session) {
			throw new NullPointerException();
		}
	}

	@Test(timeOut = 1000, expectedExceptions = ThreadTimeoutException.class)
	public void testTimeoutBug() throws InterruptedException {

		RemoteProxy p1 = new MyBuggyRemoteProxyTimeout(req);

		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest.process();
			// wait for a timeout
			Thread.sleep(500);

			MockedRequestHandler newSessionRequest2 = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest2.process();
			TestSession session = newSessionRequest2.getTestSession();
			Assert.assertNull(session);
		} finally {
			registry.stop();
		}
	}

	class MyStupidConfig extends RemoteProxy implements TimeoutListener {

		public MyStupidConfig(RegistrationRequest request) {
			super(request);
		}

		public void beforeRelease(TestSession session) {
			session.put("FLAG", true);
		}
	}

	// timeout || cycle
	@DataProvider(name = "stupidConfig")
	public Object[][] config() {
		return new Object[][] {
		// correct config, just to check something happens
				{ 5, 5 },
				// and invalid ones
				{ -1, 5 }, { 5, -1 }, { -1, -1 }, { 0, 0 } };
	}

	@Test(timeOut = 2000, dataProvider = "stupidConfig")
	public void stupidConfig(int timeout, int cycle) throws InterruptedException {
		Registry registry = Registry.getNewInstanceForTestOnly();

		RegistrationRequest req = new RegistrationRequest();
		Map<String, Object> app1 = new HashMap<String, Object>();
		app1.put(APP, "app1");
		req.addDesiredCapabilitiy(app1);
		Map<String, Object> config = new HashMap<String, Object>();

		config.put(TIME_OUT, timeout);
		config.put(CLEAN_UP_CYCLE, cycle);

		req.setConfiguration(config);

		registry.add(new MyStupidConfig(req));
		MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
		newSessionRequest.process();
		TestSession session = newSessionRequest.getTestSession();
		// wait -> timed out and released.
		Thread.sleep(500);
		boolean shouldTimeout = timeout > 0 && cycle > 0;

		if (shouldTimeout) {
			Assert.assertEquals(session.get("FLAG"), true);
			Assert.assertNull(session.getSlot().getSession());
		} else {
			Assert.assertNull(session.get("FLAG"));
			Assert.assertNotNull(session.getSlot().getSession());
		}
	}

}
