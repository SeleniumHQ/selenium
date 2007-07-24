/*
 * Copyright 2006 ThoughtWorks, Inc.
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

// This file has been automatically generated via XSL
package com.thoughtworks.selenium;
/**
Defines an object that runs Selenium commands.

<h3><a name="locators"></a>Element Locators</h3><p>
Element Locators tell Selenium which HTML element a command refers to.
The format of a locator is:</p><blockquote><em>locatorType</em><strong>=</strong><em>argument</em></blockquote><p>
We support the following strategies for locating elements:
</p><ul><li><strong>identifier</strong>=<em>id</em>: 
Select the element with the specified @id attribute. If no match is
found, select the first element whose @name attribute is <em>id</em>.
(This is normally the default; see below.)</li><li><strong>id</strong>=<em>id</em>:
Select the element with the specified @id attribute.</li><li><strong>name</strong>=<em>name</em>:
Select the first element with the specified @name attribute.
<ul class="first last simple"><li>username</li><li>name=username</li></ul><p>The name may optionally be followed by one or more <em>element-filters</em>, separated from the name by whitespace.  If the <em>filterType</em> is not specified, <strong>value</strong> is assumed.</p><ul class="first last simple"><li>name=flavour value=chocolate</li></ul></li><li><strong>dom</strong>=<em>javascriptExpression</em>: 

Find an element by evaluating the specified string.  This allows you to traverse the HTML Document Object
Model using JavaScript.  Note that you must not return a value in this string; simply make it the last expression in the block.
<ul class="first last simple"><li>dom=document.forms['myForm'].myDropdown</li><li>dom=document.images[56]</li><li>dom=function foo() { return document.links[1]; }; foo();</li></ul></li><li><strong>xpath</strong>=<em>xpathExpression</em>: 
Locate an element using an XPath expression.
<ul class="first last simple"><li>xpath=//img[@alt='The image alt text']</li><li>xpath=//table[@id='table1']//tr[4]/td[2]</li><li>xpath=//a[contains(@href,'#id1')]</li><li>xpath=//a[contains(@href,'#id1')]/@class</li><li>xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td</li><li>xpath=//input[@name='name2' and @value='yes']</li><li>xpath=//*[text()="right"]</li></ul></li><li><strong>link</strong>=<em>textPattern</em>:
Select the link (anchor) element which contains text matching the
specified <em>pattern</em>.
<ul class="first last simple"><li>link=The link text</li></ul></li><li><strong>css</strong>=<em>cssSelectorSyntax</em>:
Select the element using css selectors. Please refer to <a href="http://www.w3.org/TR/REC-CSS2/selector.html">CSS2 selectors</a>, <a href="http://www.w3.org/TR/2001/CR-css3-selectors-20011113/">CSS3 selectors</a> for more information. You can also check the TestCssLocators test in the selenium test suite for an example of usage, which is included in the downloaded selenium core package.
<ul class="first last simple"><li>css=a[href="#id3"]</li><li>css=span#firstChild + span</li></ul><p>Currently the css selector locator supports all css1, css2 and css3 selectors except namespace in css3, some pseudo classes(:nth-of-type, :nth-last-of-type, :first-of-type, :last-of-type, :only-of-type, :visited, :hover, :active, :focus, :indeterminate) and pseudo elements(::first-line, ::first-letter, ::selection, ::before, ::after). </p></li></ul><p>
Without an explicit locator prefix, Selenium uses the following default
strategies:
</p><ul class="simple"><li><strong>dom</strong>, for locators starting with "document."</li><li><strong>xpath</strong>, for locators starting with "//"</li><li><strong>identifier</strong>, otherwise</li></ul><h3><a name="element-filters">Element Filters</a></h3><blockquote><p>Element filters can be used with a locator to refine a list of candidate elements.  They are currently used only in the 'name' element-locator.</p><p>Filters look much like locators, ie.</p><blockquote><em>filterType</em><strong>=</strong><em>argument</em></blockquote><p>Supported element-filters are:</p><p><strong>value=</strong><em>valuePattern</em></p><blockquote>
Matches elements based on their values.  This is particularly useful for refining a list of similarly-named toggle-buttons.</blockquote><p><strong>index=</strong><em>index</em></p><blockquote>
Selects a single element based on its position in the list (offset from zero).</blockquote></blockquote><h3><a name="patterns"></a>String-match Patterns</h3><p>
Various Pattern syntaxes are available for matching string values:
</p><ul><li><strong>glob:</strong><em>pattern</em>:
Match a string against a "glob" (aka "wildmat") pattern. "Glob" is a
kind of limited regular-expression syntax typically used in command-line
shells. In a glob pattern, "*" represents any sequence of characters, and "?"
represents any single character. Glob patterns match against the entire
string.</li><li><strong>regexp:</strong><em>regexp</em>:
Match a string using a regular-expression. The full power of JavaScript
regular-expressions is available.</li><li><strong>exact:</strong><em>string</em>:

Match a string exactly, verbatim, without any of that fancy wildcard
stuff.</li></ul><p>
If no pattern prefix is specified, Selenium assumes that it's a "glob"
pattern.
</p>*/
public interface Selenium {

	/** Launches the browser with a new Selenium session */
    void start();

    /** Ends the test session, killing the browser */
    void stop();
/** Clicks on a link, button, checkbox or radio button. If the click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.
@param locator an element locator
*/
void click(String locator);

/** Double clicks on a link, button, checkbox or radio button. If the double click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.
@param locator an element locator
*/
void doubleClick(String locator);

/** Clicks on a link, button, checkbox or radio button. If the click action
causes a new page to load (like a link usually does), call
waitForPageToLoad.
@param locator an element locator
@param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
*/
void clickAt(String locator,String coordString);

/** Doubleclicks on a link, button, checkbox or radio button. If the action
causes a new page to load (like a link usually does), call
waitForPageToLoad.
@param locator an element locator
@param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
*/
void doubleClickAt(String locator,String coordString);

/** Explicitly simulate an event, to trigger the corresponding "on<em>event</em>"
handler.
@param locator an <a href="#locators">element locator</a>
@param eventName the event name, e.g. "focus" or "blur"
*/
void fireEvent(String locator,String eventName);

/** Simulates a user pressing and releasing a key.
@param locator an <a href="#locators">element locator</a>
@param keySequence Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
*/
void keyPress(String locator,String keySequence);

/** Press the shift key and hold it down until doShiftUp() is called or a new page is loaded.
*/
void shiftKeyDown();

/** Release the shift key.
*/
void shiftKeyUp();

/** Press the meta key and hold it down until doMetaUp() is called or a new page is loaded.
*/
void metaKeyDown();

/** Release the meta key.
*/
void metaKeyUp();

/** Press the alt key and hold it down until doAltUp() is called or a new page is loaded.
*/
void altKeyDown();

/** Release the alt key.
*/
void altKeyUp();

/** Press the control key and hold it down until doControlUp() is called or a new page is loaded.
*/
void controlKeyDown();

/** Release the control key.
*/
void controlKeyUp();

/** Simulates a user pressing a key (without releasing it yet).
@param locator an <a href="#locators">element locator</a>
@param keySequence Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
*/
void keyDown(String locator,String keySequence);

/** Simulates a user releasing a key.
@param locator an <a href="#locators">element locator</a>
@param keySequence Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
*/
void keyUp(String locator,String keySequence);

/** Simulates a user hovering a mouse over the specified element.
@param locator an <a href="#locators">element locator</a>
*/
void mouseOver(String locator);

/** Simulates a user moving the mouse pointer away from the specified element.
@param locator an <a href="#locators">element locator</a>
*/
void mouseOut(String locator);

/** Simulates a user pressing the mouse button (without releasing it yet) on
the specified element.
@param locator an <a href="#locators">element locator</a>
*/
void mouseDown(String locator);

/** Simulates a user pressing the mouse button (without releasing it yet) at
the specified location.
@param locator an <a href="#locators">element locator</a>
@param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
*/
void mouseDownAt(String locator,String coordString);

/** Simulates the event that occurs when the user releases the mouse button (i.e., stops
holding the button down) on the specified element.
@param locator an <a href="#locators">element locator</a>
*/
void mouseUp(String locator);

/** Simulates the event that occurs when the user releases the mouse button (i.e., stops
holding the button down) at the specified location.
@param locator an <a href="#locators">element locator</a>
@param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
*/
void mouseUpAt(String locator,String coordString);

/** Simulates a user pressing the mouse button (without releasing it yet) on
the specified element.
@param locator an <a href="#locators">element locator</a>
*/
void mouseMove(String locator);

/** Simulates a user pressing the mouse button (without releasing it yet) on
the specified element.
@param locator an <a href="#locators">element locator</a>
@param coordString specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
*/
void mouseMoveAt(String locator,String coordString);

/** Sets the value of an input field, as though you typed it in.

<p>Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
value should be the value of the option selected, not the visible text.</p>
@param locator an <a href="#locators">element locator</a>
@param value the value to type
*/
void type(String locator,String value);

/** Simulates keystroke events on the specified element, as though you typed the value key-by-key.

<p>This is a convenience method for calling keyDown, keyUp, keyPress for every character in the specified string;
this is useful for dynamic UI widgets (like auto-completing combo boxes) that require explicit key events.</p><p>Unlike the simple "type" command, which forces the specified value into the page directly, this command
may or may not have any visible effect, even in cases where typing keys would normally have a visible effect.
For example, if you use "typeKeys" on a form element, you may or may not see the results of what you typed in
the field.</p><p>In some cases, you may need to use the simple "type" command to set the value of the field and then the "typeKeys" command to
send the keystroke events corresponding to what you just typed.</p>
@param locator an <a href="#locators">element locator</a>
@param value the value to type
*/
void typeKeys(String locator,String value);

/** Set execution speed (i.e., set the millisecond length of a delay which will follow each selenium operation).  By default, there is no such delay, i.e.,
the delay is 0 milliseconds.
@param value the number of milliseconds to pause after operation
*/
void setSpeed(String value);

/** Get execution speed (i.e., get the millisecond length of the delay following each selenium operation).  By default, there is no such delay, i.e.,
the delay is 0 milliseconds.

See also setSpeed.
*/
void getSpeed();

/** Check a toggle-button (checkbox/radio)
@param locator an <a href="#locators">element locator</a>
*/
void check(String locator);

/** Uncheck a toggle-button (checkbox/radio)
@param locator an <a href="#locators">element locator</a>
*/
void uncheck(String locator);

/** Select an option from a drop-down using an option locator.

<p>
Option locators provide different ways of specifying options of an HTML
Select element (e.g. for selecting a specific option, or for asserting
that the selected option satisfies a specification). There are several
forms of Select Option Locator.
</p><ul><li><strong>label</strong>=<em>labelPattern</em>:
matches options based on their labels, i.e. the visible text. (This
is the default.)
<ul class="first last simple"><li>label=regexp:^[Oo]ther</li></ul></li><li><strong>value</strong>=<em>valuePattern</em>:
matches options based on their values.
<ul class="first last simple"><li>value=other</li></ul></li><li><strong>id</strong>=<em>id</em>:

matches options based on their ids.
<ul class="first last simple"><li>id=option1</li></ul></li><li><strong>index</strong>=<em>index</em>:
matches an option based on its index (offset from zero).
<ul class="first last simple"><li>index=2</li></ul></li></ul><p>
If no option locator prefix is provided, the default behaviour is to match on <strong>label</strong>.
</p>
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@param optionLocator an option locator (a label by default)
*/
void select(String selectLocator,String optionLocator);

/** Add a selection to the set of selected options in a multi-select element using an option locator.

@see #doSelect for details of option locators
@param locator an <a href="#locators">element locator</a> identifying a multi-select box
@param optionLocator an option locator (a label by default)
*/
void addSelection(String locator,String optionLocator);

/** Remove a selection from the set of selected options in a multi-select element using an option locator.

@see #doSelect for details of option locators
@param locator an <a href="#locators">element locator</a> identifying a multi-select box
@param optionLocator an option locator (a label by default)
*/
void removeSelection(String locator,String optionLocator);

/** Unselects all of the selected options in a multi-select element.
@param locator an <a href="#locators">element locator</a> identifying a multi-select box
*/
void removeAllSelections(String locator);

/** Submit the specified form. This is particularly useful for forms without
submit buttons, e.g. single-input "Search" forms.
@param formLocator an <a href="#locators">element locator</a> for the form you want to submit
*/
void submit(String formLocator);

/** Opens an URL in the test frame. This accepts both relative and absolute
URLs.

The "open" command waits for the page to load before proceeding,
ie. the "AndWait" suffix is implicit.

<em>Note</em>: The URL must be on the same domain as the runner HTML
due to security restrictions in the browser (Same Origin Policy). If you
need to open an URL on another domain, use the Selenium Server to start a
new browser session on that domain.
@param url the URL to open; may be relative or absolute
*/
void open(String url);

/** Opens a popup window (if a window with that ID isn't already open).
After opening the window, you'll need to select it using the selectWindow
command.

<p>This command can also be a useful workaround for bug SEL-339.  In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
an empty (blank) url, like this: openWindow("", "myFunnyWindow").</p>
@param url the URL to open, which can be blank
@param windowID the JavaScript window ID of the window to select
*/
void openWindow(String url,String windowID);

/** Selects a popup window; once a popup window has been selected, all
commands go to that window. To select the main window again, use null
as the target.

<p>Note that there is a big difference between a window's internal JavaScript "name" property
and the "title" of a given window's document (which is normally what you actually see, as an end user,
in the title bar of the window).  The "name" is normally invisible to the end-user; it's the second 
parameter "windowName" passed to the JavaScript method window.open(url, windowName, windowFeatures, replaceFlag)
(which selenium intercepts).</p><p>Selenium has several strategies for finding the window object referred to by the "windowID" parameter.</p><p>1.) if windowID is null, (or the string "null") then it is assumed the user is referring to the original window instantiated by the browser).</p><p>2.) if the value of the "windowID" parameter is a JavaScript variable name in the current application window, then it is assumed
that this variable contains the return value from a call to the JavaScript window.open() method.</p><p>3.) Otherwise, selenium looks in a hash it maintains that maps string names to window "names".</p><p>4.) If <i>that</i> fails, we'll try looping over all of the known windows to try to find the appropriate "title".
Since "title" is not necessarily unique, this may have unexpected behavior.</p><p>If you're having trouble figuring out what is the name of a window that you want to manipulate, look at the selenium log messages
which identify the names of windows created via window.open (and therefore intercepted by selenium).  You will see messages
like the following for each window as it is opened:</p><p><code>debug: window.open call intercepted; window ID (which you can use with selectWindow()) is "myNewWindow"</code></p><p>In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
(This is bug SEL-339.)  In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
an empty (blank) url, like this: openWindow("", "myFunnyWindow").</p>
@param windowID the JavaScript window ID of the window to select
*/
void selectWindow(String windowID);

/** Selects a frame within the current window.  (You may invoke this command
multiple times to select nested frames.)  To select the parent frame, use
"relative=parent" as a locator; to select the top frame, use "relative=top".

<p>You may also use a DOM expression to identify the frame you want directly,
like this: <code>dom=frames["main"].frames["subframe"]</code></p>
@param locator an <a href="#locators">element locator</a> identifying a frame or iframe
*/
void selectFrame(String locator);

/** Return the contents of the log.

<p>This is a placeholder intended to make the code generator make this API
available to clients.  The selenium server will intercept this call, however,
and return its recordkeeping of log messages since the last call to this API.
Thus this code in JavaScript will never be called.</p><p>The reason I opted for a servercentric solution is to be able to support
multiple frames served from different domains, which would break a
centralized JavaScript logging mechanism under some conditions.</p>
@return all log messages seen since the last call to this API
*/
String getLogMessages();

/** Determine whether current/locator identify the frame containing this running code.

<p>This is useful in proxy injection mode, where this code runs in every
browser frame and window, and sometimes the selenium server needs to identify
the "current" frame.  In this case, when the test calls selectFrame, this
routine is called for each frame to figure out which one has been selected.
The selected frame will return true, while all others will return false.</p>
@param currentFrameString starting frame
@param target new frame (which might be relative to the current one)
@return true if the new frame is this code's window
*/
boolean getWhetherThisFrameMatchFrameExpression(String currentFrameString,String target);

/** Determine whether currentWindowString plus target identify the window containing this running code.

<p>This is useful in proxy injection mode, where this code runs in every
browser frame and window, and sometimes the selenium server needs to identify
the "current" window.  In this case, when the test calls selectWindow, this
routine is called for each window to figure out which one has been selected.
The selected window will return true, while all others will return false.</p>
@param currentWindowString starting window
@param target new window (which might be relative to the current one, e.g., "_parent")
@return true if the new window is this code's window
*/
boolean getWhetherThisWindowMatchWindowExpression(String currentWindowString,String target);

/** Waits for a popup window to appear and load up.
@param windowID the JavaScript window ID of the window that will appear
@param timeout a timeout in milliseconds, after which the action will return with an error
*/
void waitForPopUp(String windowID,String timeout);

/** By default, Selenium's overridden window.confirm() function will
return true, as if the user had manually clicked OK; after running
this command, the next call to confirm() will return false, as if
the user had clicked Cancel.  Selenium will then resume using the
default behavior for future confirmations, automatically returning 
true (OK) unless/until you explicitly call this command for each
confirmation.
*/
void chooseCancelOnNextConfirmation();

/** Undo the effect of calling chooseCancelOnNextConfirmation.  Note
that Selenium's overridden window.confirm() function will normally automatically
return true, as if the user had manually clicked OK, so you shouldn't
need to use this command unless for some reason you need to change
your mind prior to the next confirmation.  After any confirmation, Selenium will resume using the
default behavior for future confirmations, automatically returning 
true (OK) unless/until you explicitly call chooseCancelOnNextConfirmation for each
confirmation.
*/
void chooseOkOnNextConfirmation();

/** Instructs Selenium to return the specified answer string in response to
the next JavaScript prompt [window.prompt()].
@param answer the answer to give in response to the prompt pop-up
*/
void answerOnNextPrompt(String answer);

/** Simulates the user clicking the "back" button on their browser.
*/
void goBack();

/** Simulates the user clicking the "Refresh" button on their browser.
*/
void refresh();

/** Simulates the user clicking the "close" button in the titlebar of a popup
window or tab.
*/
void close();

/** Has an alert occurred?

<p>
This function never throws an exception
</p>
@return true if there is an alert
*/
boolean isAlertPresent();

/** Has a prompt occurred?

<p>
This function never throws an exception
</p>
@return true if there is a pending prompt
*/
boolean isPromptPresent();

/** Has confirm() been called?

<p>
This function never throws an exception
</p>
@return true if there is a pending confirmation
*/
boolean isConfirmationPresent();

/** Retrieves the message of a JavaScript alert generated during the previous action, or fail if there were no alerts.

<p>Getting an alert has the same effect as manually clicking OK. If an
alert is generated but you do not get/verify it, the next Selenium action
will fail.</p><p>NOTE: under Selenium, JavaScript alerts will NOT pop up a visible alert
dialog.</p><p>NOTE: Selenium does NOT support JavaScript alerts that are generated in a
page's onload() event handler. In this case a visible dialog WILL be
generated and Selenium will hang until someone manually clicks OK.</p>
@return The message of the most recent JavaScript alert
*/
String getAlert();

/** Retrieves the message of a JavaScript confirmation dialog generated during
the previous action.

<p>
By default, the confirm function will return true, having the same effect
as manually clicking OK. This can be changed by prior execution of the
chooseCancelOnNextConfirmation command. If an confirmation is generated
but you do not get/verify it, the next Selenium action will fail.
</p><p>
NOTE: under Selenium, JavaScript confirmations will NOT pop up a visible
dialog.
</p><p>
NOTE: Selenium does NOT support JavaScript confirmations that are
generated in a page's onload() event handler. In this case a visible
dialog WILL be generated and Selenium will hang until you manually click
OK.
</p>
@return the message of the most recent JavaScript confirmation dialog
*/
String getConfirmation();

/** Retrieves the message of a JavaScript question prompt dialog generated during
the previous action.

<p>Successful handling of the prompt requires prior execution of the
answerOnNextPrompt command. If a prompt is generated but you
do not get/verify it, the next Selenium action will fail.</p><p>NOTE: under Selenium, JavaScript prompts will NOT pop up a visible
dialog.</p><p>NOTE: Selenium does NOT support JavaScript prompts that are generated in a
page's onload() event handler. In this case a visible dialog WILL be
generated and Selenium will hang until someone manually clicks OK.</p>
@return the message of the most recent JavaScript question prompt
*/
String getPrompt();

/** Gets the absolute URL of the current page.
@return the absolute URL of the current page
*/
String getLocation();

/** Gets the title of the current page.
@return the title of the current page
*/
String getTitle();

/** Gets the entire text of the page.
@return the entire text of the page
*/
String getBodyText();

/** Gets the (whitespace-trimmed) value of an input field (or anything else with a value parameter).
For checkbox/radio elements, the value will be "on" or "off" depending on
whether the element is checked or not.
@param locator an <a href="#locators">element locator</a>
@return the element value, or "on/off" for checkbox/radio elements
*/
String getValue(String locator);

/** Gets the text of an element. This works for any element that contains
text. This command uses either the textContent (Mozilla-like browsers) or
the innerText (IE-like browsers) of the element, which is the rendered
text shown to the user.
@param locator an <a href="#locators">element locator</a>
@return the text of the element
*/
String getText(String locator);

/** Briefly changes the backgroundColor of the specified element yellow.  Useful for debugging.
@param locator an <a href="#locators">element locator</a>
*/
void highlight(String locator);

/** Gets the result of evaluating the specified JavaScript snippet.  The snippet may
have multiple lines, but only the result of the last line will be returned.

<p>Note that, by default, the snippet will run in the context of the "selenium"
object itself, so <code>this</code> will refer to the Selenium object, and <code>window</code> will
refer to the top-level runner test window, not the window of your application.</p><p>If you need a reference to the window of your application, you can refer
to <code>this.browserbot.getCurrentWindow()</code> and if you need to use
a locator to refer to a single element in your application page, you can
use <code>this.browserbot.findElement("foo")</code> where "foo" is your locator.</p>
@param script the JavaScript snippet to run
@return the results of evaluating the snippet
*/
String getEval(String script);

/** Gets whether a toggle-button (checkbox/radio) is checked.  Fails if the specified element doesn't exist or isn't a toggle-button.
@param locator an <a href="#locators">element locator</a> pointing to a checkbox or radio button
@return true if the checkbox is checked, false otherwise
*/
boolean isChecked(String locator);

/** Gets the text from a cell of a table. The cellAddress syntax
tableLocator.row.column, where row and column start at 0.
@param tableCellAddress a cell address, e.g. "foo.1.4"
@return the text from the specified cell
*/
String getTable(String tableCellAddress);

/** Gets all option labels (visible text) for selected options in the specified select or multi-select element.
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@return an array of all selected option labels in the specified select drop-down
*/
String[] getSelectedLabels(String selectLocator);

/** Gets option label (visible text) for selected option in the specified select element.
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@return the selected option label in the specified select drop-down
*/
String getSelectedLabel(String selectLocator);

/** Gets all option values (value attributes) for selected options in the specified select or multi-select element.
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@return an array of all selected option values in the specified select drop-down
*/
String[] getSelectedValues(String selectLocator);

/** Gets option value (value attribute) for selected option in the specified select element.
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@return the selected option value in the specified select drop-down
*/
String getSelectedValue(String selectLocator);

/** Gets all option indexes (option number, starting at 0) for selected options in the specified select or multi-select element.
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@return an array of all selected option indexes in the specified select drop-down
*/
String[] getSelectedIndexes(String selectLocator);

/** Gets option index (option number, starting at 0) for selected option in the specified select element.
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@return the selected option index in the specified select drop-down
*/
String getSelectedIndex(String selectLocator);

/** Gets all option element IDs for selected options in the specified select or multi-select element.
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@return an array of all selected option IDs in the specified select drop-down
*/
String[] getSelectedIds(String selectLocator);

/** Gets option element ID for selected option in the specified select element.
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@return the selected option ID in the specified select drop-down
*/
String getSelectedId(String selectLocator);

/** Determines whether some option in a drop-down menu is selected.
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@return true if some option has been selected, false otherwise
*/
boolean isSomethingSelected(String selectLocator);

/** Gets all option labels in the specified select drop-down.
@param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
@return an array of all option labels in the specified select drop-down
*/
String[] getSelectOptions(String selectLocator);

/** Gets the value of an element attribute.
@param attributeLocator an element locator followed by an @ sign and then the name of the attribute, e.g. "foo@bar"
@return the value of the specified attribute
*/
String getAttribute(String attributeLocator);

/** Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
@param pattern a <a href="#patterns">pattern</a> to match with the text of the page
@return true if the pattern matches the text, false otherwise
*/
boolean isTextPresent(String pattern);

/** Verifies that the specified element is somewhere on the page.
@param locator an <a href="#locators">element locator</a>
@return true if the element is present, false otherwise
*/
boolean isElementPresent(String locator);

/** Determines if the specified element is visible. An
element can be rendered invisible by setting the CSS "visibility"
property to "hidden", or the "display" property to "none", either for the
element itself or one if its ancestors.  This method will fail if
the element is not present.
@param locator an <a href="#locators">element locator</a>
@return true if the specified element is visible, false otherwise
*/
boolean isVisible(String locator);

/** Determines whether the specified input element is editable, ie hasn't been disabled.
This method will fail if the specified element isn't an input element.
@param locator an <a href="#locators">element locator</a>
@return true if the input element is editable, false otherwise
*/
boolean isEditable(String locator);

/** Returns the IDs of all buttons on the page.

<p>If a given button has no ID, it will appear as "" in this array.</p>
@return the IDs of all buttons on the page
*/
String[] getAllButtons();

/** Returns the IDs of all links on the page.

<p>If a given link has no ID, it will appear as "" in this array.</p>
@return the IDs of all links on the page
*/
String[] getAllLinks();

/** Returns the IDs of all input fields on the page.

<p>If a given field has no ID, it will appear as "" in this array.</p>
@return the IDs of all field on the page
*/
String[] getAllFields();

/** Returns every instance of some attribute from all known windows.
@param attributeName name of an attribute on the windows
@return the set of values of this attribute from all known windows.
*/
String[] getAttributeFromAllWindows(String attributeName);

/** deprecated - use dragAndDrop instead
@param locator an element locator
@param movementsString offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
*/
void dragdrop(String locator,String movementsString);

/** Configure the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
<p>Setting this value to 0 means that we'll send a "mousemove" event to every single pixel
in between the start location and the end location; that can be very slow, and may
cause some browsers to force the JavaScript to timeout.</p><p>If the mouse speed is greater than the distance between the two dragged objects, we'll
just send one "mousemove" at the start location and then one final one at the end location.</p>
@param pixels the number of pixels between "mousemove" events
*/
void setMouseSpeed(String pixels);

/** Returns the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
@return the number of pixels between "mousemove" events during dragAndDrop commands (default=10)
*/
Number getMouseSpeed();

/** Drags an element a certain distance and then drops it
@param locator an element locator
@param movementsString offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
*/
void dragAndDrop(String locator,String movementsString);

/** Drags an element and drops it on another element
@param locatorOfObjectToBeDragged an element to be dragged
@param locatorOfDragDestinationObject an element whose location (i.e., whose center-most pixel) will be the point where locatorOfObjectToBeDragged  is dropped
*/
void dragAndDropToObject(String locatorOfObjectToBeDragged,String locatorOfDragDestinationObject);

/** Gives focus to the currently selected window
*/
void windowFocus();

/** Resize currently selected window to take up the entire screen
*/
void windowMaximize();

/** Returns the IDs of all windows that the browser knows about.
@return the IDs of all windows that the browser knows about.
*/
String[] getAllWindowIds();

/** Returns the names of all windows that the browser knows about.
@return the names of all windows that the browser knows about.
*/
String[] getAllWindowNames();

/** Returns the titles of all windows that the browser knows about.
@return the titles of all windows that the browser knows about.
*/
String[] getAllWindowTitles();

/** Returns the entire HTML source between the opening and
closing "html" tags.
@return the entire HTML source
*/
String getHtmlSource();

/** Moves the text cursor to the specified position in the given input element or textarea.
This method will fail if the specified element isn't an input element or textarea.
@param locator an <a href="#locators">element locator</a> pointing to an input element or textarea
@param position the numerical position of the cursor in the field; position should be 0 to move the position to the beginning of the field.  You can also set the cursor to -1 to move it to the end of the field.
*/
void setCursorPosition(String locator,String position);

/** Get the relative index of an element to its parent (starting from 0). The comment node and empty text node
will be ignored.
@param locator an <a href="#locators">element locator</a> pointing to an element
@return of relative index of the element to its parent (starting from 0)
*/
Number getElementIndex(String locator);

/** Check if these two elements have same parent and are ordered siblings in the DOM. Two same elements will
not be considered ordered.
@param locator1 an <a href="#locators">element locator</a> pointing to the first element
@param locator2 an <a href="#locators">element locator</a> pointing to the second element
@return true if element1 is the previous sibling of element2, false otherwise
*/
boolean isOrdered(String locator1,String locator2);

/** Retrieves the horizontal position of an element
@param locator an <a href="#locators">element locator</a> pointing to an element OR an element itself
@return of pixels from the edge of the frame.
*/
Number getElementPositionLeft(String locator);

/** Retrieves the vertical position of an element
@param locator an <a href="#locators">element locator</a> pointing to an element OR an element itself
@return of pixels from the edge of the frame.
*/
Number getElementPositionTop(String locator);

/** Retrieves the width of an element
@param locator an <a href="#locators">element locator</a> pointing to an element
@return width of an element in pixels
*/
Number getElementWidth(String locator);

/** Retrieves the height of an element
@param locator an <a href="#locators">element locator</a> pointing to an element
@return height of an element in pixels
*/
Number getElementHeight(String locator);

/** Retrieves the text cursor position in the given input element or textarea; beware, this may not work perfectly on all browsers.

<p>Specifically, if the cursor/selection has been cleared by JavaScript, this command will tend to
return the position of the last location of the cursor, even though the cursor is now gone from the page.  This is filed as <a href="http://jira.openqa.org/browse/SEL-243">SEL-243</a>.</p>
This method will fail if the specified element isn't an input element or textarea, or there is no cursor in the element.
@param locator an <a href="#locators">element locator</a> pointing to an input element or textarea
@return the numerical position of the cursor in the field
*/
Number getCursorPosition(String locator);

/** Writes a message to the status bar and adds a note to the browser-side
log.

<p>If logLevelThreshold is specified, set the threshold for logging
to that level (debug, info, warn, error).</p><p>(Note that the browser-side logs will <i>not</i> be sent back to the
server, and are invisible to the Client Driver.)</p>
@param context the message to be sent to the browser
@param logLevelThreshold one of "debug", "info", "warn", "error", sets the threshold for browser-side logging
*/
void setContext(String context,String logLevelThreshold);

/** Returns the specified expression.

<p>This is useful because of JavaScript preprocessing.
It is used to generate commands like assertExpression and waitForExpression.</p>
@param expression the value to return
@return the value passed in
*/
String getExpression(String expression);

/** Returns the number of nodes that match the specified xpath, eg. "//table" would give
the number of tables.
*/
void getXpathCount();

/** Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
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

/** Specifies the amount of time that Selenium will wait for actions to complete.

<p>Actions that require waiting include "open" and the "waitFor*" actions.</p>
The default timeout is 30 seconds.
@param timeout a timeout in milliseconds, after which the action will return with an error
*/
void setTimeout(String timeout);

/** Waits for a new page to load.

<p>You can use this command instead of the "AndWait" suffixes, "clickAndWait", "selectAndWait", "typeAndWait" etc.
(which are only available in the JS API).</p><p>Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
flag when it first notices a page load.  Running any other Selenium command after
turns the flag to false.  Hence, if you want to wait for a page to load, you must
wait immediately after a Selenium command that caused a page-load.</p>
@param timeout a timeout in milliseconds, after which this command will return with an error
*/
void waitForPageToLoad(String timeout);

/** Waits for a new frame to load.

<p>Selenium constantly keeps track of new pages and frames loading, 
and sets a "newPageLoaded" flag when it first notices a page load.</p>

See waitForPageToLoad for more information.
@param frameAddress FrameAddress from the server side
@param timeout a timeout in milliseconds, after which this command will return with an error
*/
void waitForFrameToLoad(String frameAddress,String timeout);

/** Return all cookies of the current page under test.
@return all cookies of the current page under test
*/
String getCookie();

/** Create a new cookie whose path and domain are same with those of current page
under test, unless you specified a path for this cookie explicitly.
@param nameValuePair name and value of the cookie in a format "name=value"
@param optionsString options for the cookie. Currently supported options include 'path' and 'max_age'.      the optionsString's format is "path=/path/, max_age=60". The order of options are irrelevant, the unit      of the value of 'max_age' is second.
*/
void createCookie(String nameValuePair,String optionsString);

/** Delete a named cookie with specified path.
@param name the name of the cookie to be deleted
@param path the path property of the cookie to be deleted
*/
void deleteCookie(String name,String path);

}