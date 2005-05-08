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

import com.thoughtworks.selenium.embedded.jetty.DirectoryStaticContentHandler;
import com.thoughtworks.selenium.embedded.jetty.JettyCommandProcessor;
import com.thoughtworks.selenium.launchers.DefaultBrowserLauncher;

import java.io.File;
import java.util.StringTokenizer;

/**
 * @author Paul Hammant
 * @version $Revision$
 */
public class DefaultSelenium implements Selenium {

    private CommandProcessor commandProcessor;
    private BrowserLauncher launcher;

    public static final String DEFAULT_SELENIUM_CONTEXT = "selenium-driver";

    public DefaultSelenium(CommandProcessor commandProcessor, BrowserLauncher launcher) {
        this.commandProcessor = commandProcessor;
        this.launcher = launcher;
    }

    public DefaultSelenium(File webAppRoot, BrowserLauncher launcher) {
        commandProcessor = new JettyCommandProcessor(webAppRoot, getContextName());
        this.launcher = launcher;
    }

    public DefaultSelenium(File webAppRoot) {
        commandProcessor = new JettyCommandProcessor(webAppRoot, getContextName(),
                new DirectoryStaticContentHandler(new File(DEFAULT_SELENIUM_CONTEXT)));
        launcher = new DefaultBrowserLauncher();
    }

    public void open(String path) {
        String result = commandProcessor.doCommand("open", path, "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void clickAndWait(String field) {
        String result = commandProcessor.doCommand("clickAndWait", field, "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void setTextField(String field, String value) {
        String result = commandProcessor.doCommand("setText", field, value);
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyText(String type, String text) {
        String result = commandProcessor.doCommand("verifyText", type, text);
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyLocation(String location) {
        String result = commandProcessor.doCommand("verifyLocation", location, "");
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void testComplete() {
        commandProcessor.doCommand("testComplete", "", "");
    }

    protected String getContextName() {
        return DEFAULT_SELENIUM_CONTEXT;
    }

    protected String getTestRunnerPageName() {
        return "SeleneseRunner.html";
    }

    public void chooseCancelOnNextConfirmation() {
        String result = commandProcessor.doCommand("chooseCancelOnNextConfirmation", "", "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void click(String field) {
        String result = commandProcessor.doCommand("click", field, "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void pause(int duration) // is this needed for driven ?
    {
        String result = commandProcessor.doCommand("pause", "" + duration, "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void selectAndWait(String field, String value) {
        String result = commandProcessor.doCommand("selectAndWait", field, value);
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void selectWindow(String window) {
        String result = commandProcessor.doCommand("selectWindow", window, "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void storeText(String element, String value) {
        String result = commandProcessor.doCommand("storeText", element, value);
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void storeValue(String field, String value) {
        String result = commandProcessor.doCommand("storeValue", field, value);
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void type(String field, String value) {
        String result = commandProcessor.doCommand("type", field, value);
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void typeAndWait(String field, String value) {
        String result = commandProcessor.doCommand("typeAndWait", field, value);
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyAlert(String alert) {
        String result = commandProcessor.doCommand("verifyAlert", alert, "");
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyAttribute(String element, String value) {
        String result = commandProcessor.doCommand("verifyAttribute", element, value);
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyConfirmation(String confirmation) {
        String result = commandProcessor.doCommand("verifyConfirmation", confirmation, "");
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyElementNotPresent(String type) {
        String result = commandProcessor.doCommand("verifyElementNotPresent", type, "");
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyElementPresent(String type) {
        String result = commandProcessor.doCommand("verifyElementPresent", type, "");
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifySelectOptions(String field, String[] values) {
        String vals = "";
        for (int i = 0; i < values.length; i++) {
            vals = vals + values[i];
            if (i + 1 < values.length) {
                vals = vals + ",";
            }
        }
        String result = commandProcessor.doCommand("verifySelectOptions", field, vals);
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifySelected(String field, String value) {
        String result = commandProcessor.doCommand("verifySelected", field, value);
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyTable(String table, String value) {
        String result = commandProcessor.doCommand("verifyTable", table, value);
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyTextPresent(String text) {
        String result = commandProcessor.doCommand("verifyTextPresent", text, "");
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyTitle(String title) {
        String result = commandProcessor.doCommand("verifyTitle", title, "");
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyValue(String field, String value) {
        String result = commandProcessor.doCommand("verifyValue", field, value);
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }
    
    public void setContext(String context) {
        String result = commandProcessor.doCommand("context", context, "");
    }

    public String[] getAllButtons() {
        String stringResult = commandProcessor.doCommand("getAllButtons", "", "");

        String[] result = extractDelimitedString(stringResult);

        return result;
    }

    public String[] getAllLinks() {
        String stringResult = commandProcessor.doCommand("getAllLinks", "", "");

        String[] result = extractDelimitedString(stringResult);

        return result;
    }

    public String[] getAllFields() {
        String stringResult = commandProcessor.doCommand("getAllFields", "", "");

        String[] result = extractDelimitedString(stringResult);

        return result;
    }

    private String[] extractDelimitedString(String stringResult) {
        StringTokenizer tokenizer = new StringTokenizer(stringResult, ",");
        String[] result = new String[tokenizer.countTokens()];
        for (int i = 0; tokenizer.hasMoreElements(); i++) {
            result[i] = (String) tokenizer.nextToken();
        }
        return result;
    }

    public void start() {
        commandProcessor.start();
        launcher.launch("http://localhost:8080/" + getContextName() + "/" + getTestRunnerPageName());
    }

    public void stop() {
        launcher.close();
        commandProcessor.stop();
    }


}
