package org.openqa.grid.internal;

import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.CapabilityNotPresentOnTheGridException;
import org.openqa.grid.internal.listeners.RegistrationListener;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;

public class RegistryTest {

	private static final int TOTAL_THREADS = 100;

		

	@Test
	public void addProxy() {
		Registry registry = new Registry();
		RemoteProxy p1 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine1:4444/",registry);
		RemoteProxy p2 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine2:4444/",registry);
		RemoteProxy p3 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine3:4444/",registry);
		RemoteProxy p4 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine4:4444/",registry);
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
		Registry registry = new Registry();
		RemoteProxy p1 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine1:4444/",registry);
		RemoteProxy p2 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine2:4444/",registry);
		RemoteProxy p3 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine3:4444/",registry);
		RemoteProxy p4 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine4:4444/",registry);
	
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

	static RegistrationRequest req = null;
	static Map<String, Object> app1 = new HashMap<String, Object>();
	static Map<String, Object> app2 = new HashMap<String, Object>();

	@BeforeClass
	public static void prepareReqRequest() {
		Map<String, Object> config = new HashMap<String, Object>();
		app1.put("browserName", "app1");
		app2.put("browserName", "app2");
		config.put(REMOTE_URL, "http://machine1:4444");
		config.put(MAX_SESSION, 5);
		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.setConfiguration(config);
	}

	@Test(expected = GridException.class)
	public void emptyRegistry() throws Throwable {
		Registry registry = new Registry();
		System.out.println(registry);
		try {
			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
			newSessionRequest.process();
		}finally{
			
		}
			

	}

	// @Test(timeout=2000) excepted timeout here.How to specify that in junit ?
	public void emptyRegistryParam() {
		Registry registry = new Registry();
		registry.setThrowOnCapabilityNotPresent(false);
		try {

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
			newSessionRequest.process();
		} finally {
			registry.stop();
		}

	}

	@Test(expected = CapabilityNotPresentOnTheGridException.class)
	public void CapabilityNotPresentRegistry() throws Throwable {
		Registry registry = new Registry();
		try {
			registry.add(new RemoteProxy(req, registry));
			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
			System.out.println(newSessionRequest.getDesiredCapabilities());
			newSessionRequest.process();
			System.out.println("new "+newSessionRequest.getTestSession());
		}  finally {
			registry.stop();
		}
	}

	// @Test(timeout=2000) excepted timeout here.How to specify that in junit ?
	public void CapabilityNotPresentRegistryParam() {
		Registry registry = new Registry();
		registry.setThrowOnCapabilityNotPresent(false);
		try {
			registry.add(new RemoteProxy(req, registry));

			MockedRequestHandler newSessionRequest = new MockedNewSessionRequestHandler(registry, app2);
			newSessionRequest.process();
			
		} finally {
			registry.stop();
		}
	}

	private int invoc = 0;

	private synchronized void increment() {
		invoc++;
	}

	@Test(timeout = 1000)
	public void registerAtTheSameTime() throws InterruptedException {
		final Registry registry = new Registry();
		try {
			for (int i = 0; i < TOTAL_THREADS; i++) {
				new Thread(new Runnable() {

					public void run() {
						registry.add(new RemoteProxy(req, registry));
						increment();
					}
				}).start();
			}
			while (invoc != TOTAL_THREADS) {
				Thread.sleep(250);
			}
			Assert.assertEquals(invoc, TOTAL_THREADS);
			Assert.assertEquals(registry.getAllProxies().size(), 1);
		} finally {
			registry.stop();
		}
	}

	private Random randomGenerator = new Random();

	/**
	 * try to simulate a real proxy. The proxy registration takes up to 1 sec to
	 * register, and crashes in 10% of the case.
	 * 
	 * @author Fran�ois Reynaud
	 * 
	 */
	class MyRemoteProxy extends RemoteProxy implements RegistrationListener {
		public MyRemoteProxy(RegistrationRequest request, Registry registry) {
			super(request, registry);

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

	private int invoc2 = 0;

	private synchronized void increment2() {
		invoc2++;
	}

	@Test(timeout = 2000)
	public void registerAtTheSameTimeWithListener() throws InterruptedException {
		final Registry registry = new Registry();

		try {
			for (int i = 0; i < TOTAL_THREADS; i++) {
				new Thread(new Runnable() {

					public void run() {
						registry.add(new MyRemoteProxy(req, registry));
						increment2();
					}
				}).start();
			}
			while (invoc2 != TOTAL_THREADS) {
				Thread.sleep(250);
			}
			Assert.assertEquals(invoc2, TOTAL_THREADS);
			Assert.assertEquals(registry.getAllProxies().size(), 1);
		} finally {
			registry.stop();
		}
	}

}
