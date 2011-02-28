package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.grid.common.RegistrationRequest;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;


public class RemoteProxyTest {

	RemoteProxy p1 = null;
	RemoteProxy p2 = null;

	Map<String, Object> app1Capability = new HashMap<String, Object>();
	Map<String, Object> app2Capability = new HashMap<String, Object>();

	@BeforeClass
	public void setup() {
		app1Capability.put(APP, "app1");
		app2Capability.put(APP, "app2");

		p1 = RemoteProxyFactory.getNewBasicRemoteProxy(app1Capability, "http://machine1:4444/");
		List<Map<String, Object>> caps = new ArrayList<Map<String,Object>>();
		caps.add(app1Capability);
		caps.add(app2Capability);
		p2 = RemoteProxyFactory.getNewBasicRemoteProxy(caps, "http://machine4:4444/");

	}

	@Test
	public void testEqual() {
		Assert.assertTrue(p1.equals(p1));
		Assert.assertFalse(p1.equals(p2));
	}

	@Test(expectedExceptions = GridException.class)
	public void create() {
		Map<String, Object> cap = new HashMap<String, Object>();
		cap.put(APP, "corrupted");

		Map<String, Object> config = new HashMap<String, Object>();
		config.put(REMOTE_URL, "ebay.com");

		RegistrationRequest request = new RegistrationRequest();
		request.addDesiredCapabilitiy(cap);
		request.setConfiguration(config);

		new RemoteProxy(request);
	}
	
	

}
