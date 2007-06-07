package org.openqa.selenium.server;

import junit.framework.TestCase;

/**
 * Unit tests for SeleniumServer.
 * 
 * @author Matthew Purland
 */
public class SeleniumServerTest extends TestCase {

	// Number of jetty threads to positively test for
	private int positiveJettyThreads = SeleniumServer.DEFAULT_JETTY_THREADS;

	// Number of jetty threads to negatively test for
	private int negativeJettyThreadsMaximum = SeleniumServer.MAX_JETTY_THREADS + 1;

	private int negativeJettyThreadsMinimum = SeleniumServer.MIN_JETTY_THREADS - 1;

	private SeleniumServer server;

	public void tearDown() {
		if (server != null) {
			server.stop();
		}
	}

	/**
	 * Test happy path that if an "okay" number of threads is given then it will
	 * start up correctly.
	 * 
	 * @throws Exception
	 */
	public void testJettyThreadsPositive() throws Exception {
		SeleniumServer.setJettyThreads(positiveJettyThreads);

		server = new SeleniumServer();

		server.start();

		assertEquals("Jetty threads given is not correct.",
				positiveJettyThreads, SeleniumServer.getJettyThreads());
	}

	/**
	 * Test negative path if a bad number of threads is given. The server should
	 * not start.
	 * 
	 * @throws Exception
	 */
	public void testJettyThreadsNegativeMaximum() throws Exception {
		int expectedJettyThreads = SeleniumServer.getJettyThreads();

		try {
			SeleniumServer.setJettyThreads(negativeJettyThreadsMaximum);
			// Fail if an exception wasn't thrown
			fail("Error not caught when an illegal argument was passed to setJettyThreads");
		} catch (IllegalArgumentException ex) {
			/*
			 * Empty catch block
			 */
		}

		server = new SeleniumServer();

		server.start();

		// We should expect the default amount of threads since the above
		// setJettyThreads should not pass
		assertEquals("Server did not start up correctly.",
				expectedJettyThreads, SeleniumServer.getJettyThreads());
	}

	/**
	 * Test negative path if a bad number of threads is given. The server should
	 * not start.
	 * 
	 * @throws Exception
	 */
	public void testJettyThreadsNegativeZero() throws Exception {
		int expectedJettyThreads = SeleniumServer.getJettyThreads();

		try {
			SeleniumServer.setJettyThreads(negativeJettyThreadsMinimum);
			// Fail if an exception wasn't thrown
			fail("Error not caught when an illegal argument was passed to setJettyThreads");
		} catch (IllegalArgumentException ex) {
			/*
			 * Empty catch block
			 */
		}

		server = new SeleniumServer();

		server.start();

		// We should expect the default amount of threads since the above
		// setJettyThreads should not pass
		assertEquals("Server did not start up correctly.",
				expectedJettyThreads, SeleniumServer.getJettyThreads());
	}

	/**
	 * Test for a positive result when passing a positive argument for
	 * -jettyThreads.
	 * 
	 * @throws Exception
	 */
	public void testJettyServerArgumentPositive() throws Exception {
		String[] args = new String[] { "-jettyThreads",
				String.valueOf(positiveJettyThreads) };
		SeleniumServer.main(args);

		assertEquals("Server did not start up correctly from arguments.",
				positiveJettyThreads, SeleniumServer.getJettyThreads());
	}

	/**
	 * Test for a negative result when passing a max argument for -jettyThreads.
	 * 
	 * @throws Exception
	 */
	public void testJettyServerArgumentNegativeMaximum() throws Exception {
		int expectedJettyThreads = SeleniumServer.getJettyThreads();

		String[] args = new String[] { "-jettyThreads",
				String.valueOf(negativeJettyThreadsMaximum) };
		try {
			SeleniumServer.main(args);
			// Fail if an exception wasn't thrown
			fail("Server should not be able to start when given an illegal amount of jettyThreads ("
					+ negativeJettyThreadsMaximum + ")");
		} catch (IllegalArgumentException ex) {
			/*
			 * Empty catch block
			 */
		}
		assertEquals("Server did not start up correctly from arguments.",
				expectedJettyThreads, SeleniumServer.getJettyThreads());
	}

	/**
	 * Test for a negative result when passing a zero argument for
	 * -jettyThreads.
	 * 
	 * @throws Exception
	 */
	public void testJettyServerArgumentNegativeZero() throws Exception {
		int expectedJettyThreads = SeleniumServer.getJettyThreads();

		String[] args = new String[] { "-jettyThreads",
				String.valueOf(negativeJettyThreadsMinimum) };
		try {
			SeleniumServer.main(args);
			// Fail if an exception wasn't thrown
			fail("Server should not be able to start when given an illegal amount of jettyThreads ("
					+ negativeJettyThreadsMinimum + ")");
		} catch (IllegalArgumentException ex) {
			/*
			 * Empty catch block
			 */
		}
		assertEquals("Server did not start up correctly from arguments.",
				expectedJettyThreads, SeleniumServer.getJettyThreads());
	}
}
