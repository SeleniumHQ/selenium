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


// TODO freynaud copy paste from PriorityTestLoad ....
@Test(timeOut=10000)
public class DefaultToFIFOPriorityTest {

	private final static int MAX = 50;
	
	private Registry registry = Registry.getNewInstanceForTestOnly();

	// priority rule : nothing defined = FIFO
	private Prioritizer fifo = null;

	Map<String, Object> ff = new HashMap<String, Object>();
	RemoteProxy p1;
	List<MockedRequestHandler> requests = new ArrayList<MockedRequestHandler>();

	/**
	 * create a hub with 1 FF
	 */
	@BeforeClass(alwaysRun = true)
	public void setup() {

		registry.setPrioritizer(fifo);
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

	// fill the queue with MAX requests.
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
		session.terminateSyncronousFOR_TEST_ONLY();

	}

	// validate that the one with priority 5 has been assigned a proxy
	@Test(dependsOnMethods = "releaseTheSessionBlockingTheGrid")
	public void validate() throws InterruptedException {
		Thread.sleep(250);
		Assert.assertNotNull(requests.get(0).getTestSession());	
		Assert.assertEquals(requests.get(0).getDesiredCapabilities().get("priority"), 1);
	}
	
	
	@AfterClass(alwaysRun=true)
	public void teardown(){
		registry.stop();
	}

}
