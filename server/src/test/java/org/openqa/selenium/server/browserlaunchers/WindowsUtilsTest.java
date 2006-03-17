/*
 * Created on Mar 8, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;

import java.util.*;

import junit.framework.*;

public class WindowsUtilsTest extends TestCase {

    public void testLoadEnvironment() {
        if (WindowsUtils.thisIsWindows()) {
            Map p =WindowsUtils.loadEnvironment();
            assertFalse("Environment appears to be empty!", p.isEmpty());
//            for (Iterator i = p.keySet().iterator(); i.hasNext();) {
//                String key = (String) i.next();
//                String value = (String) p.get(key);
//                System.out.print(key);
//                System.out.print('=');
//                System.out.println(value);
//            }
            assertNotNull("SystemRoot env var apparently not set on Windows!", WindowsUtils.findSystemRoot());   
        }
    }
    public void testWMIC() {
        assertTrue("wmic should be found", "wmic" != WindowsUtils.findWMIC());
    }
    public void testTaskKill() {
        assertTrue("taskkill should be found", "taskkill" != WindowsUtils.findTaskKill());
    }
    public void testReadRegistryValue() {
        System.out.println(WindowsUtils.doesRegistryValueExist("HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "AutoConfigURL"));
        System.out.println(WindowsUtils.readBooleanRegistryValue("HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "ProxyEnable"));
        System.out.println(WindowsUtils.readIntRegistryValue("HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "ProxyEnable"));
        System.out.println(WindowsUtils.readStringRegistryValue("HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "ProxyServer"));
    }
}
