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
package com.thoughtworks.selenium.jwebunit;

import java.io.PrintStream;

/**
 * Provides a high-level API for basic web application navigation and validation
 * by wrapping HttpUnit and providing Junit assertions.  It supports use of a property file for web
 * resources (a la Struts), though a resource file for the app is not required.
 *
 *  @author Jim Weaver
 *  @author Wilkes Joiner
 *  @author Paul Hammant (Forked from JWebUnit @ SourceForge, Unilaterally I/I separated)
 *  @version $Revision: 1.8 $
 */
interface WebTester {

    /**
     * Begin conversation at a url relative to the application root.
     *
     * @param relativeURL
     */
    void beginAt(String relativeURL);


    /**
     * Return the value of a web resource based on its key. This translates to a
     * property file lookup with the locale based on the current TestContext.
     *
     * @param key name of the web resource.
     * @return value of the web resource, encoded according to TestContext.
     */
    String getMessage(String key);



    //Assertions

    /**
     * Assert title of current html page in conversation matches an expected value.
     *
     * @param title expected title value
     */
    void assertTitleEquals(String title);


    /**
     * Assert title of current html page matches the value of a specified web resource.
     *
     * @param titleKey web resource key for title
     */
    void assertTitleEqualsKey(String titleKey);


    /**
     * Assert that a web resource's value is present.
     *
     * @param key web resource name
     */
    void assertKeyPresent(String key);


    /**
     * Assert that supplied text is present.
     *
     * @param text
     */
    void assertTextPresent(String text);


    /**
     * Assert that a web resource's value is not present.
     *
     * @param key web resource name
     */
    void assertKeyNotPresent(String key);


    /**
     * Assert that supplied text is not present.
     *
     * @param text
     */
    void assertTextNotPresent(String text);


    /**
     * Assert that a table with a given summary or id value is present.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     */
    void assertTablePresent(String tableSummaryOrId);


    /**
     * Assert that a table with a given summary or id value is not present.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     */
    void assertTableNotPresent(String tableSummaryOrId);


    /**
     * Assert that the value of a given web resource is present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param key              web resource name
     */
    void assertKeyInTable(String tableSummaryOrId, String key);


    /**
     * Assert that supplied text is present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param text
     */
    void assertTextInTable(String tableSummaryOrId, String text);


    /**
     * Assert that the values of a set of web resources are all present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param keys             Array of web resource names.
     */
    void assertKeysInTable(String tableSummaryOrId, String[] keys);


    /**
     * Assert that a set of text values are all present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param text             Array of expected text values.
     */
    void assertTextInTable(String tableSummaryOrId, String[] text);


    /**
     * Assert that the value of a given web resource is not present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param key              web resource name
     */
    void assertKeyNotInTable(String tableSummaryOrId, String key);


    /**
     * Assert that supplied text is not present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param text
     */
    void assertTextNotInTable(String tableSummaryOrId, String text);


    /**
     * Assert that none of a set of text values are present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param text             Array of text values
     */
    void assertTextNotInTable(String tableSummaryOrId, String[] text);


    /**
     * Assert that a specific table matches an ExpectedTable.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param expectedTable    represents expected values (colspan supported).
     */
    void assertTableEquals(String tableSummaryOrId, ExpectedTable expectedTable);


    /**
     * Assert that a specific table matches a matrix of supplied text values.
     *
     * @param tableSummaryOrId   summary or id attribute value of table
     * @param expectedCellValues double dimensional array of expected values
     */
    void assertTableEquals(String tableSummaryOrId, String[][] expectedCellValues);


    /**
     * Assert that a range of rows for a specific table matches a matrix of supplied text values.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param startRow         index of start row for comparison
     * @param expectedTable    represents expected values (colspan supported).
     */
    void assertTableRowsEqual(String tableSummaryOrId, int startRow, ExpectedTable expectedTable);


    /**
     * Assert that a range of rows for a specific table matches a matrix of supplied text values.
     *
     * @param tableSummaryOrId   summary or id attribute value of table
     * @param startRow           index of start row for comparison
     * @param expectedCellValues double dimensional array of expected values
     */
    void assertTableRowsEqual(String tableSummaryOrId, int startRow, String[][] expectedCellValues);


    /**
     * Assert that a form input element with a given name is present.
     *
     * @param formElementName
     */
    void assertFormElementPresent(String formElementName);


    /**
     * Assert that a form input element with a given name is not present.
     *
     * @param formElementName
     */
    void assertFormElementNotPresent(String formElementName);


    /**
     * Assert that a form input element with a given label is present.
     *
     * @param formElementLabel label preceding form element.
     * @see #setFormElementWithLabel(String,String)
     */
    void assertFormElementPresentWithLabel(String formElementLabel);


    /**
     * Assert that a form input element with a given label is not present.
     *
     * @param formElementLabel label preceding form element.
     * @see #setFormElementWithLabel(String,String)
     */
    void assertFormElementNotPresentWithLabel(String formElementLabel);


    /**
     * Assert that there is a form present.
     */
    void assertFormPresent();


    /**
     * Assert that there is a form with the specified name or id present.
     *
     * @param nameOrID
     */
    void assertFormPresent(String nameOrID);


    /**
     * Assert that there is not a form present.
     */
    void assertFormNotPresent();


    /**
     * Assert that there is not a form with the specified name or id present.
     *
     * @param nameOrID
     */
    void assertFormNotPresent(String nameOrID);


    /**
     * Assert that a specific form element has an expected value.
     *
     * @param formElementName
     * @param expectedValue
     */
    void assertFormElementEquals(String formElementName, String expectedValue);


    /**
     * Assert that a form element had no value / is empty.
     *
     * @param formElementName
     */
    void assertFormElementEmpty(String formElementName);


    /**
     * Assert that a specific checkbox is selected.
     *
     * @param checkBoxName
     */
    void assertCheckboxSelected(String checkBoxName);


    /**
     * Assert that a specific checkbox is not selected.
     *
     * @param checkBoxName
     */
    void assertCheckboxNotSelected(String checkBoxName);


    /**
     * Assert that a specific option is present in a radio group.
     *
     * @param name        radio group name.
     * @param radioOption option to test for.
     */
    void assertRadioOptionPresent(String name, String radioOption);


    /**
     * Assert that a specific option is not present in a radio group.
     *
     * @param name        radio group name.
     * @param radioOption option to test for.
     */
    void assertRadioOptionNotPresent(String name, String radioOption);


    /**
     * Assert that a specific option is selected in a radio group.
     *
     * @param name        radio group name.
     * @param radioOption option to test for selection.
     */
    void assertRadioOptionSelected(String name, String radioOption);


    /**
     * Assert that a specific option is not selected in a radio group.
     *
     * @param name        radio group name.
     * @param radioOption option to test for selection.
     */
    void assertRadioOptionNotSelected(String name, String radioOption);


    /**
     * Assert that the display values of a select element's options match a given array of strings.
     *
     * @param selectName      name of the select element.
     * @param expectedOptions expected display values for the select box.
     */
    void assertOptionsEqual(String selectName, String[] expectedOptions);


    /**
     * Assert that the display values of a select element's options do not match a given array of strings.
     *
     * @param selectName      name of the select element.
     * @param expectedOptions expected display values for the select box.
     */
    void assertOptionsNotEqual(String selectName, String[] expectedOptions);


    /**
     * Assert that the values of a select element's options match a given array of strings.
     *
     * @param selectName     name of the select element.
     * @param expectedValues expected values for the select box.
     */
    void assertOptionValuesEqual(String selectName, String[] expectedValues);


    /**
     * Assert that the values of a select element's options do not match a given array of strings.
     *
     * @param selectName   name of the select element.
     * @param optionValues expected values for the select box.
     */
    void assertOptionValuesNotEqual(String selectName, String[] optionValues);


    /**
     * Assert that the currently selected display value of a select box matches a given value.
     *
     * @param selectName name of the select element.
     * @param option     expected display value of the selected option.
     */
    void assertOptionEquals(String selectName, String option);


    /**
     * Assert that a submit button with a given name is present.
     *
     * @param buttonName
     */
    void assertSubmitButtonPresent(String buttonName);


    /**
     * Assert that a submit button with a given name is not present.
     *
     * @param buttonName
     */
    void assertSubmitButtonNotPresent(String buttonName);


    /**
     * Assert that a submit button with a given name and value is present.
     *
     * @param buttonName
     * @param expectedValue
     */
    void assertSubmitButtonValue(String buttonName, String expectedValue);


    /**
     * Assert that a button with a given id is present.
     *
     * @param buttonId
     */
    void assertButtonPresent(String buttonId);


    /**
     * Assert that a button with a given id is not present.
     *
     * @param buttonId
     */
    void assertButtonNotPresent(String buttonId);


    /**
     * Assert that a link with a given id is present in the response.
     *
     * @param linkId
     */
    void assertLinkPresent(String linkId);


    /**
     * Assert that no link with the given id is present in the response.
     *
     * @param linkId
     */
    void assertLinkNotPresent(String linkId);


    /**
     * Assert that a link containing the supplied text is present.
     *
     * @param linkText
     */
    void assertLinkPresentWithText(String linkText);


    /**
     * Assert that no link containing the supplied text is present.
     *
     * @param linkText
     */
    void assertLinkNotPresentWithText(String linkText);


    /**
     * Assert that a link containing the supplied text is present.
     *
     * @param linkText
     * @param index    The 0-based index, when more than one link with the same
     *                 text is expected.
     */
    void assertLinkPresentWithText(String linkText, int index);


    /**
     * Assert that no link containing the supplied text is present.
     *
     * @param linkText
     * @param index    The 0-based index, when more than one link with the same
     *                 text is expected.
     */
    void assertLinkNotPresentWithText(String linkText, int index);



    //BEGIN RFE 996031...

    /**
     * Assert that a link containing the Exact text is present.
     *
     * @param linkText
     */
    void assertLinkPresentWithExactText(String linkText);


    /**
     * Assert that no link containing the Exact text is present.
     *
     * @param linkText
     */
    void assertLinkNotPresentWithExactText(String linkText);


    /**
     * Assert that a link containing the Exact text is present.
     *
     * @param linkText
     * @param index    The 0-based index, when more than one link with the same
     *                 text is expected.
     */
    void assertLinkPresentWithExactText(String linkText, int index);


    /**
     * Assert that no link containing the Exact text is present.
     *
     * @param linkText
     * @param index    The 0-based index, when more than one link with the same
     *                 text is expected.
     */
    void assertLinkNotPresentWithExactText(String linkText, int index);


    //END RFE 996031...



    /**
     * Assert that a link containing a specified image is present.
     *
     * @param imageFileName A suffix of the image's filename; for example, to match
     *                      <tt>"images/my_icon.png"</tt>, you could just pass in
     *                      <tt>"my_icon.png"</tt>.
     */
    void assertLinkPresentWithImage(String imageFileName);


    /**
     * Assert that a link containing a specified image is not present.
     *
     * @param imageFileName A suffix of the image's filename; for example, to match
     *                      <tt>"images/my_icon.png"</tt>, you could just pass in
     *                      <tt>"my_icon.png"</tt>.
     */
    void assertLinkNotPresentWithImage(String imageFileName);


    /**
     * Assert that an element with a given id is present.
     *
     * @param anID element id to test for.
     */
    void assertElementPresent(String anID);


    /**
     * Assert that an element with a given id is not present.
     *
     * @param anID element id to test for.
     */
    void assertElementNotPresent(String anID);


    /**
     * Assert that a given element contains specific text.
     *
     * @param elementID id of element to be inspected.
     * @param text      to check for.
     */
    void assertTextInElement(String elementID, String text);


    void assertTextNotInElement(String elementID, String text);


    /**
     * Assert that a window with the given name is open.
     *
     * @param windowName
     */
    void assertWindowPresent(String windowName);


    /**
     * Assert that a frame with the given name is present.
     *
     * @param frameName
     */
    void assertFramePresent(String frameName);


    /**
     * Checks to see if a cookie is present in the response.
     * Contributed by Vivek Venugopalan.
     *
     * @param cookieName The cookie name
     */
    void assertCookiePresent(String cookieName);


    void assertCookieValueEquals(String cookieName, String expectedValue);


    void dumpCookies();


    void dumpCookies(PrintStream stream);


// is Pattern methods


    /**
     * Return true if given text is present anywhere in the current response.
     *
     * @param text string to check for.
     */
    boolean isTextInResponse(String text);

//Form interaction methods

    /**
     * Gets the value of a form input element.  Allows getting information from a form element.
     * Also, checks assertions as well.
     *
     * @param formElementName name of form element.
     * @param formElementName
     */
    String getFormElementValue(String formElementName);


    /**
     * Begin interaction with a specified form.  If form interaction methods are called without
     * explicitly calling this method first, jWebUnit will attempt to determine itself which form
     * is being manipulated.
     * <p/>
     * It is not necessary to call this method if their is only one form on the current page.
     *
     * @param nameOrId name or id of the form to work with.
     */
    void setWorkingForm(String nameOrId);


    /**
     * Set the value of a form input element.
     *
     * @param formElementName name of form element.
     * @param value
     */
    void setFormElement(String formElementName, String value);


    /**
     * Set the value of a form input element. The element is identified by a
     * preceding "label". For example, in "<code>Home Address : &lt;input
     * type='text' name='home_addr' /&gt;</code>", "<code>Home Address</code>"
     * could be used as a label. The label must appear within the associated
     * <code>&lt;form&gt;</code> tag.
     *
     * @param formElementLabel label preceding form element.
     * @param value
     */
    void setFormElementWithLabel(String formElementLabel,
                                 String value);


    /**
     * Select a specified checkbox.
     *
     * @param checkBoxName name of checkbox to be deselected.
     */
    void checkCheckbox(String checkBoxName);


    void checkCheckbox(String checkBoxName, String value);


    /**
     * Deselect a specified checkbox.
     *
     * @param checkBoxName name of checkbox to be deselected.
     */
    void uncheckCheckbox(String checkBoxName);


    void uncheckCheckbox(String checkBoxName, String value);


    /**
     * Select an option with a given display value in a select element.
     *
     * @param selectName name of select element.
     * @param option     display value of option to be selected.
     */
    void selectOption(String selectName, String option);


    //Form submission and link navigation methods

    /**
     * Submit form - default submit button will be used (unnamed submit button, or
     * named button if there is only one on the form.
     */
    void submit();


    /**
     * Submit form by pressing named button.
     *
     * @param buttonName name of button to submit form with.
     */
    void submit(String buttonName);


    /**
     * Reset the current form.
     */
    void reset();


    /**
     * Navigate by selection of a link containing given text.
     *
     * @param linkText
     */
    void clickLinkWithText(String linkText);


    /**
     * Navigate by selection of a link containing given text.
     *
     * @param linkText
     * @param index    The 0-based index, when more than one link with the same
     *                 text is expected.
     */
    void clickLinkWithText(String linkText, int index);


    /**
     * Navigate by selection of a link with the exact given text.
     * <p/>
     * SF.NET RFE: 996031
     *
     * @param linkText
     */
    void clickLinkWithExactText(String linkText);


    /**
     * Navigate by selection of a link with the exact given text.
     * <p/>
     * SF.NET RFE: 996031
     *
     * @param linkText
     * @param index    The 0-based index, when more than one link with the same
     *                 text is expected.
     */
    void clickLinkWithExactText(String linkText, int index);


    /**
     * Search for labelText in the document, then search forward until
     * finding a link called linkText.  Click it.
     */
    void clickLinkWithTextAfterText(String linkText, String labelText);


    /**
     * Click the button with the given id.
     *
     * @param buttonId
     */
    void clickButton(String buttonId);


    /**
     * Navigate by selection of a link with a given image.
     *
     * @param imageFileName A suffix of the image's filename; for example, to match
     *                      <tt>"images/my_icon.png"</tt>, you could just pass in
     *                      <tt>"my_icon.png"</tt>.
     */
    void clickLinkWithImage(String imageFileName);


    /**
     * Navigate by selection of a link with given id.
     *
     * @param linkId id of link
     */
    void clickLink(String linkId);


    /**
     * Clicks a radio option.  Asserts that the radio option exists first.
     * <p/>
     * * @param radioGroup
     * name of the radio group.
     *
     * @param radioOption value of the option to check for.
     */
    void clickRadioOption(String radioGroup, String radioOption);


//Window and Frame Navigation Methods

    /**
     * Make a given window active (current response will be window's contents).
     *
     * @param windowName
     */
    void gotoWindow(String windowName);


    /**
     * Make the root window active.
     */
    void gotoRootWindow();


    /**
     * Make the named frame active (current response will be frame's contents).
     *
     * @param frameName
     */
    void gotoFrame(String frameName);


    /**
     * Patch sumbitted by Alex Chaffee.
     */
    void gotoPage(String url);


//Debug methods


    /**
     * Dump html of current response to System.out - for debugging purposes.
     */
    void dumpResponse();


    /**
     * Dump html of current response to a specified stream - for debugging purposes.
     *
     * @param stream
     */
    void dumpResponse(PrintStream stream);


    /**
     * Dump the table as the 2D array that is used for assertions - for debugging purposes.
     *
     * @param tableNameOrId
     * @param stream
     */
    void dumpTable(String tableNameOrId, PrintStream stream);


    /**
     * Dump the table as the 2D array that is used for assertions - for debugging purposes.
     *
     * @param tableNameOrId
     * @param table
     */
    void dumpTable(String tableNameOrId, String[][] table);


    /**
     * Dump the table as the 2D array that is used for assertions - for debugging purposes.
     *
     * @param tableNameOrId
     * @param table
     * @param stream
     */
    void dumpTable(String tableNameOrId, String[][] table, PrintStream stream);


}
