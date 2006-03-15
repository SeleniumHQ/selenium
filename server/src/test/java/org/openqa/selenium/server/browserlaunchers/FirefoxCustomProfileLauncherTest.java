/*
 * Created on Mar 8, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.*;

import junit.framework.*;

public class FirefoxCustomProfileLauncherTest extends TestCase {
    public void testFirefox() throws Exception {
        FirefoxCustomProfileLauncher l = new FirefoxCustomProfileLauncher(SeleniumProxy.DEFAULT_PORT);
        l.launch("http://www.google.com");
        System.out.println("Killing browser in 10 seconds");
        Thread.sleep(10000);
        l.close();
        System.out.println("He's dead now, right?");
    }
}
