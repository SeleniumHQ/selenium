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
import com.thoughtworks.selenium.launchers.DefaultBrowserLauncher;

import java.io.File;

/**
 * @author Paul Hammant
 * @version $Revision: 1.8 $
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

    public void open(String path) {
        String result = commandProcessor.doCommand("open", path, "");
        if(!result.equals("OK")) {
            throw new SeleniumException(result);
        };
    }

    public void clickAndWait(String field) {
        String result = commandProcessor.doCommand("clickAndWait", field, "");
        if(!result.equals("OK")) {
            throw new SeleniumException(result);
        };
    }

    public void setTextField(String field, String value) {
        String result = commandProcessor.doCommand("setText", field, value);
        if(!result.equals("OK")) {
            throw new SeleniumException(result);
        };
    }

    public void verifyText(String type, String text) {
    }

    public void verifyLocation(String location) {
    }

    public void testComplete() {
        commandProcessor.doCommand("testComplete", "", "");
    }

    public void start() {
        commandProcessor.start();
        launcher.launch("http://localhost:8080/" + SELENIUM_CONTEXT + "/SeleneseRunner.html");
    }

    public void stop() {
        launcher.close();
        commandProcessor.stop();
    }
}
