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
 * Defines an object that runs Selenium commands; <i>end users should primarily
 * interact with this object</i>.
 * 
 * Normally you'll begin by creating a new Selenium object and then running the
 * <code>start</code> methed to prepare a new test session. When you are
 * finished with the current browser session, call stop() to clean up the
 * session and kill the browser.
 * <h3><a name="locators"></a>Element Locators</h3>
 * <p>
 * Element Locators tell Selenium which HTML element a command refers to. Many
 * commands require an Element Locator as a parameter.
 * 
 * We support the following strategies for locating elements:
 * </p>
 * <blockquote>
 * <dl>
 * <dt><strong>identifier=</strong><em>id</em></dt>
 * <dd>Select the element with the specified &#64;id attribute. If no match is
 * found, select the first element whose &#64;name attribute is <em>id</em>.
 * (This is normally the default; see below.)</dd>
 * <dt><strong>id=</strong><em>id</em></dt>
 * <dd>Select the element with the specified &#64;id attribute.</dd>
 * 
 * <dt><strong>name=</strong><em>name</em></dt>
 * <dd>Select the first element with the specified &#64;name attribute.</dd>
 * <dt><strong>dom=</strong><em>javascriptExpression</em></dt>
 * 
 * <dd>
 * 
 * <dd>Find an element using JavaScript traversal of the HTML Document Object
 * Model. DOM locators <em>must</em> begin with &quot;document.&quot;.
 * <ul class="first last simple">
 * <li>dom=document.forms['myForm'].myDropdown</li>
 * <li>dom=document.images[56]</li>
 * </ul>
 * </dd>
 * 
 * </dd>
 * 
 * <dt><strong>xpath=</strong><em>xpathExpression</em></dt>
 * <dd>Locate an element using an XPath expression. XPath locators
 * <em>must</em> begin with &quot;//&quot;.
 * <ul class="first last simple">
 * <li>xpath=//img[&#64;alt='The image alt text']</li>
 * <li>xpath=//table[&#64;id='table1']//tr[4]/td[2]</li>
 * 
 * </ul>
 * </dd>
 * <dt><strong>link=</strong><em>textPattern</em></dt>
 * <dd>Select the link (anchor) element which contains text matching the
 * specified <em>pattern</em>.
 * <ul class="first last simple">
 * <li>link=The link text</li>
 * </ul>
 * 
 * </dd>
 * </dl>
 * </blockquote>
 * <p>
 * Without an explicit locator prefix, Selenium uses the following default
 * strategies:
 * </p>
 * 
 * <ul class="simple">
 * <li><strong>dom</strong>, for locators starting with &quot;document.&quot;</li>
 * <li><strong>xpath</strong>, for locators starting with &quot;//&quot;</li>
 * <li><strong>identifier</strong>, otherwise</li>
 * 
 * </ul>
 * <h3><a name="patterns"></a>String-match Patterns</h3>
 * 
 * <p>
 * Various Pattern syntaxes are available for matching string values:
 * </p>
 * <blockquote>
 * <dl>
 * <dt><strong>glob:</strong><em>pattern</em></dt>
 * <dd>Match a string against a "glob" (aka "wildmat") pattern. "Glob" is a
 * kind of limited regular-expression syntax typically used in command-line
 * shells. In a glob pattern, "*" represents any sequence of characters, and "?"
 * represents any single character. Glob patterns match against the entire
 * string.</dd>
 * <dt><strong>regexp:</strong><em>regexp</em></dt>
 * <dd>Match a string using a regular-expression. The full power of JavaScript
 * regular-expressions is available.</dd>
 * <dt><strong>exact:</strong><em>string</em></dt>
 * 
 * <dd>Match a string exactly, verbatim, without any of that fancy wildcard
 * stuff.</dd>
 * </dl>
 * </blockquote>
 * <p>
 * If no pattern prefix is specified, Selenium assumes that it's a "glob"
 * pattern.
 * </p>
 * 
 * @see com.thoughtworks.selenium.DefaultSelenium
 * @author Paul Hammant
 * @author Aslak Hellesoy
 * @version $Revision$
 */
public interface Selenium {

    /**
     * Instructs Selenium to return the specified answerString in response to
     * the next JavaScript prompt [window.prompt()].
     * 
     * <p>
     * Example: <code>answerOnNextPrompt("Kangaroo");</code>
     * 
     * @param answerString
     */
    void answerOnNextPrompt(String answerString);

    /**
     * Instructs Selenium to click "Cancel" on the next JavaScript confirmation
     * dialog to be raised. By default, the confirm function will return true,
     * having the same effect as manually clicking OK. After running this
     * command, the next confirmation will behave as if the user had clicked
     * Cancel.
     * 
     */
    void chooseCancelOnNextConfirmation();

    /**
     * Check a toggle-button (checkbox/radio)
     * 
     * @param locator -
     *            an <a href="#locators">element locator</a>
     */
    void check(String locator);

    /**
     * Clicks on a link, button, checkbox or radio button. If the click action
     * causes a new page to load (like a link usually does), call
     * waitForPageToLoad.
     * 
     * @param locator -
     *            an <a href="#locators">element locator</a>
     * 
     * @see #waitForPageToLoad(long)
     */
    void click(String locator);

    /**
     * Simulates the user clicking the "close" button in the titlebar of a popup
     * window or tab.
     */
    void close();

    /**
     * Simulates a user pressing and releasing a key.
     * 
     * @param locator -
     *            an <a href="#locators">element locator</a>
     * @param keycode -
     *            the numeric keycode of the key to be pressed, normally the
     *            ASCII value of that key. (In Java, you can just pass in a
     *            char, e.g. 'x'.)
     */
    void keyPress(String locator, int keycode);

    /**
     * Simulates a user pressing a key (without releasing it yet).
     * 
     * @param locator -
     *            an <a href="#locators">element locator</a>
     * @param keycode -
     *            the numeric keycode of the key to be pressed, normally the
     *            ASCII value of that key. (In Java, you can just pass in a
     *            char, e.g. 'x'.)
     */
    void keyDown(String locator, int keycode);

    /**
     * Simulates a user hovering a mouse over the specified element.
     * 
     * @param locator -
     *            an <a href="#locators">element locator</a>
     */
    void mouseOver(String locator);

    /**
     * Simulates a user pressing the mouse button (without releasing it yet) on
     * the specified element.
     * 
     * @param locator -
     *            an <a href="#locators">element locator</a>
     */
    void mouseDown(String locator);

    /**
     * Explicitly simulate an event, to trigger the corresponding &quot;on<em>event</em>&quot;
     * handler.
     * 
     * @param locator -
     *            an <a href="#locators">element locator</a>
     * @param event -
     *            the event name, e.g. "focus" or "blur"
     */
    void fireEvent(String locator, String event);

    /**
     * Simulates the user clicking the "back" button on their browser.
     * 
     */
    void goBack();

    /**
     * Opens a URL in the test frame. This accepts both relative and absolute
     * URLs.
     * 
     * <em>Note</em>: The URL must be on the same domain as the runner HTML
     * due to security restrictions in the browser (Same Origin Policy). If you
     * need to open an URL on another domain, use the Selenium Server to start a
     * new browser session on that domain.
     * 
     * @param url -
     *            the URL to open; may be relative or absolute
     */
    void open(String url);

    /**
     * Select an option from a drop-down using an option specifier.
     * 
     * <p>
     * Option specifiers provide different ways of specifying options of an HTML
     * Select element (e.g. for selecting a specific option, or for asserting
     * that the selected option satisfies a specification). There are several
     * forms of Select Option Specifier.
     * </p>
     * <dl>
     * <dt><strong>label=</strong><em>labelPattern</em></dt>
     * <dd>matches options based on their labels, i.e. the visible text. (This
     * is the default.)
     * <ul class="first last simple">
     * <li>label=regexp:^[Oo]ther</li>
     * </ul>
     * </dd>
     * <dt><strong>value=</strong><em>valuePattern</em></dt>
     * <dd>matches options based on their values.
     * <ul class="first last simple">
     * <li>value=other</li>
     * </ul>
     * 
     * 
     * </dd>
     * <dt><strong>id=</strong><em>id</em></dt>
     * 
     * <dd>matches options based on their ids.
     * <ul class="first last simple">
     * <li>id=option1</li>
     * </ul>
     * </dd>
     * <dt><strong>index=</strong><em>index</em></dt>
     * <dd>matches an option based on its index (offset from zero).
     * <ul class="first last simple">
     * 
     * <li>index=2</li>
     * </ul>
     * </dd>
     * </dl>
     * <p>
     * Without a prefix, the default behaviour is to only match on labels.
     * </p>
     * 
     * 
     * @param dropDownLocator -
     *            an <a href="#locators">element locator</a> identifying a drop-down menu
     * @param optionSpecifier -
     *            an option specifier (a label by default)
     */
    void select(String dropDownLocator, String optionSpecifier);

    /**
     * Selects a popup window; once a popup window has been selected, all
     * commands go to that window. To select the main window again, use "null"
     * as the target.
     * 
     * @param windowID
     */
    void selectWindow(String windowID);

    /**
     * Submit the specified form. This is particularly useful for forms without
     * submit buttons, e.g. single-input "Search" forms.
     * 
     * @param formLocator -
     *            an <a href="#locators">element locator</a> for the form you want to submit
     */
    void submit(String formLocator);

    /**
     * Sets the value of an input field, as though you typed it in.
     * 
     * <p>Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
     * value should be the value of the option selected, not the visible text.</p>
     * 
     * @param locator - an <a href="#locators">element locator</a>
     * @param value - the value to type
     */
    void type(String locator, String value);
    /**
     * Uncheck a toggle-button (checkbox/radio)
     * 
     * @param locator -
     *            an <a href="#locators">element locator</a>
     */
    void uncheck(String locator);

    /**
     * <p>Verifies that a javascript alert with the specified message was
     * generated. Like confirmations and question prompts, alerts must be verified in the same order that they were
     * generated.</p>
     * 
     * <p>Verifying an alert has the same effect as manually clicking OK. If an
     * alert is generated but you do not get/verify it, the next Selenium action
     * will fail.</p>
     * 
     * <p>NOTE: under Selenium, javascript alerts will NOT pop up a visible alert
     * dialog.</p>
     * 
     * <p>NOTE: Selenium does NOT support javascript alerts that are generated in a
     * page's onload() event handler. In this case a visible dialog WILL be
     * generated and Selenium will hang until someone manually clicks OK.</p>
     * 
     * @param messagePattern - a <a href="#patterns">pattern</a> matching the alert box message
     * @see #getAlert()
     */
    void verifyAlert(String messagePattern);

    /**
     * Verifies the value of an element attribute.
     * @param locator - an <a href="#locators">element locator</a>
     * @param attribute - the name of the element to verify
     * @param pattern - the pattern to match against
     */
    void verifyAttribute(String locator, String attribute, String pattern);

    /**
     * Verifies that a javascript confirmation dialog with the specified message
     * was generated. Like alerts, confirmations must be verified in the same
     * order that they were generated.
     * 
     * <p>By default, the confirm function will return true, having the same effect
     * as manually clicking OK. This can be changed by prior execution of the
     * chooseCancelOnNextConfirmation command. If an confirmation is
     * generated but you do not get/verify it, the next Selenium action will fail.</p>
     * 
     * <p>NOTE: under Selenium, javascript confirmations will NOT pop up a visible
     * dialog.</p>
     * 
     * <p>NOTE: Selenium does NOT support javascript confirmations that are
     * generated in a page's onload() event handler. In this case a visible
     * dialog WILL be generated and Selenium will hang until you manually click
     * OK.</p>
     * 
     * @param confirmationPattern the value/pattern which must appear in the confirmation dialog
     * @see #chooseCancelOnNextConfirmation()
     * @see #getConfirmation()
     */
    void verifyConfirmation(String confirmationPattern);

    /**
     * Verifies that the specified element is editable, ie. it's an input
     * element, and hasn't been disabled.
     * 
     * @param locator - an <a href="#locators">element locator</a>
     */
    void verifyEditable(String locator);

    /**
     * Verifies that the specified element is NOT on the page.
     * @param locator - an <a href="#locators">element locator</a>
     */
    void verifyElementNotPresent(String locator);

    /**
     * Verifies that the specified element is somewhere on the page.
     * @param locator - an <a href="#locators">element locator</a>
     */
    void verifyElementPresent(String locator);

    /**
     * Verify the location of the current page ends with the expected location.
     * If an URL querystring is provided, this is checked as well.
     * @param location - the location to match
     */
    void verifyLocation(String location);

    /**
     * Verifies that the specified element is NOT editable, ie. it's NOT an
     * input element, or has been disabled.
     * 
     * @param locator - an <a href="#locators">element locator</a>
     */
    void verifyNotEditable(String locator);

    /**
     * Verifies that the specified element is NOT visible; elements that are
     * simply not present are also considered invisible.
     * 
     * @param locator -
     *            an <a href="#locators">element locator</a>
     */
    void verifyNotVisible(String locator);

    /**
     * Verifies that a javascript question prompt dialog with the specified message was
     * generated. Like alerts and confirmations, prompts must be verified in the same order that
     * they were generated.
     * 
     * <p>Successful handling of the prompt requires prior execution of the
     * answerOnNextPrompt command. If a prompt is generated but you
     * do not get/verify it, the next Selenium action will fail.</p>
     * 
     * <p>NOTE: under Selenium, javascript prompts will NOT pop up a visible
     * dialog.</p>
     * 
     * <p>NOTE: Selenium does NOT support javascript prompts that are generated in a
     * page's onload() event handler. In this case a visible dialog WILL be
     * generated and Selenium will hang until someone manually clicks OK.</p>
     * @param promptPattern - the value/pattern which must appear in the prompt dialog
     * @see #answerOnNextPrompt(String)
     * @see #getPrompt()
     */
    void verifyPrompt(String promptPattern);

    /**
     * Verifies that the selected option of a drop-down satisfies the optionSpecifier.
     * @param locator - an <a href="#locators">element locator</a>
     * @param optionSpecifier - an option specifier, typically just an option label (e.g. "John Smith")
     * @see #select(String, String) for more information about option specifiers
     */
    void verifySelected(String locator, String optionSpecifier);

    /**
     * Verifies the text in a cell of a table. The cellAddress syntax
     * tableName.row.column, where row and column start at 0.
     * 
     * @param tableCellAddress - a cell address, e.g. "foo.1.4"
     * @param pattern - a <a href="#patterns">pattern</a> that must match the text of that table cell
     */
    void verifyTable(String tableCellAddress, String pattern);

    /**
     * Verifies the text of an element. This works for any element that contains
     * text. This command uses either the textContent (Mozilla-like browsers) or
     * the innerText (IE-like browsers) of the element, which is the rendered
     * text shown to the user.
     * 
     * @param locator - an <a href="#locators">element locator</a>
     * @param pattern - a <a href="#patterns">pattern</a> to match on the text
     */
    void verifyText(String locator, String pattern);

    /**
     * Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
     * @param pattern - a <a href="#patterns">pattern</a> to match with the text of the page
     */
    void verifyTextPresent(String pattern);

    /**
     * Verifies that the specified text pattern does NOT appear anywhere on the rendered page.
     * @param pattern - a <a href="#patterns">pattern</a> to match with the text of the page
     */
    void verifyTextNotPresent(String pattern);

    /**
     * Verifies the title of the current page
     * @param titlePattern - a <a href="#patterns">pattern</a> to match with the title of the page
     */
    void verifyTitle(String titlePattern);

    /**
     * Gets the value of an input field (or anything else with a value parameter).
     * For checkbox/radio elements, the value will be "on" or "off" depending on
     * whether the element is checked or not.
     * @param locator - an <a href="#locators">element locator</a>
     * @param pattern - a <a href="#patterns">pattern</a> to match with the value of the input field
     */
    void verifyValue(String locator, String pattern);

    /**
     * Verifies that the specified element is both present and visible. An
     * element can be rendered invisible by setting the CSS "visibility"
     * property to "hidden", or the "display" property to "none", either for the
     * element itself or one if its ancestors.
     * 
     * @param locator - an <a href="#locators">element locator</a>
     */
    void verifyVisible(String locator);

    /**
     * Waits for a specified input (e.g. a hidden field) to have a specified
     * value. Will succeed immediately if the input already has the value. This
     * is implemented by polling for the value. Warning: can block indefinitely
     * if the input never has the specified value.
     * @deprecated waitForValue can block indefinitely if the input never has the specified value; use waitForCondition instead.
     * @param locator - an <a href="#locators">element locator</a>
     * @param pattern - a <a href="#patterns">pattern</a> to match with the value of the input field
     */
    void waitForValue(String locator, String pattern);

    /**
     * Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
     * The snippet may have multiple lines, but only the result of the last line
     * will be considered.
     * 
     * <p>Note that, by default, the snippet will be run in the runner's test window, not in the window
     * of your application.  To get the window of your application, you can use
     * the JavaScript snippet <code>selenium.browserbot.getCurrentWindow()</code>, and then
     * run your JavaScript in there
     * @param script - the JavaScript snippet to run
     * @param timeout - a timeout in milliseconds, after which this command will return with an error
     */
    void waitForCondition(String script, long timeout);

    /**
     * Waits for a new page to load.
     * 
     * Use this command instead of the "clickAndWait", "selectAndWait", "typeAndWait" etc.
     * commands available in the JS API.
     * 
     * <p>Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
     * flag when it first notices a page load.  Running any other Selenium command after
     * turns the flag to false.  Hence, if you want to wait for a page to load, you must
     * wait immediately after a Selenium command that caused a page-load.</p>
     * @param timeout - a timeout in milliseconds, after which this command will return with an error
     */
    void waitForPageToLoad(long timeout);

    /**
     * Writes a message to the status bar and adds a note to the browser-side
     * log. Note that the browser-side logs will <i>not</i> be sent back to the
     * server, and are invisible to the driver.
     * 
     * @param context
     *            the message to be sent to the browser
     */
    void setContext(String context);

    /**
     * Writes a message to the status bar and adds a note to the browser-side
     * log, specifying the logging level for the rest of the current test.
     * Note that the browser-side logs will <i>not</i> be sent back to the
     * server, and are invisible to the driver.
     * 
     * @param context - 
     *            the message to be sent to the browser
     * @param logLevel - one of the enumerated entries in SeleniumLogLevels 
     * @see SeleniumLogLevels
     */
    void setContext(String context, String logLevel);

    /** Returns the IDs of all buttons on the page.
     * 
     * <p>If a given button has no ID, it will appear as "" in this array.
     * 
     * @return the IDs of all buttons on the page
     */
    String[] getAllButtons();

    /** Returns the IDs of all links on the page.
     * 
     * <p>If a given link has no ID, it will appear as "" in this array.
     * 
     * @return the IDs of all links on the page
     */
    String[] getAllLinks();

    /** Returns the IDs of all input fields on the page.
     * 
     * <p>If a given field has no ID, it will appear as "" in this array.
     * 
     * @return the IDs of all field on the page
     */
    String[] getAllFields();

    /**
     * Gets the value of an element attribute.
     * @param locator - an <a href="#locators">element locator</a>
     * @param attribute - the name of the element to verify
     */
    String getAttribute(String locator, String attribute);

    /**
     * Get whether a toggle-button (checkbox/radio) is checked.
     * @param locator - an <a href="#locators">element locator</a> pointing to a checkbox or radio button
     * @return either "true" or "false" depending on whether the checkbox is checked
     * @throws SeleniumException if the specified element doesn't exist or isn't a toggle-button
     */
    String getChecked(String locator);

    /** Gets the result of evaluating the specified JavaScript snippet.  The snippet may 
     * have multiple lines, but only the result of the last line will be returned.
     * 
     * <p>Note that, by default, the snippet will be run in the runner's test window, not in the window
     * of your application.  To get the window of your application, you can use
     * the JavaScript snippet <code>selenium.browserbot.getCurrentWindow()</code>, and then
     * run your JavaScript in there.
     * 
     * @param script - the JavaScript snippet to run
     * @return - the results of evaluating the snippet, or an error message starting with "ERROR" if your snippet caused a JavaScript exception
     */
    String getEval(String script);

    /**
     * Gets the text from a cell of a table. The cellAddress syntax
     * tableLocator.row.column, where row and column start at 0.
     * 
     * @param tableCellAddress - a cell address, e.g. "foo.1.4"
     */
    String getTable(String tableCellAddress);

    /**
     * Gets the text of an element. This works for any element that contains
     * text. This command uses either the textContent (Mozilla-like browsers) or
     * the innerText (IE-like browsers) of the element, which is the rendered
     * text shown to the user.
     * 
     * @param locator - an <a href="#locators">element locator</a>
     * @return the text of the element
     */
    String getText(String locator);

    /**
     * Gets the value of an input field (or anything else with a value parameter).
     * For checkbox/radio elements, the value will be "on" or "off" depending on
     * whether the element is checked or not.
     * 
     * @param locator - an <a href="#locators">element locator</a>
     * @return the element value, or "on/off" for checkbox/radio elements
     */
    String getValue(String locator);

    /** Gets the title of the current page.
     * 
     * @return the title of the current page
     */
    String getTitle();

    /** Gets the absolute URL of the current page.
     * 
     * @return the absolute URL of the current page
     */
    String getAbsoluteLocation();

    /**
     * Retrieves the message of a javascript question prompt dialog generated during
     * the previous action.
     * 
     * <p>Successful handling of the prompt requires prior execution of the
     * answerOnNextPrompt command. If a prompt is generated but you
     * do not get/verify it, the next Selenium action will fail.</p>
     * 
     * <p>NOTE: under Selenium, javascript prompts will NOT pop up a visible
     * dialog.</p>
     * 
     * <p>NOTE: Selenium does NOT support javascript prompts that are generated in a
     * page's onload() event handler. In this case a visible dialog WILL be
     * generated and Selenium will hang until someone manually clicks OK.</p>
     * @see #answerOnNextPrompt(String)
     * @see #verifyPrompt()
     */
    String getPrompt();

    /**
     * Retrieves the message of a javascript confirmation dialog generated during
     * the previous action.
     * 
     * <p>
     * By default, the confirm function will return true, having the same effect
     * as manually clicking OK. This can be changed by prior execution of the
     * chooseCancelOnNextConfirmation command. If an confirmation is generated
     * but you do not get/verify it, the next Selenium action will fail.
     * </p>
     * 
     * <p>
     * NOTE: under Selenium, javascript confirmations will NOT pop up a visible
     * dialog.
     * </p>
     * 
     * <p>
     * NOTE: Selenium does NOT support javascript confirmations that are
     * generated in a page's onload() event handler. In this case a visible
     * dialog WILL be generated and Selenium will hang until you manually click
     * OK.
     * </p>
     * 
     * @see #chooseCancelOnNextConfirmation()
     * @see #verifyConfirmation()
     */
    String getConfirmation();

    /**
     * Retrieves the message of a javascript alert generated during the previous action.
     * 
     * <p>Getting an alert has the same effect as manually clicking OK. If an
     * alert is generated but you do not get/verify it, the next Selenium action
     * will fail.</p>
     * 
     * <p>NOTE: under Selenium, javascript alerts will NOT pop up a visible alert
     * dialog.</p>
     * 
     * <p>NOTE: Selenium does NOT support javascript alerts that are generated in a
     * page's onload() event handler. In this case a visible dialog WILL be
     * generated and Selenium will hang until someone manually clicks OK.</p>
     * @see #verifyAlert(String)
     */
    String getAlert();
    
    /** Gets all option labels in the specified select drop-down.
     * 
     * @param locator - an <a href="#locators">element locator</a>
     * @return an array of all option labels in the specified select drop-down
     */
    String[] getSelectOptions(String locator);

    /** Launches the browser with a new Selenium session */
    void start();

    /** Ends the test session, killing the browser */
    void stop();

    /** Returns a complete list of Selenium "doX" actions */
    String[] getAllActions();

    /** Returns a complete list of Selenium "getX" actions */
    String[] getAllAccessors();

    /** Returns a complete list of Selenium "assertX" actions */
    String[] getAllAsserts();
}
