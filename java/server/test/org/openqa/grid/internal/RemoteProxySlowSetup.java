package org.openqa.grid.internal;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.listeners.RegistrationListener;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

@Test(timeOut = 10000)
public class RemoteProxySlowSetup {

	RemoteProxy p1;
	RemoteProxy p2;

	Registry registry = Registry.getNewInstanceForTestOnly();

	@BeforeClass(alwaysRun = true)
	public void setup() {
		// create 2 proxy that are equal and have a slow onRegistration
		// p1.equals(p2) = true
		p1 = new SlowRemoteSetup();
		p2 = new SlowRemoteSetup();
	}

	@DataProvider(name = "proxy", parallel = true)
	public Object[][] data() {
		return new Object[][] { { p1 }, { p2 } };
	}

	// the first onRegistration should be executed, but the 2nd shouldn't.
	@Test(dataProvider = "proxy")
	public void addDup(RemoteProxy p) {
		registry.add(p);
	}

	@Test(dependsOnMethods = "addDup")
	public void validate() {
		Assert.assertEquals(registry.getAllProxies().size(), 1);
	}

	private class SlowRemoteSetup extends RemoteProxy implements RegistrationListener {

		public SlowRemoteSetup() {
			super(new RegistrationRequest());
		}

		public void beforeRegistration() {
			try {
				Thread.sleep(2000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}

		@Override
		public boolean equals(Object obj) {
			return true;
		}

		@Override
		public int hashCode() {
			return 42;
		}

	}

	@AfterClass
	public void tearfdown() {
		registry.stop();
		registry.stop();
	}
}
