package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;


/**
 * Grid with only 1 node. Sending MAX thread in it to load the queue and keep it
 * ordered.
 * 
 */
public class PriorityTestLoad {

	private final static int MAX = 100;

	private static Registry registry;

	// priority rule : the request with the highest priority goes first.
	private static Prioritizer highestNumberHasPriority = new Prioritizer() {
		public int compareTo(Map<String, Object> a, Map<String, Object> b) {
			int priorityA = Integer.parseInt(a.get("_priority").toString());
			int priorityB = Integer.parseInt(b.get("_priority").toString());
			return priorityB - priorityA;
		}
	};

	static Map<String, Object> ff = new HashMap<String, Object>();
	static RemoteProxy p1;
	static List<MockedRequestHandler> requests = new ArrayList<MockedRequestHandler>();

	/**
	 * create a hub with 1 FF
	 * @throws InterruptedException 
	 */
	@BeforeClass
	public static void setup() throws InterruptedException {
		registry = new Registry();
		registry.setPrioritizer(highestNumberHasPriority);
		ff.put(APP, "FF");
		p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine1:4444",registry);
		registry.add(p1);

		for (int i = 1; i <= MAX; i++) {
			Map<String, Object> cap = new HashMap<String, Object>();
			cap.put(APP, "FF");
			cap.put("_priority", i);
			MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, cap);
			requests.add(req);
		}
		
		// use all the proxies
		MockedRequestHandler newSessionRequest = new MockedRequestHandler(registry);
		newSessionRequest.setRequestType(RequestType.START_SESSION);
		newSessionRequest.setDesiredCapabilities(ff);
		newSessionRequest.process();
		TestSession session = newSessionRequest.getTestSession();
		
		// and keep adding request in the queue.
		for (MockedRequestHandler h : requests) {
			final MockedRequestHandler req = h;
			new Thread(new Runnable() {
				public void run() {
					req.process();
					reqDone = true;
				}
			}).start();
		}
		
		// wait for all the request to reach the queue.
		while (registry.getNewSessionRequests().size()!=MAX){
			Thread.sleep(250);
		}
		
		// release the initial request.
		session.terminateSynchronousFOR_TEST_ONLY();
	}

	private static boolean reqDone = false;

	
	// validate that the one with priority MAX has been assigned a proxy
	@Test(timeout = 5000)
	public void validate() throws InterruptedException {
		// using a flag here. The queue contains all the requests.
		// when release is executed, 1 slot is
		// freed.The iteration over the queue to sort + find the match isn't
		// instant.
		while (!reqDone) {
			Thread.sleep(20);
		}
		Assert.assertNotNull(requests.get(requests.size() - 1).getTestSession());
		Assert.assertEquals(requests.get(requests.size() - 1).getDesiredCapabilities().get("_priority"), MAX);
	}

	@AfterClass
	public static void teardown() {
		registry.stop();
	}

}
