/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.server;

import static org.junit.Assert.assertEquals;

import org.junit.After;
import org.junit.Test;

/**
 * Unit tests for SeleniumServer.
 * 
 * @author Matthew Purland
 */
public class SeleniumServerUnitTest {

  // Number of jetty threads to positively test for
  private int positiveJettyThreads = SeleniumServer.DEFAULT_JETTY_THREADS;

  private SeleniumServer server;

  @Test
  public void constructor_setsThisAsSeleniumServerInRemoteControlConfiguration() throws Exception {
    RemoteControlConfiguration remoteConfiguration = new RemoteControlConfiguration();
    server = new SeleniumServer(remoteConfiguration);
    assertEquals(server, remoteConfiguration.getSslCertificateGenerator());
  }

  @After
  public void tearDown() {
    if (server != null) {
      server.stop();
    }
  }

  /**
   * Test happy path that if an "okay" number of threads is given then it will start up correctly.
   * 
   * @throws Exception
   */
  @Test
  public void testJettyThreadsPositive() throws Exception {
    RemoteControlConfiguration configuration = new RemoteControlConfiguration();
    configuration.setJettyThreads(positiveJettyThreads);

    server = new SeleniumServer(configuration);

    server.start();

    assertEquals("Jetty threads given is not correct.",
        positiveJettyThreads, server.getJettyThreads());
  }

  // /**
  // * Test for a positive result when passing a positive argument for
  // * -jettyThreads.
  // *
  // * @throws Exception
  // */
  // public void testJettyServerArgumentPositive() throws Exception {
  // String[] args = new String[] { "-jettyThreads",
  // String.valueOf(positiveJettyThreads) };
  // SeleniumServer.main(args);
  //
  // assertEquals("Server did not start up correctly from arguments.",
  // positiveJettyThreads, SeleniumServer.getJettyThreads());
  // }
  //
  // /**
  // * Test for a negative result when passing a max argument for -jettyThreads.
  // *
  // * @throws Exception
  // */
  // public void testJettyServerArgumentNegativeMaximum() throws Exception {
  // int expectedJettyThreads = SeleniumServer.getJettyThreads();
  //
  // String[] args = new String[] { "-jettyThreads",
  // String.valueOf(negativeJettyThreadsMaximum) };
  // try {
  // SeleniumServer.main(args);
  // // Fail if an exception wasn't thrown
  // fail("Server should not be able to start when given an illegal amount of jettyThreads ("
  // + negativeJettyThreadsMaximum + ")");
  // } catch (IllegalArgumentException ex) {
  // /*
  // * Empty catch block
  // */
  // }
  // assertEquals("Server did not start up correctly from arguments.",
  // expectedJettyThreads, SeleniumServer.getJettyThreads());
  // }
  //
  // /**
  // * Test for a negative result when passing a zero argument for
  // * -jettyThreads.
  // *
  // * @throws Exception
  // */
  // public void testJettyServerArgumentNegativeZero() throws Exception {
  // int expectedJettyThreads = SeleniumServer.getJettyThreads();
  //
  // String[] args = new String[] { "-jettyThreads",
  // String.valueOf(negativeJettyThreadsMinimum) };
  // try {
  // SeleniumServer.main(args);
  // // Fail if an exception wasn't thrown
  // fail("Server should not be able to start when given an illegal amount of jettyThreads ("
  // + negativeJettyThreadsMinimum + ")");
  // } catch (IllegalArgumentException ex) {
  // /*
  // * Empty catch block
  // */
  // }
  // assertEquals("Server did not start up correctly from arguments.",
  // expectedJettyThreads, SeleniumServer.getJettyThreads());
  // }
}
