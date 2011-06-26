package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;

import java.util.HashMap;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;

public class NewRequestCrashesDuringNewSessionTest {

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

	}

	/**
	 * check the normal scenario works
	 */
	@Test(timeout = 1000)
	public void basic() throws InterruptedException {
		// should work
		MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, ff);
		newSessionRequest.process();
		TestSession s = newSessionRequest.getTestSession();
		Assert.assertNotNull(s);
		s.terminate();
		Assert.assertEquals(0, registry.getNewSessionRequests().size());
	}

	/**
	 * check that a crashes during the new session request handling doesn't
	 * result in a corrupted state
	 * 
	 * @throws InterruptedException
	 */
	@Test(timeout = 1000)
	public void requestIsremovedFromTheQeueAfterItcrashes() throws InterruptedException {
		// should work
		try {
			MockedRequestHandler newSessionRequest = new MockedBuggyNewSessionRequestHandler(registry, ff);
			newSessionRequest.process();
		} catch (RuntimeException e) {
			System.out.println(e.getMessage());
		}

		Assert.assertEquals(0, registry.getNewSessionRequests().size());
	}

	@AfterClass
	public static void teardown() {
		registry.stop();
	}

	class MockedBuggyNewSessionRequestHandler extends MockedNewSessionRequestHandler {

		public MockedBuggyNewSessionRequestHandler(Registry registry, Map<String, Object> desiredCapabilities) {
			super(registry, desiredCapabilities);
		}

		@Override
		public String forwardNewSessionRequest(TestSession session) {
			throw new RuntimeException("something horrible happened.");
		}

	}
}
