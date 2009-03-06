package org.openqa.selenium.server;

import junit.framework.TestCase;

/**
 * Unit tests for SeleniumServer.
 * 
 * @author Matthew Purland
 */
public class SeleniumServerUnitTest extends TestCase {

	// Number of jetty threads to positively test for
	private int positiveJettyThreads = SeleniumServer.DEFAULT_JETTY_THREADS;

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
		RemoteControlConfiguration configuration = new RemoteControlConfiguration();
	    configuration.setJettyThreads(positiveJettyThreads);

		server = new SeleniumServer(configuration);

		server.start();

		assertEquals("Jetty threads given is not correct.",
				positiveJettyThreads, server.getJettyThreads());
	}

//	/**
//	 * Test for a positive result when passing a positive argument for
//	 * -jettyThreads.
//	 * 
//	 * @throws Exception
//	 */
//	public void testJettyServerArgumentPositive() throws Exception {
//		String[] args = new String[] { "-jettyThreads",
//				String.valueOf(positiveJettyThreads) };
//		SeleniumServer.main(args);
//
//		assertEquals("Server did not start up correctly from arguments.",
//				positiveJettyThreads, SeleniumServer.getJettyThreads());
//	}
//
//	/**
//	 * Test for a negative result when passing a max argument for -jettyThreads.
//	 * 
//	 * @throws Exception
//	 */
//	public void testJettyServerArgumentNegativeMaximum() throws Exception {
//		int expectedJettyThreads = SeleniumServer.getJettyThreads();
//
//		String[] args = new String[] { "-jettyThreads",
//				String.valueOf(negativeJettyThreadsMaximum) };
//		try {
//			SeleniumServer.main(args);
//			// Fail if an exception wasn't thrown
//			fail("Server should not be able to start when given an illegal amount of jettyThreads ("
//					+ negativeJettyThreadsMaximum + ")");
//		} catch (IllegalArgumentException ex) {
//			/*
//			 * Empty catch block
//			 */
//		}
//		assertEquals("Server did not start up correctly from arguments.",
//				expectedJettyThreads, SeleniumServer.getJettyThreads());
//	}
//
//	/**
//	 * Test for a negative result when passing a zero argument for
//	 * -jettyThreads.
//	 * 
//	 * @throws Exception
//	 */
//	public void testJettyServerArgumentNegativeZero() throws Exception {
//		int expectedJettyThreads = SeleniumServer.getJettyThreads();
//
//		String[] args = new String[] { "-jettyThreads",
//				String.valueOf(negativeJettyThreadsMinimum) };
//		try {
//			SeleniumServer.main(args);
//			// Fail if an exception wasn't thrown
//			fail("Server should not be able to start when given an illegal amount of jettyThreads ("
//					+ negativeJettyThreadsMinimum + ")");
//		} catch (IllegalArgumentException ex) {
//			/*
//			 * Empty catch block
//			 */
//		}
//		assertEquals("Server did not start up correctly from arguments.",
//				expectedJettyThreads, SeleniumServer.getJettyThreads());
//	}
}
