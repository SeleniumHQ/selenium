package com.thoughtworks.selenium.browserlifecycle.session;

import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import com.thoughtworks.selenium.browserlifecycle.LifeCycleException;

public class MultipleBrowserSessionTest extends MockObjectTestCase {

	public void testShouldDoNothingIfPassedNoBrowsers() throws Exception {

		String url = "irrelevant";
		String[] browsers = new String[] {};

		Mock sessionFactory = mock(SessionFactory.class);

		sessionFactory.expects(never());

		MultipleBrowserSession session = new MultipleBrowserSession(
				(SessionFactory) sessionFactory.proxy(), browsers, url);
		session.run(0);

		sessionFactory.verify();
	}

	public void testShouldBuildAndRunASessionForASingleBrowser()
			throws Exception {

		Mock sessionFactory = mock(SessionFactory.class);
		Mock browserSession = mock(Session.class);

		long timeout = 99;
		String url = "testUrl";
		String browser = "testSingleBrowser";
		String[] browsers = new String[] { browser };

		MultipleBrowserSession session = new MultipleBrowserSession(
				(SessionFactory) sessionFactory.proxy(), browsers, url);

		sessionFactory.expects(once()).method("buildBrowserSession").with(
				eq(browser), eq(url)).will(returnValue(browserSession.proxy()));
		browserSession.expects(once()).method("run").with(eq(timeout));

		session.run(timeout);

		sessionFactory.verify();
		browserSession.verify();
	}

	public void testShouldBuildAndRunASessionForMultipleBrowsersInOrder()
			throws Exception {

		Mock sessionFactory = mock(SessionFactory.class);
		Mock browserSession1 = mock(Session.class);
		Mock browserSession2 = mock(Session.class);

		long timeout = 99;
		String url = "testUrl";
		String browser1 = "testFirstBrowser";
		String browser2 = "testSecondBrowser";
		String[] browsers = new String[] { browser1, browser2 };

		MultipleBrowserSession session = new MultipleBrowserSession(
				(SessionFactory) sessionFactory.proxy(), browsers, url);

		sessionFactory.expects(once()).method("buildBrowserSession").with(
				eq(browser1), eq(url)).will(
				returnValue(browserSession1.proxy())).id(
				"first session created");

		browserSession1.expects(once()).method("run").with(eq(timeout)).after(
				sessionFactory, "first session created")
				.id("first session run");

		sessionFactory.expects(once()).method("buildBrowserSession").with(
				eq(browser2), eq(url)).after(browserSession1,
				"first session run").will(returnValue(browserSession2.proxy()))
				.id("second session created");

		browserSession2.expects(once()).method("run").with(eq(timeout)).after(
				sessionFactory, "second session created");

		session.run(timeout);

		sessionFactory.verify();
		browserSession1.verify();
		browserSession2.verify();
	}

	// is this what we want? or should we just go on to the next browser
	// and report at end?
	public void testShouldAbortOnError() {
		Mock sessionFactory = mock(SessionFactory.class);
		Mock browserSession = mock(Session.class);

		long timeout = 99;
		String url = "testUrl";
		String browser1 = "testFirstBrowser";
		String browser2 = "testSecondBrowser";
		String[] browsers = new String[] { browser1, browser2 };

		LifeCycleException error = new LifeCycleException("test",
				new Throwable());

		MultipleBrowserSession session = new MultipleBrowserSession(
				(SessionFactory) sessionFactory.proxy(), browsers, url);

		sessionFactory.expects(once()).method("buildBrowserSession").with(
				eq(browser1), eq(url))
				.will(returnValue(browserSession.proxy()));
		browserSession.expects(once()).method("run").with(eq(timeout)).will(
				throwException(error));

		try {
			session.run(timeout);
			fail("Expected exception to be thrown");
		} catch (LifeCycleException e) {
			// woot
		}

		sessionFactory.verify();
		browserSession.verify();
	}

}