package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;
import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;

import java.util.HashMap;
import java.util.Map;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

@Test(timeOut=10000)
public class LoadBalancedTests {

	private Registry registry = Registry.getNewInstanceForTestOnly();
	private RegistrationRequest request = new RegistrationRequest();
	private Map<String, Object> ff = new HashMap<String, Object>();

	@BeforeClass
	public void setup() {
		// A request that will create a proxy with 5 slots. Each slot can host a
		// firefox.
		Map<String, Object> config = new HashMap<String, Object>();
		ff.put(APP, "firefox");
		ff.put(MAX_INSTANCES, 5);
		request.addDesiredCapabilitiy(ff);
		
		config.put(MAX_SESSION, 5);
		
		

		// add 5 proxies. Total = 5 proxies * 5 slots each = 25 firefox.
		for (int i = 0; i < 5; i++) {
			config.put(REMOTE_URL, "http://machine"+i+":4444");
			request.setConfiguration(config);
			registry.add(new RemoteProxy(request));
		}
	}

	@Test
	public void newSessionSpreadOnAllProxies() {
		
		// request 5 slots : it should spread the load to 1 FF per proxy.
		for (int i = 0; i < 5; i++) {
			MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, ff);
			req.process();
			TestSession session = req.getTestSession();
			
			Assert.assertNotNull(session);
			Assert.assertEquals(session.getSlot().getProxy().getTotalUsed(),1);
		}
		
		// 2 ff per proxy.
		for (int i = 0; i < 5; i++) {
			MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, ff);
			req.process();
			TestSession session = req.getTestSession();
			Assert.assertNotNull(session);
			Assert.assertEquals(session.getSlot().getProxy().getTotalUsed(),2);
			// and release
			session.terminateSyncronousFOR_TEST_ONLY();
		}
		
		// at that point, 1 FF per proxy
		for (int i = 0; i < 5; i++) {
			MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, ff);
			req.process();
			TestSession session = req.getTestSession();
			Assert.assertNotNull(session);
			Assert.assertEquals(session.getSlot().getProxy().getTotalUsed(),2);

		}
	}
	
	@AfterClass(alwaysRun=true)
	public void teardown(){
		registry.stop();
	}
}
