package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;


/**
 * Check that 1 type of request doesn't block other requests.
 * 
 * For a hub capable of handling 1 FF and 1 IE for instance, if the hub already
 * built a queue of FF requests and a IE request is recieved it should be
 * processed right away and not blocked by the FF queue.
 * 
 * 
 */


@Test(timeOut=10000)
public class ConcurrencyLock {

	private Registry registry = Registry.getNewInstanceForTestOnly();

	Map<String, Object> ie = new HashMap<String, Object>();
	Map<String, Object> ff = new HashMap<String, Object>();

	RemoteProxy p1;
	RemoteProxy p2;

	/**
	 * create a hub with 1 IE and 1 FF
	 */
	@BeforeClass(alwaysRun = true)
	public void setup() {
		ie.put(APP, "IE");
		ff.put(APP, "FF");

		p1 = RemoteProxyFactory.getNewBasicRemoteProxy(ie, "http://machine1:4444");
		p2 = RemoteProxyFactory.getNewBasicRemoteProxy(ff, "http://machine2:4444");
		registry.add(p1);
		registry.add(p2);

	}

	@DataProvider(name = "cap", parallel = true)
	Object[][] createData1() {
		return new Object[][] { { ff }, { ff }, { ff }, { ie } };
	}

	private List<String> results = new ArrayList<String>();

	@Test(dataProvider = "cap")
	public void runTests(Map<String, Object> cap) throws InterruptedException {
		
		MockedRequestHandler newSessionRequest = new MockedRequestHandler(registry);
		newSessionRequest.setRequestType(RequestType.START_SESSION);
		newSessionRequest.setDesiredCapabilities(cap);
		
		if (cap.get(APP).equals("FF")) {
			// start the FF right away	
			newSessionRequest.process();
			TestSession s = newSessionRequest.getTestSession();
			Thread.sleep(2000);
			results.add("FF");
			s.terminateSyncronousFOR_TEST_ONLY();
		} else {
			// wait for 1 sec before starting IE to make sure the FF proxy is
			// busy with the 3 FF requests.
			Thread.sleep(1000);
			newSessionRequest.process();
			results.add("IE");
		}
		// at that point, the hub has recieved first 3 FF requests that are
		// queued and 1 IE request 1sec later, after the FF are already blocked
		// in the queue.The blocked FF request shouldn't block IE from starting,
		// so IE should be done first.
	}

	@Test(dependsOnMethods = "runTests")
	public void validation() {
		Assert.assertEquals(results.size(), 4);
		Assert.assertEquals(results.get(0), "IE");
		Assert.assertEquals(results.get(1), "FF");
		Assert.assertEquals(results.get(2), "FF");
		Assert.assertEquals(results.get(3), "FF");
	}
	
	@AfterClass(alwaysRun=true)
	public void teardown(){
		registry.stop();
	}

}
