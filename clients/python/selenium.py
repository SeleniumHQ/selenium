
"""
Copyright 2006 OpenQA

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
__docformat__ = "restructuredtext en"

# This file has been automatically generated via XSL

import httplib
import urllib
import re

class selenium_class:
	"""

	
	Defines an object that runs Selenium commands.
	
	Element Locators
	~~~~~~~~~~~~~~~~
	Element Locators tell Selenium which HTML element a command refers to. Many
	commands require an Element Locator as a parameter.
	
	We support the following strategies for locating elements:
	
	*	\ **identifier**\ =\ *id*
		Select the element with the specified @id attribute. If no match is
		found, select the first element whose @name attribute is \ *id*.
		(This is normally the default; see below.)
	*	\ **id**\ =\ *id*
		Select the element with the specified @id attribute.
	*	\ **name**\ =\ *name*
		Select the first element with the specified @name attribute.
	*	\ **dom**\ =\ *javascriptExpression*
		
			Find an element using JavaScript traversal of the HTML Document Object
			Model. DOM locators \ *must* begin with "document.".
			*	dom=document.forms['myForm'].myDropdown
			*	dom=document.images[56]
			
			
		
	*	\ **xpath**\ =\ *xpathExpression*
		Locate an element using an XPath expression. XPath locators
		\ *must* begin with "//".
		*	xpath=//img[@alt='The image alt text']
		*	xpath=//table[@id='table1']//tr[4]/td[2]
		
		
	*	\ **link**\ =\ *textPattern*
		Select the link (anchor) element which contains text matching the
		specified \ *pattern*.
		*	link=The link text
		
		
	
	
	Without an explicit locator prefix, Selenium uses the following default
	strategies:
	
	*	\ **dom**\ , for locators starting with "document."
	*	\ **xpath**\ , for locators starting with "//"
	*	\ **identifier**\ , otherwise
	
	String-match Patterns
	~~~~~~~~~~~~~~~~~~~~~
	Various Pattern syntaxes are available for matching string values:
	
	*	\ **glob:**\ \ *pattern*
		Match a string against a "glob" (aka "wildmat") pattern. "Glob" is a
		kind of limited regular-expression syntax typically used in command-line
		shells. In a glob pattern, "*" represents any sequence of characters, and "?"
		represents any single character. Glob patterns match against the entire
		string.
	*	\ **regexp:**\ \ *regexp*
		Match a string using a regular-expression. The full power of JavaScript
		regular-expressions is available.
	*	\ **exact:**\ \ *string*
		Match a string exactly, verbatim, without any of that fancy wildcard
		stuff.
	
	
	If no pattern prefix is specified, Selenium assumes that it's a "glob"
	pattern.
	
	
	"""

### This part is hard-coded in the XSL
	def __init__(self, host, port, browserStartCommand, browserURL):
		self.host = host
		self.port = port
		self.browserStartCommand = browserStartCommand
		self.browserURL = browserURL
		self.sessionId = None

	def start(self):
		result = self.get_string("getNewBrowserSession", [self.browserStartCommand, self.browserURL])
		try:
			self.sessionId = long(result)
		except ValueError:
			raise Exception, result
		
	def stop(self):
		self.do_command("testComplete", [])
		self.sessionId = None

	def do_command(self, verb, args):
		conn = httplib.HTTPConnection(self.host, self.port)
		commandString = '/selenium-server/driver/?cmd=' + urllib.quote_plus(verb)
		for i in range(len(args)):
			commandString = commandString + '&' + str(i+1) + '=' + urllib.quote_plus(str(args[i]))
		if (None != self.sessionId):
			commandString = commandString + "&sessionId=" + str(self.sessionId)
		conn.request("GET", commandString)
	
		response = conn.getresponse()
		#print response.status, response.reason
		data = str(response.read())
		result = response.reason
		#print "Selenium Result: " + data + "\n\n"
		if (not data.startswith('OK')):
			raise Exception, data
		return data
	
	def get_string(self, verb, args):
		result = self.do_command(verb, args)
		return result[3:]
	
	def get_string_array(self, verb, args):
		csv = self.get_string(verb, args)
		token = ""
		tokens = []
		for i in range(len(csv)):
			letter = csv[i]
			if (letter == '\\'):
				i = i + 1
				letter = csv[i]
				token = token + letter
			elif (letter == ','):
				tokens.append(token)
				token = ""
			else:
				token = token + letter
		return tokens

	def get_number(self, verb, args):
		# Is there something I need to do here?
		return self.get_string(verb, args)
	
	def get_number_array(self, verb, args):
		# Is there something I need to do here?
		return self.get_string_array(verb, args)

	def get_boolean(self, verb, args):
		boolstr = self.get_string(verb, args)
		if ("true" == boolstr):
			return True
		if ("false" == boolstr):
			return False
		raise ValueError, "result is neither 'true' nor 'false': " + boolstr
	
	def get_boolean_array(self, verb, args):
		boolarr = self.get_string_array(verb, args)
		for i in range(len(boolarr)):
			if ("true" == boolstr):
				boolarr[i] = True
				continue
			if ("false" == boolstr):
				boolarr[i] = False
				continue
			raise ValueError, "result is neither 'true' nor 'false': " + boolarr[i]
		return boolarr
	
	

### From here on, everything's auto-generated from XML


	def click(self,locator):
		"""
		
		Clicks on a link, button, checkbox or radio button. If the click action
		causes a new page to load (like a link usually does), call
		waitForPageToLoad.
		
		
		'locator' is an element locator
		"""
		self.do_command("click", [locator,])


	def key_press(self,locator,keycode):
		"""
		
		Simulates a user pressing and releasing a key.
		
		
		'locator' is an element locator
		'keycode' is the numeric keycode of the key to be pressed, normally the
		            ASCII value of that key.
		"""
		self.do_command("keyPress", [locator,keycode,])


	def key_down(self,locator,keycode):
		"""
		
		Simulates a user pressing a key (without releasing it yet).
		
		
		'locator' is an element locator
		'keycode' is the numeric keycode of the key to be pressed, normally the
		            ASCII value of that key.
		"""
		self.do_command("keyDown", [locator,keycode,])


	def mouse_over(self,locator):
		"""
		
		Simulates a user hovering a mouse over the specified element.
		
		
		'locator' is an element locator
		"""
		self.do_command("mouseOver", [locator,])


	def mouse_down(self,locator):
		"""
		
		Simulates a user pressing the mouse button (without releasing it yet) on
		the specified element.
		
		
		'locator' is an element locator
		"""
		self.do_command("mouseDown", [locator,])


	def type(self,locator,value):
		"""
		
		Sets the value of an input field, as though you typed it in.
		
		Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
		value should be the value of the option selected, not the visible text.
		
		'locator' is an element locator
		'value' is the value to type
		"""
		self.do_command("type", [locator,value,])


	def check(self,locator):
		"""
		
		Check a toggle-button (checkbox/radio)
		
		
		'locator' is an element locator
		"""
		self.do_command("check", [locator,])


	def uncheck(self,locator):
		"""
		
		Uncheck a toggle-button (checkbox/radio)
		
		
		'locator' is an element locator
		"""
		self.do_command("uncheck", [locator,])


	def select(self,locator,optionLocator):
		"""
		
		Select an option from a drop-down using an option locator.
		
		
		Option locators provide different ways of specifying options of an HTML
		Select element (e.g. for selecting a specific option, or for asserting
		that the selected option satisfies a specification). There are several
		forms of Select Option Locator.
		
		*	\ **label**\ =\ *labelPattern*
			matches options based on their labels, i.e. the visible text. (This
			is the default.)
			*	label=regexp:^[Oo]ther
			
			
		*	\ **value**\ =\ *valuePattern*
			matches options based on their values.
			*	value=other
			
			
		*	\ **id**\ =\ *id*
			matches options based on their ids.
			*	id=option1
			
			
		*	\ **index**\ =\ *index*
			matches an option based on its index (offset from zero).
			*	index=2
			
			
		
		
		Without a prefix, the default behaviour is to only match on labels.
		
		
		'locator' is an element locator identifying a drop-down menu
		'optionLocator' is an option locator (a label by default)
		"""
		self.do_command("select", [locator,optionLocator,])


	def submit(self,formLocator):
		"""
		
		Submit the specified form. This is particularly useful for forms without
		submit buttons, e.g. single-input "Search" forms.
		
		
		'formLocator' is an element locator for the form you want to submit
		"""
		self.do_command("submit", [formLocator,])


	def open(self,url):
		"""
		
		Opens an URL in the test frame. This accepts both relative and absolute
		URLs.
		
		\ *Note*: The URL must be on the same domain as the runner HTML
		due to security restrictions in the browser (Same Origin Policy). If you
		need to open an URL on another domain, use the Selenium Server to start a
		new browser session on that domain.
		
		
		'url' is the URL to open; may be relative or absolute
		"""
		self.do_command("open", [url,])


	def select_window(self,windowID):
		"""
		
		Selects a popup window; once a popup window has been selected, all
		commands go to that window. To select the main window again, use "null"
		as the target.
		
		
		'windowID' is the JavaScript window ID of the window to select
		"""
		self.do_command("selectWindow", [windowID,])


	def choose_cancel_on_next_confirmation(self):
		"""
		
		Instructs Selenium to click "Cancel" on the next JavaScript confirmation
		dialog to be raised. By default, the confirm function will return true,
		having the same effect as manually clicking OK. After running this
		command, the next confirmation will behave as if the user had clicked
		Cancel.
		
		   
		"""
		self.do_command("chooseCancelOnNextConfirmation", [])


	def answer_on_next_prompt(self,answer):
		"""
		
		Instructs Selenium to return the specified answer string in response to
		the next JavaScript prompt [window.prompt()].
		
		
		
		'answer' is the answer to give in response to the prompt pop-up
		"""
		self.do_command("answerOnNextPrompt", [answer,])


	def go_back(self):
		"""
		
		Simulates the user clicking the "back" button on their browser.
		
		     
		"""
		self.do_command("goBack", [])


	def close(self):
		"""
		
		Simulates the user clicking the "close" button in the titlebar of a popup
		window or tab.
		   
		"""
		self.do_command("close", [])


	def fire_event(self,locator,eventName):
		"""
		
		Explicitly simulate an event, to trigger the corresponding "on\ *event*"
		handler.
		
		
		'locator' is an element locator
		'eventName' is the event name, e.g. "focus" or "blur"
		"""
		self.do_command("fireEvent", [locator,eventName,])


	def get_alert(self):
		"""
		
		Retrieves the message of a javascript alert generated during the previous action, or fail if there were no alerts.
		
		Getting an alert has the same effect as manually clicking OK. If an
		alert is generated but you do not get/verify it, the next Selenium action
		will fail.
		NOTE: under Selenium, javascript alerts will NOT pop up a visible alert
		dialog.
		NOTE: Selenium does NOT support javascript alerts that are generated in a
		page's onload() event handler. In this case a visible dialog WILL be
		generated and Selenium will hang until someone manually clicks OK.
		
		"""
		return self.get_string("getAlert", [])


	def get_confirmation(self):
		"""
		
		Retrieves the message of a javascript confirmation dialog generated during
		the previous action.
		
		
		By default, the confirm function will return true, having the same effect
		as manually clicking OK. This can be changed by prior execution of the
		chooseCancelOnNextConfirmation command. If an confirmation is generated
		but you do not get/verify it, the next Selenium action will fail.
		
		
		NOTE: under Selenium, javascript confirmations will NOT pop up a visible
		dialog.
		
		
		NOTE: Selenium does NOT support javascript confirmations that are
		generated in a page's onload() event handler. In this case a visible
		dialog WILL be generated and Selenium will hang until you manually click
		OK.
		
		
		"""
		return self.get_string("getConfirmation", [])


	def get_prompt(self):
		"""
		
		Retrieves the message of a javascript question prompt dialog generated during
		the previous action.
		
		Successful handling of the prompt requires prior execution of the
		answerOnNextPrompt command. If a prompt is generated but you
		do not get/verify it, the next Selenium action will fail.
		NOTE: under Selenium, javascript prompts will NOT pop up a visible
		dialog.
		NOTE: Selenium does NOT support javascript prompts that are generated in a
		page's onload() event handler. In this case a visible dialog WILL be
		generated and Selenium will hang until someone manually clicks OK.
		
		"""
		return self.get_string("getPrompt", [])


	def get_absolute_location(self):
		"""
		 Gets the absolute URL of the current page.
		
		
		"""
		return self.get_string("getAbsoluteLocation", [])


	def assert_location(self,expectedLocation):
		"""
		
		Verify the location of the current page ends with the expected location.
		If an URL querystring is provided, this is checked as well.
		
		'expectedLocation' is the location to match
		"""
		self.do_command("assertLocation", [expectedLocation,])


	def get_title(self):
		"""
		 Gets the title of the current page.
		
		
		"""
		return self.get_string("getTitle", [])


	def get_body_text(self):
		"""
		
		Get the entire text of the page.
		
		"""
		return self.get_string("getBodyText", [])


	def get_value(self,locator):
		"""
		
		Gets the (whitespace-trimmed) value of an input field (or anything else with a value parameter).
		For checkbox/radio elements, the value will be "on" or "off" depending on
		whether the element is checked or not.
		
		
		'locator' is an element locator
		"""
		return self.get_string("getValue", [locator,])


	def get_text(self,locator):
		"""
		
		Gets the text of an element. This works for any element that contains
		text. This command uses either the textContent (Mozilla-like browsers) or
		the innerText (IE-like browsers) of the element, which is the rendered
		text shown to the user.
		
		
		'locator' is an element locator
		"""
		return self.get_string("getText", [locator,])


	def get_eval(self,script):
		"""
		 Gets the result of evaluating the specified JavaScript snippet.  The snippet may 
		have multiple lines, but only the result of the last line will be returned.
		
		Note that, by default, the snippet will be run in the runner's test window, not in the window
		of your application.  To get the window of your application, you can use
		the JavaScript snippet ``selenium.browserbot.getCurrentWindow()``, and then
		run your JavaScript in there.
		
		'script' is the JavaScript snippet to run
		"""
		return self.get_string("getEval", [script,])


	def get_checked(self,locator):
		"""
		
		Get whether a toggle-button (checkbox/radio) is checked.  Fails if the specified element doesn't exist or isn't a toggle-button.
		
		'locator' is an element locator pointing to a checkbox or radio button
		"""
		return self.get_string("getChecked", [locator,])


	def get_table(self,tableCellAddress):
		"""
		
		Gets the text from a cell of a table. The cellAddress syntax
		tableLocator.row.column, where row and column start at 0.
		
		
		'tableCellAddress' is a cell address, e.g. "foo.1.4"
		"""
		return self.get_string("getTable", [tableCellAddress,])


	def assert_selected(self,locator,optionLocator):
		"""
		
		Verifies that the selected option of a drop-down satisfies the optionSpecifier.
		
		See the select command for more information about option locators.
		
		'locator' is an element locator
		'optionLocator' is an option locator, typically just an option label (e.g. "John Smith")
		"""
		self.do_command("assertSelected", [locator,optionLocator,])


	def get_select_options(self,locator):
		"""
		 Gets all option labels in the specified select drop-down.
		
		
		'locator' is an element locator
		"""
		return self.get_string_array("getSelectOptions", [locator,])


	def get_attribute(self,attributeLocator):
		"""
		
		Gets the value of an element attribute.
		
		'attributeLocator' is an element locator followed by an
		"""
		return self.get_string("getAttribute", [attributeLocator,])


	def assert_text_present(self,pattern):
		"""
		
		Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
		
		'pattern' is a pattern to match with the text of the page
		"""
		self.do_command("assertTextPresent", [pattern,])


	def assert_text_not_present(self,pattern):
		"""
		
		Verifies that the specified text pattern does NOT appear anywhere on the rendered page.
		
		'pattern' is a pattern to match with the text of the page
		"""
		self.do_command("assertTextNotPresent", [pattern,])


	def assert_element_present(self,locator):
		"""
		
		Verifies that the specified element is somewhere on the page.
		
		'locator' is an element locator
		"""
		self.do_command("assertElementPresent", [locator,])


	def assert_element_not_present(self,locator):
		"""
		
		Verifies that the specified element is NOT on the page.
		
		'locator' is an element locator
		"""
		self.do_command("assertElementNotPresent", [locator,])


	def assert_visible(self,locator):
		"""
		
		Verifies that the specified element is both present and visible. An
		element can be rendered invisible by setting the CSS "visibility"
		property to "hidden", or the "display" property to "none", either for the
		element itself or one if its ancestors.
		
		
		'locator' is an element locator
		"""
		self.do_command("assertVisible", [locator,])


	def assert_not_visible(self,locator):
		"""
		
		Verifies that the specified element is NOT visible; elements that are
		simply not present are also considered invisible.
		
		
		'locator' is an element locator
		"""
		self.do_command("assertNotVisible", [locator,])


	def assert_editable(self,locator):
		"""
		
		Verifies that the specified element is editable, ie. it's an input
		element, and hasn't been disabled.
		
		
		'locator' is an element locator
		"""
		self.do_command("assertEditable", [locator,])


	def assert_not_editable(self,locator):
		"""
		
		Verifies that the specified element is NOT editable, ie. it's NOT an
		input element, or has been disabled.
		
		
		'locator' is an element locator
		"""
		self.do_command("assertNotEditable", [locator,])


	def get_all_buttons(self):
		"""
		 Returns the IDs of all buttons on the page.
		
		If a given button has no ID, it will appear as "" in this array.
		
		"""
		return self.get_string_array("getAllButtons", [])


	def get_all_links(self):
		"""
		 Returns the IDs of all links on the page.
		
		If a given link has no ID, it will appear as "" in this array.
		
		"""
		return self.get_string_array("getAllLinks", [])


	def get_all_fields(self):
		"""
		 Returns the IDs of all input fields on the page.
		
		If a given field has no ID, it will appear as "" in this array.
		
		"""
		return self.get_string_array("getAllFields", [])


	def set_context(self,context,logLevelThreshold):
		"""
		
		Writes a message to the status bar and adds a note to the browser-side
		log.
		
		If logLevelThreshold is specified, set the threshold for logging
		to that level (debug, info, warn, error).
		(Note that the browser-side logs will \ *not* be sent back to the
		server, and are invisible to the Client Driver.)
		
		'context' is the message to be sent to the browser
		'logLevelThreshold' is one of "debug", "info", "warn", "error", sets the threshold for browser-side logging
		"""
		self.do_command("setContext", [context,logLevelThreshold,])


	def get_expression(self,expression):
		"""
		
		Return the specified expression.
		
		This is useful because of JavaScript preprocessing.
		It is used to generate commands like assertExpression and storeExpression.
		
		'expression' is the value to return
		"""
		return self.get_string("getExpression", [expression,])


	def wait_for_condition(self,script,timeout):
		"""
		
		Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
		The snippet may have multiple lines, but only the result of the last line
		will be considered.
		
		Note that, by default, the snippet will be run in the runner's test window, not in the window
		of your application.  To get the window of your application, you can use
		the JavaScript snippet ``selenium.browserbot.getCurrentWindow()``, and then
		run your JavaScript in there
		
		'script' is the JavaScript snippet to run
		'timeout' is a timeout in milliseconds, after which this command will return with an error
		"""
		self.do_command("waitForCondition", [script,timeout,])


	def wait_for_page_to_load(self,timeout):
		"""
		
		Waits for a new page to load.
		
		You can use this command instead of the "AndWait" suffixes, "clickAndWait", "selectAndWait", "typeAndWait" etc.
		(which are only available in the JS API).
		Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
		flag when it first notices a page load.  Running any other Selenium command after
		turns the flag to false.  Hence, if you want to wait for a page to load, you must
		wait immediately after a Selenium command that caused a page-load.
		
		'timeout' is a timeout in milliseconds, after which this command will return with an error
		"""
		self.do_command("waitForPageToLoad", [timeout,])

