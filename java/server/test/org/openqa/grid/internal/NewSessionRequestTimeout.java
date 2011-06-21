package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;

import java.util.HashMap;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;

public class NewSessionRequestTimeout {

	private static Registry registry;
	private static Map<String, Object> ff = new HashMap<String, Object>();
	private static RemoteProxy p1;

	/**
	 * create a hub with 1 IE and 1 FF
	 */
	@BeforeClass
	public static void setup() {
		registry = new Registry();
		ff.put(APP, "FF");

		p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444", registry);
		registry.add(p1);
		// after 1 sec in the queue, request are kicked out.
		registry.setNewSessionWaitTimeout(1000);
	}

	@Test(timeout = 5000, expected = RuntimeException.class)
	public void method() throws InterruptedException {

		// should work
		MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, ff);
		newSessionRequest.process();

		// should throw after 1sec being stuck in the queue
		MockedRequestHandler newSessionRequest2 = new MockedNewSessionRequestHandler(registry, ff);
		newSessionRequest2.process();

	}

	@AfterClass
	public static void teardown() {
		registry.stop();
	}
}
