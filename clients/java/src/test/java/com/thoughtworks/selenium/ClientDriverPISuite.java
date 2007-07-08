package com.thoughtworks.selenium;

import java.util.*;
import java.util.logging.Logger;
import java.util.logging.Handler;
import java.util.logging.Level;

import junit.extensions.*;
import junit.framework.*;

import org.openqa.selenium.server.browserlaunchers.*;
import org.openqa.selenium.server.log.TerseFormatter;

/**
 * This class executes the same tests that ClientDriverSuite does, but it does
 * so with proxy injection mode turned on and with the default browser string
 * set so as to use IE. (ClientDriverSuite normally uses Firefox.)
 * 
 * @author nelsons
 * 
 */

public class ClientDriverPISuite extends ClientDriverSuite {
    public static Test suite() {
        TestSuite supersuite = new TestSuite(ClientDriverPISuite.class.getName());
        TestSuite suite = ClientDriverSuite.generateSuite(true, determineForcedBrowserMode());
        suite.setName(ClientDriverPISuite.class.getName());

        InitSystemPropertiesTestSetupForPImode setup = new InitSystemPropertiesTestSetupForPImode(suite);
        supersuite.addTest(setup);
        return supersuite;
    }

    protected static String determineForcedBrowserMode() {
        String forcedBrowserMode = System.getProperty("selenium.forcedBrowserMode");
        if (forcedBrowserMode == null) {
            if (WindowsUtils.thisIsWindows()) {
                forcedBrowserMode = "*piiexplore";
            } else {
                forcedBrowserMode = "*pifirefox";
            }
        }
        return forcedBrowserMode;
    }
    
    /** A TestSetup decorator that runs a super setUp and tearDown at the
     * beginning and end of the entire run: in this case, we use it to
     * set and clear the PI mode property, and rename the suite.
     *
     *
     *  @author nelsons
     *
     */
    public static class InitSystemPropertiesTestSetupForPImode extends ClientDriverSuite.InitSystemPropertiesTestSetup {

        public InitSystemPropertiesTestSetupForPImode(Test test) {
            super(test);
        }

        public void setUp() throws Exception {
        	super.setUp();
        	
        	overrideProperty("selenium.forcedBrowserMode", determineForcedBrowserMode());
            overrideProperty("selenium.proxyInjectionMode", "true");
        }
    }
}
