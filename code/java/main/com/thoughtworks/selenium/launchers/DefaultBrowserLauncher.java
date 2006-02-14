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

import com.thoughtworks.selenium.BrowserLauncher;

/**
 * Delegates launching the browser to the OS default browser launcher
 * @see com.thoughtworks.selenium.launchers.WindowsDefaultBrowserLauncher
 * @see com.thoughtworks.selenium.launchers.UnixDefaultBrowserLauncher
 * @see com.thoughtworks.selenium.launchers.MacDefaultBrowserLauncher
 * @see com.thoughtworks.selenium.launchers.SystemDefaultBrowserLauncher 
 * @author Paul Hammant
 * @version $Revision$
 */
public class DefaultBrowserLauncher implements BrowserLauncher {

    BrowserLauncher delegate;
    private static final String OS = System.getProperty("os.name").toLowerCase();
    public DefaultBrowserLauncher() {
        if (OS.startsWith("windows")) {
            delegate = new WindowsDefaultBrowserLauncher();
        } else if (OS.startsWith("mac")) {
            delegate = new MacDefaultBrowserLauncher();
        } else {
            //TODO default for Linux ?
        }
    }

    public void launch(String url) {
        delegate.launch(url);
    }

    public void close() {
        delegate.close();
    }
}
