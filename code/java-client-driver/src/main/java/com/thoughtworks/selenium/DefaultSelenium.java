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

import java.util.*;

/**
 * The default implementation of the Selenium interface.
 * 
 * @see com.thoughtworks.selenium.Selenium
 * @author Paul Hammant
 * @version $Revision$
 */
public class DefaultSelenium implements Selenium {
    
    private CommandProcessor commandProcessor;
    private String logLevel = null;

    public static final String DEFAULT_SELENIUM_CONTEXT = "selenium";

    /** Uses a CommandBridgeClient, specifying a server host/port, a command to launch the browser, and a starting URL for the browser.
     * 
     * @param serverHost - the host name on which the Selenium Server resides
     * @param serverPort - the port on which the Selenium Server is listening
     * @param browserStartCommand - the command string used to launch the browser, e.g. "*firefox" or "c:\\program files\\internet explorer\\iexplore.exe"
     * @param browserURL - the starting URL including just a domain name.  We'll start the browser pointing at the Selenium resources on this URL,
     * e.g. "http://www.google.com" would send the browser to "http://www.google.com/selenium-server/SeleneseRunner.html"
     */
    public DefaultSelenium(String serverHost, int serverPort, String browserStartCommand, String browserURL) {
        this.commandProcessor = new HttpCommandProcessor(serverHost, serverPort, browserStartCommand, browserURL);
    }
    
    /** Uses an arbitrary CommandProcessor */
    public DefaultSelenium(CommandProcessor processor) {
        this.commandProcessor = processor;
    }

    public void open(String path) {
        doCommandAndFailIfNotSuccess("open", path);
    }

    public void verifyText(String type, String text) {
        doVerify("verifyText", type, text);
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
        return "SeleneseRunner.html?counterToMakeURsUniqueAndSoStopPageCachingInTheBrowser=" + (new Date()).getTime();
    }

    public void answerOnNextPrompt(String value) {
        String result = commandProcessor.doCommand("answerOnNextPrompt", value, "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
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

    public void fireEvent(String element, String event) {
        String result = commandProcessor.doCommand("fireEvent", element, event);
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void goBack() {
        String result = commandProcessor.doCommand("goBack", "", "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void select(String field, String value) {
        String result = commandProcessor.doCommand("select", field, value);
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

    public void type(String field, String value) {
        String result = commandProcessor.doCommand("type", field, value);
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void keyPress(String locator, int keycode) {
        String result = commandProcessor.doCommand("keyPress", locator, Integer.toString(keycode));
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }
    
    public void keyDown(String locator, int keycode) {
        String result = commandProcessor.doCommand("keyDown", locator, Integer.toString(keycode));
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }
    
    public void mouseOver(String locator) {
        String result = commandProcessor.doCommand("mouseOver", locator, "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }
    
    public void mouseDown(String locator) {
        String result = commandProcessor.doCommand("mouseDown", locator, "");
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

    public void verifyAttribute(String element, String attribute, String value) {
        String result = commandProcessor.doCommand("verifyAttribute", element + "@" + attribute, value);
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

    public void verifyEditable(String field) {
        String result = commandProcessor.doCommand("verifyEditable", field, "");
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyNotEditable(String field) {
        String result = commandProcessor.doCommand("verifyNotEditable", field, "");
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

    public void verifyPrompt(String text) {
        String result = commandProcessor.doCommand("verifyPrompt", text, "");
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

    public void verifyTextNotPresent(String text) {
        String result = commandProcessor.doCommand("verifyTextNotPresent", text, "");
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

    public void waitForValue(String field, String value) {
        String result = commandProcessor.doCommand("waitForValue", field, value);
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }
    
    public void verifyVisible(String element) {
        String result = commandProcessor.doCommand("verifyVisible", element, "");
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }

    public void verifyNotVisible(String element) {
        String result = commandProcessor.doCommand("verifyNotVisible", element, "");
        if (!result.equals("PASSED")) {
            throw new SeleniumException(result);
        }
    }
    
    public void setContext(String context) {
        setContext(context, "");   
    }

    public void setContext(String context, String logLevel) {
        commandProcessor.doCommand("setContext", context, logLevel);
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
            result[i] = tokenizer.nextToken();
        }
        return result;
    }

    public String getEval(String script) {
        String stringResult = commandProcessor.doCommand("getEval", script, "");
        return stringResult;
    }
    
    public void start() {
        commandProcessor.start();

    }

    public void stop() {
        commandProcessor.stop();
    }

    public String getLogLevel() {
        return logLevel;
    }

    public boolean getEvalBool(String string) {
        String eval = getEval(string);
        boolean result = "true".equals(eval);
        return result;
    }

    public String[] getAllActions() {
        String stringResult = commandProcessor.doCommand("getAllActions", "", "");
        String[] result = extractDelimitedString(stringResult);
        return result;
    }

    public String[] getAllAccessors() {
        String stringResult = commandProcessor.doCommand("getAllAccessors", "", "");
        String[] result = extractDelimitedString(stringResult);
        return result;
    }
    
    public String[] getAllAsserts() {
        String stringResult = commandProcessor.doCommand("getAllAsserts", "", "");
        String[] result = extractDelimitedString(stringResult);
        return result;
    }

    public void check(String field) {
        String result = commandProcessor.doCommand("check", field, "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void close() {
        String result = commandProcessor.doCommand("close", "", "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void submit(String formLocator) {
        String result = commandProcessor.doCommand("submit", formLocator, "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void uncheck(String field) {
        String result = commandProcessor.doCommand("uncheck", field, "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public void waitForCondition(String script, long timeout) {
        String result = commandProcessor.doCommand("waitForCondition", script, Long.toString(timeout));
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }

    public String getAttribute(String locator, String attribute) {
        String result = commandProcessor.doCommand("getAttribute", locator + "@" + attribute, "");
        return result;
    }

    public String getChecked(String locator) {
        String result = commandProcessor.doCommand("getChecked", locator, "");
        return result;
    }

    public String getTable(String tableLocator) {
        String result = commandProcessor.doCommand("getTable", tableLocator, "");
        return result;
    }

    public String getText(String type) {
        String result = commandProcessor.doCommand("getText", type, "");
        return result;
    }

    public String getValue(String field) {
        String result = commandProcessor.doCommand("getValue", field, "");
        return result;
    }

    public String getTitle() {
        String result = commandProcessor.doCommand("getTitle", "", "");
        return result;
    }

    public String getAbsoluteLocation() {
        String result = commandProcessor.doCommand("getAbsoluteLocation", "", "");
        return result;
    }

    public String getPrompt() {
        String result = commandProcessor.doCommand("getPrompt", "", "");
        return result;
    }

    public String getConfirmation() {
        String result = commandProcessor.doCommand("getConfirmation", "", "");
        return result;
    }

    public String getAlert() {
        String result = commandProcessor.doCommand("getAlert", "", "");
        return result;
    }

    public void waitForPageToLoad(long timeout) {
        String result = commandProcessor.doCommand("waitForCondition", Long.toString(timeout), "");
        if (!result.equals("OK")) {
            throw new SeleniumException(result);
        }
    }
    
    public String[] getSelectOptions(String locator) {
        String stringResult = commandProcessor.doCommand("getSelectOptions", locator, "");
        String[] result = extractDelimitedString(stringResult);
        return result;
    }

    private String doGet(String command, String argument1, String argument2)
    {
        return commandProcessor.doCommand(command, argument1, argument2);
    }

    private String doGet(String command, String argument1)
    {
        return commandProcessor.doCommand(command, argument1, "");
    }

    private String doGet(String command)
    {
        return commandProcessor.doCommand(command, "", "");
    }

    private void doVerify(String command)
    {
        doCommandAndFailIfNotSuccess(command, "", "", "PASSED");
    }

    private void doVerify(String command, String argument1)
    {
        doCommandAndFailIfNotSuccess(command, argument1, "", "PASSED");
    }

    private void doVerify(String command, String argument1, String argument2)
    {
        doCommandAndFailIfNotSuccess(command, argument1, argument2, "PASSED");
    }

    private void doCommandAndFailIfNotSuccess(String command)
    {
        doCommandAndFailIfNotSuccess(command, "", "", "OK");
    }

    private void doCommandAndFailIfNotSuccess(String command, String argument1)
    {
        doCommandAndFailIfNotSuccess(command, argument1, "", "OK");
    }

    private void doCommandAndFailIfNotSuccess(String command, String argument1, String argument2)
    {
        doCommandAndFailIfNotSuccess(command, argument1, argument2, "OK");
    }
    
    private void doCommandAndFailIfNotSuccess(String command, String argument1, String argument2, String expectedResult)
    {
        String actualResult = commandProcessor.doCommand(command, argument1, argument2);
        if (!actualResult.equals(expectedResult))
        {
            throw new SeleniumException(actualResult);
        }
    }
    
}
