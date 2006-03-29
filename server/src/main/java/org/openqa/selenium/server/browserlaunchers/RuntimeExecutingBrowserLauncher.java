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

import java.io.*;

/**
 * An abstract class to launch the specified command path
 * @author Paul Hammant
 * @version $Revision: 1.8 $
 */
public abstract class RuntimeExecutingBrowserLauncher implements BrowserLauncher {

    protected Process process;
    protected String commandPath;

    /** Specifies a command path to run */
    protected RuntimeExecutingBrowserLauncher(String commandPath) {
        this.commandPath = commandPath;
    }

    public void launch(String url) {
        exec(commandPath + " " + url);
    }

    protected void exec(String command) {

        try {
            process = Runtime.getRuntime().exec(command);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
