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
import org.testng.Reporter;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * Grid with only 1 node. Sending MAX thread in it to load the queue and keep it
 * ordered.
 * 
 * 
 */
@Test(timeOut = 10000)
public class PriorityTestLoad {

	private final static int MAX = 100;

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

		for (int i = 1; i <= MAX; i++) {
			Map<String, Object> cap = new HashMap<String, Object>();
			cap.put(APP, "FF");
			cap.put("priority", i);
			MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, cap);
			requests.add(req);
		}
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

	private boolean reqDone = false;

	// fill the queue with MAX requests.
	@Test(dependsOnMethods = "useAllProxies")
	public void queueSomeMore() {
		for (MockedRequestHandler h : requests) {
			final MockedRequestHandler req = h;
			new Thread(new Runnable() {
				public void run() {
					req.process();
					reqDone = true;
					Reporter.log("exec : "+req.getDesiredCapabilities());
				}
			}).start();
		}
	}

	// free the grid : the queue is consumed, and the test with the highest
	// priority should be processed.
	@Test(dependsOnMethods = "queueSomeMore")
	public void releaseTheSessionBlockingTheGrid() throws InterruptedException {
		// wait for all the request to reach the queue.
		while (registry.getNewSessionRequests().size()!=MAX){
			Thread.sleep(250);
		}
		Reporter.log("queue size : "+registry.getNewSessionRequests().size());
		session.terminateSyncronousFOR_TEST_ONLY();

	}

	// validate that the one with priority 5 has been assigned a proxy
	@Test(dependsOnMethods = "releaseTheSessionBlockingTheGrid", timeOut = 5000)
	public void validate() throws InterruptedException {
		// using a flag here. The queue contains all the requests.
		// when releaseTheSessionBlockingTheGrid is executed, 1 slot is
		// freed.The iteration over the queue to sort + find the match isn't
		// instant.
		while (!reqDone) {
			Thread.sleep(20);
		}
		Assert.assertNotNull(requests.get(requests.size() - 1).getTestSession());
		Assert.assertEquals(requests.get(requests.size() - 1).getDesiredCapabilities().get("priority"), MAX);
	}

	@AfterClass(alwaysRun = true)
	public void teardown() {
		registry.stop();
	}

}
