package org.openqa.grid.plugin;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.PROXY_CLASS;

import java.security.InvalidParameterException;
import java.util.HashMap;
import java.util.Map;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.RemoteProxy;
import org.testng.Assert;
import org.testng.annotations.Test;


public class RemoteProxyInheritanceTest {

	
	@Test
	public void defaultToRemoteProxy() {
		RegistrationRequest req = new RegistrationRequest();
		Map<String, Object> app1 = new HashMap<String, Object>();
		Map<String, Object> config = new HashMap<String, Object>();
		app1.put(APP, "app1");
		
		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.setConfiguration(config);

		// requires Custom1 & Custom1 set in config to work.
		RemoteProxy p = RemoteProxy.getNewInstance(req);
		Assert.assertEquals(p.getClass(), RemoteProxy.class);
	}
	
	
	@Test
	public void existing() {
		RegistrationRequest req = new RegistrationRequest();
		Map<String, Object> app1 = new HashMap<String, Object>();
		Map<String, Object> config = new HashMap<String, Object>();
		app1.put(APP, "app1");
		config.put(PROXY_CLASS, "org.openqa.grid.plugin.MyRemoteProxy");

		config.put("Custom1", "A");
		config.put("Custom2", "B");

		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.setConfiguration(config);

		RemoteProxy p = RemoteProxy.getNewInstance(req);

		Assert.assertEquals(p.getClass(), MyRemoteProxy.class);
		MyRemoteProxy myRemoteProxy = (MyRemoteProxy) p;
		Assert.assertEquals(myRemoteProxy.getCustom1(), "A");
		Assert.assertEquals(myRemoteProxy.getCustom2(), "B");
		Assert.assertEquals(myRemoteProxy.getConfig().get("Custom1"), "A");
		Assert.assertEquals(myRemoteProxy.getConfig().get("Custom2"), "B");

	}
	
	@Test(expectedExceptions=InvalidParameterException.class)
	public void notExisting() {
		RegistrationRequest req = new RegistrationRequest();
		Map<String, Object> app1 = new HashMap<String, Object>();
		Map<String, Object> config = new HashMap<String, Object>();
		app1.put(APP, "app1");
		config.put(PROXY_CLASS, "I Don't exist");

		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.setConfiguration(config);

		RemoteProxy.getNewInstance(req);
	}
	
	@Test(expectedExceptions=InvalidParameterException.class)
	public void notExtendingProxyExisting() {
		RegistrationRequest req = new RegistrationRequest();
		Map<String, Object> app1 = new HashMap<String, Object>();
		Map<String, Object> config = new HashMap<String, Object>();
		app1.put(APP, "app1");
		config.put(PROXY_CLASS, "java.lang.String");


		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.setConfiguration(config);

		RemoteProxy.getNewInstance(req);
	}
	
	// when some mandatory param are missing -> InvalidParameterException
	@Test(expectedExceptions=InvalidParameterException.class)
	public void badConfig() {
		RegistrationRequest req = new RegistrationRequest();
		Map<String, Object> app1 = new HashMap<String, Object>();
		Map<String, Object> config = new HashMap<String, Object>();
		app1.put(APP, "app1");
		config.put(PROXY_CLASS, "I Don't exist");

		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.setConfiguration(config);

		// requires Custom1 & Custom1 set in config to work.
		RemoteProxy.getNewInstance(req);
	}
	
	

}
