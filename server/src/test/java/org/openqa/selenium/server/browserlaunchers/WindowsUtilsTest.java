/*
 * Copyright 2006 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
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
        boolean autoConfigURLExists = WindowsUtils.doesRegistryValueExist("HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "AutoConfigURL");
        System.out.println(autoConfigURLExists);
        if (autoConfigURLExists) {
            System.out.println(WindowsUtils.readStringRegistryValue("HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "AutoConfigURL"));
        }
    }
}
