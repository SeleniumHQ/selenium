/*
 * Copyright 2015 Software Freedom Conservancy.
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
using System;
namespace Selenium
{
	/// <summary>Defines an object that runs Selenium commands.
	/// 
	/// <h3><a name="locators"></a>Element Locators</h3><p>
	/// Element Locators tell Selenium which HTML element a command refers to.
	/// The format of a locator is:</p><blockquote><em>locatorType</em><strong>=</strong><em>argument</em></blockquote><p>
	/// We support the following strategies for locating elements:
	/// </p><ul><li><strong>identifier</strong>=<em>id</em>: 
	/// Select the element with the specified @id attribute. If no match is
	/// found, select the first element whose @name attribute is <em>id</em>.
	/// (This is normally the default; see below.)</li><li><strong>id</strong>=<em>id</em>:
	/// Select the element with the specified @id attribute.</li><li><strong>name</strong>=<em>name</em>:
	/// Select the first element with the specified @name attribute.
	/// <ul class="first last simple"><li>username</li><li>name=username</li></ul><p>The name may optionally be followed by one or more <em>element-filters</em>, separated from the name by whitespace.  If the <em>filterType</em> is not specified, <strong>value</strong> is assumed.</p><ul class="first last simple"><li>name=flavour value=chocolate</li></ul></li><li><strong>dom</strong>=<em>javascriptExpression</em>: 
	/// 
	/// Find an element by evaluating the specified string.  This allows you to traverse the HTML Document Object
	/// Model using JavaScript.  Note that you must not return a value in this string; simply make it the last expression in the block.
	/// <ul class="first last simple"><li>dom=document.forms['myForm'].myDropdown</li><li>dom=document.images[56]</li><li>dom=function foo() { return document.links[1]; }; foo();</li></ul></li><li><strong>xpath</strong>=<em>xpathExpression</em>: 
	/// Locate an element using an XPath expression.
	/// <ul class="first last simple"><li>xpath=//img[@alt='The image alt text']</li><li>xpath=//table[@id='table1']//tr[4]/td[2]</li><li>xpath=//a[contains(@href,'#id1')]</li><li>xpath=//a[contains(@href,'#id1')]/@class</li><li>xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td</li><li>xpath=//input[@name='name2' and @value='yes']</li><li>xpath=//*[text()="right"]</li></ul></li><li><strong>link</strong>=<em>textPattern</em>:
	/// Select the link (anchor) element which contains text matching the
	/// specified <em>pattern</em>.
	/// <ul class="first last simple"><li>link=The link text</li></ul></li><li><strong>css</strong>=<em>cssSelectorSyntax</em>:
	/// Select the element using css selectors. Please refer to <a href="http://www.w3.org/TR/REC-CSS2/selector.html">CSS2 selectors</a>, <a href="http://www.w3.org/TR/2001/CR-css3-selectors-20011113/">CSS3 selectors</a> for more information. You can also check the TestCssLocators test in the selenium test suite for an example of usage, which is included in the downloaded selenium core package.
	/// <ul class="first last simple"><li>css=a[href="#id3"]</li><li>css=span#firstChild + span</li></ul><p>Currently the css selector locator supports all css1, css2 and css3 selectors except namespace in css3, some pseudo classes(:nth-of-type, :nth-last-of-type, :first-of-type, :last-of-type, :only-of-type, :visited, :hover, :active, :focus, :indeterminate) and pseudo elements(::first-line, ::first-letter, ::selection, ::before, ::after). </p></li><li><strong>ui</strong>=<em>uiSpecifierString</em>:
	/// Locate an element by resolving the UI specifier string to another locator, and evaluating it. See the <a href="http://svn.openqa.org/fisheye/browse/~raw,r=trunk/selenium/trunk/src/main/resources/core/scripts/ui-doc.html">Selenium UI-Element Reference</a> for more details.
	/// <ul class="first last simple"><li>ui=loginPages::loginButton()</li><li>ui=settingsPages::toggle(label=Hide Email)</li><li>ui=forumPages::postBody(index=2)//a[2]</li></ul></li></ul><p>
	/// Without an explicit locator prefix, Selenium uses the following default
	/// strategies:
	/// </p><ul class="simple"><li><strong>dom</strong>, for locators starting with "document."</li><li><strong>xpath</strong>, for locators starting with "//"</li><li><strong>identifier</strong>, otherwise</li></ul><h3><a name="element-filters">Element Filters</a></h3><blockquote><p>Element filters can be used with a locator to refine a list of candidate elements.  They are currently used only in the 'name' element-locator.</p><p>Filters look much like locators, ie.</p><blockquote><em>filterType</em><strong>=</strong><em>argument</em></blockquote><p>Supported element-filters are:</p><p><strong>value=</strong><em>valuePattern</em></p><blockquote>
	/// Matches elements based on their values.  This is particularly useful for refining a list of similarly-named toggle-buttons.</blockquote><p><strong>index=</strong><em>index</em></p><blockquote>
	/// Selects a single element based on its position in the list (offset from zero).</blockquote></blockquote><h3><a name="patterns"></a>String-match Patterns</h3><p>
	/// Various Pattern syntaxes are available for matching string values:
	/// </p><ul><li><strong>glob:</strong><em>pattern</em>:
	/// Match a string against a "glob" (aka "wildmat") pattern. "Glob" is a
	/// kind of limited regular-expression syntax typically used in command-line
	/// shells. In a glob pattern, "*" represents any sequence of characters, and "?"
	/// represents any single character. Glob patterns match against the entire
	/// string.</li><li><strong>regexp:</strong><em>regexp</em>:
	/// Match a string using a regular-expression. The full power of JavaScript
	/// regular-expressions is available.</li><li><strong>regexpi:</strong><em>regexpi</em>:
	/// Match a string using a case-insensitive regular-expression.</li><li><strong>exact:</strong><em>string</em>:
	/// 
	/// Match a string exactly, verbatim, without any of that fancy wildcard
	/// stuff.</li></ul><p>
	/// If no pattern prefix is specified, Selenium assumes that it's a "glob"
	/// pattern.
	/// </p><p>
	/// For commands that return multiple values (such as verifySelectOptions),
	/// the string being matched is a comma-separated list of the return values,
	/// where both commas and backslashes in the values are backslash-escaped.
	/// When providing a pattern, the optional matching syntax (i.e. glob,
	/// regexp, etc.) is specified once, as usual, at the beginning of the
	/// pattern.
	/// </p>
	/// </summary>
    [Obsolete("The ISelenium interface and Selenium RC is deprecated. Please use WebDriver instead.")]
	public interface ISelenium
	{
		/// <summary>
		/// Sets the extension Javascript for the session
		/// </summary>
        /// <param name="extensionJs">The extension JavaScript to use.</param>
		void SetExtensionJs(string extensionJs);
		
		/// <summary>
		/// Launches the browser with a new Selenium session
		/// </summary>
		void Start();
		
		/// <summary>
		/// Ends the test session, killing the browser
		/// </summary>
		void Stop();
					
		/// <summary>Clicks on a link, button, checkbox or radio button. If the click action
		/// causes a new page to load (like a link usually does), call
		/// waitForPageToLoad.
		/// </summary>
		/// <param name="locator">an element locator</param>
		void Click(String locator);


		/// <summary>Double clicks on a link, button, checkbox or radio button. If the double click action
		/// causes a new page to load (like a link usually does), call
		/// waitForPageToLoad.
		/// </summary>
		/// <param name="locator">an element locator</param>
		void DoubleClick(String locator);


		/// <summary>Simulates opening the context menu for the specified element (as might happen if the user "right-clicked" on the element).
		/// </summary>
		/// <param name="locator">an element locator</param>
		void ContextMenu(String locator);


		/// <summary>Clicks on a link, button, checkbox or radio button. If the click action
		/// causes a new page to load (like a link usually does), call
		/// waitForPageToLoad.
		/// </summary>
		/// <param name="locator">an element locator</param>
		/// <param name="coordString">specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.</param>
		void ClickAt(String locator,String coordString);


		/// <summary>Doubleclicks on a link, button, checkbox or radio button. If the action
		/// causes a new page to load (like a link usually does), call
		/// waitForPageToLoad.
		/// </summary>
		/// <param name="locator">an element locator</param>
		/// <param name="coordString">specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.</param>
		void DoubleClickAt(String locator,String coordString);


		/// <summary>Simulates opening the context menu for the specified element (as might happen if the user "right-clicked" on the element).
		/// </summary>
		/// <param name="locator">an element locator</param>
		/// <param name="coordString">specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.</param>
		void ContextMenuAt(String locator,String coordString);


		/// <summary>Explicitly simulate an event, to trigger the corresponding "on<em>event</em>"
		/// handler.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="eventName">the event name, e.g. "focus" or "blur"</param>
		void FireEvent(String locator,String eventName);


		/// <summary>Move the focus to the specified element; for example, if the element is an input field, move the cursor to that field.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void Focus(String locator);


		/// <summary>Simulates a user pressing and releasing a key.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="keySequence">Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".</param>
		void KeyPress(String locator,String keySequence);


		/// <summary>Press the shift key and hold it down until doShiftUp() is called or a new page is loaded.
		/// </summary>
		void ShiftKeyDown();


		/// <summary>Release the shift key.
		/// </summary>
		void ShiftKeyUp();


		/// <summary>Press the meta key and hold it down until doMetaUp() is called or a new page is loaded.
		/// </summary>
		void MetaKeyDown();


		/// <summary>Release the meta key.
		/// </summary>
		void MetaKeyUp();


		/// <summary>Press the alt key and hold it down until doAltUp() is called or a new page is loaded.
		/// </summary>
		void AltKeyDown();


		/// <summary>Release the alt key.
		/// </summary>
		void AltKeyUp();


		/// <summary>Press the control key and hold it down until doControlUp() is called or a new page is loaded.
		/// </summary>
		void ControlKeyDown();


		/// <summary>Release the control key.
		/// </summary>
		void ControlKeyUp();


		/// <summary>Simulates a user pressing a key (without releasing it yet).
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="keySequence">Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".</param>
		void KeyDown(String locator,String keySequence);


		/// <summary>Simulates a user releasing a key.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="keySequence">Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".</param>
		void KeyUp(String locator,String keySequence);


		/// <summary>Simulates a user hovering a mouse over the specified element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void MouseOver(String locator);


		/// <summary>Simulates a user moving the mouse pointer away from the specified element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void MouseOut(String locator);


		/// <summary>Simulates a user pressing the left mouse button (without releasing it yet) on
		/// the specified element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void MouseDown(String locator);


		/// <summary>Simulates a user pressing the right mouse button (without releasing it yet) on
		/// the specified element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void MouseDownRight(String locator);


		/// <summary>Simulates a user pressing the left mouse button (without releasing it yet) at
		/// the specified location.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="coordString">specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.</param>
		void MouseDownAt(String locator,String coordString);


		/// <summary>Simulates a user pressing the right mouse button (without releasing it yet) at
		/// the specified location.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="coordString">specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.</param>
		void MouseDownRightAt(String locator,String coordString);


		/// <summary>Simulates the event that occurs when the user releases the mouse button (i.e., stops
		/// holding the button down) on the specified element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void MouseUp(String locator);


		/// <summary>Simulates the event that occurs when the user releases the right mouse button (i.e., stops
		/// holding the button down) on the specified element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void MouseUpRight(String locator);


		/// <summary>Simulates the event that occurs when the user releases the mouse button (i.e., stops
		/// holding the button down) at the specified location.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="coordString">specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.</param>
		void MouseUpAt(String locator,String coordString);


		/// <summary>Simulates the event that occurs when the user releases the right mouse button (i.e., stops
		/// holding the button down) at the specified location.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="coordString">specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.</param>
		void MouseUpRightAt(String locator,String coordString);


		/// <summary>Simulates a user pressing the mouse button (without releasing it yet) on
		/// the specified element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void MouseMove(String locator);


		/// <summary>Simulates a user pressing the mouse button (without releasing it yet) on
		/// the specified element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="coordString">specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.</param>
		void MouseMoveAt(String locator,String coordString);


		/// <summary>Sets the value of an input field, as though you typed it in.
		/// 
		/// <p>Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
		/// value should be the value of the option selected, not the visible text.</p>
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="value">the value to type</param>
		void Type(String locator,String value);


		/// <summary>Simulates keystroke events on the specified element, as though you typed the value key-by-key.
		/// 
		/// <p>This is a convenience method for calling keyDown, keyUp, keyPress for every character in the specified string;
		/// this is useful for dynamic UI widgets (like auto-completing combo boxes) that require explicit key events.</p><p>Unlike the simple "type" command, which forces the specified value into the page directly, this command
		/// may or may not have any visible effect, even in cases where typing keys would normally have a visible effect.
		/// For example, if you use "typeKeys" on a form element, you may or may not see the results of what you typed in
		/// the field.</p><p>In some cases, you may need to use the simple "type" command to set the value of the field and then the "typeKeys" command to
		/// send the keystroke events corresponding to what you just typed.</p>
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="value">the value to type</param>
		void TypeKeys(String locator,String value);


		/// <summary>Set execution speed (i.e., set the millisecond length of a delay which will follow each selenium operation).  By default, there is no such delay, i.e.,
		/// the delay is 0 milliseconds.
		/// </summary>
		/// <param name="value">the number of milliseconds to pause after operation</param>
		void SetSpeed(String value);


		/// <summary>Get execution speed (i.e., get the millisecond length of the delay following each selenium operation).  By default, there is no such delay, i.e.,
		/// the delay is 0 milliseconds.
		/// 
		/// See also setSpeed.
		/// </summary>
		/// <returns>the execution speed in milliseconds.</returns>
		String GetSpeed();


		/// <summary>Check a toggle-button (checkbox/radio)
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void Check(String locator);


		/// <summary>Uncheck a toggle-button (checkbox/radio)
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void Uncheck(String locator);


		/// <summary>Select an option from a drop-down using an option locator.
		/// 
		/// <p>
		/// Option locators provide different ways of specifying options of an HTML
		/// Select element (e.g. for selecting a specific option, or for asserting
		/// that the selected option satisfies a specification). There are several
		/// forms of Select Option Locator.
		/// </p><ul><li><strong>label</strong>=<em>labelPattern</em>:
		/// matches options based on their labels, i.e. the visible text. (This
		/// is the default.)
		/// <ul class="first last simple"><li>label=regexp:^[Oo]ther</li></ul></li><li><strong>value</strong>=<em>valuePattern</em>:
		/// matches options based on their values.
		/// <ul class="first last simple"><li>value=other</li></ul></li><li><strong>id</strong>=<em>id</em>:
		/// 
		/// matches options based on their ids.
		/// <ul class="first last simple"><li>id=option1</li></ul></li><li><strong>index</strong>=<em>index</em>:
		/// matches an option based on its index (offset from zero).
		/// <ul class="first last simple"><li>index=2</li></ul></li></ul><p>
		/// If no option locator prefix is provided, the default behaviour is to match on <strong>label</strong>.
		/// </p>
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <param name="optionLocator">an option locator (a label by default)</param>
		void Select(String selectLocator,String optionLocator);


		/// <summary>Add a selection to the set of selected options in a multi-select element using an option locator.
		/// 
		/// @see #doSelect for details of option locators
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> identifying a multi-select box</param>
		/// <param name="optionLocator">an option locator (a label by default)</param>
		void AddSelection(String locator,String optionLocator);


		/// <summary>Remove a selection from the set of selected options in a multi-select element using an option locator.
		/// 
		/// @see #doSelect for details of option locators
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> identifying a multi-select box</param>
		/// <param name="optionLocator">an option locator (a label by default)</param>
		void RemoveSelection(String locator,String optionLocator);


		/// <summary>Unselects all of the selected options in a multi-select element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> identifying a multi-select box</param>
		void RemoveAllSelections(String locator);


		/// <summary>Submit the specified form. This is particularly useful for forms without
		/// submit buttons, e.g. single-input "Search" forms.
		/// </summary>
		/// <param name="formLocator">an <a href="#locators">element locator</a> for the form you want to submit</param>
		void Submit(String formLocator);


		/// <summary>Opens an URL in the test frame. This accepts both relative and absolute
		/// URLs.
		/// 
		/// The "open" command waits for the page to load before proceeding,
		/// ie. the "AndWait" suffix is implicit.
		/// 
		/// <em>Note</em>: The URL must be on the same domain as the runner HTML
		/// due to security restrictions in the browser (Same Origin Policy). If you
		/// need to open an URL on another domain, use the Selenium Server to start a
		/// new browser session on that domain.
		/// </summary>
		/// <param name="url">the URL to open; may be relative or absolute</param>
		void Open(String url);


		/// <summary>Opens a popup window (if a window with that ID isn't already open).
		/// After opening the window, you'll need to select it using the selectWindow
		/// command.
		/// 
		/// <p>This command can also be a useful workaround for bug SEL-339.  In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
		/// In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
		/// an empty (blank) url, like this: openWindow("", "myFunnyWindow").</p>
		/// </summary>
		/// <param name="url">the URL to open, which can be blank</param>
		/// <param name="windowID">the JavaScript window ID of the window to select</param>
		void OpenWindow(String url,String windowID);


		/// <summary>Selects a popup window using a window locator; once a popup window has been selected, all
		/// commands go to that window. To select the main window again, use null
		/// as the target.
		/// 
		/// <p>
		/// 
		/// Window locators provide different ways of specifying the window object:
		/// by title, by internal JavaScript "name," or by JavaScript variable.
		/// </p><ul><li><strong>title</strong>=<em>My Special Window</em>:
		/// Finds the window using the text that appears in the title bar.  Be careful;
		/// two windows can share the same title.  If that happens, this locator will
		/// just pick one.
		/// </li><li><strong>name</strong>=<em>myWindow</em>:
		/// Finds the window using its internal JavaScript "name" property.  This is the second 
		/// parameter "windowName" passed to the JavaScript method window.open(url, windowName, windowFeatures, replaceFlag)
		/// (which Selenium intercepts).
		/// </li><li><strong>var</strong>=<em>variableName</em>:
		/// Some pop-up windows are unnamed (anonymous), but are associated with a JavaScript variable name in the current
		/// application window, e.g. "window.foo = window.open(url);".  In those cases, you can open the window using
		/// "var=foo".
		/// </li></ul><p>
		/// If no window locator prefix is provided, we'll try to guess what you mean like this:</p><p>1.) if windowID is null, (or the string "null") then it is assumed the user is referring to the original window instantiated by the browser).</p><p>2.) if the value of the "windowID" parameter is a JavaScript variable name in the current application window, then it is assumed
		/// that this variable contains the return value from a call to the JavaScript window.open() method.</p><p>3.) Otherwise, selenium looks in a hash it maintains that maps string names to window "names".</p><p>4.) If <em>that</em> fails, we'll try looping over all of the known windows to try to find the appropriate "title".
		/// Since "title" is not necessarily unique, this may have unexpected behavior.</p><p>If you're having trouble figuring out the name of a window that you want to manipulate, look at the Selenium log messages
		/// which identify the names of windows created via window.open (and therefore intercepted by Selenium).  You will see messages
		/// like the following for each window as it is opened:</p><p><code>debug: window.open call intercepted; window ID (which you can use with selectWindow()) is "myNewWindow"</code></p><p>In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
		/// (This is bug SEL-339.)  In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
		/// an empty (blank) url, like this: openWindow("", "myFunnyWindow").</p>
		/// </summary>
		/// <param name="windowID">the JavaScript window ID of the window to select</param>
		void SelectWindow(String windowID);


		/// <summary>Simplifies the process of selecting a popup window (and does not offer
		/// functionality beyond what <code>selectWindow()</code> already provides).
		/// <ul><li>If <code>windowID</code> is either not specified, or specified as
		/// "null", the first non-top window is selected. The top window is the one
		/// that would be selected by <code>selectWindow()</code> without providing a
		/// <code>windowID</code> . This should not be used when more than one popup
		/// window is in play.</li><li>Otherwise, the window will be looked up considering
		/// <code>windowID</code> as the following in order: 1) the "name" of the
		/// window, as specified to <code>window.open()</code>; 2) a javascript
		/// variable which is a reference to a window; and 3) the title of the
		/// window. This is the same ordered lookup performed by
		/// <code>selectWindow</code> .</li></ul>
		/// </summary>
		/// <param name="windowID">an identifier for the popup window, which can take on a                  number of different meanings</param>
		void SelectPopUp(String windowID);


		/// <summary>Selects the main window. Functionally equivalent to using
		/// <code>selectWindow()</code> and specifying no value for
		/// <code>windowID</code>.
		/// </summary>
		void DeselectPopUp();


		/// <summary>Selects a frame within the current window.  (You may invoke this command
		/// multiple times to select nested frames.)  To select the parent frame, use
		/// "relative=parent" as a locator; to select the top frame, use "relative=top".
		/// You can also select a frame by its 0-based index number; select the first frame with
		/// "index=0", or the third frame with "index=2".
		/// 
		/// <p>You may also use a DOM expression to identify the frame you want directly,
		/// like this: <code>dom=frames["main"].frames["subframe"]</code></p>
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> identifying a frame or iframe</param>
		void SelectFrame(String locator);


		/// <summary>Determine whether current/locator identify the frame containing this running code.
		/// 
		/// <p>This is useful in proxy injection mode, where this code runs in every
		/// browser frame and window, and sometimes the selenium server needs to identify
		/// the "current" frame.  In this case, when the test calls selectFrame, this
		/// routine is called for each frame to figure out which one has been selected.
		/// The selected frame will return true, while all others will return false.</p>
		/// </summary>
		/// <param name="currentFrameString">starting frame</param>
		/// <param name="target">new frame (which might be relative to the current one)</param>
		/// <returns>true if the new frame is this code's window</returns>
		bool GetWhetherThisFrameMatchFrameExpression(String currentFrameString,String target);


		/// <summary>Determine whether currentWindowString plus target identify the window containing this running code.
		/// 
		/// <p>This is useful in proxy injection mode, where this code runs in every
		/// browser frame and window, and sometimes the selenium server needs to identify
		/// the "current" window.  In this case, when the test calls selectWindow, this
		/// routine is called for each window to figure out which one has been selected.
		/// The selected window will return true, while all others will return false.</p>
		/// </summary>
		/// <param name="currentWindowString">starting window</param>
		/// <param name="target">new window (which might be relative to the current one, e.g., "_parent")</param>
		/// <returns>true if the new window is this code's window</returns>
		bool GetWhetherThisWindowMatchWindowExpression(String currentWindowString,String target);


		/// <summary>Waits for a popup window to appear and load up.
		/// </summary>
		/// <param name="windowID">the JavaScript window "name" of the window that will appear (not the text of the title bar)                 If unspecified, or specified as "null", this command will                 wait for the first non-top window to appear (don't rely                 on this if you are working with multiple popups                 simultaneously).</param>
		/// <param name="timeout">a timeout in milliseconds, after which the action will return with an error.                If this value is not specified, the default Selenium                timeout will be used. See the setTimeout() command.</param>
		void WaitForPopUp(String windowID,String timeout);


		/// <summary><p>
		/// By default, Selenium's overridden window.confirm() function will
		/// return true, as if the user had manually clicked OK; after running
		/// this command, the next call to confirm() will return false, as if
		/// the user had clicked Cancel.  Selenium will then resume using the
		/// default behavior for future confirmations, automatically returning 
		/// true (OK) unless/until you explicitly call this command for each
		/// confirmation.
		/// </p><p>
		/// Take note - every time a confirmation comes up, you must
		/// consume it with a corresponding getConfirmation, or else
		/// the next selenium operation will fail.
		/// </p>
		/// </summary>
		void ChooseCancelOnNextConfirmation();


		/// <summary><p>
		/// Undo the effect of calling chooseCancelOnNextConfirmation.  Note
		/// that Selenium's overridden window.confirm() function will normally automatically
		/// return true, as if the user had manually clicked OK, so you shouldn't
		/// need to use this command unless for some reason you need to change
		/// your mind prior to the next confirmation.  After any confirmation, Selenium will resume using the
		/// default behavior for future confirmations, automatically returning 
		/// true (OK) unless/until you explicitly call chooseCancelOnNextConfirmation for each
		/// confirmation.
		/// </p><p>
		/// Take note - every time a confirmation comes up, you must
		/// consume it with a corresponding getConfirmation, or else
		/// the next selenium operation will fail.
		/// </p>
		/// </summary>
		void ChooseOkOnNextConfirmation();


		/// <summary>Instructs Selenium to return the specified answer string in response to
		/// the next JavaScript prompt [window.prompt()].
		/// </summary>
		/// <param name="answer">the answer to give in response to the prompt pop-up</param>
		void AnswerOnNextPrompt(String answer);


		/// <summary>Simulates the user clicking the "back" button on their browser.
		/// </summary>
		void GoBack();


		/// <summary>Simulates the user clicking the "Refresh" button on their browser.
		/// </summary>
		void Refresh();


		/// <summary>Simulates the user clicking the "close" button in the titlebar of a popup
		/// window or tab.
		/// </summary>
		void Close();


		/// <summary>Has an alert occurred?
		/// 
		/// <p>
		/// This function never throws an exception
		/// </p>
		/// </summary>
		/// <returns>true if there is an alert</returns>
		bool IsAlertPresent();


		/// <summary>Has a prompt occurred?
		/// 
		/// <p>
		/// This function never throws an exception
		/// </p>
		/// </summary>
		/// <returns>true if there is a pending prompt</returns>
		bool IsPromptPresent();


		/// <summary>Has confirm() been called?
		/// 
		/// <p>
		/// This function never throws an exception
		/// </p>
		/// </summary>
		/// <returns>true if there is a pending confirmation</returns>
		bool IsConfirmationPresent();


		/// <summary>Retrieves the message of a JavaScript alert generated during the previous action, or fail if there were no alerts.
		/// 
		/// <p>Getting an alert has the same effect as manually clicking OK. If an
		/// alert is generated but you do not consume it with getAlert, the next Selenium action
		/// will fail.</p><p>Under Selenium, JavaScript alerts will NOT pop up a visible alert
		/// dialog.</p><p>Selenium does NOT support JavaScript alerts that are generated in a
		/// page's onload() event handler. In this case a visible dialog WILL be
		/// generated and Selenium will hang until someone manually clicks OK.</p>
		/// </summary>
		/// <returns>The message of the most recent JavaScript alert</returns>
		String GetAlert();


		/// <summary>Retrieves the message of a JavaScript confirmation dialog generated during
		/// the previous action.
		/// 
		/// <p>
		/// By default, the confirm function will return true, having the same effect
		/// as manually clicking OK. This can be changed by prior execution of the
		/// chooseCancelOnNextConfirmation command. 
		/// </p><p>
		/// If an confirmation is generated but you do not consume it with getConfirmation,
		/// the next Selenium action will fail.
		/// </p><p>
		/// NOTE: under Selenium, JavaScript confirmations will NOT pop up a visible
		/// dialog.
		/// </p><p>
		/// NOTE: Selenium does NOT support JavaScript confirmations that are
		/// generated in a page's onload() event handler. In this case a visible
		/// dialog WILL be generated and Selenium will hang until you manually click
		/// OK.
		/// </p>
		/// </summary>
		/// <returns>the message of the most recent JavaScript confirmation dialog</returns>
		String GetConfirmation();


		/// <summary>Retrieves the message of a JavaScript question prompt dialog generated during
		/// the previous action.
		/// 
		/// <p>Successful handling of the prompt requires prior execution of the
		/// answerOnNextPrompt command. If a prompt is generated but you
		/// do not get/verify it, the next Selenium action will fail.</p><p>NOTE: under Selenium, JavaScript prompts will NOT pop up a visible
		/// dialog.</p><p>NOTE: Selenium does NOT support JavaScript prompts that are generated in a
		/// page's onload() event handler. In this case a visible dialog WILL be
		/// generated and Selenium will hang until someone manually clicks OK.</p>
		/// </summary>
		/// <returns>the message of the most recent JavaScript question prompt</returns>
		String GetPrompt();


		/// <summary>Gets the absolute URL of the current page.
		/// </summary>
		/// <returns>the absolute URL of the current page</returns>
		String GetLocation();


		/// <summary>Gets the title of the current page.
		/// </summary>
		/// <returns>the title of the current page</returns>
		String GetTitle();


		/// <summary>Gets the entire text of the page.
		/// </summary>
		/// <returns>the entire text of the page</returns>
		String GetBodyText();


		/// <summary>Gets the (whitespace-trimmed) value of an input field (or anything else with a value parameter).
		/// For checkbox/radio elements, the value will be "on" or "off" depending on
		/// whether the element is checked or not.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <returns>the element value, or "on/off" for checkbox/radio elements</returns>
		String GetValue(String locator);


		/// <summary>Gets the text of an element. This works for any element that contains
		/// text. This command uses either the textContent (Mozilla-like browsers) or
		/// the innerText (IE-like browsers) of the element, which is the rendered
		/// text shown to the user.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <returns>the text of the element</returns>
		String GetText(String locator);


		/// <summary>Briefly changes the backgroundColor of the specified element yellow.  Useful for debugging.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void Highlight(String locator);


		/// <summary>Gets the result of evaluating the specified JavaScript snippet.  The snippet may
		/// have multiple lines, but only the result of the last line will be returned.
		/// 
		/// <p>Note that, by default, the snippet will run in the context of the "selenium"
		/// object itself, so <code>this</code> will refer to the Selenium object.  Use <code>window</code> to
		/// refer to the window of your application, e.g. <code>window.document.getElementById('foo')</code></p><p>If you need to use
		/// a locator to refer to a single element in your application page, you can
		/// use <code>this.browserbot.findElement("id=foo")</code> where "id=foo" is your locator.</p>
		/// </summary>
		/// <param name="script">the JavaScript snippet to run</param>
		/// <returns>the results of evaluating the snippet</returns>
		String GetEval(String script);


		/// <summary>Gets whether a toggle-button (checkbox/radio) is checked.  Fails if the specified element doesn't exist or isn't a toggle-button.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> pointing to a checkbox or radio button</param>
		/// <returns>true if the checkbox is checked, false otherwise</returns>
		bool IsChecked(String locator);


		/// <summary>Gets the text from a cell of a table. The cellAddress syntax
		/// tableLocator.row.column, where row and column start at 0.
		/// </summary>
		/// <param name="tableCellAddress">a cell address, e.g. "foo.1.4"</param>
		/// <returns>the text from the specified cell</returns>
		String GetTable(String tableCellAddress);


		/// <summary>Gets all option labels (visible text) for selected options in the specified select or multi-select element.
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <returns>an array of all selected option labels in the specified select drop-down</returns>
		String[] GetSelectedLabels(String selectLocator);


		/// <summary>Gets option label (visible text) for selected option in the specified select element.
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <returns>the selected option label in the specified select drop-down</returns>
		String GetSelectedLabel(String selectLocator);


		/// <summary>Gets all option values (value attributes) for selected options in the specified select or multi-select element.
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <returns>an array of all selected option values in the specified select drop-down</returns>
		String[] GetSelectedValues(String selectLocator);


		/// <summary>Gets option value (value attribute) for selected option in the specified select element.
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <returns>the selected option value in the specified select drop-down</returns>
		String GetSelectedValue(String selectLocator);


		/// <summary>Gets all option indexes (option number, starting at 0) for selected options in the specified select or multi-select element.
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <returns>an array of all selected option indexes in the specified select drop-down</returns>
		String[] GetSelectedIndexes(String selectLocator);


		/// <summary>Gets option index (option number, starting at 0) for selected option in the specified select element.
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <returns>the selected option index in the specified select drop-down</returns>
		String GetSelectedIndex(String selectLocator);


		/// <summary>Gets all option element IDs for selected options in the specified select or multi-select element.
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <returns>an array of all selected option IDs in the specified select drop-down</returns>
		String[] GetSelectedIds(String selectLocator);


		/// <summary>Gets option element ID for selected option in the specified select element.
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <returns>the selected option ID in the specified select drop-down</returns>
		String GetSelectedId(String selectLocator);


		/// <summary>Determines whether some option in a drop-down menu is selected.
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <returns>true if some option has been selected, false otherwise</returns>
		bool IsSomethingSelected(String selectLocator);


		/// <summary>Gets all option labels in the specified select drop-down.
		/// </summary>
		/// <param name="selectLocator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <returns>an array of all option labels in the specified select drop-down</returns>
		String[] GetSelectOptions(String selectLocator);


		/// <summary>Gets the value of an element attribute. The value of the attribute may
		/// differ across browsers (this is the case for the "style" attribute, for
		/// example).
		/// </summary>
		/// <param name="attributeLocator">an element locator followed by an @ sign and then the name of the attribute, e.g. "foo@bar"</param>
		/// <returns>the value of the specified attribute</returns>
		String GetAttribute(String attributeLocator);


		/// <summary>Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
		/// </summary>
		/// <param name="pattern">a <a href="#patterns">pattern</a> to match with the text of the page</param>
		/// <returns>true if the pattern matches the text, false otherwise</returns>
		bool IsTextPresent(String pattern);


		/// <summary>Verifies that the specified element is somewhere on the page.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <returns>true if the element is present, false otherwise</returns>
		bool IsElementPresent(String locator);


		/// <summary>Determines if the specified element is visible. An
		/// element can be rendered invisible by setting the CSS "visibility"
		/// property to "hidden", or the "display" property to "none", either for the
		/// element itself or one if its ancestors.  This method will fail if
		/// the element is not present.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <returns>true if the specified element is visible, false otherwise</returns>
		bool IsVisible(String locator);


		/// <summary>Determines whether the specified input element is editable, ie hasn't been disabled.
		/// This method will fail if the specified element isn't an input element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <returns>true if the input element is editable, false otherwise</returns>
		bool IsEditable(String locator);


		/// <summary>Returns the IDs of all buttons on the page.
		/// 
		/// <p>If a given button has no ID, it will appear as "" in this array.</p>
		/// </summary>
		/// <returns>the IDs of all buttons on the page</returns>
		String[] GetAllButtons();


		/// <summary>Returns the IDs of all links on the page.
		/// 
		/// <p>If a given link has no ID, it will appear as "" in this array.</p>
		/// </summary>
		/// <returns>the IDs of all links on the page</returns>
		String[] GetAllLinks();


		/// <summary>Returns the IDs of all input fields on the page.
		/// 
		/// <p>If a given field has no ID, it will appear as "" in this array.</p>
		/// </summary>
		/// <returns>the IDs of all field on the page</returns>
		String[] GetAllFields();


		/// <summary>Returns an array of JavaScript property values from all known windows having one.
		/// </summary>
		/// <param name="attributeName">name of an attribute on the windows</param>
		/// <returns>the set of values of this attribute from all known windows.</returns>
		String[] GetAttributeFromAllWindows(String attributeName);


		/// <summary>deprecated - use dragAndDrop instead
		/// </summary>
		/// <param name="locator">an element locator</param>
		/// <param name="movementsString">offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"</param>
		void Dragdrop(String locator,String movementsString);


		/// <summary>Configure the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
		/// <p>Setting this value to 0 means that we'll send a "mousemove" event to every single pixel
		/// in between the start location and the end location; that can be very slow, and may
		/// cause some browsers to force the JavaScript to timeout.</p><p>If the mouse speed is greater than the distance between the two dragged objects, we'll
		/// just send one "mousemove" at the start location and then one final one at the end location.</p>
		/// </summary>
		/// <param name="pixels">the number of pixels between "mousemove" events</param>
		void SetMouseSpeed(String pixels);


		/// <summary>Returns the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
		/// </summary>
		/// <returns>the number of pixels between "mousemove" events during dragAndDrop commands (default=10)</returns>
		Decimal GetMouseSpeed();


		/// <summary>Drags an element a certain distance and then drops it
		/// </summary>
		/// <param name="locator">an element locator</param>
		/// <param name="movementsString">offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"</param>
		void DragAndDrop(String locator,String movementsString);


		/// <summary>Drags an element and drops it on another element
		/// </summary>
		/// <param name="locatorOfObjectToBeDragged">an element to be dragged</param>
		/// <param name="locatorOfDragDestinationObject">an element whose location (i.e., whose center-most pixel) will be the point where locatorOfObjectToBeDragged  is dropped</param>
		void DragAndDropToObject(String locatorOfObjectToBeDragged,String locatorOfDragDestinationObject);


		/// <summary>Gives focus to the currently selected window
		/// </summary>
		void WindowFocus();


		/// <summary>Resize currently selected window to take up the entire screen
		/// </summary>
		void WindowMaximize();


		/// <summary>Returns the IDs of all windows that the browser knows about in an array.
		/// </summary>
		/// <returns>Array of identifiers of all windows that the browser knows about.</returns>
		String[] GetAllWindowIds();


		/// <summary>Returns the names of all windows that the browser knows about in an array.
		/// </summary>
		/// <returns>Array of names of all windows that the browser knows about.</returns>
		String[] GetAllWindowNames();


		/// <summary>Returns the titles of all windows that the browser knows about in an array.
		/// </summary>
		/// <returns>Array of titles of all windows that the browser knows about.</returns>
		String[] GetAllWindowTitles();


		/// <summary>Returns the entire HTML source between the opening and
		/// closing "html" tags.
		/// </summary>
		/// <returns>the entire HTML source</returns>
		String GetHtmlSource();


		/// <summary>Moves the text cursor to the specified position in the given input element or textarea.
		/// This method will fail if the specified element isn't an input element or textarea.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> pointing to an input element or textarea</param>
		/// <param name="position">the numerical position of the cursor in the field; position should be 0 to move the position to the beginning of the field.  You can also set the cursor to -1 to move it to the end of the field.</param>
		void SetCursorPosition(String locator,String position);


		/// <summary>Get the relative index of an element to its parent (starting from 0). The comment node and empty text node
		/// will be ignored.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> pointing to an element</param>
		/// <returns>of relative index of the element to its parent (starting from 0)</returns>
		Decimal GetElementIndex(String locator);


		/// <summary>Check if these two elements have same parent and are ordered siblings in the DOM. Two same elements will
		/// not be considered ordered.
		/// </summary>
		/// <param name="locator1">an <a href="#locators">element locator</a> pointing to the first element</param>
		/// <param name="locator2">an <a href="#locators">element locator</a> pointing to the second element</param>
		/// <returns>true if element1 is the previous sibling of element2, false otherwise</returns>
		bool IsOrdered(String locator1,String locator2);


		/// <summary>Retrieves the horizontal position of an element
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> pointing to an element OR an element itself</param>
		/// <returns>of pixels from the edge of the frame.</returns>
		Decimal GetElementPositionLeft(String locator);


		/// <summary>Retrieves the vertical position of an element
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> pointing to an element OR an element itself</param>
		/// <returns>of pixels from the edge of the frame.</returns>
		Decimal GetElementPositionTop(String locator);


		/// <summary>Retrieves the width of an element
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> pointing to an element</param>
		/// <returns>width of an element in pixels</returns>
		Decimal GetElementWidth(String locator);


		/// <summary>Retrieves the height of an element
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> pointing to an element</param>
		/// <returns>height of an element in pixels</returns>
		Decimal GetElementHeight(String locator);


		/// <summary>Retrieves the text cursor position in the given input element or textarea; beware, this may not work perfectly on all browsers.
		/// 
		/// <p>Specifically, if the cursor/selection has been cleared by JavaScript, this command will tend to
		/// return the position of the last location of the cursor, even though the cursor is now gone from the page.  This is filed as <a href="http://jira.openqa.org/browse/SEL-243">SEL-243</a>.</p>
		/// This method will fail if the specified element isn't an input element or textarea, or there is no cursor in the element.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> pointing to an input element or textarea</param>
		/// <returns>the numerical position of the cursor in the field</returns>
		Decimal GetCursorPosition(String locator);


		/// <summary>Returns the specified expression.
		/// 
		/// <p>This is useful because of JavaScript preprocessing.
		/// It is used to generate commands like assertExpression and waitForExpression.</p>
		/// </summary>
		/// <param name="expression">the value to return</param>
		/// <returns>the value passed in</returns>
		String GetExpression(String expression);


		/// <summary>Returns the number of nodes that match the specified xpath, eg. "//table" would give
		/// the number of tables.
		/// </summary>
		/// <param name="xpath">the xpath expression to evaluate. do NOT wrap this expression in a 'count()' function; we will do that for you.</param>
		/// <returns>the number of nodes that match the specified xpath</returns>
		Decimal GetXpathCount(String xpath);


	    /// <summary>Returns the number of nodes that match the specified css, eg. "css=table" would give
	    /// the number of tables.
	    /// </summary>
	    /// <param name="cssLocator">the css path expression to evaluate. do NOT wrap this expression in a 'count()' function; we will do that for you.</param>
	    /// <returns>the number of nodes that match the specified css locator</returns>
	    Decimal GetCSSCount(String cssLocator);

        /// <summary>Temporarily sets the "id" attribute of the specified element, so you can locate it in the future
		/// using its ID rather than a slow/complicated XPath.  This ID will disappear once the page is
		/// reloaded.
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> pointing to an element</param>
		/// <param name="identifier">a string to be used as the ID of the specified element</param>
		void AssignId(String locator,String identifier);


		/// <summary>Specifies whether Selenium should use the native in-browser implementation
		/// of XPath (if any native version is available); if you pass "false" to
		/// this function, we will always use our pure-JavaScript xpath library.
		/// Using the pure-JS xpath library can improve the consistency of xpath
		/// element locators between different browser vendors, but the pure-JS
		/// version is much slower than the native implementations.
		/// </summary>
		/// <param name="allow">boolean, true means we'll prefer to use native XPath; false means we'll only use JS XPath</param>
		void AllowNativeXpath(String allow);


		/// <summary>Specifies whether Selenium will ignore xpath attributes that have no
		/// value, i.e. are the empty string, when using the non-native xpath
		/// evaluation engine. You'd want to do this for performance reasons in IE.
		/// However, this could break certain xpaths, for example an xpath that looks
		/// for an attribute whose value is NOT the empty string.
		/// 
		/// The hope is that such xpaths are relatively rare, but the user should
		/// have the option of using them. Note that this only influences xpath
		/// evaluation when using the ajaxslt engine (i.e. not "javascript-xpath").
		/// </summary>
		/// <param name="ignore">boolean, true means we'll ignore attributes without value                        at the expense of xpath "correctness"; false means                        we'll sacrifice speed for correctness.</param>
		void IgnoreAttributesWithoutValue(String ignore);


		/// <summary>Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
		/// The snippet may have multiple lines, but only the result of the last line
		/// will be considered.
		/// 
		/// <p>Note that, by default, the snippet will be run in the runner's test window, not in the window
		/// of your application.  To get the window of your application, you can use
		/// the JavaScript snippet <code>selenium.browserbot.getCurrentWindow()</code>, and then
		/// run your JavaScript in there</p>
		/// </summary>
		/// <param name="script">the JavaScript snippet to run</param>
		/// <param name="timeout">a timeout in milliseconds, after which this command will return with an error</param>
		void WaitForCondition(String script,String timeout);


		/// <summary>Specifies the amount of time that Selenium will wait for actions to complete.
		/// 
		/// <p>Actions that require waiting include "open" and the "waitFor*" actions.</p>
		/// The default timeout is 30 seconds.
		/// </summary>
		/// <param name="timeout">a timeout in milliseconds, after which the action will return with an error</param>
		void SetTimeout(String timeout);


		/// <summary>Waits for a new page to load.
		/// 
		/// <p>You can use this command instead of the "AndWait" suffixes, "clickAndWait", "selectAndWait", "typeAndWait" etc.
		/// (which are only available in the JS API).</p><p>Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
		/// flag when it first notices a page load.  Running any other Selenium command after
		/// turns the flag to false.  Hence, if you want to wait for a page to load, you must
		/// wait immediately after a Selenium command that caused a page-load.</p>
		/// </summary>
		/// <param name="timeout">a timeout in milliseconds, after which this command will return with an error</param>
		void WaitForPageToLoad(String timeout);


		/// <summary>Waits for a new frame to load.
		/// 
		/// <p>Selenium constantly keeps track of new pages and frames loading, 
		/// and sets a "newPageLoaded" flag when it first notices a page load.</p>
		/// 
		/// See waitForPageToLoad for more information.
		/// </summary>
		/// <param name="frameAddress">FrameAddress from the server side</param>
		/// <param name="timeout">a timeout in milliseconds, after which this command will return with an error</param>
		void WaitForFrameToLoad(String frameAddress,String timeout);


		/// <summary>Return all cookies of the current page under test.
		/// </summary>
		/// <returns>all cookies of the current page under test</returns>
		String GetCookie();


		/// <summary>Returns the value of the cookie with the specified name, or throws an error if the cookie is not present.
		/// </summary>
		/// <param name="name">the name of the cookie</param>
		/// <returns>the value of the cookie</returns>
		String GetCookieByName(String name);


		/// <summary>Returns true if a cookie with the specified name is present, or false otherwise.
		/// </summary>
		/// <param name="name">the name of the cookie</param>
		/// <returns>true if a cookie with the specified name is present, or false otherwise.</returns>
		bool IsCookiePresent(String name);


		/// <summary>Create a new cookie whose path and domain are same with those of current page
		/// under test, unless you specified a path for this cookie explicitly.
		/// </summary>
		/// <param name="nameValuePair">name and value of the cookie in a format "name=value"</param>
		/// <param name="optionsString">options for the cookie. Currently supported options include 'path', 'max_age' and 'domain'.      the optionsString's format is "path=/path/, max_age=60, domain=.foo.com". The order of options are irrelevant, the unit      of the value of 'max_age' is second.  Note that specifying a domain that isn't a subset of the current domain will      usually fail.</param>
		void CreateCookie(String nameValuePair,String optionsString);


		/// <summary>Delete a named cookie with specified path and domain.  Be careful; to delete a cookie, you
		/// need to delete it using the exact same path and domain that were used to create the cookie.
		/// If the path is wrong, or the domain is wrong, the cookie simply won't be deleted.  Also
		/// note that specifying a domain that isn't a subset of the current domain will usually fail.
		/// 
		/// Since there's no way to discover at runtime the original path and domain of a given cookie,
		/// we've added an option called 'recurse' to try all sub-domains of the current domain with
		/// all paths that are a subset of the current path.  Beware; this option can be slow.  In
		/// big-O notation, it operates in O(n*m) time, where n is the number of dots in the domain
		/// name and m is the number of slashes in the path.
		/// </summary>
		/// <param name="name">the name of the cookie to be deleted</param>
		/// <param name="optionsString">options for the cookie. Currently supported options include 'path', 'domain'      and 'recurse.' The optionsString's format is "path=/path/, domain=.foo.com, recurse=true".      The order of options are irrelevant. Note that specifying a domain that isn't a subset of      the current domain will usually fail.</param>
		void DeleteCookie(String name,String optionsString);


		/// <summary>Calls deleteCookie with recurse=true on all cookies visible to the current page.
		/// As noted on the documentation for deleteCookie, recurse=true can be much slower
		/// than simply deleting the cookies using a known domain/path.
		/// </summary>
		void DeleteAllVisibleCookies();


		/// <summary>Sets the threshold for browser-side logging messages; log messages beneath this threshold will be discarded.
		/// Valid logLevel strings are: "debug", "info", "warn", "error" or "off".
		/// To see the browser logs, you need to
		/// either show the log window in GUI mode, or enable browser-side logging in Selenium RC.
		/// </summary>
		/// <param name="logLevel">one of the following: "debug", "info", "warn", "error" or "off"</param>
		void SetBrowserLogLevel(String logLevel);


		/// <summary>Creates a new "script" tag in the body of the current test window, and 
		/// adds the specified text into the body of the command.  Scripts run in
		/// this way can often be debugged more easily than scripts executed using
		/// Selenium's "getEval" command.  Beware that JS exceptions thrown in these script
		/// tags aren't managed by Selenium, so you should probably wrap your script
		/// in try/catch blocks if there is any chance that the script will throw
		/// an exception.
		/// </summary>
		/// <param name="script">the JavaScript snippet to run</param>
		void RunScript(String script);


		/// <summary>Defines a new function for Selenium to locate elements on the page.
		/// For example,
		/// if you define the strategy "foo", and someone runs click("foo=blah"), we'll
		/// run your function, passing you the string "blah", and click on the element 
		/// that your function
		/// returns, or throw an "Element not found" error if your function returns null.
		/// 
		/// We'll pass three arguments to your function:
		/// <ul><li>locator: the string the user passed in</li><li>inWindow: the currently selected window</li><li>inDocument: the currently selected document</li></ul>
		/// The function must return null if the element can't be found.
		/// </summary>
		/// <param name="strategyName">the name of the strategy to define; this should use only   letters [a-zA-Z] with no spaces or other punctuation.</param>
		/// <param name="functionDefinition">a string defining the body of a function in JavaScript.   For example: <code>return inDocument.getElementById(locator);</code></param>
		void AddLocationStrategy(String strategyName,String functionDefinition);


		/// <summary>Saves the entire contents of the current window canvas to a PNG file.
		/// Contrast this with the captureScreenshot command, which captures the
		/// contents of the OS viewport (i.e. whatever is currently being displayed
		/// on the monitor), and is implemented in the RC only. Currently this only
		/// works in Firefox when running in chrome mode, and in IE non-HTA using
		/// the EXPERIMENTAL "Snapsie" utility. The Firefox implementation is mostly
		/// borrowed from the Screengrab! Firefox extension. Please see
		/// http://www.screengrab.org and http://snapsie.sourceforge.net/ for
		/// details.
		/// </summary>
		/// <param name="filename">the path to the file to persist the screenshot as. No                  filename extension will be appended by default.                  Directories will not be created if they do not exist,                    and an exception will be thrown, possibly by native                  code.</param>
		/// <param name="kwargs">a kwargs string that modifies the way the screenshot                  is captured. Example: "background=#CCFFDD" .                  Currently valid options:                  <dl><dt>background</dt><dd>the background CSS for the HTML document. This                     may be useful to set for capturing screenshots of                     less-than-ideal layouts, for example where absolute                     positioning causes the calculation of the canvas                     dimension to fail and a black background is exposed                     (possibly obscuring black text).</dd></dl></param>
		void CaptureEntirePageScreenshot(String filename,String kwargs);


		/// <summary>Executes a command rollup, which is a series of commands with a unique
		/// name, and optionally arguments that control the generation of the set of
		/// commands. If any one of the rolled-up commands fails, the rollup is
		/// considered to have failed. Rollups may also contain nested rollups.
		/// </summary>
		/// <param name="rollupName">the name of the rollup command</param>
		/// <param name="kwargs">keyword arguments string that influences how the                    rollup expands into commands</param>
		void Rollup(String rollupName,String kwargs);


		/// <summary>Loads script content into a new script tag in the Selenium document. This
		/// differs from the runScript command in that runScript adds the script tag
		/// to the document of the AUT, not the Selenium document. The following
		/// entities in the script content are replaced by the characters they
		/// represent:
		/// 
		///     &lt;
		///     &gt;
		///     &amp;
		/// 
		/// The corresponding remove command is removeScript.
		/// </summary>
		/// <param name="scriptContent">the Javascript content of the script to add</param>
		/// <param name="scriptTagId">(optional) the id of the new script tag. If                       specified, and an element with this id already                       exists, this operation will fail.</param>
		void AddScript(String scriptContent,String scriptTagId);


		/// <summary>Removes a script tag from the Selenium document identified by the given
		/// id. Does nothing if the referenced tag doesn't exist.
		/// </summary>
		/// <param name="scriptTagId">the id of the script element to remove.</param>
		void RemoveScript(String scriptTagId);


		/// <summary>Allows choice of one of the available libraries.
		/// </summary>
		/// <param name="libraryName">name of the desired library Only the following three can be chosen: <ul><li>"ajaxslt" - Google's library</li><li>"javascript-xpath" - Cybozu Labs' faster library</li><li>"default" - The default library.  Currently the default library is "ajaxslt" .</li></ul> If libraryName isn't one of these three, then  no change will be made.</param>
		void UseXpathLibrary(String libraryName);


		/// <summary>Writes a message to the status bar and adds a note to the browser-side
		/// log.
		/// </summary>
		/// <param name="context">the message to be sent to the browser</param>
		void SetContext(String context);


		/// <summary>Sets a file input (upload) field to the file listed in fileLocator
		/// </summary>
		/// <param name="fieldLocator">an <a href="#locators">element locator</a></param>
		/// <param name="fileLocator">a URL pointing to the specified file. Before the file  can be set in the input field (fieldLocator), Selenium RC may need to transfer the file    to the local machine before attaching the file in a web page form. This is common in selenium  grid configurations where the RC server driving the browser is not the same  machine that started the test.   Supported Browsers: Firefox ("*chrome") only.</param>
		void AttachFile(String fieldLocator,String fileLocator);


		/// <summary>Captures a PNG screenshot to the specified file.
		/// </summary>
		/// <param name="filename">the absolute path to the file to be written, e.g. "c:\blah\screenshot.png"</param>
		void CaptureScreenshot(String filename);


		/// <summary>Capture a PNG screenshot.  It then returns the file as a base 64 encoded string.
		/// </summary>
		/// <returns>The base 64 encoded string of the screen shot (PNG file)</returns>
		String CaptureScreenshotToString();


		/// <summary>Downloads a screenshot of the browser current window canvas to a 
		/// based 64 encoded PNG file. The <em>entire</em> windows canvas is captured,
		/// including parts rendered outside of the current view port.
		/// 
		/// Currently this only works in Mozilla and when running in chrome mode.
		/// </summary>
		/// <param name="kwargs">A kwargs string that modifies the way the screenshot is captured. Example: "background=#CCFFDD". This may be useful to set for capturing screenshots of less-than-ideal layouts, for example where absolute positioning causes the calculation of the canvas dimension to fail and a black background is exposed  (possibly obscuring black text).</param>
		/// <returns>The base 64 encoded string of the page screenshot (PNG file)</returns>
		String CaptureEntirePageScreenshotToString(String kwargs);


		/// <summary>Kills the running Selenium Server and all browser sessions.  After you run this command, you will no longer be able to send
		/// commands to the server; you can't remotely start the server once it has been stopped.  Normally
		/// you should prefer to run the "stop" command, which terminates the current browser session, rather than 
		/// shutting down the entire server.
		/// </summary>
		void ShutDownSeleniumServer();


		/// <summary>Retrieve the last messages logged on a specific remote control. Useful for error reports, especially
		/// when running multiple remote controls in a distributed environment. The maximum number of log messages
		/// that can be retrieve is configured on remote control startup.
		/// </summary>
		/// <returns>The last N log messages as a multi-line string.</returns>
		String RetrieveLastRemoteControlLogs();


		/// <summary>Simulates a user pressing a key (without releasing it yet) by sending a native operating system keystroke.
		/// This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
		/// a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
		/// metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
		/// element, focus on the element first before running this command.
		/// </summary>
		/// <param name="keycode">an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!</param>
		void KeyDownNative(String keycode);


		/// <summary>Simulates a user releasing a key by sending a native operating system keystroke.
		/// This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
		/// a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
		/// metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
		/// element, focus on the element first before running this command.
		/// </summary>
		/// <param name="keycode">an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!</param>
		void KeyUpNative(String keycode);


		/// <summary>Simulates a user pressing and releasing a key by sending a native operating system keystroke.
		/// This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
		/// a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
		/// metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
		/// element, focus on the element first before running this command.
		/// </summary>
		/// <param name="keycode">an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!</param>
		void KeyPressNative(String keycode);

	}
}