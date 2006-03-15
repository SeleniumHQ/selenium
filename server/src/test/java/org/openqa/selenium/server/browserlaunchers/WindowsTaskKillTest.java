/*
 * Created on Mar 8, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.util.*;

import junit.framework.*;

public class WindowsTaskKillTest extends TestCase {

    public void testLoadEnvironment() {
        if (WindowsTaskKill.thisIsWindows()) {
            Map p =WindowsTaskKill.loadEnvironment();
            assertFalse("Environment appears to be empty!", p.isEmpty());
//            for (Iterator i = p.keySet().iterator(); i.hasNext();) {
//                String key = (String) i.next();
//                String value = (String) p.get(key);
//                System.out.print(key);
//                System.out.print('=');
//                System.out.println(value);
//            }
            assertNotNull("SystemRoot env var apparently not set on Windows!", WindowsTaskKill.findSystemRoot());   
        }
    }
    public void testWMIC() {
        assertTrue("wmic should be found", "wmic" != WindowsTaskKill.findWMIC());
    }
    public void testTaskKill() {
        assertTrue("taskkill should be found", "taskkill" != WindowsTaskKill.findTaskKill());
    }
}
