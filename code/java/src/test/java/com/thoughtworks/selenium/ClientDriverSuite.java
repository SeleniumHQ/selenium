/*
 * Created on Feb 25, 2006
 *
 */
package com.thoughtworks.selenium;

import junit.extensions.*;
import junit.framework.*;

import org.openqa.selenium.server.*;

/** The wrapper test suite for these tests, which spawns an in-process Selenium Server
 * for simple integration testing.
 * 
 * <p>Normally, users should start the Selenium Server
 * out-of-process, and just leave it up and running, available for the tests to use.
 * But, if you like, you can do what we do here and start a Selenium Server before
 * launching the tests.</p>
 * 
 * <p>Note that we don't recommend starting and stopping the
 * entire server during each test's setUp and tearDown for these Integration tests;
 * it shouldn't be necessary, and doing so may conceal bugs in the server.</p>
 *  
 * 
 *  @author Dan Fabulich
 *
 */
public class ClientDriverSuite extends TestSuite{

    /** Construct a test suite containing the other integration tests,
     * wrapping them up in a TestSetup object that will launch the Selenium
     * Server in-proc.
     * @return a test suite containing tests to run
     */
    public static Test suite() {
        ClientDriverSuite supersuite = new ClientDriverSuite();
        ClientDriverSuite suite = new ClientDriverSuite();
        suite.addTestSuite(ApacheMyFacesSuggestTest.class);
        suite.addTestSuite(RealDealIntegrationTest.class);
        ClientDriverTestSetup setup = new ClientDriverTestSetup(suite);
        supersuite.addTest(setup);
        return supersuite;
    }
    
    /** A TestSetup decorator that runs a super setUp and tearDown at the
     * beginning and end of the entire run: in this case, we use it to
     * startup and shutdown the in-process Selenium Server.
     *  
     * 
     *  @author danielf
     *
     */
    static class ClientDriverTestSetup extends TestSetup {
        SeleniumProxy server;
        
        public ClientDriverTestSetup(Test test) {
            super(test);
        }
        
        public void setUp() throws Exception {
            server = new SeleniumProxy(SeleniumProxy.DEFAULT_PORT);
            server.start();
        }
        
        public void tearDown() throws Exception {
            server.stop();
        }
        
    }
}
