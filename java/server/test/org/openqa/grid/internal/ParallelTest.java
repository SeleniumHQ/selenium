package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;
import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import org.testng.internal.thread.ThreadTimeoutException;

@Test(singleThreaded = true,timeOut=10000)
public class ParallelTest {

	RemoteProxy p1 = null;
	RegistrationRequest req = null;
	Map<String, Object> app1 = new HashMap<String, Object>();
	Map<String, Object> app2 = new HashMap<String, Object>();

	@BeforeClass(alwaysRun = true)
	public void prepareReqRequest() {

		Map<String, Object> config = new HashMap<String, Object>();
		app1.put(APP, "app1");
		app1.put(MAX_INSTANCES, 5);

		app2.put(APP, "app2");
		app2.put(MAX_INSTANCES, 1);

		config.put(REMOTE_URL, "http://machine1:4444");
		config.put(MAX_SESSION, 5);

		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.addDesiredCapabilitiy(app2);
		req.setConfiguration(config);
	}

	/**
	 * create and register a proxy than can host up to 5 tests at the same time.
	 * - of type app1 ( max 5 tests at the same time ) could be Firefox for
	 * instance - of type app2 ( max 1 test ) could be IE
	 */
	@BeforeMethod(alwaysRun = true)
	public void prepareProxy() {
		p1 = new RemoteProxy(req);
	}

	@Test
	public void canGetApp2() throws InterruptedException {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);
			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
			newSessionRequest.process();
		} finally {
			registry.stop();
		}

	}

	/**
	 * cannot reserve 2 app2
	 */
	@Test(timeOut = 1000, expectedExceptions = ThreadTimeoutException.class)
	public void cannotGet2App2() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);
			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
			newSessionRequest.process();
			MockedRequestHandler newSessionRequest2 = new MockedNewSessionRequestHandler(registry, app2);
			newSessionRequest2.process();
		} finally {
			registry.stop();
		}
	}

	/**
	 * can reserve 5 app1
	 */
	@Test(timeOut = 2000)
	public void canGet5App1() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);
			for (int i = 0; i < 5; i++) {
				MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
				newSessionRequest.process();
			}
		} finally {
			registry.stop();
		}
	}

	/**
	 * cannot get 6 app1
	 */
	@Test(timeOut = 1000, expectedExceptions = ThreadTimeoutException.class)
	public void cannotGet6App1() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);
			for (int i = 0; i < 6; i++) {
				MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
				newSessionRequest.process();
			}
		} finally {
			registry.stop();
		}
	}

	/**
	 * cannot get app2 if 5 app1 are reserved.
	 */
	@Test(timeOut = 1000, expectedExceptions = ThreadTimeoutException.class)
	public void cannotGetApp2() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);

			for (int i = 0; i < 5; i++) {
				MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
				newSessionRequest.process();
			}
			
			
			
			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
			newSessionRequest.process();
		} finally {
			registry.stop();
		}
	}

	@Test(invocationCount=100,threadPoolSize=100,timeOut=5000)
	public void releaseAndReserve() throws InterruptedException {
		Registry registry = Registry.getNewInstanceForTestOnly();
		RemoteProxy p1 = null;
		RegistrationRequest req = null;
		Map<String, Object> app1 = new HashMap<String, Object>();
		Map<String, Object> app2 = new HashMap<String, Object>();
		Map<String, Object> config = new HashMap<String, Object>();
		app1.put(APP, "app1");
		app1.put(MAX_INSTANCES, 5);

		app2.put(APP, "app2");
		app2.put(MAX_INSTANCES, 1);

		config.put(REMOTE_URL, "http://machine1:4444");
		config.put(MAX_SESSION, 5);

		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.addDesiredCapabilitiy(app2);
		req.setConfiguration(config);
		
		
		try {
			p1 = new RemoteProxy(req);
			registry.add(p1);

			// reserve 5 app1
			List<TestSession> used = new ArrayList<TestSession>();
			for (int i = 0; i < 5; i++) {
				MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
				newSessionRequest.process();
				used.add(newSessionRequest.getTestSession());
			}

			Assert.assertEquals(registry.getActiveSessions().size(), 5);

			// release them
			for (TestSession session : used) {
				session.terminateSyncronousFOR_TEST_ONLY();
			}
			Assert.assertEquals(registry.getActiveSessions().size(), 0);
			used.clear();

			

			// reserve them again
			for (int i = 0; i < 5; i++) {
				int original = registry.getActiveSessions().size();
				Assert.assertEquals(original, i);
				MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
				newSessionRequest.process();
				TestSession session =newSessionRequest.getTestSession(); 
				used.add(session);
			}

			Assert.assertEquals(registry.getActiveSessions().size(), 5);

			used.get(0).terminateSyncronousFOR_TEST_ONLY();

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
			newSessionRequest.process();
			newSessionRequest.getTestSession(); 
			Assert.assertEquals(registry.getActiveSessions().size(), 5);
		} finally {
			registry.stop();
		}

	}

}
