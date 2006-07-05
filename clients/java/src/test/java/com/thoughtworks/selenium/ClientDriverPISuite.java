package com.thoughtworks.selenium;

import junit.framework.Test;

/**
 * This class executes the same tests that ClientDriverSuite does, but it does so with proxy injection mode
 * turned on and with the default browser string set so as to use IE.  (ClientDriverSuite normally uses Firefox.)
 * 
 * @author nelsons
 *
 */

public class ClientDriverPISuite extends ClientDriverSuite {
    public static Test suite() {
        System.setProperty("selenium.proxyInjectionMode", "true");
        System.setProperty("selenium.defaultBrowserString", "*piiexplore");
        
        return ClientDriverSuite.suite();
    }
}
