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
 *  @author Paul Hammant (Forked from JWebUnit @ SourceForge)
 */
public class DefaultWebTester implements WebTester {

    /**
     * Begin conversation at a url relative to the application root.
     *
     * @param relativeURL
     */
    public void beginAt(String relativeURL) {
    }

    /**
     * Return the value of a web resource based on its key. This translates to a
     * property file lookup with the locale based on the current TestContext.
     *
     * @param key name of the web resource.
     * @return value of the web resource, encoded according to TestContext.
     */
    public String getMessage(String key) {
        return null;
    }

    //Assertions

    /**
     * Assert title of current html page in conversation matches an expected value.
     *
     * @param title expected title value
     */
    public void assertTitleEquals(String title) {
    }

    /**
     * Assert title of current html page matches the value of a specified web resource.
     *
     * @param titleKey web resource key for title
     */
    public void assertTitleEqualsKey(String titleKey) {
    }

    /**
     * Assert that a web resource's value is present.
     *
     * @param key web resource name
     */
    public void assertKeyPresent(String key) {
    }

    /**
     * Assert that supplied text is present.
     *
     * @param text
     */
    public void assertTextPresent(String text) {
    }

    /**
     * Assert that a web resource's value is not present.
     *
     * @param key web resource name
     */
    public void assertKeyNotPresent(String key) {
    }

    /**
     * Assert that supplied text is not present.
     *
     * @param text
     */
    public void assertTextNotPresent(String text) {
    }

    /**
     * Assert that a table with a given summary or id value is present.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     */
    public void assertTablePresent(String tableSummaryOrId) {
    }

    /**
     * Assert that a table with a given summary or id value is not present.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     */
    public void assertTableNotPresent(String tableSummaryOrId) {
    }

    /**
     * Assert that the value of a given web resource is present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param key web resource name
     */
    public void assertKeyInTable(String tableSummaryOrId, String key) {
    }

    /**
     * Assert that supplied text is present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param text
     */
    public void assertTextInTable(String tableSummaryOrId, String text) {
    }

    /**
     * Assert that the values of a set of web resources are all present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param keys Array of web resource names.
     */
    public void assertKeysInTable(String tableSummaryOrId, String[] keys) {
    }

    /**
     * Assert that a set of text values are all present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param text Array of expected text values.
     */
    public void assertTextInTable(String tableSummaryOrId, String[] text) {
    }

    /**
     * Assert that the value of a given web resource is not present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param key web resource name
     */
    public void assertKeyNotInTable(String tableSummaryOrId, String key) {
    }

    /**
     * Assert that supplied text is not present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param text
     */
    public void assertTextNotInTable(String tableSummaryOrId, String text) {
    }

    /**
     * Assert that none of a set of text values are present in a specific table.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param text Array of text values
     */
    public void assertTextNotInTable(String tableSummaryOrId, String[] text) {
    }

    /**
     * Assert that a specific table matches an ExpectedTable.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param expectedTable represents expected values (colspan supported).
     */
    public void assertTableEquals(String tableSummaryOrId, ExpectedTable expectedTable) {
    }

    /**
     * Assert that a specific table matches a matrix of supplied text values.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param expectedCellValues double dimensional array of expected values
     */
    public void assertTableEquals(String tableSummaryOrId, String[][] expectedCellValues) {
    }

    /**
     * Assert that a range of rows for a specific table matches a matrix of supplied text values.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param startRow index of start row for comparison
     * @param expectedTable represents expected values (colspan supported).
     */
    public void assertTableRowsEqual(String tableSummaryOrId, int startRow, ExpectedTable expectedTable) {
    }

    /**
     * Assert that a range of rows for a specific table matches a matrix of supplied text values.
     *
     * @param tableSummaryOrId summary or id attribute value of table
     * @param startRow index of start row for comparison
     * @param expectedCellValues double dimensional array of expected values
     */
    public void assertTableRowsEqual(String tableSummaryOrId, int startRow, String[][] expectedCellValues) {
    }

    /**
     * Assert that a form input element with a given name is present.
     *
     * @param formElementName
     */
    public void assertFormElementPresent(String formElementName) {
    }

    /**
     * Assert that a form input element with a given name is not present.
     *
     * @param formElementName
     */
    public void assertFormElementNotPresent(String formElementName) {
    }

    /**
     * Assert that a form input element with a given label is present.
     *
     * @param formElementLabel label preceding form element.
     * @see #setFormElementWithLabel(String,String)
     */
    public void assertFormElementPresentWithLabel(String formElementLabel) {
    }

    /**
     * Assert that a form input element with a given label is not present.
     *
     * @param formElementLabel label preceding form element.
     * @see #setFormElementWithLabel(String,String)
     */
    public void assertFormElementNotPresentWithLabel(String formElementLabel) {
    }

    /**
     * Assert that there is a form present.
     *
     */
    public void assertFormPresent() {
    }

    /**
     * Assert that there is a form with the specified name or id present.
     * @param nameOrID
     */
    public void assertFormPresent(String nameOrID) {
    }

    /**
     * Assert that there is not a form present.
     *
     */
    public void assertFormNotPresent() {
    }

    /**
     * Assert that there is not a form with the specified name or id present.
     * @param nameOrID
     */
    public void assertFormNotPresent(String nameOrID) {
    }

    /**
     * Assert that a specific form element has an expected value.
     *
     * @param formElementName
     * @param expectedValue
     */
    public void assertFormElementEquals(String formElementName, String expectedValue) {
    }

    /**
     * Assert that a form element had no value / is empty.
     *
     * @param formElementName
     */
    public void assertFormElementEmpty(String formElementName) {
    }

    /**
     * Assert that a specific checkbox is selected.
     *
     * @param checkBoxName
     */
    public void assertCheckboxSelected(String checkBoxName) {
    }

    /**
     * Assert that a specific checkbox is not selected.
     *
     * @param checkBoxName
     */
    public void assertCheckboxNotSelected(String checkBoxName) {
    }

    /**
     * Assert that a specific option is present in a radio group.
     *
     * @param name radio group name.
     * @param radioOption option to test for.
     */
    public void assertRadioOptionPresent(String name, String radioOption) {
    }

    /**
     * Assert that a specific option is not present in a radio group.
     *
     * @param name radio group name.
     * @param radioOption option to test for.
     */
    public void assertRadioOptionNotPresent(String name, String radioOption) {
    }

    /**
     * Assert that a specific option is selected in a radio group.
     *
     * @param name radio group name.
     * @param radioOption option to test for selection.
     */
    public void assertRadioOptionSelected(String name, String radioOption) {
    }

    /**
     * Assert that a specific option is not selected in a radio group.
     *
     * @param name radio group name.
     * @param radioOption option to test for selection.
     */
    public void assertRadioOptionNotSelected(String name, String radioOption) {
    }

    /**
     * Assert that the display values of a select element's options match a given array of strings.
     *
     * @param selectName name of the select element.
     * @param expectedOptions expected display values for the select box.
     */
    public void assertOptionsEqual(String selectName, String[] expectedOptions) {
    }

    /**
     * Assert that the display values of a select element's options do not match a given array of strings.
     *
     * @param selectName name of the select element.
     * @param expectedOptions expected display values for the select box.
     */
    public void assertOptionsNotEqual(String selectName, String[] expectedOptions) {
    }

    /**
     * Assert that the values of a select element's options match a given array of strings.
     *
     * @param selectName name of the select element.
     * @param expectedValues expected values for the select box.
     */
    public void assertOptionValuesEqual(String selectName, String[] expectedValues) {
    }

    /**
     * Assert that the values of a select element's options do not match a given array of strings.
     *
     * @param selectName name of the select element.
     * @param optionValues expected values for the select box.
     */
    public void assertOptionValuesNotEqual(String selectName, String[] optionValues) {
    }

    /**
     * Assert that the currently selected display value of a select box matches a given value.
     *
     * @param selectName name of the select element.
     * @param option expected display value of the selected option.
     */
    public void assertOptionEquals(String selectName, String option) {
    }

    /**
     * Assert that a submit button with a given name is present.
     *
     * @param buttonName
     */
    public void assertSubmitButtonPresent(String buttonName) {
    }

    /**
     * Assert that a submit button with a given name is not present.
     *
     * @param buttonName
     */
    public void assertSubmitButtonNotPresent(String buttonName) {
    }

    /**
     * Assert that a submit button with a given name and value is present.
     *
     * @param buttonName
     * @param expectedValue
     */
    public void assertSubmitButtonValue(String buttonName, String expectedValue) {
    }

    /**
     * Assert that a button with a given id is present.
     *
     * @param buttonId
     */
    public void assertButtonPresent(String buttonId) {
    }

    /**
     * Assert that a button with a given id is not present.
     *
     * @param buttonId
     */
    public void assertButtonNotPresent(String buttonId) {
    }


    /**
     * Assert that a link with a given id is present in the response.
     *
     * @param linkId
     */
    public void assertLinkPresent(String linkId) {
    }

    /**
     * Assert that no link with the given id is present in the response.
     *
     * @param linkId
     */
    public void assertLinkNotPresent(String linkId) {
    }

    /**
     * Assert that a link containing the supplied text is present.
     *
     * @param linkText
     */
    public void assertLinkPresentWithText(String linkText) {
    }

    /**
     * Assert that no link containing the supplied text is present.
     *
     * @param linkText
     */
    public void assertLinkNotPresentWithText(String linkText) {
    }

    /**
     * Assert that a link containing the supplied text is present.
     *
     * @param linkText
     * @param index The 0-based index, when more than one link with the same
     *              text is expected.
     */
    public void assertLinkPresentWithText(String linkText, int index) {
    }

    /**
     * Assert that no link containing the supplied text is present.
     *
     * @param linkText
     * @param index The 0-based index, when more than one link with the same
     *              text is expected.
     */
    public void assertLinkNotPresentWithText(String linkText, int index) {
    }


    //BEGIN RFE 996031...

    /**
     * Assert that a link containing the Exact text is present.
     *
     * @param linkText
     */
    public void assertLinkPresentWithExactText(String linkText) {
    }

    /**
     * Assert that no link containing the Exact text is present.
     *
     * @param linkText
     */
    public void assertLinkNotPresentWithExactText(String linkText) {
    }

    /**
     * Assert that a link containing the Exact text is present.
     *
     * @param linkText
     * @param index The 0-based index, when more than one link with the same
     *              text is expected.
     */
    public void assertLinkPresentWithExactText(String linkText, int index) {
    }

    /**
     * Assert that no link containing the Exact text is present.
     *
     * @param linkText
     * @param index The 0-based index, when more than one link with the same
     *              text is expected.
     */
    public void assertLinkNotPresentWithExactText(String linkText, int index) {
    }

    //END RFE 996031...



    /**
     * Assert that a link containing a specified image is present.
     *
     * @param imageFileName A suffix of the image's filename; for example, to match
     *                      <tt>"images/my_icon.png"</tt>, you could just pass in
     *                      <tt>"my_icon.png"</tt>.
     */
    public void assertLinkPresentWithImage(String imageFileName) {
    }

    /**
     * Assert that a link containing a specified image is not present.
     *
     * @param imageFileName A suffix of the image's filename; for example, to match
     *                      <tt>"images/my_icon.png"</tt>, you could just pass in
     *                      <tt>"my_icon.png"</tt>.
     */
    public void assertLinkNotPresentWithImage(String imageFileName) {
    }

    /**
     * Assert that an element with a given id is present.
     *
     * @param anID element id to test for.
     */
    public void assertElementPresent(String anID) {
    }

    /**
     * Assert that an element with a given id is not present.
     *
     * @param anID element id to test for.
     */
    public void assertElementNotPresent(String anID) {
    }

    /**
     * Assert that a given element contains specific text.
     *
     * @param elementID id of element to be inspected.
     * @param text to check for.
     */
    public void assertTextInElement(String elementID, String text) {
    }

    public void assertTextNotInElement(String elementID, String text) {
    }

    /**
     * Assert that a window with the given name is open.
     *
     * @param windowName
     */
    public void assertWindowPresent(String windowName) {
    }

    /**
     * Assert that a frame with the given name is present.
     *
     * @param frameName
     */
    public void assertFramePresent(String frameName) {
    }

    /**
     *  Checks to see if a cookie is present in the response.
     *  Contributed by Vivek Venugopalan.
     *
     * @param cookieName  The cookie name
     */
    public void assertCookiePresent(String cookieName) {
	}

    public void assertCookieValueEquals(String cookieName, String expectedValue) {
    }

    public void dumpCookies() {
    }

    public void dumpCookies(PrintStream stream) {
    }

// is Pattern methods


    /**
     * Return true if given text is present anywhere in the current response.
     *
     * @param text
     *            string to check for.
     */
    public boolean isTextInResponse(String text) {
        return false;
    }



//Form interaction methods

    /**
     * Gets the value of a form input element.  Allows getting information from a form element.
     * Also, checks assertions as well.
     *
     * @param formElementName name of form element.
     * @param formElementName
     */
    public String getFormElementValue(String formElementName) {
        return null;
    }



    /**
     * Begin interaction with a specified form.  If form interaction methods are called without
     * explicitly calling this method first, jWebUnit will attempt to determine itself which form
     * is being manipulated.
     *
     * It is not necessary to call this method if their is only one form on the current page.
     *
     * @param nameOrId name or id of the form to work with.
     */
    public void setWorkingForm(String nameOrId) {
    }

    /**
     * Set the value of a form input element.
     *
     * @param formElementName name of form element.
     * @param value
     */
    public void setFormElement(String formElementName, String value) {
    }

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
    public void setFormElementWithLabel(String formElementLabel,
                                           String value) {
    }

    /**
     * Select a specified checkbox.
     *
     * @param checkBoxName name of checkbox to be deselected.
     */
    public void checkCheckbox(String checkBoxName) {
    }

    public void checkCheckbox(String checkBoxName, String value) {
    }

    /**
     * Deselect a specified checkbox.
     *
     * @param checkBoxName name of checkbox to be deselected.
     */
    public void uncheckCheckbox(String checkBoxName) {
    }

    public void uncheckCheckbox(String checkBoxName, String value) {
    }

    /**
     * Select an option with a given display value in a select element.
     *
     * @param selectName name of select element.
     * @param option display value of option to be selected.
     */
    public void selectOption(String selectName, String option) {
    }

    //Form submission and link navigation methods

    /**
     * Submit form - default submit button will be used (unnamed submit button, or
     * named button if there is only one on the form.
     */
    public void submit() {
    }

    /**
     * Submit form by pressing named button.
     *
     * @param buttonName name of button to submit form with.
     */
    public void submit(String buttonName) {
    }

    /**
     * Reset the current form.
     */
    public void reset() {
    }

    /**
     * Navigate by selection of a link containing given text.
     *
     * @param linkText
     */
    public void clickLinkWithText(String linkText) {
    }

    /**
     * Navigate by selection of a link containing given text.
     *
     * @param linkText
     * @param index The 0-based index, when more than one link with the same
     *              text is expected.
     */
    public void clickLinkWithText(String linkText, int index) {
    }


    /**
     * Navigate by selection of a link with the exact given text.
     *
     * SF.NET RFE: 996031
     *
     * @param linkText
     */
    public void clickLinkWithExactText(String linkText) {
    }

    /**
     * Navigate by selection of a link with the exact given text.
     *
     * SF.NET RFE: 996031
     * @param linkText
     * @param index The 0-based index, when more than one link with the same
     *              text is expected.
     */
    public void clickLinkWithExactText(String linkText, int index) {
    }



    /**
     * Search for labelText in the document, then search forward until
     * finding a link called linkText.  Click it.
     */
    public void clickLinkWithTextAfterText(String linkText, String labelText) {
    }

    /**
     * Click the button with the given id.
     *
     * @param buttonId
     */
    public void clickButton(String buttonId) {
    }

    /**
     * Navigate by selection of a link with a given image.
     *
     * @param imageFileName A suffix of the image's filename; for example, to match
     *                      <tt>"images/my_icon.png"</tt>, you could just pass in
     *                      <tt>"my_icon.png"</tt>.
     */
    public void clickLinkWithImage(String imageFileName) {
    }


    /**
     * Navigate by selection of a link with given id.
     *
     * @param linkId id of link
     */
    public void clickLink(String linkId) {
    }

    /**
     * Clicks a radio option.  Asserts that the radio option exists first.
     *
     * * @param radioGroup
	 *			name of the radio group.
	 * @param radioOption
	 * 			value of the option to check for.
     */
    public void clickRadioOption(String radioGroup, String radioOption) {
    }

//Window and Frame Navigation Methods

    /**
     * Make a given window active (current response will be window's contents).
     *
     * @param windowName
     */
    public void gotoWindow(String windowName) {
    }

    /**
     * Make the root window active.
     */
    public void gotoRootWindow() {
    }

    /**
     * Make the named frame active (current response will be frame's contents).
     *
     * @param frameName
     */
    public void gotoFrame(String frameName) {
    }

    /**
     *  Patch sumbitted by Alex Chaffee.
     */
    public void gotoPage(String url) {
    }

//Debug methods


    /**
     * Dump html of current response to System.out - for debugging purposes.
     */
    public void dumpResponse() {
    }

    /**
     * Dump html of current response to a specified stream - for debugging purposes.
     *
     * @param stream
     */
    public void dumpResponse(PrintStream stream) {
    }

    /**
     * Dump the table as the 2D array that is used for assertions - for debugging purposes.
     *
     * @param tableNameOrId
     * @param stream
     */
    public void dumpTable(String tableNameOrId, PrintStream stream) {
    }

    /**
     * Dump the table as the 2D array that is used for assertions - for debugging purposes.
     *
     * @param tableNameOrId
     * @param table
     */
    public void dumpTable(String tableNameOrId, String[][] table) {
    }

    /**
     * Dump the table as the 2D array that is used for assertions - for debugging purposes.
     *
     * @param tableNameOrId
     * @param table
     * @param stream
     */
    public void dumpTable(String tableNameOrId, String[][] table, PrintStream stream) {
    }

}