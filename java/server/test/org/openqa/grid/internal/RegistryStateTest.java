package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;
import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;

import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;



public class RegistryStateTest {


	static RegistrationRequest req = null;
	static Map<String, Object> app1 = new HashMap<String, Object>();
	static Map<String, Object> app2 = new HashMap<String, Object>();

	/**
	 * create a proxy than can host up to 5 tests at the same time. - of type
	 * app1 ( max 5 tests at the same time ) could be Firefox for instance - of
	 * type app2 ( max 1 test ) could be IE
	 */
	@BeforeClass
	public static void prepareReqRequest() {

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


	

	@Test
	public void sessionIsRemoved() throws InterruptedException {
		Registry registry = new Registry();
		
		RemoteProxy p1 = new RemoteProxy(req,registry);
		
		

		try {
			registry.add(p1);

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest.process();
			TestSession session = newSessionRequest.getTestSession();

			session.terminateSynchronousFOR_TEST_ONLY();
			Assert.assertEquals(0,registry.getActiveSessions().size());
		} finally {
			registry.stop();
		}
	}

	@Test(timeout = 5000)
	public void basichecks() throws InterruptedException {
		Registry registry = new Registry();
		RemoteProxy p1 = new RemoteProxy(req,registry);
		
		try {
			registry.add(p1);

			Assert.assertEquals(0,registry.getActiveSessions().size());
			Assert.assertEquals(1,registry.getAllProxies().size());
			Assert.assertEquals(0,registry.getUsedProxies().size());

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest.process();
			TestSession session = newSessionRequest.getTestSession();

			Assert.assertEquals(1,registry.getActiveSessions().size());
			Assert.assertEquals(1,registry.getAllProxies().size());
			Assert.assertEquals(1,registry.getUsedProxies().size());

			session.terminateSynchronousFOR_TEST_ONLY();
			Assert.assertEquals(0,registry.getActiveSessions().size());
			Assert.assertEquals(1,registry.getAllProxies().size());
			Assert.assertEquals(0,registry.getUsedProxies().size());
		} finally {
			registry.stop();
		}
	}

	@Test(timeout=4000)
	public void sessionIsRemoved2() throws InterruptedException {
		Registry registry = new Registry();
		RemoteProxy p1 = new RemoteProxy(req,registry);
		
		try {
			registry.add(p1);

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest.process();
			TestSession session = newSessionRequest.getTestSession();
			session.terminateSynchronousFOR_TEST_ONLY();
			Assert.assertEquals(0,registry.getActiveSessions().size());
		
		} finally {
			registry.stop();
		}
	}

	@Test(timeout=4000)
	public void sessionByExtKey() throws InterruptedException {
		Registry registry = new Registry();
		RemoteProxy p1 = new RemoteProxy(req,registry);
		
		try {
			registry.add(p1);

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app1);
			newSessionRequest.process();
			TestSession session = newSessionRequest.getTestSession();
			session.setExternalKey("1234");

			TestSession s = registry.getSession("1234");
			Assert.assertNotNull(s);
			Assert.assertEquals(s, session);
			session.terminateSynchronousFOR_TEST_ONLY();
			Assert.assertEquals(0,registry.getActiveSessions().size());

			TestSession s2 = registry.getSession("1234");
			Assert.assertNull(s2);

			Assert.assertEquals(0,registry.getActiveSessions().size());
		} finally {
			registry.stop();
		}
	}

	@Test
	public void sessionByExtKeyNull() {
		Registry registry = new Registry();
		RemoteProxy p1 = new RemoteProxy(req,registry);
		
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
