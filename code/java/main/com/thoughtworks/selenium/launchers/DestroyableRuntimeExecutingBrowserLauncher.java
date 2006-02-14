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

/**
 * Runs the specified command path to start the browser, and kills the process to quit.
 * @author Paul Hammant
 * @version $Revision: 189 $
 */
public class DestroyableRuntimeExecutingBrowserLauncher extends RuntimeExecutingBrowserLauncher {

    /** Specifies a command path to run */
    public DestroyableRuntimeExecutingBrowserLauncher(String commandPath) {
        super(commandPath);
    }

    public final void close() {
        process.destroy();
    }
}
