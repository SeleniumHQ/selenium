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

/**
 * Defines an object that runs Selenium commands; end users should primarily interact with this object.
 * @author Paul Hammant
 * @author Aslak Hellesoy
 * @version $Revision$
 */
public interface Selenium extends Startable {

    void answerOnNextPrompt(String value);
    void chooseCancelOnNextConfirmation();
    void click(String field);
    void clickAndWait(String field);
    void fireEvent(String element, String event);
    void goBack();
    void open(String path);
    void pause(int duration); // is this needed for driven ?
    void select(String field, String value);
    void selectAndWait(String field, String value);
    void selectWindow(String window);
    void setTextField(String field, String value);
    void store(String field, String value);
    void storeAttribute(String element, String value);
    void storeText(String element, String value);
    void storeValue(String field, String value);
    /** Instructs the browser that the test is complete and that no more driven commands will arrive */
    void testComplete();
    void type(String field, String value);
    void typeAndWait(String field, String value);
    void verifyAlert(String alert);
    void verifyAttribute(String element, String value);
    void verifyConfirmation(String confirmation);
    void verifyEditable(String field);
    void verifyElementNotPresent(String type);
    void verifyElementPresent(String type);
    void verifyLocation(String location);
    void verifyNotEditable(String field);
    void verifyNotVisible(String element);
    void verifyPrompt(String text);
    void verifySelectOptions(String field, String[] values);
    void verifySelected(String field, String value);
    void verifyTable(String table, String value);
    void verifyText(String type, String text);
    void verifyTextPresent(String text);
    void verifyTextNotPresent(String text);
    void verifyTitle(String title);
    void verifyValue(String field, String value);
    void verifyVisible(String element);
    void waitForValue(String field, String value);
    /** Writes a message to the status bar and adds a note to the 
     * browser-side log. Note that the browser-side logs will <i>not</i>
     * be sent back to the server, and are invisible to the driver.
     * @param context the message to be sent to the browser
     */
    void setContext(String context);
	String[] getAllButtons();
	String[] getAllLinks();
	String[] getAllFields();
    /** Starts the command processor and launches the browser */
    void start();
    /** Kills the browser and stops the command processor */
    void stop();
}
