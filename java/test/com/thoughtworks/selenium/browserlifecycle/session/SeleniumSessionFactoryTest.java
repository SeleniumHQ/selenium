package com.thoughtworks.selenium.browserlifecycle.session;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;
import com.thoughtworks.selenium.browserlifecycle.coordinate.Waiter;
import com.thoughtworks.selenium.browserlifecycle.coordinate.WaiterFactory;
import com.thoughtworks.selenium.browserlifecycle.window.Killable;
import com.thoughtworks.selenium.browserlifecycle.window.Spawner;

public class SeleniumSessionFactoryTest extends MockObjectTestCase {

	public void testShouldCreateBrowserSessionWithNecessaryServices() throws LifeCycleException {

		Mock windowSpawner = mock(Spawner.class);
		Mock waiterFactory = mock(WaiterFactory.class);
        Mock waiter        = mock(Waiter.class);
        Mock window        = mock(Killable.class);
		
		SeleniumSessionFactory factory = new SeleniumSessionFactory(
				(Spawner) windowSpawner.proxy(), (WaiterFactory) waiterFactory
						.proxy());
		
		waiterFactory.expects(once()).method("getWaiter").will(returnValue(waiter.proxy()));
		
		String browser = "testBrowser";
		String url     = "testUrl";
		Session session = factory.buildBrowserSession(browser, url);
		
		waiterFactory.verify();
		
		assertTrue("Factory Should return a BrowserSession", session instanceof BrowserSession);
		
		// intent of following is not to test BrowserSession but to check what it was constructed with
		windowSpawner.expects(once()).method("spawn").with(eq(browser), eq(url)).will(returnValue(window.proxy()));
		waiter.expects(once()).method("waitFor");
		window.stubs();
		
		session.run(0);
		
		windowSpawner.verify();
		waiter.verify();

	}
	
	public void testShouldCreateMultipleBrowserSessionWithNecessaryServices() throws LifeCycleException {
		
		Mock windowSpawner = mock(Spawner.class);
		Mock waiterFactory = mock(WaiterFactory.class);
        Mock waiter        = mock(Waiter.class);
        Mock window        = mock(Killable.class);
		

		
		SeleniumSessionFactory factory = new SeleniumSessionFactory(
				(Spawner) windowSpawner.proxy(), (WaiterFactory) waiterFactory
						.proxy());
		
		String url = "testUrl";
		String browser = "browser";
		String[] browsers = new String[]{browser};
		
		Session session = factory.buildMultipleBrowserSession(browsers, url);
		assertTrue("Factory Should return a MultipleBrowserSession", session instanceof MultipleBrowserSession);
		

		
        // intent of following is not to test MultipleBrowserSession but to check what it was constructed with
		waiterFactory.expects(once()).method("getWaiter").will(returnValue(waiter.proxy()));
		windowSpawner.expects(once()).method("spawn").with(eq(browser), eq(url)).will(returnValue(window.proxy()));
		waiter.expects(once()).method("waitFor");
		window.stubs();
		
		session.run(0);
		
		waiterFactory.verify();
		windowSpawner.verify();
		waiter.verify();
		
	}
}