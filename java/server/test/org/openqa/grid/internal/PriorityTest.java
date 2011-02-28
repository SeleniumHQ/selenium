package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

@Test(timeOut=10000)
public class PriorityTest {

	private Registry registry = Registry.getNewInstanceForTestOnly();

	// priority rule : the request with the highest priority goes first.
	private Prioritizer highestNumberHasPriority = new Prioritizer() {
		public int compareTo(Map<String, Object> a, Map<String, Object> b) {
			int priorityA = Integer.parseInt(a.get("priority").toString());
			int priorityB = Integer.parseInt(b.get("priority").toString());
			return priorityB - priorityA;
		}
	};

	Map<String, Object> ff = new HashMap<String, Object>();
	RemoteProxy p1;

	MockedNewSessionRequestHandler newSessionRequest1;
	MockedNewSessionRequestHandler newSessionRequest2;
	MockedNewSessionRequestHandler newSessionRequest3;
	MockedNewSessionRequestHandler newSessionRequest4;
	MockedNewSessionRequestHandler newSessionRequest5;

	List<MockedRequestHandler> requests = new ArrayList<MockedRequestHandler>();

	/**
	 * create a hub with 1 FF
	 */
	@BeforeClass(alwaysRun = true)
	public void setup() {

		registry.setPrioritizer(highestNumberHasPriority);
		ff.put(APP, "FF");
		p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444");
		registry.add(p1);

		// create 5 sessionRequest, with priority =1 .. 5
		Map<String, Object> ff1 = new HashMap<String, Object>();
		ff1.put(APP, "FF");
		ff1.put("priority", 1);

		Map<String, Object> ff2 = new HashMap<String, Object>();
		ff2.put(APP, "FF");
		ff2.put("priority", 2);

		Map<String, Object> ff3 = new HashMap<String, Object>();
		ff3.put(APP, "FF");
		ff3.put("priority", 3);

		Map<String, Object> ff4 = new HashMap<String, Object>();
		ff4.put(APP, "FF");
		ff4.put("priority", 4);

		Map<String, Object> ff5 = new HashMap<String, Object>();
		ff5.put(APP, "FF");
		ff5.put("priority", 5);

		newSessionRequest1 = new MockedNewSessionRequestHandler(registry, ff1);
		newSessionRequest2 = new MockedNewSessionRequestHandler(registry, ff2);
		newSessionRequest3 = new MockedNewSessionRequestHandler(registry, ff3);
		newSessionRequest4 = new MockedNewSessionRequestHandler(registry, ff4);
		newSessionRequest5 = new MockedNewSessionRequestHandler(registry, ff5);

		requests.add(newSessionRequest1);
		requests.add(newSessionRequest2);
		requests.add(newSessionRequest5);
		requests.add(newSessionRequest3);
		requests.add(newSessionRequest4);

	}

	TestSession session = null;

	// use all the spots ( so 1 ) of the grid so that a queue buils up
	@Test
	public void useAllProxies() {
		MockedRequestHandler newSessionRequest = new MockedRequestHandler(registry);
		newSessionRequest.setRequestType(RequestType.START_SESSION);
		newSessionRequest.setDesiredCapabilities(ff);
		newSessionRequest.process();
		session = newSessionRequest.getTestSession();
	}

	// fill the queue with 5 requests.
	@Test(dependsOnMethods = "useAllProxies")
	public void queueSomeMore() {
		for (MockedRequestHandler h : requests) {
			final MockedRequestHandler req = h;
			new Thread(new Runnable() {
				public void run() {
					req.process();
				}
			}).start();
		}
	}

	// free the grid : the queue is consumed, and the test with the highest
	// priority should be processed.
	@Test(dependsOnMethods = "queueSomeMore")
	public void releaseTheSessionBlockingTheGrid() throws InterruptedException {
		while (registry.getNewSessionRequests().size() != 5) {
			Thread.sleep(100);
		}
		session.terminateSyncronousFOR_TEST_ONLY();

	}

	// validate that the one with priority 5 has been assigned a proxy
	@Test(dependsOnMethods = "releaseTheSessionBlockingTheGrid")
	public void validate() throws InterruptedException {
		Thread.sleep(250);
		Assert.assertNotNull(newSessionRequest5.getTestSession());
	}
	
	
	@AfterClass(alwaysRun=true)
	public void teardown(){
		registry.stop();
	}

}
