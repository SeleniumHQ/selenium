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

import java.io.IOException;

/**
 * @author Paul Hammant
 * @version $Revision: 1.1 $
 */
public class SystemPropertiesBrowserLauncher implements BrowserLauncher {

    Runtime runtime = Runtime.getRuntime();

    private static final String browserPath = System.getProperty("selenium-browser-path");

    public void launch(String url) {
        try {
            String command = browserPath + " " + url;
            runtime.exec(command);
        } catch (IOException e) {
            throw new RuntimeException("Could not launch default browser.", e);
        }
    }
}
