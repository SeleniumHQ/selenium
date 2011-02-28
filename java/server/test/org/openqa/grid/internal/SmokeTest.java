package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;

import java.util.HashMap;
import java.util.Map;

import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;



@Test(timeOut=10000)
public class SmokeTest {
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
	
	
	
	
	
	@Test(threadPoolSize=10,invocationCount=10)
	public void method(){
		
		MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry,ie);
		newSessionRequest.process();
		TestSession session = newSessionRequest.getTestSession();

		MockedRequestHandler stopSessionRequest = new MockedRequestHandler(registry);
		stopSessionRequest.setSession(session);
		stopSessionRequest.setRequestType(RequestType.STOP_SESSION);
		stopSessionRequest.process();
		
	}
	
	@AfterClass(alwaysRun=true)
	public void teardown(){
		registry.stop();
	}
}
