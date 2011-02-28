package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.exception.CapabilityNotPresentOnTheGridException;
import org.openqa.grid.internal.listeners.RegistrationListener;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;


@Test(timeOut=10000)
public class RegistryTest {
	
	private static final int TOTAL_THREADS = 100;
	
	
	RemoteProxy p1 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine1:4444/");
	RemoteProxy p2 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine2:4444/");
	RemoteProxy p3 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine3:4444/");
	RemoteProxy p4 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine4:4444/");
	

	@Test
	public void addProxy() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);
			registry.add(p2);
			registry.add(p3);
			registry.add(p4);
			Assert.assertTrue(registry.getAllProxies().size() == 4);
		} finally {
			registry.stop();
		}
	}

	@Test
	public void addDuppedProxy() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(p1);
			registry.add(p2);
			registry.add(p3);
			registry.add(p4);
			registry.add(p4);
			Assert.assertTrue(registry.getAllProxies().size() == 4);
		} finally {
			registry.stop();
		}
	}

	RegistrationRequest req = null;
	Map<String, Object> app1 = new HashMap<String, Object>();
	Map<String, Object> app2 = new HashMap<String, Object>();

	@BeforeClass(alwaysRun = true)
	public void prepareReqRequest() {
		Map<String, Object> config = new HashMap<String, Object>();
		app1.put(APP, "app1");
		app2.put(APP, "app2");
		config.put(REMOTE_URL, "http://machine1:4444");
		config.put(MAX_SESSION, 5);
		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.setConfiguration(config);
	}

	@Test(expectedExceptions = GridException.class)
	public void emptyRegistry() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
			newSessionRequest.process();
		} finally {
			registry.stop();
		}

	}

	@Test(expectedExceptions = CapabilityNotPresentOnTheGridException.class)
	public void CapabilityNotPresentRegistry() {
		Registry registry = Registry.getNewInstanceForTestOnly();
		try {
			registry.add(new RemoteProxy(req));

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
			newSessionRequest.process();
		} finally {
			registry.stop();
		}
	}

	private Registry registry = Registry.getNewInstanceForTestOnly();
	private int invoc = 0;

	private synchronized void increment() {
		invoc++;
	}

	@Test(invocationCount = TOTAL_THREADS, threadPoolSize = TOTAL_THREADS)
	public void registerAtTheSameTime() {
		registry.add(new RemoteProxy(req));
		increment();
	}

	@Test(dependsOnMethods = "registerAtTheSameTime")
	public void validate() {
		Assert.assertEquals(invoc, TOTAL_THREADS);
		Assert.assertEquals(registry.getAllProxies().size(), 1);
	}

	private Random randomGenerator = new Random();

	/**
	 * try to simulate a real proxy. The proxy registration takes up to 1 sec to
	 * register, and crashes in 10% of the case.
	 * 
	 * @author Franзois Reynaud
	 * 
	 */
	class MyRemoteProxy extends RemoteProxy implements RegistrationListener {
		public MyRemoteProxy(RegistrationRequest request) {
			super(request);

		}

		public void beforeRegistration() {
			int registrationTime = randomGenerator.nextInt(1000);
			if (registrationTime > 900) {
				throw new NullPointerException();
			}
			try {
				Thread.sleep(registrationTime);
			} catch (InterruptedException e) {
			}
		}
	}

	private Registry registry2 = Registry.getNewInstanceForTestOnly();
	private int invoc2 = 0;

	private synchronized void increment2() {
		invoc2++;
	}

	@Test(invocationCount = TOTAL_THREADS, threadPoolSize = TOTAL_THREADS)
	public void registerAtTheSameTimeWithListener() {
		registry2.add(new MyRemoteProxy(req));
		increment2();
	}

	@Test(dependsOnMethods = "registerAtTheSameTimeWithListener")
	public void validate2() {
		Assert.assertEquals(invoc2, TOTAL_THREADS);
		Assert.assertEquals(registry2.getAllProxies().size(), 1);
	}

	@AfterClass(alwaysRun=true)
	public void tearfdown() {
		registry.stop();
		registry.stop();
	}

	
}
