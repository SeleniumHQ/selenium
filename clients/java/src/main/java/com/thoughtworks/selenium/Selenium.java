// This file has been automatically generated via XSL
package com.thoughtworks.selenium;
/**


Defines an object that runs Selenium commands.

<h3><a name="locators"></a>Element Locators</h3><p>
Element Locators tell Selenium which HTML element a command refers to. Many
commands require an Element Locator as a parameter.

We support the following strategies for locating elements:
</p><blockquote><dl><dt><strong>identifier</strong>=<em>id</em></dt><dd>Select the element with the specified @id attribute. If no match is
found, select the first element whose @name attribute is <em>id</em>.
(This is normally the default; see below.)</dd><dt><strong>id</strong>=<em>id</em></dt><dd>Select the element with the specified @id attribute.</dd><dt><strong>name</strong>=<em>name</em></dt><dd>Select the first element with the specified @name attribute.</dd><dt><strong>dom</strong>=<em>javascriptExpression</em></dt><dd><dd>Find an element using JavaScript traversal of the HTML Document Object
Model. DOM locators <em>must</em> begin with "document.".
<ul class="first last simple"><li>dom=document.forms['myForm'].myDropdown</li><li>dom=document.images[56]</li></ul></dd></dd><dt><strong>xpath</strong>=<em>xpathExpression</em></dt><dd>Locate an element using an XPath expression. XPath locators
<em>must</em> begin with "//".
<ul class="first last simple"><li>xpath=//img[@alt='The image alt text']</li><li>xpath=//table[@id='table1']//tr[4]/td[2]</li></ul></dd><dt><strong>link</strong>=<em>textPattern</em></dt><dd>Select the link (anchor) element which contains text matching the
specified <em>pattern</em>.
<ul class="first last simple"><li>link=The link text</li></ul></dd></dl></blockquote><p>
Without an explicit locator prefix, Selenium uses the following default
strategies:
</p><ul class="simple"><li><strong>dom</strong>, for locators starting with "document."</li><li><strong>xpath</strong>, for locators starting with "//"</li><li><strong>identifier</strong>, otherwise</li></ul><h3><a name="patterns"></a>String-match Patterns</h3><p>
Various Pattern syntaxes are available for matching string values:
</p><blockquote><dl><dt><strong>glob:</strong><em>pattern</em></dt><dd>Match a string against a "glob" (aka "wildmat") pattern. "Glob" is a
kind of limited regular-expression syntax typically used in command-line
shells. In a glob pattern, "*" represents any sequence of characters, and "?"
represents any single character. Glob patterns match against the entire
string.</dd><dt><strong>regexp:</strong><em>regexp</em></dt><dd>Match a string using a regular-expression. The full power of JavaScript
regular-expressions is available.</dd><dt><strong>exact:</strong><em>string</em></dt><dd>Match a string exactly, verbatim, without any of that fancy wildcard
stuff.</dd></dl></blockquote><p>
If no pattern prefix is specified, Selenium assumes that it's a "glob"
pattern.
</p>*/
public interface Selenium {

    /** Launches the browser with a new Selenium session */
    void start();

    /** Ends the test session, killing the browser */
    void stop();
/** 
Clicks on a link, button, checkbox or radio button. If the click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.


@param locator an element locator
*/
void click(String locator);

/** 
Simulates a user pressing and releasing a key.


@param locator an <a href="#locators">element locator</a>
@param keycode the numeric keycode of the key to be pressed, normally the
            ASCII value of that key.
*/
void keyPress(String locator,String keycode);

/** 
Simulates a user pressing a key (without releasing it yet).


@param locator an <a href="#locators">element locator</a>
@param keycode the numeric keycode of the key to be pressed, normally the
            ASCII value of that key.
*/
void keyDown(String locator,String keycode);

/** 
Simulates a user hovering a mouse over the specified element.


@param locator an <a href="#locators">element locator</a>
*/
void mouseOver(String locator);

/** 
Simulates a user pressing the mouse button (without releasing it yet) on
the specified element.


@param locator an <a href="#locators">element locator</a>
*/
void mouseDown(String locator);

/** 
Sets the value of an input field, as though you typed it in.

<p>Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
value should be the value of the option selected, not the visible text.</p>
@param locator an <a href="#locators">element locator</a>
@param value the value to type
*/
void type(String locator,String value);

/** 
Check a toggle-button (checkbox/radio)


@param locator an <a href="#locators">element locator</a>
*/
void check(String locator);

/** 
Uncheck a toggle-button (checkbox/radio)


@param locator an <a href="#locators">element locator</a>
*/
void uncheck(String locator);

/** 
Select an option from a drop-down using an option locator.

<p>
Option locators provide different ways of specifying options of an HTML
Select element (e.g. for selecting a specific option, or for asserting
that the selected option satisfies a specification). There are several
forms of Select Option Locator.
</p><dl><dt><strong>label</strong>=<em>labelPattern</em></dt><dd>matches options based on their labels, i.e. the visible text. (This
is the default.)
<ul class="first last simple"><li>label=regexp:^[Oo]ther</li></ul></dd><dt><strong>value</strong>=<em>valuePattern</em></dt><dd>matches options based on their values.
<ul class="first last simple"><li>value=other</li></ul></dd><dt><strong>id</strong>=<em>id</em></dt><dd>matches options based on their ids.
<ul class="first last simple"><li>id=option1</li></ul></dd><dt><strong>index</strong>=<em>index</em></dt><dd>matches an option based on its index (offset from zero).
<ul class="first last simple"><li>index=2</li></ul></dd></dl><p>
Without a prefix, the default behaviour is to only match on labels.
</p>
@param locator an <a href="#locators">element locator</a> identifying a drop-down menu
@param optionLocator an option locator (a label by default)
*/
void select(String locator,String optionLocator);

/** 
Submit the specified form. This is particularly useful for forms without
submit buttons, e.g. single-input "Search" forms.


@param formLocator an <a href="#locators">element locator</a> for the form you want to submit
*/
void submit(String formLocator);

/** 
Opens an URL in the test frame. This accepts both relative and absolute
URLs.

<em>Note</em>: The URL must be on the same domain as the runner HTML
due to security restrictions in the browser (Same Origin Policy). If you
need to open an URL on another domain, use the Selenium Server to start a
new browser session on that domain.


@param url the URL to open; may be relative or absolute
*/
void open(String url);

/** 
Selects a popup window; once a popup window has been selected, all
commands go to that window. To select the main window again, use "null"
as the target.


@param windowID the JavaScript window ID of the window to select
*/
void selectWindow(String windowID);

/** 
Instructs Selenium to click "Cancel" on the next JavaScript confirmation
dialog to be raised. By default, the confirm function will return true,
having the same effect as manually clicking OK. After running this
command, the next confirmation will behave as if the user had clicked
Cancel.

   
*/
void chooseCancelOnNextConfirmation();

/** 
Instructs Selenium to return the specified answer string in response to
the next JavaScript prompt [window.prompt()].



@param answer the answer to give in response to the prompt pop-up
*/
void answerOnNextPrompt(String answer);

/** 
Simulates the user clicking the "back" button on their browser.

     
*/
void goBack();

/** 
Simulates the user clicking the "close" button in the titlebar of a popup
window or tab.
   
*/
void close();

/** 
Explicitly simulate an event, to trigger the corresponding "on<em>event</em>"
handler.


@param locator an <a href="#locators">element locator</a>
@param event the event name, e.g. "focus" or "blur"
*/
void fireEvent(String locator,String event);

/** 
Retrieves the message of a javascript alert generated during the previous action, or fail if there were no alerts.

<p>Getting an alert has the same effect as manually clicking OK. If an
alert is generated but you do not get/verify it, the next Selenium action
will fail.</p><p>NOTE: under Selenium, javascript alerts will NOT pop up a visible alert
dialog.</p><p>NOTE: Selenium does NOT support javascript alerts that are generated in a
page's onload() event handler. In this case a visible dialog WILL be
generated and Selenium will hang until someone manually clicks OK.</p>
@return The message of the most recent JavaScript alert
*/
String getAlert();

/** 
Retrieves the message of a javascript confirmation dialog generated during
the previous action.

<p>
By default, the confirm function will return true, having the same effect
as manually clicking OK. This can be changed by prior execution of the
chooseCancelOnNextConfirmation command. If an confirmation is generated
but you do not get/verify it, the next Selenium action will fail.
</p><p>
NOTE: under Selenium, javascript confirmations will NOT pop up a visible
dialog.
</p><p>
NOTE: Selenium does NOT support javascript confirmations that are
generated in a page's onload() event handler. In this case a visible
dialog WILL be generated and Selenium will hang until you manually click
OK.
</p>
@return the message of the most recent JavaScript confirmation dialog
*/
String getConfirmation();

/** 
Retrieves the message of a javascript question prompt dialog generated during
the previous action.

<p>Successful handling of the prompt requires prior execution of the
answerOnNextPrompt command. If a prompt is generated but you
do not get/verify it, the next Selenium action will fail.</p><p>NOTE: under Selenium, javascript prompts will NOT pop up a visible
dialog.</p><p>NOTE: Selenium does NOT support javascript prompts that are generated in a
page's onload() event handler. In this case a visible dialog WILL be
generated and Selenium will hang until someone manually clicks OK.</p>
@return the message of the most recent JavaScript question prompt
*/
String getPrompt();

/**  Gets the absolute URL of the current page.


@return the absolute URL of the current page
*/
String getAbsoluteLocation();

/** 
Verify the location of the current page ends with the expected location.
If an URL querystring is provided, this is checked as well.

@param expectedLocation the location to match
*/
void assertLocation(String expectedLocation);

/**  Gets the title of the current page.


@return the title of the current page
*/
String getTitle();

/** 
Get the entire text of the page.

@return the entire text of the page
*/
String getBodyText();

/** 
Gets the (whitespace-trimmed) value of an input field (or anything else with a value parameter).
For checkbox/radio elements, the value will be "on" or "off" depending on
whether the element is checked or not.


@param locator an <a href="#locators">element locator</a>
@return the element value, or "on/off" for checkbox/radio elements
*/
String getValue(String locator);

/** 
Gets the text of an element. This works for any element that contains
text. This command uses either the textContent (Mozilla-like browsers) or
the innerText (IE-like browsers) of the element, which is the rendered
text shown to the user.


@param locator an <a href="#locators">element locator</a>
@return the text of the element
*/
String getText(String locator);

/**  Gets the result of evaluating the specified JavaScript snippet.  The snippet may 
have multiple lines, but only the result of the last line will be returned.

<p>Note that, by default, the snippet will be run in the runner's test window, not in the window
of your application.  To get the window of your application, you can use
the JavaScript snippet <code>selenium.browserbot.getCurrentWindow()</code>, and then
run your JavaScript in there.</p>
@param script the JavaScript snippet to run
@return the results of evaluating the snippet
*/
String getEval(String script);

/** 
Get whether a toggle-button (checkbox/radio) is checked.  Fails if the specified element doesn't exist or isn't a toggle-button.

@param locator an <a href="#locators">element locator</a> pointing to a checkbox or radio button
@return either "true" or "false" depending on whether the checkbox is checked
*/
String getChecked(String locator);

/** 
Gets the text from a cell of a table. The cellAddress syntax
tableLocator.row.column, where row and column start at 0.


@param tableCellAddress a cell address, e.g. "foo.1.4"
@return the text from the specified cell
*/
String getTable(String tableCellAddress);

/** 
Verifies that the selected option of a drop-down satisfies the optionSpecifier.

<p>See the select command for more information about option locators.</p>
@param locator an <a href="#locators">element locator</a>
@param optionLocator an option locator, typically just an option label (e.g. "John Smith")
*/
void assertSelected(String locator,String optionLocator);

/**  Gets all option labels in the specified select drop-down.


@param locator an <a href="#locators">element locator</a>
@return an array of all option labels in the specified select drop-down
*/
String[] getSelectOptions(String locator);

/** 
Gets the value of an element attribute.

@param attributeLocator an element locator followed by an
@return the value of the specified attribute
*/
String getAttribute(String attributeLocator);

/** 
Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.

@param pattern a <a href="#patterns">pattern</a> to match with the text of the page
*/
void assertTextPresent(String pattern);

/** 
Verifies that the specified text pattern does NOT appear anywhere on the rendered page.

@param pattern a <a href="#patterns">pattern</a> to match with the text of the page
*/
void assertTextNotPresent(String pattern);

/** 
Verifies that the specified element is somewhere on the page.

@param locator an <a href="#locators">element locator</a>
*/
void assertElementPresent(String locator);

/** 
Verifies that the specified element is NOT on the page.

@param locator an <a href="#locators">element locator</a>
*/
void assertElementNotPresent(String locator);

/** 
Verifies that the specified element is both present and visible. An
element can be rendered invisible by setting the CSS "visibility"
property to "hidden", or the "display" property to "none", either for the
element itself or one if its ancestors.


@param locator an <a href="#locators">element locator</a>
*/
void assertVisible(String locator);

/** 
Verifies that the specified element is NOT visible; elements that are
simply not present are also considered invisible.


@param locator an <a href="#locators">element locator</a>
*/
void assertNotVisible(String locator);

/** 
Verifies that the specified element is editable, ie. it's an input
element, and hasn't been disabled.


@param locator an <a href="#locators">element locator</a>
*/
void assertEditable(String locator);

/** 
Verifies that the specified element is NOT editable, ie. it's NOT an
input element, or has been disabled.


@param locator an <a href="#locators">element locator</a>
*/
void assertNotEditable(String locator);

/**  Returns the IDs of all buttons on the page.

<p>If a given button has no ID, it will appear as "" in this array.</p>
@return the IDs of all buttons on the page
*/
String[] getAllButtons();

/**  Returns the IDs of all links on the page.

<p>If a given link has no ID, it will appear as "" in this array.</p>
@return the IDs of all links on the page
*/
String[] getAllLinks();

/**  Returns the IDs of all input fields on the page.

<p>If a given field has no ID, it will appear as "" in this array.</p>
@return the IDs of all field on the page
*/
String[] getAllFields();

/** 
Writes a message to the status bar and adds a note to the browser-side
log.

<p>If logLevelThreshold is specified, set the threshold for logging
to that level (debug, info, warn, error).</p><p>(Note that the browser-side logs will <i>not</i> be sent back to the
server, and are invisible to the Client Driver.)</p>
@param context the message to be sent to the browser
@param logLevelThreshold one of "debug", "info", "warn", "error", sets the threshold for browser-side logging
*/
void setContext(String context,String logLevelThreshold);

/** 
Return the specified expression.

<p>This is useful because of JavaScript preprocessing.
It is used to generate commands like assertExpression and storeExpression.</p>
@param expression the value to return
@return the value passed in
*/
String getExpression(String expression);

/** 
Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
The snippet may have multiple lines, but only the result of the last line
will be considered.

<p>Note that, by default, the snippet will be run in the runner's test window, not in the window
of your application.  To get the window of your application, you can use
the JavaScript snippet <code>selenium.browserbot.getCurrentWindow()</code>, and then
run your JavaScript in there</p>
@param script the JavaScript snippet to run
@param timeout a timeout in milliseconds, after which this command will return with an error
*/
void waitForCondition(String script,String timeout);

/** 
Waits for a new page to load.

<p>You can use this command instead of the "AndWait" suffixes, "clickAndWait", "selectAndWait", "typeAndWait" etc.
(which are only available in the JS API).</p><p>Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
flag when it first notices a page load.  Running any other Selenium command after
turns the flag to false.  Hence, if you want to wait for a page to load, you must
wait immediately after a Selenium command that caused a page-load.</p>
@param timeout a timeout in milliseconds, after which this command will return with an error
*/
void waitForPageToLoad(String timeout);

}