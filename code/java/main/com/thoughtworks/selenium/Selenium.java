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
 * @author Paul Hammant
 * @version $Revision$
 */
public interface Selenium extends Startable {

    void chooseCancelOnNextConfirmation();
    void click(String field);
    void clickAndWait(String field);
    void open(String path);
    void pause(int duration); // is this needed for driven ?
    void selectAndWait(String field, String value);
    void selectWindow(String window);
    void setTextField(String field, String value);
    void storeText(String element, String value);
    void storeValue(String field, String value);
    void testComplete();
    void type(String field, String value);
    void typeAndWait(String field, String value);
    void verifyAlert(String alert);
    void verifyAttribute(String element, String value);
    void verifyConfirmation(String confirmation);
    void verifyElementNotPresent(String type);
    void verifyElementPresent(String type);
    void verifyLocation(String location);
    void verifySelectOptions(String field, String[] values);
    void verifySelected(String field, String value);
    void verifyTable(String table, String value);
    void verifyText(String type, String text);
    void verifyTextPresent(String type, String text);
    void verifyTitle(String title);
    void verifyValue(String field, String value);
}
