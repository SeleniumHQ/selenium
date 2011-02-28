package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;
import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;

import java.util.HashMap;
import java.util.Map;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

@Test(singleThreaded=true,timeOut=10000)
public class RegistryStateTest {

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
	 * create a proxy than can host up to 5 tests at the same time. - of type
	 * app1 ( max 5 tests at the same time ) could be Firefox for instance - of
	 * type app2 ( max 1 test ) could be IE
	 */
	@BeforeMethod(alwaysRun = true)
	public void prepareProxy() {
		p1 = new RemoteProxy(req);
	}

	@Test
	public void sessionIsRemoved() throws InterruptedException {
		Registry registry = Registry.getNewInstanceForTestOnly();

		try {
			registry.add(p1);

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest.process();
			TestSession session = newSessionRequest.getTestSession();

			session.terminateSyncronousFOR_TEST_ONLY();
			Assert.assertEquals(registry.getActiveSessions().size(), 0);
		} finally {
			registry.stop();
		}
	}

	@Test(timeOut = 5000)
	public void basichecks() throws InterruptedException {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);

			Assert.assertEquals(registry.getActiveSessions().size(), 0);
			Assert.assertEquals(registry.getAllProxies().size(), 1);
			Assert.assertEquals(registry.getUsedProxies().size(), 0);

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest.process();
			TestSession session = newSessionRequest.getTestSession();

			Assert.assertEquals(registry.getActiveSessions().size(), 1);
			Assert.assertEquals(registry.getAllProxies().size(), 1);
			Assert.assertEquals(registry.getUsedProxies().size(), 1);

			session.terminateSyncronousFOR_TEST_ONLY();
			Assert.assertEquals(registry.getActiveSessions().size(), 0);
			Assert.assertEquals(registry.getAllProxies().size(), 1);
			Assert.assertEquals(registry.getUsedProxies().size(), 0);
		} finally {
			registry.stop();
		}
	}

	@Test(timeOut=4000)
	public void sessionIsRemoved2() throws InterruptedException {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest.process();
			TestSession session = newSessionRequest.getTestSession();
			session.terminateSyncronousFOR_TEST_ONLY();
			Assert.assertEquals(registry.getActiveSessions().size(), 0);
		
		} finally {
			registry.stop();
		}
	}

	@Test(timeOut=4000)
	public void sessionByExtKey() throws InterruptedException {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest.process();
			TestSession session = newSessionRequest.getTestSession();
			session.setExternalKey("1234");

			TestSession s = registry.getSession("1234");
			Assert.assertNotNull(s);
			Assert.assertEquals(s, session);
			session.terminateSyncronousFOR_TEST_ONLY();
			Assert.assertEquals(registry.getActiveSessions().size(), 0);

			TestSession s2 = registry.getSession("1234");
			Assert.assertNull(s2);

			Assert.assertEquals(registry.getActiveSessions().size(), 0);
		} finally {
			registry.stop();
		}
	}

	@Test
	public void sessionByExtKeyNull() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);

			TestSession s = registry.getSession("1234");
			Assert.assertNull(s);

			s = registry.getSession("");
			Assert.assertNull(s);

			s = registry.getSession(null);
			Assert.assertNull(s);
		} finally {
			registry.stop();
		}
	}

}
