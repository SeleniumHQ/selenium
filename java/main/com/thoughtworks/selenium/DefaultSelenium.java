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

package com.thoughtworks.selenium;

import com.thoughtworks.selenium.embedded.jetty.JettyCommandProcessor;
import com.thoughtworks.selenium.launchers.WindowsDefaultBrowserLauncher;
import com.thoughtworks.selenium.launchers.DefaultBrowserLauncher;

import java.io.File;

/**
 * @author Paul Hammant
 * @version $Revision: 1.4 $
 */
public class DefaultSelenium implements Selenium {

    CommandProcessor commandProcessor;
    private BrowserLauncher launcher;
    public static final String SELENIUM_CONTEXT = "selenium-driver";

    public DefaultSelenium(CommandProcessor commandProcessor, BrowserLauncher launcher) {
        this.commandProcessor = commandProcessor;
        this.launcher = launcher;
    }

    public DefaultSelenium(File webAppRoot, BrowserLauncher launcher) {
        commandProcessor = new JettyCommandProcessor(webAppRoot, SELENIUM_CONTEXT);
        this.launcher = launcher;
    }

    public DefaultSelenium(File webAppRoot) {
        commandProcessor = new JettyCommandProcessor(webAppRoot, SELENIUM_CONTEXT);
        launcher = new DefaultBrowserLauncher();
    }

    public boolean open(String path) {
        return commandProcessor.doCommand("open", path, "").equals("open-done");
    }

    public boolean click(String field) {
        return commandProcessor.doCommand("click", field, "").equals("click-done");
    }

    public boolean setTextField(String field, String value) {
        return commandProcessor.doCommand("setText", field, value).equals("setText-done");
    }

    public void endOfRun() {
        commandProcessor.doCommand("end", "", "");
    }

    public void start() {
        commandProcessor.start();
        launcher.launch("http://localhost:8080/" + SELENIUM_CONTEXT + "/Selenium.html");
    }

    public void stop() {
        launcher.close();
        commandProcessor.stop();
    }
}
