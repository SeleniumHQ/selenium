// This file has been automatically generated via XSL
using System;
namespace Selenium
{
	/// <summary>
	/// 
	/// Defines an object that runs Selenium commands.
	/// 
	/// <h3><a name="locators"></a>Element Locators</h3><p>
	/// Element Locators tell Selenium which HTML element a command refers to. Many
	/// commands require an Element Locator as a parameter.
	/// 
	/// We support the following strategies for locating elements:
	/// </p><blockquote><dl><dt><strong>identifier</strong>=<em>id</em></dt><dd>Select the element with the specified @id attribute. If no match is
	/// found, select the first element whose @name attribute is <em>id</em>.
	/// (This is normally the default; see below.)</dd><dt><strong>id</strong>=<em>id</em></dt><dd>Select the element with the specified @id attribute.</dd><dt><strong>name</strong>=<em>name</em></dt><dd>Select the first element with the specified @name attribute.</dd><dt><strong>dom</strong>=<em>javascriptExpression</em></dt><dd><dd>Find an element using JavaScript traversal of the HTML Document Object
	/// Model. DOM locators <em>must</em> begin with "document.".
	/// <ul class="first last simple"><li>dom=document.forms['myForm'].myDropdown</li><li>dom=document.images[56]</li></ul></dd></dd><dt><strong>xpath</strong>=<em>xpathExpression</em></dt><dd>Locate an element using an XPath expression. XPath locators
	/// <em>must</em> begin with "//".
	/// <ul class="first last simple"><li>xpath=//img[@alt='The image alt text']</li><li>xpath=//table[@id='table1']//tr[4]/td[2]</li></ul></dd><dt><strong>link</strong>=<em>textPattern</em></dt><dd>Select the link (anchor) element which contains text matching the
	/// specified <em>pattern</em>.
	/// <ul class="first last simple"><li>link=The link text</li></ul></dd></dl></blockquote><p>
	/// Without an explicit locator prefix, Selenium uses the following default
	/// strategies:
	/// </p><ul class="simple"><li><strong>dom</strong>, for locators starting with "document."</li><li><strong>xpath</strong>, for locators starting with "//"</li><li><strong>identifier</strong>, otherwise</li></ul><h3><a name="patterns"></a>String-match Patterns</h3><p>
	/// Various Pattern syntaxes are available for matching string values:
	/// </p><blockquote><dl><dt><strong>glob:</strong><em>pattern</em></dt><dd>Match a string against a "glob" (aka "wildmat") pattern. "Glob" is a
	/// kind of limited regular-expression syntax typically used in command-line
	/// shells. In a glob pattern, "*" represents any sequence of characters, and "?"
	/// represents any single character. Glob patterns match against the entire
	/// string.</dd><dt><strong>regexp:</strong><em>regexp</em></dt><dd>Match a string using a regular-expression. The full power of JavaScript
	/// regular-expressions is available.</dd><dt><strong>exact:</strong><em>string</em></dt><dd>Match a string exactly, verbatim, without any of that fancy wildcard
	/// stuff.</dd></dl></blockquote><p>
	/// If no pattern prefix is specified, Selenium assumes that it's a "glob"
	/// pattern.
	/// </p>
	/// </summary>
	public interface ISelenium
	{
		/// <summary>
		/// Launches the browser with a new Selenium session
		/// </summary>
		void Start();
		
		/// <summary>
		/// Ends the test session, killing the browser
		/// </summary>
		void Stop();
		
		
	
		/// <summary>
		/// Clicks on a link, button, checkbox or radio button. If the click action
		/// causes a new page to load (like a link usually does), call
		/// waitForPageToLoad.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an element locator</param>
		void Click(String locator);


		/// <summary>
		/// Simulates a user pressing and releasing a key.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="keycode">the numeric keycode of the key to be pressed, normally the
		///             ASCII value of that key.</param>
		void KeyPress(String locator,String keycode);


		/// <summary>
		/// Simulates a user pressing a key (without releasing it yet).
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="keycode">the numeric keycode of the key to be pressed, normally the
		///             ASCII value of that key.</param>
		void KeyDown(String locator,String keycode);


		/// <summary>
		/// Simulates a user hovering a mouse over the specified element.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void MouseOver(String locator);


		/// <summary>
		/// Simulates a user pressing the mouse button (without releasing it yet) on
		/// the specified element.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void MouseDown(String locator);


		/// <summary>
		/// Sets the value of an input field, as though you typed it in.
		/// 
		/// <p>Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
		/// value should be the value of the option selected, not the visible text.</p>
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="value">the value to type</param>
		void Type(String locator,String value);


		/// <summary>
		/// Check a toggle-button (checkbox/radio)
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void Check(String locator);


		/// <summary>
		/// Uncheck a toggle-button (checkbox/radio)
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void Uncheck(String locator);


		/// <summary>
		/// Select an option from a drop-down using an option locator.
		/// 
		/// <p>
		/// Option locators provide different ways of specifying options of an HTML
		/// Select element (e.g. for selecting a specific option, or for asserting
		/// that the selected option satisfies a specification). There are several
		/// forms of Select Option Locator.
		/// </p><dl><dt><strong>label</strong>=<em>labelPattern</em></dt><dd>matches options based on their labels, i.e. the visible text. (This
		/// is the default.)
		/// <ul class="first last simple"><li>label=regexp:^[Oo]ther</li></ul></dd><dt><strong>value</strong>=<em>valuePattern</em></dt><dd>matches options based on their values.
		/// <ul class="first last simple"><li>value=other</li></ul></dd><dt><strong>id</strong>=<em>id</em></dt><dd>matches options based on their ids.
		/// <ul class="first last simple"><li>id=option1</li></ul></dd><dt><strong>index</strong>=<em>index</em></dt><dd>matches an option based on its index (offset from zero).
		/// <ul class="first last simple"><li>index=2</li></ul></dd></dl><p>
		/// Without a prefix, the default behaviour is to only match on labels.
		/// </p>
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> identifying a drop-down menu</param>
		/// <param name="optionLocator">an option locator (a label by default)</param>
		void Select(String locator,String optionLocator);


		/// <summary>
		/// Submit the specified form. This is particularly useful for forms without
		/// submit buttons, e.g. single-input "Search" forms.
		/// 
		/// 
		/// </summary>
		/// <param name="formLocator">an <a href="#locators">element locator</a> for the form you want to submit</param>
		void Submit(String formLocator);


		/// <summary>
		/// Opens an URL in the test frame. This accepts both relative and absolute
		/// URLs.
		/// 
		/// <em>Note</em>: The URL must be on the same domain as the runner HTML
		/// due to security restrictions in the browser (Same Origin Policy). If you
		/// need to open an URL on another domain, use the Selenium Server to start a
		/// new browser session on that domain.
		/// 
		/// 
		/// </summary>
		/// <param name="url">the URL to open; may be relative or absolute</param>
		void Open(String url);


		/// <summary>
		/// Selects a popup window; once a popup window has been selected, all
		/// commands go to that window. To select the main window again, use "null"
		/// as the target.
		/// 
		/// 
		/// </summary>
		/// <param name="windowID">the JavaScript window ID of the window to select</param>
		void SelectWindow(String windowID);


		/// <summary>
		/// Instructs Selenium to click "Cancel" on the next JavaScript confirmation
		/// dialog to be raised. By default, the confirm function will return true,
		/// having the same effect as manually clicking OK. After running this
		/// command, the next confirmation will behave as if the user had clicked
		/// Cancel.
		/// 
		///    
		/// </summary>
		void ChooseCancelOnNextConfirmation();


		/// <summary>
		/// Instructs Selenium to return the specified answer string in response to
		/// the next JavaScript prompt [window.prompt()].
		/// 
		/// 
		/// 
		/// </summary>
		/// <param name="answer">the answer to give in response to the prompt pop-up</param>
		void AnswerOnNextPrompt(String answer);


		/// <summary>
		/// Simulates the user clicking the "back" button on their browser.
		/// 
		///      
		/// </summary>
		void GoBack();


		/// <summary>
		/// Simulates the user clicking the "close" button in the titlebar of a popup
		/// window or tab.
		///    
		/// </summary>
		void Close();


		/// <summary>
		/// Explicitly simulate an event, to trigger the corresponding "on<em>event</em>"
		/// handler.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="eventName">the event name, e.g. "focus" or "blur"</param>
		void FireEvent(String locator,String eventName);


		/// <summary>
		/// Retrieves the message of a javascript alert generated during the previous action, or fail if there were no alerts.
		/// 
		/// <p>Getting an alert has the same effect as manually clicking OK. If an
		/// alert is generated but you do not get/verify it, the next Selenium action
		/// will fail.</p><p>NOTE: under Selenium, javascript alerts will NOT pop up a visible alert
		/// dialog.</p><p>NOTE: Selenium does NOT support javascript alerts that are generated in a
		/// page's onload() event handler. In this case a visible dialog WILL be
		/// generated and Selenium will hang until someone manually clicks OK.</p>
		/// </summary>
		/// <returns>The message of the most recent JavaScript alert</returns>
		String GetAlert();


		/// <summary>
		/// Retrieves the message of a javascript confirmation dialog generated during
		/// the previous action.
		/// 
		/// <p>
		/// By default, the confirm function will return true, having the same effect
		/// as manually clicking OK. This can be changed by prior execution of the
		/// chooseCancelOnNextConfirmation command. If an confirmation is generated
		/// but you do not get/verify it, the next Selenium action will fail.
		/// </p><p>
		/// NOTE: under Selenium, javascript confirmations will NOT pop up a visible
		/// dialog.
		/// </p><p>
		/// NOTE: Selenium does NOT support javascript confirmations that are
		/// generated in a page's onload() event handler. In this case a visible
		/// dialog WILL be generated and Selenium will hang until you manually click
		/// OK.
		/// </p>
		/// </summary>
		/// <returns>the message of the most recent JavaScript confirmation dialog</returns>
		String GetConfirmation();


		/// <summary>
		/// Retrieves the message of a javascript question prompt dialog generated during
		/// the previous action.
		/// 
		/// <p>Successful handling of the prompt requires prior execution of the
		/// answerOnNextPrompt command. If a prompt is generated but you
		/// do not get/verify it, the next Selenium action will fail.</p><p>NOTE: under Selenium, javascript prompts will NOT pop up a visible
		/// dialog.</p><p>NOTE: Selenium does NOT support javascript prompts that are generated in a
		/// page's onload() event handler. In this case a visible dialog WILL be
		/// generated and Selenium will hang until someone manually clicks OK.</p>
		/// </summary>
		/// <returns>the message of the most recent JavaScript question prompt</returns>
		String GetPrompt();


		/// <summary> Gets the absolute URL of the current page.
		/// 
		/// 
		/// </summary>
		/// <returns>the absolute URL of the current page</returns>
		String GetAbsoluteLocation();


		/// <summary>
		/// Verify the location of the current page ends with the expected location.
		/// If an URL querystring is provided, this is checked as well.
		/// 
		/// </summary>
		/// <param name="expectedLocation">the location to match</param>
		void AssertLocation(String expectedLocation);


		/// <summary> Gets the title of the current page.
		/// 
		/// 
		/// </summary>
		/// <returns>the title of the current page</returns>
		String GetTitle();


		/// <summary>
		/// Get the entire text of the page.
		/// 
		/// </summary>
		/// <returns>the entire text of the page</returns>
		String GetBodyText();


		/// <summary>
		/// Gets the (whitespace-trimmed) value of an input field (or anything else with a value parameter).
		/// For checkbox/radio elements, the value will be "on" or "off" depending on
		/// whether the element is checked or not.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <returns>the element value, or "on/off" for checkbox/radio elements</returns>
		String GetValue(String locator);


		/// <summary>
		/// Gets the text of an element. This works for any element that contains
		/// text. This command uses either the textContent (Mozilla-like browsers) or
		/// the innerText (IE-like browsers) of the element, which is the rendered
		/// text shown to the user.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <returns>the text of the element</returns>
		String GetText(String locator);


		/// <summary> Gets the result of evaluating the specified JavaScript snippet.  The snippet may 
		/// have multiple lines, but only the result of the last line will be returned.
		/// 
		/// <p>Note that, by default, the snippet will be run in the runner's test window, not in the window
		/// of your application.  To get the window of your application, you can use
		/// the JavaScript snippet <code>selenium.browserbot.getCurrentWindow()</code>, and then
		/// run your JavaScript in there.</p>
		/// </summary>
		/// <param name="script">the JavaScript snippet to run</param>
		/// <returns>the results of evaluating the snippet</returns>
		String GetEval(String script);


		/// <summary>
		/// Get whether a toggle-button (checkbox/radio) is checked.  Fails if the specified element doesn't exist or isn't a toggle-button.
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a> pointing to a checkbox or radio button</param>
		/// <returns>either "true" or "false" depending on whether the checkbox is checked</returns>
		String GetChecked(String locator);


		/// <summary>
		/// Gets the text from a cell of a table. The cellAddress syntax
		/// tableLocator.row.column, where row and column start at 0.
		/// 
		/// 
		/// </summary>
		/// <param name="tableCellAddress">a cell address, e.g. "foo.1.4"</param>
		/// <returns>the text from the specified cell</returns>
		String GetTable(String tableCellAddress);


		/// <summary>
		/// Verifies that the selected option of a drop-down satisfies the optionSpecifier.
		/// 
		/// <p>See the select command for more information about option locators.</p>
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <param name="optionLocator">an option locator, typically just an option label (e.g. "John Smith")</param>
		void AssertSelected(String locator,String optionLocator);


		/// <summary> Gets all option labels in the specified select drop-down.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		/// <returns>an array of all option labels in the specified select drop-down</returns>
		String[] GetSelectOptions(String locator);


		/// <summary>
		/// Gets the value of an element attribute.
		/// 
		/// </summary>
		/// <param name="attributeLocator">an element locator followed by an</param>
		/// <returns>the value of the specified attribute</returns>
		String GetAttribute(String attributeLocator);


		/// <summary>
		/// Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
		/// 
		/// </summary>
		/// <param name="pattern">a <a href="#patterns">pattern</a> to match with the text of the page</param>
		void AssertTextPresent(String pattern);


		/// <summary>
		/// Verifies that the specified text pattern does NOT appear anywhere on the rendered page.
		/// 
		/// </summary>
		/// <param name="pattern">a <a href="#patterns">pattern</a> to match with the text of the page</param>
		void AssertTextNotPresent(String pattern);


		/// <summary>
		/// Verifies that the specified element is somewhere on the page.
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void AssertElementPresent(String locator);


		/// <summary>
		/// Verifies that the specified element is NOT on the page.
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void AssertElementNotPresent(String locator);


		/// <summary>
		/// Verifies that the specified element is both present and visible. An
		/// element can be rendered invisible by setting the CSS "visibility"
		/// property to "hidden", or the "display" property to "none", either for the
		/// element itself or one if its ancestors.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void AssertVisible(String locator);


		/// <summary>
		/// Verifies that the specified element is NOT visible; elements that are
		/// simply not present are also considered invisible.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void AssertNotVisible(String locator);


		/// <summary>
		/// Verifies that the specified element is editable, ie. it's an input
		/// element, and hasn't been disabled.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void AssertEditable(String locator);


		/// <summary>
		/// Verifies that the specified element is NOT editable, ie. it's NOT an
		/// input element, or has been disabled.
		/// 
		/// 
		/// </summary>
		/// <param name="locator">an <a href="#locators">element locator</a></param>
		void AssertNotEditable(String locator);


		/// <summary> Returns the IDs of all buttons on the page.
		/// 
		/// <p>If a given button has no ID, it will appear as "" in this array.</p>
		/// </summary>
		/// <returns>the IDs of all buttons on the page</returns>
		String[] GetAllButtons();


		/// <summary> Returns the IDs of all links on the page.
		/// 
		/// <p>If a given link has no ID, it will appear as "" in this array.</p>
		/// </summary>
		/// <returns>the IDs of all links on the page</returns>
		String[] GetAllLinks();


		/// <summary> Returns the IDs of all input fields on the page.
		/// 
		/// <p>If a given field has no ID, it will appear as "" in this array.</p>
		/// </summary>
		/// <returns>the IDs of all field on the page</returns>
		String[] GetAllFields();


		/// <summary>
		/// Writes a message to the status bar and adds a note to the browser-side
		/// log.
		/// 
		/// <p>If logLevelThreshold is specified, set the threshold for logging
		/// to that level (debug, info, warn, error).</p><p>(Note that the browser-side logs will <i>not</i> be sent back to the
		/// server, and are invisible to the Client Driver.)</p>
		/// </summary>
		/// <param name="context">the message to be sent to the browser</param>
		/// <param name="logLevelThreshold">one of "debug", "info", "warn", "error", sets the threshold for browser-side logging</param>
		void SetContext(String context,String logLevelThreshold);


		/// <summary>
		/// Return the specified expression.
		/// 
		/// <p>This is useful because of JavaScript preprocessing.
		/// It is used to generate commands like assertExpression and storeExpression.</p>
		/// </summary>
		/// <param name="expression">the value to return</param>
		/// <returns>the value passed in</returns>
		String GetExpression(String expression);


		/// <summary>
		/// Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
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


		/// <summary>
		/// Waits for a new page to load.
		/// 
		/// <p>You can use this command instead of the "AndWait" suffixes, "clickAndWait", "selectAndWait", "typeAndWait" etc.
		/// (which are only available in the JS API).</p><p>Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
		/// flag when it first notices a page load.  Running any other Selenium command after
		/// turns the flag to false.  Hence, if you want to wait for a page to load, you must
		/// wait immediately after a Selenium command that caused a page-load.</p>
		/// </summary>
		/// <param name="timeout">a timeout in milliseconds, after which this command will return with an error</param>
		void WaitForPageToLoad(String timeout);

	}
}