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
 * @version $Revision: 1.3 $
 */
public class WindowsDefaultBrowserLauncher implements BrowserLauncher {

    Runtime runtime = Runtime.getRuntime();
    private Process process;

    public void launch(String url) {
        try {
            String command = "cmd /c start " + url;
            process = runtime.exec(command);
        } catch (IOException e) {
            throw new RuntimeException("Could not launch default browser.", e);
        }
    }

    public void close() {
        process.destroy();
    }

    public static void main(String[] args) {
        new WindowsDefaultBrowserLauncher().launch("http://www.google.com");
    }
}
