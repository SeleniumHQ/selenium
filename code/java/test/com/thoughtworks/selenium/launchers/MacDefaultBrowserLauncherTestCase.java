/*
 * Copyright 2004 ThoughtWorks, Inc.
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

package com.thoughtworks.selenium.launchers;

import junit.framework.TestCase;
import com.thoughtworks.selenium.BrowserLauncher;

/**
 * @author Paul Hammant
 * @version $Revision: 1.8 $
 */
public class MacDefaultBrowserLauncherTestCase extends TestCase {

    public void testBrowserLaunchIfWindows() {
        final String[] commandString = new String[1];
        BrowserLauncher launcher = new MacDefaultBrowserLauncher() {
            protected void exec(String command) {
                commandString[0] = command;
            }
        };
        launcher.launch("foo bar");
        assertEquals("open foo bar", commandString[0]);

    }
}
