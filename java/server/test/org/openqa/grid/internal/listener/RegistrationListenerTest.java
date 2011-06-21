package org.openqa.grid.internal.listener;

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_URL;

import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.RegistrationListener;
import org.openqa.grid.internal.mock.MockedNewSessionRequestHandler;
import org.openqa.grid.internal.mock.MockedRequestHandler;



public class RegistrationListenerTest {

	private static boolean serverUp = false;

	class MyRemoteProxy extends RemoteProxy implements RegistrationListener {

		public MyRemoteProxy(RegistrationRequest request,Registry registry) {
			super(request,registry);
		}

		public void beforeRegistration() {
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			serverUp = true;
		}
	}

	static RemoteProxy p1 = null;
	static RegistrationRequest req = null;
	static Map<String, Object> app1 = new HashMap<String, Object>();

	@BeforeClass
	public static void prepareReqRequest() {
		Map<String, Object> config = new HashMap<String, Object>();
		app1.put(APP, "app1");
		config.put(REMOTE_URL, "http://machine1:4444");
		req = new RegistrationRequest();
		req.addDesiredCapabilitiy(app1);
		req.setConfiguration(config);
	}

	@Test(timeout = 5000)
	public void testRegistration() {
		Registry registry = new Registry();
		registry.add(new MyRemoteProxy(req,registry));

		MockedRequestHandler request = new MockedNewSessionRequestHandler(registry,app1);
		request.process();
		
		
		Assert.assertNotNull(request.getTestSession());
		Assert.assertTrue(serverUp);
	}

	private static Boolean firstRun = true;

	/**
	 * this proxy will throw an exception on registration the first time.
	 * 
	 * @author François Reynaud
	 * 
	 */
	class MyBuggyRemoteProxy extends RemoteProxy implements RegistrationListener {
		public MyBuggyRemoteProxy(RegistrationRequest request,Registry registry) {
			super(request,registry);
		}

		public void beforeRegistration() {
			synchronized (firstRun) {
				if (firstRun) {
					firstRun = false;
					throw new NullPointerException();
				}
			}
		}
	}

	/**
	 * proxy not registered when throw an exception during registration
	 */
	@Test
	public void testBugRegistration() {
		Registry registry = new Registry();
		registry.add(new MyBuggyRemoteProxy(req,registry));
		registry.add(new MyBuggyRemoteProxy(req,registry));

		Assert.assertEquals(registry.getAllProxies().size(), 1);
	}

	static boolean slowRemoteUp = false;

	class MySlowRemoteProxy extends RemoteProxy implements RegistrationListener {
		public MySlowRemoteProxy(RegistrationRequest request,Registry registry) {
			super(request,registry);
		}

		public void beforeRegistration() {
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			slowRemoteUp = true;
		}
	}

	Registry registry = new Registry();

	/**
	 * register a regular proxy for app1 and a slow one.
	 * try to reserve 2 * app1
	 * 1 should be reserved directly.
	 * 1 should wait for the slow proxy to finish the registration properly before returning
	 */
	@Test(timeout=2000)
	public void registerSomeSlow() {
		registry.add(new RemoteProxy(req,registry));
		new Thread(new Runnable() {
			public void run() {
				registry.add(new MySlowRemoteProxy(req,registry));
			}
		}).start();

		// slow proxy hasn't finished to start slow remote, isn't accessible via
		// the registry yet
		Assert.assertEquals(registry.getAllProxies().size(), 1);
		// check onRegistration has not run yet.
		Assert.assertEquals(slowRemoteUp, false);
		// should return right away, as RemoteProxy is fast.
		MockedNewSessionRequestHandler req = new MockedNewSessionRequestHandler(registry, app1);
		req.process();
		TestSession s1 = req.getTestSession();
		Assert.assertNotNull(s1);


		// slow proxy hasn't finished to start slow remote, isn't accessible via
		// the registry yet
		Assert.assertEquals(registry.getAllProxies().size(), 1);
		// check onRegistration has not run yet.
		Assert.assertEquals(false,slowRemoteUp);
		
		
		
		// will block until MySlowRemoteProxy is fully registered.
		MockedNewSessionRequestHandler req2 = new MockedNewSessionRequestHandler(registry, app1);
		req2.process();
		TestSession s2 = req2.getTestSession();
		Assert.assertNotNull(s2);
		// return when the proxy is visible = fully registered. So registry has
		// 2 proxies at that point.
		Assert.assertEquals(2,registry.getAllProxies().size());
		// and slow remote is up
		Assert.assertTrue(slowRemoteUp);

	}

}
