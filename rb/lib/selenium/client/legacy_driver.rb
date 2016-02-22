# encoding: utf-8
#
# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

# -----------------
# Original code by Aslak Hellesoy and Darren Hobbs
# This file has been automatically generated via XSL
# -----------------

# Defines an object that runs Selenium commands.
#
# ===Element Locators
# Element Locators tell Selenium which HTML element a command refers to.
# The format of a locator is:
# <em>locatorType</em><b>=</b><em>argument</em>
# We support the following strategies for locating elements:
#
# *    <b>identifier</b>=<em>id</em>:
# Select the element with the specified @id attribute. If no match is
# found, select the first element whose @name attribute is <em>id</em>.
# (This is normally the default; see below.)
# *    <b>id</b>=<em>id</em>:
# Select the element with the specified @id attribute.
# *    <b>name</b>=<em>name</em>:
# Select the first element with the specified @name attribute.
# *    username
# *    name=username
#
# The name may optionally be followed by one or more <em>element-filters</em>, separated from the name by whitespace.  If the <em>filterType</em> is not specified, <b>value</b> is assumed.
# *    name=flavour value=chocolate
#
#
# *    <b>dom</b>=<em>javascriptExpression</em>:
#
# Find an element by evaluating the specified string.  This allows you to traverse the HTML Document Object
# Model using JavaScript.  Note that you must not return a value in this string; simply make it the last expression in the block.
# *    dom=document.forms['myForm'].myDropdown
# *    dom=document.images[56]
# *    dom=function foo() { return document.links[1]; }; foo();
#
#
# *    <b>xpath</b>=<em>xpathExpression</em>:
# Locate an element using an XPath expression.
# *    xpath=//img[@alt='The image alt text']
# *    xpath=//table[@id='table1']//tr[4]/td[2]
# *    xpath=//a[contains(@href,'#id1')]
# *    xpath=//a[contains(@href,'#id1')]/@class
# *    xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td
# *    xpath=//input[@name='name2' and @value='yes']
# *    xpath=//*[text()="right"]
#
#
# *    <b>link</b>=<em>textPattern</em>:
# Select the link (anchor) element which contains text matching the
# specified <em>pattern</em>.
# *    link=The link text
#
#
# *    <b>css</b>=<em>cssSelectorSyntax</em>:
# Select the element using css selectors. Please refer to CSS2 selectors, CSS3 selectors for more information. You can also check the TestCssLocators test in the selenium test suite for an example of usage, which is included in the downloaded selenium core package.
# *    css=a[href="#id3"]
# *    css=span#firstChild + span
#
# Currently the css selector locator supports all css1, css2 and css3 selectors except namespace in css3, some pseudo classes(:nth-of-type, :nth-last-of-type, :first-of-type, :last-of-type, :only-of-type, :visited, :hover, :active, :focus, :indeterminate) and pseudo elements(::first-line, ::first-letter, ::selection, ::before, ::after).
#
# *    <b>ui</b>=<em>uiSpecifierString</em>:
# Locate an element by resolving the UI specifier string to another locator, and evaluating it. See the Selenium UI-Element Reference for more details.
# *    ui=loginPages::loginButton()
# *    ui=settingsPages::toggle(label=Hide Email)
# *    ui=forumPages::postBody(index=2)//a[2]
#
#
#
#
# Without an explicit locator prefix, Selenium uses the following default
# strategies:
#
# *    <b>dom</b>, for locators starting with "document."
# *    <b>xpath</b>, for locators starting with "//"
# *    <b>identifier</b>, otherwise
#
# ===Element FiltersElement filters can be used with a locator to refine a list of candidate elements.  They are currently used only in the 'name' element-locator.
# Filters look much like locators, ie.
# <em>filterType</em><b>=</b><em>argument</em>Supported element-filters are:
# <b>value=</b><em>valuePattern</em>
#
# Matches elements based on their values.  This is particularly useful for refining a list of similarly-named toggle-buttons.<b>index=</b><em>index</em>
#
# Selects a single element based on its position in the list (offset from zero).===String-match Patterns
# Various Pattern syntaxes are available for matching string values:
#
# *    <b>glob:</b><em>pattern</em>:
# Match a string against a "glob" (aka "wildmat") pattern. "Glob" is a
# kind of limited regular-expression syntax typically used in command-line
# shells. In a glob pattern, "*" represents any sequence of characters, and "?"
# represents any single character. Glob patterns match against the entire
# string.
# *    <b>regexp:</b><em>regexp</em>:
# Match a string using a regular-expression. The full power of JavaScript
# regular-expressions is available.
# *    <b>regexpi:</b><em>regexpi</em>:
# Match a string using a case-insensitive regular-expression.
# *    <b>exact:</b><em>string</em>:
#
# Match a string exactly, verbatim, without any of that fancy wildcard
# stuff.
#
#
# If no pattern prefix is specified, Selenium assumes that it's a "glob"
# pattern.
#
#
# For commands that return multiple values (such as verifySelectOptions),
# the string being matched is a comma-separated list of the return values,
# where both commas and backslashes in the values are backslash-escaped.
# When providing a pattern, the optional matching syntax (i.e. glob,
# regexp, etc.) is specified once, as usual, at the beginning of the
# pattern.
#
#
module Selenium
  module Client
    module GeneratedDriver



        # Clicks on a link, button, checkbox or radio button. If the click action
        # causes a new page to load (like a link usually does), call
        # waitForPageToLoad.
        #
        # 'locator' is an element locator
        def click(locator)
            remote_control_command("click", [locator,])
        end


        # Double clicks on a link, button, checkbox or radio button. If the double click action
        # causes a new page to load (like a link usually does), call
        # waitForPageToLoad.
        #
        # 'locator' is an element locator
        def double_click(locator)
            remote_control_command("doubleClick", [locator,])
        end


        # Simulates opening the context menu for the specified element (as might happen if the user "right-clicked" on the element).
        #
        # 'locator' is an element locator
        def context_menu(locator)
            remote_control_command("contextMenu", [locator,])
        end


        # Clicks on a link, button, checkbox or radio button. If the click action
        # causes a new page to load (like a link usually does), call
        # waitForPageToLoad.
        #
        # 'locator' is an element locator
        # 'coordString' is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
        def click_at(locator,coordString)
            remote_control_command("clickAt", [locator,coordString,])
        end


        # Doubleclicks on a link, button, checkbox or radio button. If the action
        # causes a new page to load (like a link usually does), call
        # waitForPageToLoad.
        #
        # 'locator' is an element locator
        # 'coordString' is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
        def double_click_at(locator,coordString)
            remote_control_command("doubleClickAt", [locator,coordString,])
        end


        # Simulates opening the context menu for the specified element (as might happen if the user "right-clicked" on the element).
        #
        # 'locator' is an element locator
        # 'coordString' is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
        def context_menu_at(locator,coordString)
            remote_control_command("contextMenuAt", [locator,coordString,])
        end


        # Explicitly simulate an event, to trigger the corresponding "on<em>event</em>"
        # handler.
        #
        # 'locator' is an element locator
        # 'eventName' is the event name, e.g. "focus" or "blur"
        def fire_event(locator,eventName)
            remote_control_command("fireEvent", [locator,eventName,])
        end


        # Move the focus to the specified element; for example, if the element is an input field, move the cursor to that field.
        #
        # 'locator' is an element locator
        def focus(locator)
            remote_control_command("focus", [locator,])
        end


        # Simulates a user pressing and releasing a key.
        #
        # 'locator' is an element locator
        # 'keySequence' is Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
        def key_press(locator,keySequence)
            remote_control_command("keyPress", [locator,keySequence,])
        end


        # Press the shift key and hold it down until doShiftUp() is called or a new page is loaded.
        #
        def shift_key_down()
            remote_control_command("shiftKeyDown", [])
        end


        # Release the shift key.
        #
        def shift_key_up()
            remote_control_command("shiftKeyUp", [])
        end


        # Press the meta key and hold it down until doMetaUp() is called or a new page is loaded.
        #
        def meta_key_down()
            remote_control_command("metaKeyDown", [])
        end


        # Release the meta key.
        #
        def meta_key_up()
            remote_control_command("metaKeyUp", [])
        end


        # Press the alt key and hold it down until doAltUp() is called or a new page is loaded.
        #
        def alt_key_down()
            remote_control_command("altKeyDown", [])
        end


        # Release the alt key.
        #
        def alt_key_up()
            remote_control_command("altKeyUp", [])
        end


        # Press the control key and hold it down until doControlUp() is called or a new page is loaded.
        #
        def control_key_down()
            remote_control_command("controlKeyDown", [])
        end


        # Release the control key.
        #
        def control_key_up()
            remote_control_command("controlKeyUp", [])
        end


        # Simulates a user pressing a key (without releasing it yet).
        #
        # 'locator' is an element locator
        # 'keySequence' is Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
        def key_down(locator,keySequence)
            remote_control_command("keyDown", [locator,keySequence,])
        end


        # Simulates a user releasing a key.
        #
        # 'locator' is an element locator
        # 'keySequence' is Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
        def key_up(locator,keySequence)
            remote_control_command("keyUp", [locator,keySequence,])
        end


        # Simulates a user hovering a mouse over the specified element.
        #
        # 'locator' is an element locator
        def mouse_over(locator)
            remote_control_command("mouseOver", [locator,])
        end


        # Simulates a user moving the mouse pointer away from the specified element.
        #
        # 'locator' is an element locator
        def mouse_out(locator)
            remote_control_command("mouseOut", [locator,])
        end


        # Simulates a user pressing the left mouse button (without releasing it yet) on
        # the specified element.
        #
        # 'locator' is an element locator
        def mouse_down(locator)
            remote_control_command("mouseDown", [locator,])
        end


        # Simulates a user pressing the right mouse button (without releasing it yet) on
        # the specified element.
        #
        # 'locator' is an element locator
        def mouse_down_right(locator)
            remote_control_command("mouseDownRight", [locator,])
        end


        # Simulates a user pressing the left mouse button (without releasing it yet) at
        # the specified location.
        #
        # 'locator' is an element locator
        # 'coordString' is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
        def mouse_down_at(locator,coordString)
            remote_control_command("mouseDownAt", [locator,coordString,])
        end


        # Simulates a user pressing the right mouse button (without releasing it yet) at
        # the specified location.
        #
        # 'locator' is an element locator
        # 'coordString' is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
        def mouse_down_right_at(locator,coordString)
            remote_control_command("mouseDownRightAt", [locator,coordString,])
        end


        # Simulates the event that occurs when the user releases the mouse button (i.e., stops
        # holding the button down) on the specified element.
        #
        # 'locator' is an element locator
        def mouse_up(locator)
            remote_control_command("mouseUp", [locator,])
        end


        # Simulates the event that occurs when the user releases the right mouse button (i.e., stops
        # holding the button down) on the specified element.
        #
        # 'locator' is an element locator
        def mouse_up_right(locator)
            remote_control_command("mouseUpRight", [locator,])
        end


        # Simulates the event that occurs when the user releases the mouse button (i.e., stops
        # holding the button down) at the specified location.
        #
        # 'locator' is an element locator
        # 'coordString' is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
        def mouse_up_at(locator,coordString)
            remote_control_command("mouseUpAt", [locator,coordString,])
        end


        # Simulates the event that occurs when the user releases the right mouse button (i.e., stops
        # holding the button down) at the specified location.
        #
        # 'locator' is an element locator
        # 'coordString' is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
        def mouse_up_right_at(locator,coordString)
            remote_control_command("mouseUpRightAt", [locator,coordString,])
        end


        # Simulates a user pressing the mouse button (without releasing it yet) on
        # the specified element.
        #
        # 'locator' is an element locator
        def mouse_move(locator)
            remote_control_command("mouseMove", [locator,])
        end


        # Simulates a user pressing the mouse button (without releasing it yet) on
        # the specified element.
        #
        # 'locator' is an element locator
        # 'coordString' is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
        def mouse_move_at(locator,coordString)
            remote_control_command("mouseMoveAt", [locator,coordString,])
        end


        # Sets the value of an input field, as though you typed it in.
        #
        # Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
        # value should be the value of the option selected, not the visible text.
        #
        #
        # 'locator' is an element locator
        # 'value' is the value to type
        def type(locator,value)
            remote_control_command("type", [locator,value,])
        end


        # Simulates keystroke events on the specified element, as though you typed the value key-by-key.
        #
        # This is a convenience method for calling keyDown, keyUp, keyPress for every character in the specified string;
        # this is useful for dynamic UI widgets (like auto-completing combo boxes) that require explicit key events.
        # Unlike the simple "type" command, which forces the specified value into the page directly, this command
        # may or may not have any visible effect, even in cases where typing keys would normally have a visible effect.
        # For example, if you use "typeKeys" on a form element, you may or may not see the results of what you typed in
        # the field.
        # In some cases, you may need to use the simple "type" command to set the value of the field and then the "typeKeys" command to
        # send the keystroke events corresponding to what you just typed.
        #
        #
        # 'locator' is an element locator
        # 'value' is the value to type
        def type_keys(locator,value)
            remote_control_command("typeKeys", [locator,value,])
        end


        # Set execution speed (i.e., set the millisecond length of a delay which will follow each selenium operation).  By default, there is no such delay, i.e.,
        # the delay is 0 milliseconds.
        #
        # 'value' is the number of milliseconds to pause after operation
        def set_speed(value)
            remote_control_command("setSpeed", [value,])
        end


        # Get execution speed (i.e., get the millisecond length of the delay following each selenium operation).  By default, there is no such delay, i.e.,
        # the delay is 0 milliseconds.
        #
        # See also setSpeed.
        #
        def get_speed()
            return string_command("getSpeed", [])
        end


        # Check a toggle-button (checkbox/radio)
        #
        # 'locator' is an element locator
        def check(locator)
            remote_control_command("check", [locator,])
        end


        # Uncheck a toggle-button (checkbox/radio)
        #
        # 'locator' is an element locator
        def uncheck(locator)
            remote_control_command("uncheck", [locator,])
        end


        # Select an option from a drop-down using an option locator.
        #
        #
        # Option locators provide different ways of specifying options of an HTML
        # Select element (e.g. for selecting a specific option, or for asserting
        # that the selected option satisfies a specification). There are several
        # forms of Select Option Locator.
        #
        # *    <b>label</b>=<em>labelPattern</em>:
        # matches options based on their labels, i.e. the visible text. (This
        # is the default.)
        # *    label=regexp:^[Oo]ther
        #
        #
        # *    <b>value</b>=<em>valuePattern</em>:
        # matches options based on their values.
        # *    value=other
        #
        #
        # *    <b>id</b>=<em>id</em>:
        #
        # matches options based on their ids.
        # *    id=option1
        #
        #
        # *    <b>index</b>=<em>index</em>:
        # matches an option based on its index (offset from zero).
        # *    index=2
        #
        #
        #
        #
        # If no option locator prefix is provided, the default behaviour is to match on <b>label</b>.
        #
        #
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        # 'optionLocator' is an option locator (a label by default)
        def select(selectLocator,optionLocator)
            remote_control_command("select", [selectLocator,optionLocator,])
        end


        # Add a selection to the set of selected options in a multi-select element using an option locator.
        #
        # @see #doSelect for details of option locators
        #
        # 'locator' is an element locator identifying a multi-select box
        # 'optionLocator' is an option locator (a label by default)
        def add_selection(locator,optionLocator)
            remote_control_command("addSelection", [locator,optionLocator,])
        end


        # Remove a selection from the set of selected options in a multi-select element using an option locator.
        #
        # @see #doSelect for details of option locators
        #
        # 'locator' is an element locator identifying a multi-select box
        # 'optionLocator' is an option locator (a label by default)
        def remove_selection(locator,optionLocator)
            remote_control_command("removeSelection", [locator,optionLocator,])
        end


        # Unselects all of the selected options in a multi-select element.
        #
        # 'locator' is an element locator identifying a multi-select box
        def remove_all_selections(locator)
            remote_control_command("removeAllSelections", [locator,])
        end


        # Submit the specified form. This is particularly useful for forms without
        # submit buttons, e.g. single-input "Search" forms.
        #
        # 'formLocator' is an element locator for the form you want to submit
        def submit(formLocator)
            remote_control_command("submit", [formLocator,])
        end


        # Opens an URL in the test frame. This accepts both relative and absolute
        # URLs.
        #
        # The "open" command waits for the page to load before proceeding,
        # ie. the "AndWait" suffix is implicit.
        #
        # <em>Note</em>: The URL must be on the same domain as the runner HTML
        # due to security restrictions in the browser (Same Origin Policy). If you
        # need to open an URL on another domain, use the Selenium Server to start a
        # new browser session on that domain.
        #
        # 'url' is the URL to open; may be relative or absolute
        def open(url)
            remote_control_command("open", [url,])
        end


        # Opens a popup window (if a window with that ID isn't already open).
        # After opening the window, you'll need to select it using the selectWindow
        # command.
        #
        # This command can also be a useful workaround for bug SEL-339.  In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
        # In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
        # an empty (blank) url, like this: openWindow("", "myFunnyWindow").
        #
        #
        # 'url' is the URL to open, which can be blank
        # 'windowID' is the JavaScript window ID of the window to select
        def open_window(url,windowID)
            remote_control_command("openWindow", [url,windowID,])
        end


        # Selects a popup window using a window locator; once a popup window has been selected, all
        # commands go to that window. To select the main window again, use null
        # as the target.
        #
        #
        #
        # Window locators provide different ways of specifying the window object:
        # by title, by internal JavaScript "name," or by JavaScript variable.
        #
        # *    <b>title</b>=<em>My Special Window</em>:
        # Finds the window using the text that appears in the title bar.  Be careful;
        # two windows can share the same title.  If that happens, this locator will
        # just pick one.
        #
        # *    <b>name</b>=<em>myWindow</em>:
        # Finds the window using its internal JavaScript "name" property.  This is the second
        # parameter "windowName" passed to the JavaScript method window.open(url, windowName, windowFeatures, replaceFlag)
        # (which Selenium intercepts).
        #
        # *    <b>var</b>=<em>variableName</em>:
        # Some pop-up windows are unnamed (anonymous), but are associated with a JavaScript variable name in the current
        # application window, e.g. "window.foo = window.open(url);".  In those cases, you can open the window using
        # "var=foo".
        #
        #
        #
        # If no window locator prefix is provided, we'll try to guess what you mean like this:
        # 1.) if windowID is null, (or the string "null") then it is assumed the user is referring to the original window instantiated by the browser).
        # 2.) if the value of the "windowID" parameter is a JavaScript variable name in the current application window, then it is assumed
        # that this variable contains the return value from a call to the JavaScript window.open() method.
        # 3.) Otherwise, selenium looks in a hash it maintains that maps string names to window "names".
        # 4.) If <em>that</em> fails, we'll try looping over all of the known windows to try to find the appropriate "title".
        # Since "title" is not necessarily unique, this may have unexpected behavior.
        # If you're having trouble figuring out the name of a window that you want to manipulate, look at the Selenium log messages
        # which identify the names of windows created via window.open (and therefore intercepted by Selenium).  You will see messages
        # like the following for each window as it is opened:
        # <tt>debug: window.open call intercepted; window ID (which you can use with selectWindow()) is "myNewWindow"</tt>
        # In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
        # (This is bug SEL-339.)  In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
        # an empty (blank) url, like this: openWindow("", "myFunnyWindow").
        #
        #
        # 'windowID' is the JavaScript window ID of the window to select
        def select_window(windowID)
            remote_control_command("selectWindow", [windowID,])
        end


        # Simplifies the process of selecting a popup window (and does not offer
        # functionality beyond what <tt>selectWindow()</tt> already provides).
        # *    If <tt>windowID</tt> is either not specified, or specified as
        # "null", the first non-top window is selected. The top window is the one
        # that would be selected by <tt>selectWindow()</tt> without providing a
        # <tt>windowID</tt> . This should not be used when more than one popup
        # window is in play.
        # *    Otherwise, the window will be looked up considering
        # <tt>windowID</tt> as the following in order: 1) the "name" of the
        # window, as specified to <tt>window.open()</tt>; 2) a javascript
        # variable which is a reference to a window; and 3) the title of the
        # window. This is the same ordered lookup performed by
        # <tt>selectWindow</tt> .
        #
        #
        #
        # 'windowID' is an identifier for the popup window, which can take on a                  number of different meanings
        def select_pop_up(windowID)
            remote_control_command("selectPopUp", [windowID,])
        end


        # Selects the main window. Functionally equivalent to using
        # <tt>selectWindow()</tt> and specifying no value for
        # <tt>windowID</tt>.
        #
        def deselect_pop_up()
            remote_control_command("deselectPopUp", [])
        end


        # Selects a frame within the current window.  (You may invoke this command
        # multiple times to select nested frames.)  To select the parent frame, use
        # "relative=parent" as a locator; to select the top frame, use "relative=top".
        # You can also select a frame by its 0-based index number; select the first frame with
        # "index=0", or the third frame with "index=2".
        #
        # You may also use a DOM expression to identify the frame you want directly,
        # like this: <tt>dom=frames["main"].frames["subframe"]</tt>
        #
        #
        # 'locator' is an element locator identifying a frame or iframe
        def select_frame(locator)
            remote_control_command("selectFrame", [locator,])
        end


        # Determine whether current/locator identify the frame containing this running code.
        #
        # This is useful in proxy injection mode, where this code runs in every
        # browser frame and window, and sometimes the selenium server needs to identify
        # the "current" frame.  In this case, when the test calls selectFrame, this
        # routine is called for each frame to figure out which one has been selected.
        # The selected frame will return true, while all others will return false.
        #
        #
        # 'currentFrameString' is starting frame
        # 'target' is new frame (which might be relative to the current one)
        def get_whether_this_frame_match_frame_expression(currentFrameString,target)
            return boolean_command("getWhetherThisFrameMatchFrameExpression", [currentFrameString,target,])
        end


        # Determine whether currentWindowString plus target identify the window containing this running code.
        #
        # This is useful in proxy injection mode, where this code runs in every
        # browser frame and window, and sometimes the selenium server needs to identify
        # the "current" window.  In this case, when the test calls selectWindow, this
        # routine is called for each window to figure out which one has been selected.
        # The selected window will return true, while all others will return false.
        #
        #
        # 'currentWindowString' is starting window
        # 'target' is new window (which might be relative to the current one, e.g., "_parent")
        def get_whether_this_window_match_window_expression(currentWindowString,target)
            return boolean_command("getWhetherThisWindowMatchWindowExpression", [currentWindowString,target,])
        end


        # Waits for a popup window to appear and load up.
        #
        # 'windowID' is the JavaScript window "name" of the window that will appear (not the text of the title bar)                 If unspecified, or specified as "null", this command will                 wait for the first non-top window to appear (don't rely                 on this if you are working with multiple popups                 simultaneously).
        # 'timeout' is a timeout in milliseconds, after which the action will return with an error.                If this value is not specified, the default Selenium                timeout will be used. See the setTimeout() command.
        def wait_for_pop_up(windowID,timeout)
            remote_control_command("waitForPopUp", [windowID,timeout,])
        end


        #
        # By default, Selenium's overridden window.confirm() function will
        # return true, as if the user had manually clicked OK; after running
        # this command, the next call to confirm() will return false, as if
        # the user had clicked Cancel.  Selenium will then resume using the
        # default behavior for future confirmations, automatically returning
        # true (OK) unless/until you explicitly call this command for each
        # confirmation.
        #
        #
        # Take note - every time a confirmation comes up, you must
        # consume it with a corresponding getConfirmation, or else
        # the next selenium operation will fail.
        #
        #
        #
        def choose_cancel_on_next_confirmation()
            remote_control_command("chooseCancelOnNextConfirmation", [])
        end


        #
        # Undo the effect of calling chooseCancelOnNextConfirmation.  Note
        # that Selenium's overridden window.confirm() function will normally automatically
        # return true, as if the user had manually clicked OK, so you shouldn't
        # need to use this command unless for some reason you need to change
        # your mind prior to the next confirmation.  After any confirmation, Selenium will resume using the
        # default behavior for future confirmations, automatically returning
        # true (OK) unless/until you explicitly call chooseCancelOnNextConfirmation for each
        # confirmation.
        #
        #
        # Take note - every time a confirmation comes up, you must
        # consume it with a corresponding getConfirmation, or else
        # the next selenium operation will fail.
        #
        #
        #
        def choose_ok_on_next_confirmation()
            remote_control_command("chooseOkOnNextConfirmation", [])
        end


        # Instructs Selenium to return the specified answer string in response to
        # the next JavaScript prompt [window.prompt()].
        #
        # 'answer' is the answer to give in response to the prompt pop-up
        def answer_on_next_prompt(answer)
            remote_control_command("answerOnNextPrompt", [answer,])
        end


        # Simulates the user clicking the "back" button on their browser.
        #
        def go_back()
            remote_control_command("goBack", [])
        end


        # Simulates the user clicking the "Refresh" button on their browser.
        #
        def refresh()
            remote_control_command("refresh", [])
        end


        # Simulates the user clicking the "close" button in the titlebar of a popup
        # window or tab.
        #
        def close()
            remote_control_command("close", [])
        end


        # Has an alert occurred?
        #
        #
        # This function never throws an exception
        #
        #
        #
        def is_alert_present()
            return boolean_command("isAlertPresent", [])
        end


        # Has a prompt occurred?
        #
        #
        # This function never throws an exception
        #
        #
        #
        def is_prompt_present()
            return boolean_command("isPromptPresent", [])
        end


        # Has confirm() been called?
        #
        #
        # This function never throws an exception
        #
        #
        #
        def is_confirmation_present()
            return boolean_command("isConfirmationPresent", [])
        end


        # Retrieves the message of a JavaScript alert generated during the previous action, or fail if there were no alerts.
        #
        # Getting an alert has the same effect as manually clicking OK. If an
        # alert is generated but you do not consume it with getAlert, the next Selenium action
        # will fail.
        # Under Selenium, JavaScript alerts will NOT pop up a visible alert
        # dialog.
        # Selenium does NOT support JavaScript alerts that are generated in a
        # page's onload() event handler. In this case a visible dialog WILL be
        # generated and Selenium will hang until someone manually clicks OK.
        #
        #
        def get_alert()
            return string_command("getAlert", [])
        end


        # Retrieves the message of a JavaScript confirmation dialog generated during
        # the previous action.
        #
        #
        # By default, the confirm function will return true, having the same effect
        # as manually clicking OK. This can be changed by prior execution of the
        # chooseCancelOnNextConfirmation command.
        #
        #
        # If an confirmation is generated but you do not consume it with getConfirmation,
        # the next Selenium action will fail.
        #
        #
        # NOTE: under Selenium, JavaScript confirmations will NOT pop up a visible
        # dialog.
        #
        #
        # NOTE: Selenium does NOT support JavaScript confirmations that are
        # generated in a page's onload() event handler. In this case a visible
        # dialog WILL be generated and Selenium will hang until you manually click
        # OK.
        #
        #
        #
        def get_confirmation()
            return string_command("getConfirmation", [])
        end


        # Retrieves the message of a JavaScript question prompt dialog generated during
        # the previous action.
        #
        # Successful handling of the prompt requires prior execution of the
        # answerOnNextPrompt command. If a prompt is generated but you
        # do not get/verify it, the next Selenium action will fail.
        # NOTE: under Selenium, JavaScript prompts will NOT pop up a visible
        # dialog.
        # NOTE: Selenium does NOT support JavaScript prompts that are generated in a
        # page's onload() event handler. In this case a visible dialog WILL be
        # generated and Selenium will hang until someone manually clicks OK.
        #
        #
        def get_prompt()
            return string_command("getPrompt", [])
        end


        # Gets the absolute URL of the current page.
        #
        def get_location()
            return string_command("getLocation", [])
        end


        # Gets the title of the current page.
        #
        def get_title()
            return string_command("getTitle", [])
        end


        # Gets the entire text of the page.
        #
        def get_body_text()
            return string_command("getBodyText", [])
        end


        # Gets the (whitespace-trimmed) value of an input field (or anything else with a value parameter).
        # For checkbox/radio elements, the value will be "on" or "off" depending on
        # whether the element is checked or not.
        #
        # 'locator' is an element locator
        def get_value(locator)
            return string_command("getValue", [locator,])
        end


        # Gets the text of an element. This works for any element that contains
        # text. This command uses either the textContent (Mozilla-like browsers) or
        # the innerText (IE-like browsers) of the element, which is the rendered
        # text shown to the user.
        #
        # 'locator' is an element locator
        def get_text(locator)
            return string_command("getText", [locator,])
        end


        # Briefly changes the backgroundColor of the specified element yellow.  Useful for debugging.
        #
        # 'locator' is an element locator
        def highlight(locator)
            remote_control_command("highlight", [locator,])
        end


        # Gets the result of evaluating the specified JavaScript snippet.  The snippet may
        # have multiple lines, but only the result of the last line will be returned.
        #
        # Note that, by default, the snippet will run in the context of the "selenium"
        # object itself, so <tt>this</tt> will refer to the Selenium object.  Use <tt>window</tt> to
        # refer to the window of your application, e.g. <tt>window.document.getElementById('foo')</tt>
        # If you need to use
        # a locator to refer to a single element in your application page, you can
        # use <tt>this.browserbot.findElement("id=foo")</tt> where "id=foo" is your locator.
        #
        #
        # 'script' is the JavaScript snippet to run
        def get_eval(script)
            return string_command("getEval", [script,])
        end


        # Gets whether a toggle-button (checkbox/radio) is checked.  Fails if the specified element doesn't exist or isn't a toggle-button.
        #
        # 'locator' is an element locator pointing to a checkbox or radio button
        def is_checked(locator)
            return boolean_command("isChecked", [locator,])
        end


        # Gets the text from a cell of a table. The cellAddress syntax
        # tableLocator.row.column, where row and column start at 0.
        #
        # 'tableCellAddress' is a cell address, e.g. "foo.1.4"
        def get_table(tableCellAddress)
            return string_command("getTable", [tableCellAddress,])
        end


        # Gets all option labels (visible text) for selected options in the specified select or multi-select element.
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        def get_selected_labels(selectLocator)
            return string_array_command("getSelectedLabels", [selectLocator,])
        end


        # Gets option label (visible text) for selected option in the specified select element.
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        def get_selected_label(selectLocator)
            return string_command("getSelectedLabel", [selectLocator,])
        end


        # Gets all option values (value attributes) for selected options in the specified select or multi-select element.
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        def get_selected_values(selectLocator)
            return string_array_command("getSelectedValues", [selectLocator,])
        end


        # Gets option value (value attribute) for selected option in the specified select element.
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        def get_selected_value(selectLocator)
            return string_command("getSelectedValue", [selectLocator,])
        end


        # Gets all option indexes (option number, starting at 0) for selected options in the specified select or multi-select element.
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        def get_selected_indexes(selectLocator)
            return string_array_command("getSelectedIndexes", [selectLocator,])
        end


        # Gets option index (option number, starting at 0) for selected option in the specified select element.
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        def get_selected_index(selectLocator)
            return string_command("getSelectedIndex", [selectLocator,])
        end


        # Gets all option element IDs for selected options in the specified select or multi-select element.
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        def get_selected_ids(selectLocator)
            return string_array_command("getSelectedIds", [selectLocator,])
        end


        # Gets option element ID for selected option in the specified select element.
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        def get_selected_id(selectLocator)
            return string_command("getSelectedId", [selectLocator,])
        end


        # Determines whether some option in a drop-down menu is selected.
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        def is_something_selected(selectLocator)
            return boolean_command("isSomethingSelected", [selectLocator,])
        end


        # Gets all option labels in the specified select drop-down.
        #
        # 'selectLocator' is an element locator identifying a drop-down menu
        def get_select_options(selectLocator)
            return string_array_command("getSelectOptions", [selectLocator,])
        end


        # Gets the value of an element attribute. The value of the attribute may
        # differ across browsers (this is the case for the "style" attribute, for
        # example).
        #
        # 'attributeLocator' is an element locator followed by an @ sign and then the name of the attribute, e.g. "foo@bar"
        def get_attribute(attributeLocator)
            return string_command("getAttribute", [attributeLocator,])
        end


        # Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
        #
        # 'pattern' is a pattern to match with the text of the page
        def is_text_present(pattern)
            return boolean_command("isTextPresent", [pattern,])
        end


        # Verifies that the specified element is somewhere on the page.
        #
        # 'locator' is an element locator
        def is_element_present(locator)
            return boolean_command("isElementPresent", [locator,])
        end


        # Determines if the specified element is visible. An
        # element can be rendered invisible by setting the CSS "visibility"
        # property to "hidden", or the "display" property to "none", either for the
        # element itself or one if its ancestors.  This method will fail if
        # the element is not present.
        #
        # 'locator' is an element locator
        def is_visible(locator)
            return boolean_command("isVisible", [locator,])
        end


        # Determines whether the specified input element is editable, ie hasn't been disabled.
        # This method will fail if the specified element isn't an input element.
        #
        # 'locator' is an element locator
        def is_editable(locator)
            return boolean_command("isEditable", [locator,])
        end


        # Returns the IDs of all buttons on the page.
        #
        # If a given button has no ID, it will appear as "" in this array.
        #
        #
        def get_all_buttons()
            return string_array_command("getAllButtons", [])
        end


        # Returns the IDs of all links on the page.
        #
        # If a given link has no ID, it will appear as "" in this array.
        #
        #
        def get_all_links()
            return string_array_command("getAllLinks", [])
        end


        # Returns the IDs of all input fields on the page.
        #
        # If a given field has no ID, it will appear as "" in this array.
        #
        #
        def get_all_fields()
            return string_array_command("getAllFields", [])
        end


        # Returns an array of JavaScript property values from all known windows having one.
        #
        # 'attributeName' is name of an attribute on the windows
        def get_attribute_from_all_windows(attributeName)
            return string_array_command("getAttributeFromAllWindows", [attributeName,])
        end


        # deprecated - use dragAndDrop instead
        #
        # 'locator' is an element locator
        # 'movementsString' is offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
        def dragdrop(locator,movementsString)
            remote_control_command("dragdrop", [locator,movementsString,])
        end


        # Configure the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
        # Setting this value to 0 means that we'll send a "mousemove" event to every single pixel
        # in between the start location and the end location; that can be very slow, and may
        # cause some browsers to force the JavaScript to timeout.
        # If the mouse speed is greater than the distance between the two dragged objects, we'll
        # just send one "mousemove" at the start location and then one final one at the end location.
        #
        #
        # 'pixels' is the number of pixels between "mousemove" events
        def set_mouse_speed(pixels)
            remote_control_command("setMouseSpeed", [pixels,])
        end


        # Returns the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
        #
        def get_mouse_speed()
            return number_command("getMouseSpeed", [])
        end


        # Drags an element a certain distance and then drops it
        #
        # 'locator' is an element locator
        # 'movementsString' is offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
        def drag_and_drop(locator,movementsString)
            remote_control_command("dragAndDrop", [locator,movementsString,])
        end


        # Drags an element and drops it on another element
        #
        # 'locatorOfObjectToBeDragged' is an element to be dragged
        # 'locatorOfDragDestinationObject' is an element whose location (i.e., whose center-most pixel) will be the point where locatorOfObjectToBeDragged  is dropped
        def drag_and_drop_to_object(locatorOfObjectToBeDragged,locatorOfDragDestinationObject)
            remote_control_command("dragAndDropToObject", [locatorOfObjectToBeDragged,locatorOfDragDestinationObject,])
        end


        # Gives focus to the currently selected window
        #
        def window_focus()
            remote_control_command("windowFocus", [])
        end


        # Resize currently selected window to take up the entire screen
        #
        def window_maximize()
            remote_control_command("windowMaximize", [])
        end


        # Returns the IDs of all windows that the browser knows about in an array.
        #
        def get_all_window_ids()
            return string_array_command("getAllWindowIds", [])
        end


        # Returns the names of all windows that the browser knows about in an array.
        #
        def get_all_window_names()
            return string_array_command("getAllWindowNames", [])
        end


        # Returns the titles of all windows that the browser knows about in an array.
        #
        def get_all_window_titles()
            return string_array_command("getAllWindowTitles", [])
        end


        # Returns the entire HTML source between the opening and
        # closing "html" tags.
        #
        def get_html_source()
            return string_command("getHtmlSource", [])
        end


        # Moves the text cursor to the specified position in the given input element or textarea.
        # This method will fail if the specified element isn't an input element or textarea.
        #
        # 'locator' is an element locator pointing to an input element or textarea
        # 'position' is the numerical position of the cursor in the field; position should be 0 to move the position to the beginning of the field.  You can also set the cursor to -1 to move it to the end of the field.
        def set_cursor_position(locator,position)
            remote_control_command("setCursorPosition", [locator,position,])
        end


        # Get the relative index of an element to its parent (starting from 0). The comment node and empty text node
        # will be ignored.
        #
        # 'locator' is an element locator pointing to an element
        def get_element_index(locator)
            return number_command("getElementIndex", [locator,])
        end


        # Check if these two elements have same parent and are ordered siblings in the DOM. Two same elements will
        # not be considered ordered.
        #
        # 'locator1' is an element locator pointing to the first element
        # 'locator2' is an element locator pointing to the second element
        def is_ordered(locator1,locator2)
            return boolean_command("isOrdered", [locator1,locator2,])
        end


        # Retrieves the horizontal position of an element
        #
        # 'locator' is an element locator pointing to an element OR an element itself
        def get_element_position_left(locator)
            return number_command("getElementPositionLeft", [locator,])
        end


        # Retrieves the vertical position of an element
        #
        # 'locator' is an element locator pointing to an element OR an element itself
        def get_element_position_top(locator)
            return number_command("getElementPositionTop", [locator,])
        end


        # Retrieves the width of an element
        #
        # 'locator' is an element locator pointing to an element
        def get_element_width(locator)
            return number_command("getElementWidth", [locator,])
        end


        # Retrieves the height of an element
        #
        # 'locator' is an element locator pointing to an element
        def get_element_height(locator)
            return number_command("getElementHeight", [locator,])
        end


        # Retrieves the text cursor position in the given input element or textarea; beware, this may not work perfectly on all browsers.
        #
        # Specifically, if the cursor/selection has been cleared by JavaScript, this command will tend to
        # return the position of the last location of the cursor, even though the cursor is now gone from the page.  This is filed as SEL-243.
        #
        # This method will fail if the specified element isn't an input element or textarea, or there is no cursor in the element.
        #
        # 'locator' is an element locator pointing to an input element or textarea
        def get_cursor_position(locator)
            return number_command("getCursorPosition", [locator,])
        end


        # Returns the specified expression.
        #
        # This is useful because of JavaScript preprocessing.
        # It is used to generate commands like assertExpression and waitForExpression.
        #
        #
        # 'expression' is the value to return
        def get_expression(expression)
            return string_command("getExpression", [expression,])
        end


        # Returns the number of nodes that match the specified xpath, eg. "//table" would give
        # the number of tables.
        #
        # 'xpath' is the xpath expression to evaluate. do NOT wrap this expression in a 'count()' function; we will do that for you.
        def get_xpath_count(xpath)
            return number_command("getXpathCount", [xpath,])
        end


        # Returns the number of nodes that match the specified css selector, eg. "css=table" would give
        # the number of tables.
        #
        # 'css' is the css selector to evaluate. do NOT wrap this expression in a 'count()' function; we will do that for you.
        def get_css_count(css)
            return number_command("getCssCount", [css,])
        end


        # Temporarily sets the "id" attribute of the specified element, so you can locate it in the future
        # using its ID rather than a slow/complicated XPath.  This ID will disappear once the page is
        # reloaded.
        #
        # 'locator' is an element locator pointing to an element
        # 'identifier' is a string to be used as the ID of the specified element
        def assign_id(locator,identifier)
            remote_control_command("assignId", [locator,identifier,])
        end


        # Specifies whether Selenium should use the native in-browser implementation
        # of XPath (if any native version is available); if you pass "false" to
        # this function, we will always use our pure-JavaScript xpath library.
        # Using the pure-JS xpath library can improve the consistency of xpath
        # element locators between different browser vendors, but the pure-JS
        # version is much slower than the native implementations.
        #
        # 'allow' is boolean, true means we'll prefer to use native XPath; false means we'll only use JS XPath
        def allow_native_xpath(allow)
            remote_control_command("allowNativeXpath", [allow,])
        end


        # Specifies whether Selenium will ignore xpath attributes that have no
        # value, i.e. are the empty string, when using the non-native xpath
        # evaluation engine. You'd want to do this for performance reasons in IE.
        # However, this could break certain xpaths, for example an xpath that looks
        # for an attribute whose value is NOT the empty string.
        #
        # The hope is that such xpaths are relatively rare, but the user should
        # have the option of using them. Note that this only influences xpath
        # evaluation when using the ajaxslt engine (i.e. not "javascript-xpath").
        #
        # 'ignore' is boolean, true means we'll ignore attributes without value                        at the expense of xpath "correctness"; false means                        we'll sacrifice speed for correctness.
        def ignore_attributes_without_value(ignore)
            remote_control_command("ignoreAttributesWithoutValue", [ignore,])
        end


        # Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
        # The snippet may have multiple lines, but only the result of the last line
        # will be considered.
        #
        # Note that, by default, the snippet will be run in the runner's test window, not in the window
        # of your application.  To get the window of your application, you can use
        # the JavaScript snippet <tt>selenium.browserbot.getCurrentWindow()</tt>, and then
        # run your JavaScript in there
        #
        #
        # 'script' is the JavaScript snippet to run
        # 'timeout' is a timeout in milliseconds, after which this command will return with an error
        def wait_for_condition(script,timeout)
            remote_control_command("waitForCondition", [script,timeout,])
        end


        # Specifies the amount of time that Selenium will wait for actions to complete.
        #
        # Actions that require waiting include "open" and the "waitFor*" actions.
        #
        # The default timeout is 30 seconds.
        #
        # 'timeout' is a timeout in milliseconds, after which the action will return with an error
        def set_timeout(timeout)
            remote_control_command("setTimeout", [timeout,])
        end


        # Waits for a new page to load.
        #
        # You can use this command instead of the "AndWait" suffixes, "clickAndWait", "selectAndWait", "typeAndWait" etc.
        # (which are only available in the JS API).
        # Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
        # flag when it first notices a page load.  Running any other Selenium command after
        # turns the flag to false.  Hence, if you want to wait for a page to load, you must
        # wait immediately after a Selenium command that caused a page-load.
        #
        #
        # 'timeout' is a timeout in milliseconds, after which this command will return with an error
        def wait_for_page_to_load(timeout)
            remote_control_command("waitForPageToLoad", [timeout,])
        end


        # Waits for a new frame to load.
        #
        # Selenium constantly keeps track of new pages and frames loading,
        # and sets a "newPageLoaded" flag when it first notices a page load.
        #
        #
        # See waitForPageToLoad for more information.
        #
        # 'frameAddress' is FrameAddress from the server side
        # 'timeout' is a timeout in milliseconds, after which this command will return with an error
        def wait_for_frame_to_load(frameAddress,timeout)
            remote_control_command("waitForFrameToLoad", [frameAddress,timeout,])
        end


        # Return all cookies of the current page under test.
        #
        def get_cookie()
            return string_command("getCookie", [])
        end


        # Returns the value of the cookie with the specified name, or throws an error if the cookie is not present.
        #
        # 'name' is the name of the cookie
        def get_cookie_by_name(name)
            return string_command("getCookieByName", [name,])
        end


        # Returns true if a cookie with the specified name is present, or false otherwise.
        #
        # 'name' is the name of the cookie
        def is_cookie_present(name)
            return boolean_command("isCookiePresent", [name,])
        end


        # Create a new cookie whose path and domain are same with those of current page
        # under test, unless you specified a path for this cookie explicitly.
        #
        # 'nameValuePair' is name and value of the cookie in a format "name=value"
        # 'optionsString' is options for the cookie. Currently supported options include 'path', 'max_age' and 'domain'.      the optionsString's format is "path=/path/, max_age=60, domain=.foo.com". The order of options are irrelevant, the unit      of the value of 'max_age' is second.  Note that specifying a domain that isn't a subset of the current domain will      usually fail.
        def create_cookie(nameValuePair,optionsString)
            remote_control_command("createCookie", [nameValuePair,optionsString,])
        end


        # Delete a named cookie with specified path and domain.  Be careful; to delete a cookie, you
        # need to delete it using the exact same path and domain that were used to create the cookie.
        # If the path is wrong, or the domain is wrong, the cookie simply won't be deleted.  Also
        # note that specifying a domain that isn't a subset of the current domain will usually fail.
        #
        # Since there's no way to discover at runtime the original path and domain of a given cookie,
        # we've added an option called 'recurse' to try all sub-domains of the current domain with
        # all paths that are a subset of the current path.  Beware; this option can be slow.  In
        # big-O notation, it operates in O(n*m) time, where n is the number of dots in the domain
        # name and m is the number of slashes in the path.
        #
        # 'name' is the name of the cookie to be deleted
        # 'optionsString' is options for the cookie. Currently supported options include 'path', 'domain'      and 'recurse.' The optionsString's format is "path=/path/, domain=.foo.com, recurse=true".      The order of options are irrelevant. Note that specifying a domain that isn't a subset of      the current domain will usually fail.
        def delete_cookie(name,optionsString)
            remote_control_command("deleteCookie", [name,optionsString,])
        end


        # Calls deleteCookie with recurse=true on all cookies visible to the current page.
        # As noted on the documentation for deleteCookie, recurse=true can be much slower
        # than simply deleting the cookies using a known domain/path.
        #
        def delete_all_visible_cookies()
            remote_control_command("deleteAllVisibleCookies", [])
        end


        # Sets the threshold for browser-side logging messages; log messages beneath this threshold will be discarded.
        # Valid logLevel strings are: "debug", "info", "warn", "error" or "off".
        # To see the browser logs, you need to
        # either show the log window in GUI mode, or enable browser-side logging in Selenium RC.
        #
        # 'logLevel' is one of the following: "debug", "info", "warn", "error" or "off"
        def set_browser_log_level(logLevel)
            remote_control_command("setBrowserLogLevel", [logLevel,])
        end


        # Creates a new "script" tag in the body of the current test window, and
        # adds the specified text into the body of the command.  Scripts run in
        # this way can often be debugged more easily than scripts executed using
        # Selenium's "getEval" command.  Beware that JS exceptions thrown in these script
        # tags aren't managed by Selenium, so you should probably wrap your script
        # in try/catch blocks if there is any chance that the script will throw
        # an exception.
        #
        # 'script' is the JavaScript snippet to run
        def run_script(script)
            remote_control_command("runScript", [script,])
        end


        # Defines a new function for Selenium to locate elements on the page.
        # For example,
        # if you define the strategy "foo", and someone runs click("foo=blah"), we'll
        # run your function, passing you the string "blah", and click on the element
        # that your function
        # returns, or throw an "Element not found" error if your function returns null.
        #
        # We'll pass three arguments to your function:
        # *    locator: the string the user passed in
        # *    inWindow: the currently selected window
        # *    inDocument: the currently selected document
        #
        #
        # The function must return null if the element can't be found.
        #
        # 'strategyName' is the name of the strategy to define; this should use only   letters [a-zA-Z] with no spaces or other punctuation.
        # 'functionDefinition' is a string defining the body of a function in JavaScript.   For example: <tt>return inDocument.getElementById(locator);</tt>
        def add_location_strategy(strategyName,functionDefinition)
            remote_control_command("addLocationStrategy", [strategyName,functionDefinition,])
        end


        # Saves the entire contents of the current window canvas to a PNG file.
        # Contrast this with the captureScreenshot command, which captures the
        # contents of the OS viewport (i.e. whatever is currently being displayed
        # on the monitor), and is implemented in the RC only. Currently this only
        # works in Firefox when running in chrome mode, and in IE non-HTA using
        # the EXPERIMENTAL "Snapsie" utility. The Firefox implementation is mostly
        # borrowed from the Screengrab! Firefox extension. Please see
        # http://snapsie.sourceforge.net/ for details.
        #
        # 'filename' is the path to the file to persist the screenshot as. No                  filename extension will be appended by default.                  Directories will not be created if they do not exist,                    and an exception will be thrown, possibly by native                  code.
        # 'kwargs' is a kwargs string that modifies the way the screenshot                  is captured. Example: "background=#CCFFDD" .                  Currently valid options:                  *    background::    the background CSS for the HTML document. This                     may be useful to set for capturing screenshots of                     less-than-ideal layouts, for example where absolute                     positioning causes the calculation of the canvas                     dimension to fail and a black background is exposed                     (possibly obscuring black text).
        def capture_entire_page_screenshot(filename,kwargs)
            remote_control_command("captureEntirePageScreenshot", [filename,kwargs,])
        end


        # Executes a command rollup, which is a series of commands with a unique
        # name, and optionally arguments that control the generation of the set of
        # commands. If any one of the rolled-up commands fails, the rollup is
        # considered to have failed. Rollups may also contain nested rollups.
        #
        # 'rollupName' is the name of the rollup command
        # 'kwargs' is keyword arguments string that influences how the                    rollup expands into commands
        def rollup(rollupName,kwargs)
            remote_control_command("rollup", [rollupName,kwargs,])
        end


        # Loads script content into a new script tag in the Selenium document. This
        # differs from the runScript command in that runScript adds the script tag
        # to the document of the AUT, not the Selenium document. The following
        # entities in the script content are replaced by the characters they
        # represent:
        #
        #     &lt;
        #     &gt;
        #     &amp;
        #
        # The corresponding remove command is removeScript.
        #
        # 'scriptContent' is the Javascript content of the script to add
        # 'scriptTagId' is (optional) the id of the new script tag. If                       specified, and an element with this id already                       exists, this operation will fail.
        def add_script(scriptContent,scriptTagId)
            remote_control_command("addScript", [scriptContent,scriptTagId,])
        end


        # Removes a script tag from the Selenium document identified by the given
        # id. Does nothing if the referenced tag doesn't exist.
        #
        # 'scriptTagId' is the id of the script element to remove.
        def remove_script(scriptTagId)
            remote_control_command("removeScript", [scriptTagId,])
        end


        # Allows choice of one of the available libraries.
        #
        # 'libraryName' is name of the desired library Only the following three can be chosen: *    "ajaxslt" - Google's library*    "javascript-xpath" - Cybozu Labs' faster library*    "default" - The default library.  Currently the default library is "ajaxslt" . If libraryName isn't one of these three, then  no change will be made.
        def use_xpath_library(libraryName)
            remote_control_command("useXpathLibrary", [libraryName,])
        end


        # Writes a message to the status bar and adds a note to the browser-side
        # log.
        #
        # 'context' is the message to be sent to the browser
        def set_context(context)
            remote_control_command("setContext", [context,])
        end


        # Sets a file input (upload) field to the file listed in fileLocator
        #
        # 'fieldLocator' is an element locator
        # 'fileLocator' is a URL pointing to the specified file. Before the file  can be set in the input field (fieldLocator), Selenium RC may need to transfer the file    to the local machine before attaching the file in a web page form. This is common in selenium  grid configurations where the RC server driving the browser is not the same  machine that started the test.   Supported Browsers: Firefox ("*chrome") only.
        def attach_file(fieldLocator,fileLocator)
            remote_control_command("attachFile", [fieldLocator,fileLocator,])
        end


        # Captures a PNG screenshot to the specified file.
        #
        # 'filename' is the absolute path to the file to be written, e.g. "c:\blah\screenshot.png"
        def capture_screenshot(filename)
            remote_control_command("captureScreenshot", [filename,])
        end


        # Capture a PNG screenshot.  It then returns the file as a base 64 encoded string.
        #
        def capture_screenshot_to_string()
            return string_command("captureScreenshotToString", [])
        end


        # Downloads a screenshot of the browser current window canvas to a
        # based 64 encoded PNG file. The <em>entire</em> windows canvas is captured,
        # including parts rendered outside of the current view port.
        #
        # Currently this only works in Mozilla and when running in chrome mode.
        #
        # 'kwargs' is A kwargs string that modifies the way the screenshot is captured. Example: "background=#CCFFDD". This may be useful to set for capturing screenshots of less-than-ideal layouts, for example where absolute positioning causes the calculation of the canvas dimension to fail and a black background is exposed  (possibly obscuring black text).
        def capture_entire_page_screenshot_to_string(kwargs)
            return string_command("captureEntirePageScreenshotToString", [kwargs,])
        end


        # Kills the running Selenium Server and all browser sessions.  After you run this command, you will no longer be able to send
        # commands to the server; you can't remotely start the server once it has been stopped.  Normally
        # you should prefer to run the "stop" command, which terminates the current browser session, rather than
        # shutting down the entire server.
        #
        def shut_down_selenium_server()
            remote_control_command("shutDownSeleniumServer", [])
        end


        # Retrieve the last messages logged on a specific remote control. Useful for error reports, especially
        # when running multiple remote controls in a distributed environment. The maximum number of log messages
        # that can be retrieve is configured on remote control startup.
        #
        def retrieve_last_remote_control_logs()
            return string_command("retrieveLastRemoteControlLogs", [])
        end


        # Simulates a user pressing a key (without releasing it yet) by sending a native operating system keystroke.
        # This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
        # a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
        # metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
        # element, focus on the element first before running this command.
        #
        # 'keycode' is an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
        def key_down_native(keycode)
            remote_control_command("keyDownNative", [keycode,])
        end


        # Simulates a user releasing a key by sending a native operating system keystroke.
        # This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
        # a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
        # metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
        # element, focus on the element first before running this command.
        #
        # 'keycode' is an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
        def key_up_native(keycode)
            remote_control_command("keyUpNative", [keycode,])
        end


        # Simulates a user pressing and releasing a key by sending a native operating system keystroke.
        # This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
        # a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
        # metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
        # element, focus on the element first before running this command.
        #
        # 'keycode' is an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
        def key_press_native(keycode)
            remote_control_command("keyPressNative", [keycode,])
        end


    end        # GeneratedDriver
  end          # Client
end            # Selenium
