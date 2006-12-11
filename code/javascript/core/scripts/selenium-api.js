/*
 * Copyright 2004 ThoughtWorks, Inc
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

// TODO: stop navigating this.browserbot.document() ... it breaks encapsulation

var storedVars = new Object();

function Selenium(browserbot) {
    /**
     * Defines an object that runs Selenium commands.
     *
     * <h3><a name="locators"></a>Element Locators</h3>
     * <p>
     * Element Locators tell Selenium which HTML element a command refers to.
     * The format of a locator is:</p>
     * <blockquote>
     * <em>locatorType</em><strong>=</strong><em>argument</em>
     * </blockquote>
     *
     * <p>
     * We support the following strategies for locating elements:
     * </p>
     * 
     * <ul>
     * <li><strong>identifier</strong>=<em>id</em>: 
     * Select the element with the specified &#64;id attribute. If no match is
     * found, select the first element whose &#64;name attribute is <em>id</em>.
     * (This is normally the default; see below.)</li>
     * <li><strong>id</strong>=<em>id</em>:
     * Select the element with the specified &#64;id attribute.</li>
     *
     * <li><strong>name</strong>=<em>name</em>:
     * Select the first element with the specified &#64;name attribute.
     * <ul class="first last simple">
     * <li>username</li>
     * <li>name=username</li>
     * </ul>
     * 
     * <p>The name may optionally be followed by one or more <em>element-filters</em>, separated from the name by whitespace.  If the <em>filterType</em> is not specified, <strong>value</strong> is assumed.</p>
     *
     * <ul class="first last simple">
     * <li>name=flavour value=chocolate</li>
     * </ul>
     * </li>
     * <li><strong>dom</strong>=<em>javascriptExpression</em>: 
     *
     * Find an element by evaluating the specified string.  This allows you to traverse the HTML Document Object
     * Model using JavaScript.  Note that you must not return a value in this string; simply make it the last expression in the block.
     * <ul class="first last simple">
     * <li>dom=document.forms['myForm'].myDropdown</li>
     * <li>dom=document.images[56]</li>
     * <li>dom=function foo() { return document.links[1]; }; foo();</li>
     * </ul>
     *
     * </li>
     *
     * <li><strong>xpath</strong>=<em>xpathExpression</em>: 
     * Locate an element using an XPath expression.
     * <ul class="first last simple">
     * <li>xpath=//img[&#64;alt='The image alt text']</li>
     * <li>xpath=//table[&#64;id='table1']//tr[4]/td[2]</li>
     * <li>xpath=//a[contains(&#64;href,'#id1')]</li>
     * <li>xpath=//a[contains(&#64;href,'#id1')]/&#64;class</li>
     * <li>xpath=(//table[&#64;class='stylee'])//th[text()='theHeaderText']/../td</li>
     * <li>xpath=//input[&#64;name='name2' and &#64;value='yes']</li>
     * <li>xpath=//*[text()="right"]</li>
     *
     * </ul>
     * </li>
     * <li><strong>link</strong>=<em>textPattern</em>:
     * Select the link (anchor) element which contains text matching the
     * specified <em>pattern</em>.
     * <ul class="first last simple">
     * <li>link=The link text</li>
     * </ul>
     *
     * </li>
     *
     * <li><strong>css</strong>=<em>cssSelectorSyntax</em>:
     * Select the element using css selectors. Please refer to <a href="http://www.w3.org/TR/REC-CSS2/selector.html">CSS2 selectors</a>, <a href="http://www.w3.org/TR/2001/CR-css3-selectors-20011113/">CSS3 selectors</a> for more information. You can also check the TestCssLocators test in the selenium test suite for an example of usage, which is included in the downloaded selenium core package.
     * <ul class="first last simple">
     * <li>css=a[href="#id3"]</li>
     * <li>css=span#firstChild + span</li>
     * </ul>
     * <p>Currently the css selector locator supports all css1, css2 and css3 selectors except namespace in css3, some pseudo classes(:nth-of-type, :nth-last-of-type, :first-of-type, :last-of-type, :only-of-type, :visited, :hover, :active, :focus, :indeterminate) and pseudo elements(::first-line, ::first-letter, ::selection, ::before, ::after). </p>
     * </li>
     * </ul>
     * 
     * <p>
     * Without an explicit locator prefix, Selenium uses the following default
     * strategies:
     * </p>
     *
     * <ul class="simple">
     * <li><strong>dom</strong>, for locators starting with &quot;document.&quot;</li>
     * <li><strong>xpath</strong>, for locators starting with &quot;//&quot;</li>
     * <li><strong>identifier</strong>, otherwise</li>
     * </ul>
     *
     * <h3><a name="element-filters">Element Filters</a></h3>
     * <blockquote>
     * <p>Element filters can be used with a locator to refine a list of candidate elements.  They are currently used only in the 'name' element-locator.</p>
     * <p>Filters look much like locators, ie.</p>
     * <blockquote>
     * <em>filterType</em><strong>=</strong><em>argument</em></blockquote>
     *
     * <p>Supported element-filters are:</p>
     * <p><strong>value=</strong><em>valuePattern</em></p>
     * <blockquote>
     * Matches elements based on their values.  This is particularly useful for refining a list of similarly-named toggle-buttons.</blockquote>
     * <p><strong>index=</strong><em>index</em></p>
     * <blockquote>
     * Selects a single element based on its position in the list (offset from zero).</blockquote>
     * </blockquote>
     *
     * <h3><a name="patterns"></a>String-match Patterns</h3>
     *
     * <p>
     * Various Pattern syntaxes are available for matching string values:
     * </p>
     * <ul>
     * <li><strong>glob:</strong><em>pattern</em>:
     * Match a string against a "glob" (aka "wildmat") pattern. "Glob" is a
     * kind of limited regular-expression syntax typically used in command-line
     * shells. In a glob pattern, "*" represents any sequence of characters, and "?"
     * represents any single character. Glob patterns match against the entire
     * string.</li>
     * <li><strong>regexp:</strong><em>regexp</em>:
     * Match a string using a regular-expression. The full power of JavaScript
     * regular-expressions is available.</li>
     * <li><strong>exact:</strong><em>string</em>:
     *
     * Match a string exactly, verbatim, without any of that fancy wildcard
     * stuff.</li>
     * </ul>
     * <p>
     * If no pattern prefix is specified, Selenium assumes that it's a "glob"
     * pattern.
     * </p>
     */
    this.browserbot = browserbot;
    this.optionLocatorFactory = new OptionLocatorFactory();
    // DGF for backwards compatibility
    this.page = function() {
        return browserbot;
    };
    this.defaultTimeout = Selenium.DEFAULT_TIMEOUT;
    this.mouseSpeed = 10;
}

Selenium.DEFAULT_TIMEOUT = 30 * 1000;
Selenium.DEFAULT_MOUSE_SPEED = 10;

Selenium.decorateFunctionWithTimeout = function(f, timeout) {
    if (f == null) {
        return null;
    }
    var timeoutValue = parseInt(timeout);
    if (isNaN(timeoutValue)) {
        throw new SeleniumError("Timeout is not a number: '" + timeout + "'");
    }
    var now = new Date().getTime();
    var timeoutTime = now + timeoutValue;
    return function() {
        if (new Date().getTime() > timeoutTime) {
            throw new SeleniumError("Timed out after " + timeoutValue + "ms");
        }
        return f();
    };
}

Selenium.createForWindow = function(window, proxyInjectionMode) {
    if (!window.location) {
        throw "error: not a window!";
    }
    return new Selenium(BrowserBot.createForWindow(window, proxyInjectionMode));
};

Selenium.prototype.reset = function() {
    this.defaultTimeout = Selenium.DEFAULT_TIMEOUT;
    // todo: this.browserbot.reset()
    this.browserbot.selectWindow("null");
    this.browserbot.resetPopups();
};

Selenium.prototype.doClick = function(locator) {
    /**
   * Clicks on a link, button, checkbox or radio button. If the click action
   * causes a new page to load (like a link usually does), call
   * waitForPageToLoad.
   *
   * @param locator an element locator
   *
   */
   var element = this.browserbot.findElement(locator);
   this.browserbot.clickElement(element);
};

Selenium.prototype.doDoubleClick = function(locator) {
    /**
   * Double clicks on a link, button, checkbox or radio button. If the double click action
   * causes a new page to load (like a link usually does), call
   * waitForPageToLoad.
   *
   * @param locator an element locator
   *
   */
   var element = this.browserbot.findElement(locator);
   this.browserbot.doubleClickElement(element);
};

Selenium.prototype.doClickAt = function(locator, coordString) {
    /**
   * Clicks on a link, button, checkbox or radio button. If the click action
   * causes a new page to load (like a link usually does), call
   * waitForPageToLoad.
   *
   * @param locator an element locator
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse
   *      event relative to the element returned by the locator.
   *
   */
    var element = this.browserbot.findElement(locator);
    var clientXY = getClientXY(element, coordString)
    this.browserbot.clickElement(element, clientXY[0], clientXY[1]);
};

Selenium.prototype.doDoubleClickAt = function(locator, coordString) {
    /**
   * Doubleclicks on a link, button, checkbox or radio button. If the action
   * causes a new page to load (like a link usually does), call
   * waitForPageToLoad.
   *
   * @param locator an element locator
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse
   *      event relative to the element returned by the locator.
   *
   */
    var element = this.browserbot.findElement(locator);
    var clientXY = getClientXY(element, coordString)
    this.browserbot.doubleClickElement(element, clientXY[0], clientXY[1]);
};

Selenium.prototype.doFireEvent = function(locator, eventName) {
    /**
   * Explicitly simulate an event, to trigger the corresponding &quot;on<em>event</em>&quot;
   * handler.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param eventName the event name, e.g. "focus" or "blur"
   */
    var element = this.browserbot.findElement(locator);
    triggerEvent(element, eventName, false);
};

Selenium.prototype.doKeyPress = function(locator, keySequence) {
    /**
   * Simulates a user pressing and releasing a key.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param keySequence Either be a string("\" followed by the numeric keycode
   *  of the key to be pressed, normally the ASCII value of that key), or a single
   *  character. For example: "w", "\119".
   */
    var element = this.browserbot.findElement(locator);
    triggerKeyEvent(element, 'keypress', keySequence, true, 
        this.browserbot.controlKeyDown, 
        this.browserbot.altKeyDown, 
            this.browserbot.shiftKeyDown,
            this.browserbot.metaKeyDown);
};

Selenium.prototype.doShiftKeyDown = function() {
    /**
   * Press the shift key and hold it down until doShiftUp() is called or a new page is loaded.
   *
   */
   this.browserbot.shiftKeyDown = true;
};

Selenium.prototype.doShiftKeyUp = function() {
    /**
   * Release the shift key.
   *
   */
   this.browserbot.shiftKeyDown = false;
};

Selenium.prototype.doMetaKeyDown = function() {
    /**
   * Press the meta key and hold it down until doMetaUp() is called or a new page is loaded.
   *
   */
   this.browserbot.metaKeyDown = true;
};

Selenium.prototype.doMetaKeyUp = function() {
    /**
   * Release the meta key.
   *
   */
   this.browserbot.metaKeyDown = false;
};

Selenium.prototype.doAltKeyDown = function() {
    /**
   * Press the alt key and hold it down until doAltUp() is called or a new page is loaded.
   *
   */
   this.browserbot.altKeyDown = true;
};

Selenium.prototype.doAltKeyUp = function() {
    /**
   * Release the alt key.
   *
   */
   this.browserbot.altKeyDown = false;
};

Selenium.prototype.doControlKeyDown = function() {
    /**
   * Press the control key and hold it down until doControlUp() is called or a new page is loaded.
   *
   */
   this.browserbot.controlKeyDown = true;
};

Selenium.prototype.doControlKeyUp = function() {
    /**
   * Release the control key.
   *
   */
   this.browserbot.controlKeyDown = false;
};

Selenium.prototype.doKeyDown = function(locator, keySequence) {
    /**
   * Simulates a user pressing a key (without releasing it yet).
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param keySequence Either be a string("\" followed by the numeric keycode
   *  of the key to be pressed, normally the ASCII value of that key), or a single
   *  character. For example: "w", "\119".
   */
    var element = this.browserbot.findElement(locator);
    triggerKeyEvent(element, 'keydown', keySequence, true,
        this.browserbot.controlKeyDown, 
            this.browserbot.altKeyDown, 
            this.browserbot.shiftKeyDown, 
            this.browserbot.metaKeyDown);
};

Selenium.prototype.doKeyUp = function(locator, keySequence) {
    /**
   * Simulates a user releasing a key.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param keySequence Either be a string("\" followed by the numeric keycode
   *  of the key to be pressed, normally the ASCII value of that key), or a single
   *  character. For example: "w", "\119".
   */
    var element = this.browserbot.findElement(locator);
    triggerKeyEvent(element, 'keyup', keySequence, true,
        this.browserbot.controlKeyDown, 
            this.browserbot.altKeyDown, 
        this.browserbot.shiftKeyDown,
        this.browserbot.metaKeyDown);
};

function getClientXY(element, coordString) {
   // Parse coordString
   var coords = null;
   var x;
   var y;
   if (coordString) {
      coords = coordString.split(/,/);
      x = Number(coords[0]);
      y = Number(coords[1]);
   }
   else {
      x = y = 0;
   }

   // Get position of element,
   // Return 2 item array with clientX and clientY
   return [Selenium.prototype.getElementPositionLeft(element) + x, Selenium.prototype.getElementPositionTop(element) + y];
}

Selenium.prototype.doMouseOver = function(locator) {
    /**
   * Simulates a user hovering a mouse over the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
    var element = this.browserbot.findElement(locator);
    this.browserbot.triggerMouseEvent(element, 'mouseover', true);
};

Selenium.prototype.doMouseOut = function(locator) {
   /**
   * Simulates a user moving the mouse pointer away from the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
    var element = this.browserbot.findElement(locator);
    this.browserbot.triggerMouseEvent(element, 'mouseout', true);
};

Selenium.prototype.doMouseDown = function(locator) {
    /**
   * Simulates a user pressing the mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
   var element = this.browserbot.findElement(locator);
   this.browserbot.triggerMouseEvent(element, 'mousedown', true);
};

Selenium.prototype.doMouseDownAt = function(locator, coordString) {
    /**
   * Simulates a user pressing the mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse
   *      event relative to the element returned by the locator.
   */
    var element = this.browserbot.findElement(locator);
    var clientXY = getClientXY(element, coordString)

    this.browserbot.triggerMouseEvent(element, 'mousedown', true, clientXY[0], clientXY[1]);
};

Selenium.prototype.doMouseUp = function(locator) {
    /**
   * Simulates a user pressing the mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
   var element = this.browserbot.findElement(locator);
   this.browserbot.triggerMouseEvent(element, 'mouseup', true);
};

Selenium.prototype.doMouseUpAt = function(locator, coordString) {
    /**
   * Simulates a user pressing the mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse
   *      event relative to the element returned by the locator.
   */
    var element = this.browserbot.findElement(locator);
    var clientXY = getClientXY(element, coordString)

    this.browserbot.triggerMouseEvent(element, 'mouseup', true, clientXY[0], clientXY[1]);
};

Selenium.prototype.doMouseMove = function(locator) {
    /**
   * Simulates a user pressing the mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
   var element = this.browserbot.findElement(locator);
   this.browserbot.triggerMouseEvent(element, 'mousemove', true);
};

Selenium.prototype.doMouseMoveAt = function(locator, coordString) {
    /**
   * Simulates a user pressing the mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse
   *      event relative to the element returned by the locator.
   */

    var element = this.browserbot.findElement(locator);
    var clientXY = getClientXY(element, coordString)

    this.browserbot.triggerMouseEvent(element, 'mousemove', true, clientXY[0], clientXY[1]);
};

Selenium.prototype.doType = function(locator, value) {
    /**
   * Sets the value of an input field, as though you typed it in.
   *
   * <p>Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
   * value should be the value of the option selected, not the visible text.</p>
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param value the value to type
   */
   if (this.browserbot.controlKeyDown || this.browserbot.altKeyDown || this.browserbot.metaKeyDown) {
        throw new SeleniumError("type not supported immediately after call to controlKeyDown() or altKeyDown() or metaKeyDown()");
    }
        // TODO fail if it can't be typed into.
    var element = this.browserbot.findElement(locator);
    if (this.browserbot.shiftKeyDown) {
        value = new String(value).toUpperCase();
    }
    this.browserbot.replaceText(element, value);
};

Selenium.prototype.doTypeKeys = function(locator, value) {
    /**
    * Simulates keystroke events on the specified element, as though you typed the value key-by-key.
    *
    * <p>This is a convenience method for calling keyDown, keyUp, keyPress for every character in the specified string;
    * this is useful for dynamic UI widgets (like auto-completing combo boxes) that require explicit key events.</p>
    * 
    * <p>Unlike the simple "type" command, which forces the specified value into the page directly, this command
    * may or may not have any visible effect, even in cases where typing keys would normally have a visible effect.
    * For example, if you use "typeKeys" on a form element, you may or may not see the results of what you typed in
    * the field.</p>
    * <p>In some cases, you may need to use the simple "type" command to set the value of the field and then the "typeKeys" command to
    * send the keystroke events corresponding to what you just typed.</p>
    *
    * @param locator an <a href="#locators">element locator</a>
    * @param value the value to type
    */
    var keys = new String(value).split("");
    for (var i = 0; i < keys.length; i++) {
        var c = keys[i];
        this.doKeyDown(locator, c);
        this.doKeyUp(locator, c);
        this.doKeyPress(locator, c);
    }
};

Selenium.prototype.doSetSpeed = function(value) {
 /**
 * Set execution speed (i.e., set the millisecond length of a delay which will follow each selenium operation).  By default, there is no such delay, i.e.,
 * the delay is 0 milliseconds.
   *
   * @param value the number of milliseconds to pause after operation
   */
   throw new SeleniumError("this operation is only implemented in selenium-rc, and should never result in a request making it across the wire");
};

Selenium.prototype.doGetSpeed = function() {
 /**
 * Get execution speed (i.e., get the millisecond length of the delay following each selenium operation).  By default, there is no such delay, i.e.,
 * the delay is 0 milliseconds.
   *
   * See also setSpeed.
   */
   throw new SeleniumError("this operation is only implemented in selenium-rc, and should never result in a request making it across the wire");
};

Selenium.prototype.findToggleButton = function(locator) {
    var element = this.browserbot.findElement(locator);
    if (element.checked == null) {
        Assert.fail("Element " + locator + " is not a toggle-button.");
    }
    return element;
}

Selenium.prototype.doCheck = function(locator) {
    /**
   * Check a toggle-button (checkbox/radio)
   *
   * @param locator an <a href="#locators">element locator</a>
   */
    this.findToggleButton(locator).checked = true;
};

Selenium.prototype.doUncheck = function(locator) {
    /**
   * Uncheck a toggle-button (checkbox/radio)
   *
   * @param locator an <a href="#locators">element locator</a>
   */
    this.findToggleButton(locator).checked = false;
};

Selenium.prototype.doSelect = function(selectLocator, optionLocator) {
    /**
   * Select an option from a drop-down using an option locator.
   *
   * <p>
   * Option locators provide different ways of specifying options of an HTML
   * Select element (e.g. for selecting a specific option, or for asserting
   * that the selected option satisfies a specification). There are several
   * forms of Select Option Locator.
   * </p>
   * <ul>
   * <li><strong>label</strong>=<em>labelPattern</em>:
   * matches options based on their labels, i.e. the visible text. (This
   * is the default.)
   * <ul class="first last simple">
   * <li>label=regexp:^[Oo]ther</li>
   * </ul>
   * </li>
   * <li><strong>value</strong>=<em>valuePattern</em>:
   * matches options based on their values.
   * <ul class="first last simple">
   * <li>value=other</li>
   * </ul>
   *
   *
   * </li>
   * <li><strong>id</strong>=<em>id</em>:
   *
   * matches options based on their ids.
   * <ul class="first last simple">
   * <li>id=option1</li>
   * </ul>
   * </li>
   * <li><strong>index</strong>=<em>index</em>:
   * matches an option based on its index (offset from zero).
   * <ul class="first last simple">
   *
   * <li>index=2</li>
   * </ul>
   * </li>
   * </ul>
   * <p>
   * If no option locator prefix is provided, the default behaviour is to match on <strong>label</strong>.
   * </p>
   *
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @param optionLocator an option locator (a label by default)
   */
    var element = this.browserbot.findElement(selectLocator);
    if (!("options" in element)) {
        throw new SeleniumError("Specified element is not a Select (has no options)");
    }
    var locator = this.optionLocatorFactory.fromLocatorString(optionLocator);
    var option = locator.findOption(element);
    this.browserbot.selectOption(element, option);
};



Selenium.prototype.doAddSelection = function(locator, optionLocator) {
    /**
   * Add a selection to the set of selected options in a multi-select element using an option locator.
   *
   * @see #doSelect for details of option locators
   *
   * @param locator an <a href="#locators">element locator</a> identifying a multi-select box
   * @param optionLocator an option locator (a label by default)
   */
    var element = this.browserbot.findElement(locator);
    if (!("options" in element)) {
        throw new SeleniumError("Specified element is not a Select (has no options)");
    }
    var locator = this.optionLocatorFactory.fromLocatorString(optionLocator);
    var option = locator.findOption(element);
    this.browserbot.addSelection(element, option);
};

Selenium.prototype.doRemoveSelection = function(locator, optionLocator) {
    /**
   * Remove a selection from the set of selected options in a multi-select element using an option locator.
   *
   * @see #doSelect for details of option locators
   *
   * @param locator an <a href="#locators">element locator</a> identifying a multi-select box
   * @param optionLocator an option locator (a label by default)
   */

    var element = this.browserbot.findElement(locator);
    if (!("options" in element)) {
        throw new SeleniumError("Specified element is not a Select (has no options)");
    }
    var locator = this.optionLocatorFactory.fromLocatorString(optionLocator);
    var option = locator.findOption(element);
    this.browserbot.removeSelection(element, option);
};

Selenium.prototype.doRemoveAllSelections = function(locator) {
    /**
    * Unselects all of the selected options in a multi-select element.
    *
    * @param locator an <a href="#locators">element locator</a> identifying a multi-select box
    */
    var element = this.browserbot.findElement(locator);
    if (!("options" in element)) {
        throw new SeleniumError("Specified element is not a Select (has no options)");
    }
    for (var i = 0; i < element.options.length; i++) {
        this.browserbot.removeSelection(element, element.options[i]);
    }
}

Selenium.prototype.doSubmit = function(formLocator) {
    /**
   * Submit the specified form. This is particularly useful for forms without
   * submit buttons, e.g. single-input "Search" forms.
   *
   * @param formLocator an <a href="#locators">element locator</a> for the form you want to submit
   */
    var form = this.browserbot.findElement(formLocator);
    return this.browserbot.submit(form);

};

Selenium.prototype.makePageLoadCondition = function(timeout) {
    if (timeout == null) {
        timeout = this.defaultTimeout;
    }
    return Selenium.decorateFunctionWithTimeout(fnBind(this._isNewPageLoaded, this), timeout);
};

Selenium.prototype.doOpen = function(url) {
    /**
   * Opens an URL in the test frame. This accepts both relative and absolute
   * URLs.
   *
   * The &quot;open&quot; command waits for the page to load before proceeding,
   * ie. the &quot;AndWait&quot; suffix is implicit.
   *
   * <em>Note</em>: The URL must be on the same domain as the runner HTML
   * due to security restrictions in the browser (Same Origin Policy). If you
   * need to open an URL on another domain, use the Selenium Server to start a
   * new browser session on that domain.
   *
   * @param url the URL to open; may be relative or absolute
   */
    this.browserbot.openLocation(url);
    return this.makePageLoadCondition();
};

Selenium.prototype.doOpenWindow = function(url, windowID) {
    /**
   * Opens a popup window (if a window with that ID isn't already open).
   * After opening the window, you'll need to select it using the selectWindow
   * command.
   * 
   * <p>This command can also be a useful workaround for bug SEL-339.  In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
   * In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
   * an empty (blank) url, like this: openWindow("", "myFunnyWindow").</p>
   *
   * @param url the URL to open, which can be blank 
   * @param windowID the JavaScript window ID of the window to select
   */
   this.browserbot.openWindow(url, windowID);
};

Selenium.prototype.doSelectWindow = function(windowID) {
    /**
   * Selects a popup window; once a popup window has been selected, all
   * commands go to that window. To select the main window again, use null
   * as the target.
   *
   * <p>Selenium has several strategies for finding the window object referred to by the "windowID" parameter.</p>
   * 
   * <p>1.) if windowID is null, then it is assumed the user is referring to the original window instantiated by the browser).</p>
   * <p>2.) if the value of the "windowID" parameter is a JavaScript variable name in the current application window, then it is assumed
   * that this variable contains the return value from a call to the JavaScript window.open() method.</p>
   * <p>3.) Otherwise, selenium looks in a hash it maintains that maps string names to window objects.  Each of these string 
   * names matches the second parameter "windowName" past to the JavaScript method  window.open(url, windowName, windowFeatures, replaceFlag)
   * (which selenium intercepts).</p>
   *
   * <p>If you're having trouble figuring out what is the name of a window that you want to manipulate, look at the selenium log messages
   * which identify the names of windows created via window.open (and therefore intercepted by selenium).  You will see messages
   * like the following for each window as it is opened:</p>
   * 
   * <p><code>debug: window.open call intercepted; window ID (which you can use with selectWindow()) is "myNewWindow"</code></p>
   *
   * <p>In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
   * (This is bug SEL-339.)  In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
   * an empty (blank) url, like this: openWindow("", "myFunnyWindow").</p>
   * 
   * @param windowID the JavaScript window ID of the window to select
   */
    this.browserbot.selectWindow(windowID);
};

Selenium.prototype.doSelectFrame = function(locator) {
    /**
    * Selects a frame within the current window.  (You may invoke this command
    * multiple times to select nested frames.)  To select the parent frame, use
    * "relative=parent" as a locator; to select the top frame, use "relative=top".
    *
    * <p>You may also use a DOM expression to identify the frame you want directly,
    * like this: <code>dom=frames["main"].frames["subframe"]</code></p>
    *
    * @param locator an <a href="#locators">element locator</a> identifying a frame or iframe
    */
        this.browserbot.selectFrame(locator);
};

Selenium.prototype.getLogMessages = function() {
    /**
        * Return the contents of the log.
    *
        * <p>This is a placeholder intended to make the code generator make this API
        * available to clients.  The selenium server will intercept this call, however,
        * and return its recordkeeping of log messages since the last call to this API.
        * Thus this code in JavaScript will never be called.</p>
        *
        * <p>The reason I opted for a servercentric solution is to be able to support
        * multiple frames served from different domains, which would break a
        * centralized JavaScript logging mechanism under some conditions.</p>
    *
        * @return string all log messages seen since the last call to this API
    */
        return "getLogMessages should be implemented in the selenium server";
};


Selenium.prototype.getWhetherThisFrameMatchFrameExpression = function(currentFrameString, target) {
    /**
     * Determine whether current/locator identify the frame containing this running code.
     *
     * <p>This is useful in proxy injection mode, where this code runs in every
     * browser frame and window, and sometimes the selenium server needs to identify
     * the "current" frame.  In this case, when the test calls selectFrame, this
     * routine is called for each frame to figure out which one has been selected.
     * The selected frame will return true, while all others will return false.</p>
     *
     * @param currentFrameString starting frame
     * @param target new frame (which might be relative to the current one)
     * @return boolean true if the new frame is this code's window
     */
    var isDom = false;
    if (target.indexOf("dom=") == 0) {
        target = target.substr(4);
        isDom = true;
    }
    var t;
    try {
        eval("t=" + currentFrameString + "." + target);
    } catch (e) {
    }
    var autWindow = this.browserbot.getCurrentWindow();
    if (t != null) {
        if (t.window == autWindow) {
            return true;
        }
        return false;
    }
    if (isDom) {
        return false;
    }
    var currentFrame;
    eval("currentFrame=" + currentFrameString);
    if (target == "relative=up") {
        if (currentFrame.window.parent == autWindow) {
            return true;
        }
        return false;
    }
    if (target == "relative=top") {
        if (currentFrame.window.top == autWindow) {
            return true;
        }
        return false;
    }
    if (autWindow.name == target && currentFrame.window == autWindow.parent) {
        return true;
    }
    return false;
};

Selenium.prototype.getWhetherThisWindowMatchWindowExpression = function(currentWindowString, target) {
    /**
    * Determine whether currentWindowString plus target identify the window containing this running code.
     *
     * <p>This is useful in proxy injection mode, where this code runs in every
     * browser frame and window, and sometimes the selenium server needs to identify
     * the "current" window.  In this case, when the test calls selectWindow, this
     * routine is called for each window to figure out which one has been selected.
     * The selected window will return true, while all others will return false.</p>
     *
     * @param currentWindowString starting window
     * @param target new window (which might be relative to the current one, e.g., "_parent")
     * @return boolean true if the new window is this code's window
     */
     if (window.opener!=null && window.opener[target]!=null && window.opener[target]==window) {
         return true;
     }
     return false;
};

Selenium.prototype.doWaitForPopUp = function(windowID, timeout) {
    /**
    * Waits for a popup window to appear and load up.
    *
    * @param windowID the JavaScript window ID of the window that will appear
    * @param timeout a timeout in milliseconds, after which the action will return with an error
    */
    var popupLoadedPredicate = function () {
        var targetWindow = selenium.browserbot.getWindowByName(windowID, true);
        if (!targetWindow) return false;
        if (!targetWindow.location) return false;
        if ("about:blank" == targetWindow.location) return false;
        if (browserVersion.isKonqueror) {
            if ("/" == targetWindow.location.href) {
                // apparently Konqueror uses this as the temporary location, instead of about:blank
                return false;
            }
        }
        if (browserVersion.isSafari) {
            if(targetWindow.location.href == selenium.browserbot.buttonWindow.location.href) {
                // Apparently Safari uses this as the temporary location, instead of about:blank
                // what a world!
                LOG.debug("DGF what a world!");
                return false;
            }
        }
        if (!targetWindow.document) return false;
        if (!selenium.browserbot.getCurrentWindow().document.readyState) {
            // This is Firefox, with no readyState extension
            return true;
        }
        if ('complete' != targetWindow.document.readyState) return false;
        return true;
    };

    return Selenium.decorateFunctionWithTimeout(popupLoadedPredicate, timeout);
}

Selenium.prototype.doWaitForPopUp.dontCheckAlertsAndConfirms = true;

Selenium.prototype.doChooseCancelOnNextConfirmation = function() {
    /**
   * By default, Selenium's overridden window.confirm() function will
   * return true, as if the user had manually clicked OK.  After running
   * this command, the next call to confirm() will return false, as if
   * the user had clicked Cancel.
   *
   */
    this.browserbot.cancelNextConfirmation();
};


Selenium.prototype.doAnswerOnNextPrompt = function(answer) {
    /**
   * Instructs Selenium to return the specified answer string in response to
   * the next JavaScript prompt [window.prompt()].
   *
   *
   * @param answer the answer to give in response to the prompt pop-up
   */
    this.browserbot.setNextPromptResult(answer);
};

Selenium.prototype.doGoBack = function() {
    /**
     * Simulates the user clicking the "back" button on their browser.
     *
     */
    this.browserbot.goBack();
};

Selenium.prototype.doRefresh = function() {
    /**
     * Simulates the user clicking the "Refresh" button on their browser.
     *
     */
    this.browserbot.refresh();
};

Selenium.prototype.doClose = function() {
    /**
     * Simulates the user clicking the "close" button in the titlebar of a popup
     * window or tab.
     */
    this.browserbot.close();
};

Selenium.prototype.ensureNoUnhandledPopups = function() {
    if (this.browserbot.hasAlerts()) {
        throw new SeleniumError("There was an unexpected Alert! [" + this.browserbot.getNextAlert() + "]");
    }
    if ( this.browserbot.hasConfirmations() ) {
        throw new SeleniumError("There was an unexpected Confirmation! [" + this.browserbot.getNextConfirmation() + "]");
    }
};

Selenium.prototype.isAlertPresent = function() {
   /**
   * Has an alert occurred?
   *
   * <p>
   * This function never throws an exception
   * </p>
   * @return boolean true if there is an alert
   */
    return this.browserbot.hasAlerts();
};

Selenium.prototype.isPromptPresent = function() {
   /**
   * Has a prompt occurred?
   *
   * <p>
   * This function never throws an exception
   * </p>
   * @return boolean true if there is a pending prompt
   */
    return this.browserbot.hasPrompts();
};

Selenium.prototype.isConfirmationPresent = function() {
   /**
   * Has confirm() been called?
   *
   * <p>
   * This function never throws an exception
   * </p>
   * @return boolean true if there is a pending confirmation
   */
    return this.browserbot.hasConfirmations();
};
Selenium.prototype.getAlert = function() {
    /**
   * Retrieves the message of a JavaScript alert generated during the previous action, or fail if there were no alerts.
   *
   * <p>Getting an alert has the same effect as manually clicking OK. If an
   * alert is generated but you do not get/verify it, the next Selenium action
   * will fail.</p>
   *
   * <p>NOTE: under Selenium, JavaScript alerts will NOT pop up a visible alert
   * dialog.</p>
   *
   * <p>NOTE: Selenium does NOT support JavaScript alerts that are generated in a
   * page's onload() event handler. In this case a visible dialog WILL be
   * generated and Selenium will hang until someone manually clicks OK.</p>
   * @return string The message of the most recent JavaScript alert
   */
    if (!this.browserbot.hasAlerts()) {
        Assert.fail("There were no alerts");
    }
    return this.browserbot.getNextAlert();
};
Selenium.prototype.getAlert.dontCheckAlertsAndConfirms = true;

Selenium.prototype.getConfirmation = function() {
    /**
   * Retrieves the message of a JavaScript confirmation dialog generated during
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
   * NOTE: under Selenium, JavaScript confirmations will NOT pop up a visible
   * dialog.
   * </p>
   *
   * <p>
   * NOTE: Selenium does NOT support JavaScript confirmations that are
   * generated in a page's onload() event handler. In this case a visible
   * dialog WILL be generated and Selenium will hang until you manually click
   * OK.
   * </p>
   *
   * @return string the message of the most recent JavaScript confirmation dialog
   */
    if (!this.browserbot.hasConfirmations()) {
        Assert.fail("There were no confirmations");
    }
    return this.browserbot.getNextConfirmation();
};
Selenium.prototype.getConfirmation.dontCheckAlertsAndConfirms = true;

Selenium.prototype.getPrompt = function() {
    /**
   * Retrieves the message of a JavaScript question prompt dialog generated during
   * the previous action.
   *
   * <p>Successful handling of the prompt requires prior execution of the
   * answerOnNextPrompt command. If a prompt is generated but you
   * do not get/verify it, the next Selenium action will fail.</p>
   *
   * <p>NOTE: under Selenium, JavaScript prompts will NOT pop up a visible
   * dialog.</p>
   *
   * <p>NOTE: Selenium does NOT support JavaScript prompts that are generated in a
   * page's onload() event handler. In this case a visible dialog WILL be
   * generated and Selenium will hang until someone manually clicks OK.</p>
   * @return string the message of the most recent JavaScript question prompt
   */
    if (! this.browserbot.hasPrompts()) {
        Assert.fail("There were no prompts");
    }
    return this.browserbot.getNextPrompt();
};

Selenium.prototype.getLocation = function() {
    /** Gets the absolute URL of the current page.
   *
   * @return string the absolute URL of the current page
   */
    return this.browserbot.getCurrentWindow().location;
};

Selenium.prototype.getTitle = function() {
    /** Gets the title of the current page.
   *
   * @return string the title of the current page
   */
    return this.browserbot.getTitle();
};


Selenium.prototype.getBodyText = function() {
    /**
     * Gets the entire text of the page.
     * @return string the entire text of the page
     */
    return this.browserbot.bodyText();
};


Selenium.prototype.getValue = function(locator) {
  /**
   * Gets the (whitespace-trimmed) value of an input field (or anything else with a value parameter).
   * For checkbox/radio elements, the value will be "on" or "off" depending on
   * whether the element is checked or not.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @return string the element value, or "on/off" for checkbox/radio elements
   */
    var element = this.browserbot.findElement(locator)
    return getInputValue(element).trim();
}

Selenium.prototype.getText = function(locator) {
    /**
   * Gets the text of an element. This works for any element that contains
   * text. This command uses either the textContent (Mozilla-like browsers) or
   * the innerText (IE-like browsers) of the element, which is the rendered
   * text shown to the user.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @return string the text of the element
   */
    var element = this.browserbot.findElement(locator);
    return getText(element).trim();
};

Selenium.prototype.doHighlight = function(locator) {
    /**
    * Briefly changes the backgroundColor of the specified element yellow.  Useful for debugging.
    * 
    * @param locator an <a href="#locators">element locator</a>
    */
    var element = this.browserbot.findElement(locator);
    this.browserbot.highlight(element, true);
};

Selenium.prototype.getEval = function(script) {
    /** Gets the result of evaluating the specified JavaScript snippet.  The snippet may
   * have multiple lines, but only the result of the last line will be returned.
   *
   * <p>Note that, by default, the snippet will run in the context of the "selenium"
   * object itself, so <code>this</code> will refer to the Selenium object, and <code>window</code> will
   * refer to the top-level runner test window, not the window of your application.</p>
   *
   * <p>If you need a reference to the window of your application, you can refer
   * to <code>this.browserbot.getCurrentWindow()</code> and if you need to use
   * a locator to refer to a single element in your application page, you can
   * use <code>this.browserbot.findElement("foo")</code> where "foo" is your locator.</p>
   *
   * @param script the JavaScript snippet to run
   * @return string the results of evaluating the snippet
   */
    try {
        var result = eval(script);
        // Selenium RC doesn't allow returning null
        if (null == result) return "null";
        return result;
    } catch (e) {
        throw new SeleniumError("Threw an exception: " + e.message);
    }
};

Selenium.prototype.isChecked = function(locator) {
    /**
   * Gets whether a toggle-button (checkbox/radio) is checked.  Fails if the specified element doesn't exist or isn't a toggle-button.
   * @param locator an <a href="#locators">element locator</a> pointing to a checkbox or radio button
   * @return boolean true if the checkbox is checked, false otherwise
   */
    var element = this.browserbot.findElement(locator);
    if (element.checked == null) {
        throw new SeleniumError("Element " + locator + " is not a toggle-button.");
    }
    return element.checked;
};

Selenium.prototype.getTable = function(tableCellAddress) {
    /**
   * Gets the text from a cell of a table. The cellAddress syntax
   * tableLocator.row.column, where row and column start at 0.
   *
   * @param tableCellAddress a cell address, e.g. "foo.1.4"
   * @return string the text from the specified cell
   */
    // This regular expression matches "tableName.row.column"
    // For example, "mytable.3.4"
    pattern = /(.*)\.(\d+)\.(\d+)/;

    if(!pattern.test(tableCellAddress)) {
        throw new SeleniumError("Invalid target format. Correct format is tableName.rowNum.columnNum");
    }

    pieces = tableCellAddress.match(pattern);

    tableName = pieces[1];
    row = pieces[2];
    col = pieces[3];

    var table = this.browserbot.findElement(tableName);
    if (row > table.rows.length) {
        Assert.fail("Cannot access row " + row + " - table has " + table.rows.length + " rows");
    }
    else if (col > table.rows[row].cells.length) {
        Assert.fail("Cannot access column " + col + " - table row has " + table.rows[row].cells.length + " columns");
    }
    else {
        actualContent = getText(table.rows[row].cells[col]);
        return actualContent.trim();
    }
    return null;
};

Selenium.prototype.getSelectedLabels = function(selectLocator) {
    /** Gets all option labels (visible text) for selected options in the specified select or multi-select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string[] an array of all selected option labels in the specified select drop-down
   */
    return this.findSelectedOptionProperties(selectLocator, "text").join(",");
}

Selenium.prototype.getSelectedLabel = function(selectLocator) {
    /** Gets option label (visible text) for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string the selected option label in the specified select drop-down
   */
    return this.findSelectedOptionProperty(selectLocator, "text");
}

Selenium.prototype.getSelectedValues = function(selectLocator) {
    /** Gets all option values (value attributes) for selected options in the specified select or multi-select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string[] an array of all selected option values in the specified select drop-down
   */
    return this.findSelectedOptionProperties(selectLocator, "value").join(",");
}

Selenium.prototype.getSelectedValue = function(selectLocator) {
    /** Gets option value (value attribute) for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string the selected option value in the specified select drop-down
   */
    return this.findSelectedOptionProperty(selectLocator, "value");
}

Selenium.prototype.getSelectedIndexes = function(selectLocator) {
    /** Gets all option indexes (option number, starting at 0) for selected options in the specified select or multi-select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string[] an array of all selected option indexes in the specified select drop-down
   */
    return this.findSelectedOptionProperties(selectLocator, "index").join(",");
}

Selenium.prototype.getSelectedIndex = function(selectLocator) {
    /** Gets option index (option number, starting at 0) for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string the selected option index in the specified select drop-down
   */
    return this.findSelectedOptionProperty(selectLocator, "index");
}

Selenium.prototype.getSelectedIds = function(selectLocator) {
    /** Gets all option element IDs for selected options in the specified select or multi-select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string[] an array of all selected option IDs in the specified select drop-down
   */
    return this.findSelectedOptionProperties(selectLocator, "id").join(",");
}

Selenium.prototype.getSelectedId = function(selectLocator) {
    /** Gets option element ID for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string the selected option ID in the specified select drop-down
   */
    return this.findSelectedOptionProperty(selectLocator, "id");
}

Selenium.prototype.isSomethingSelected = function(selectLocator) {
    /** Determines whether some option in a drop-down menu is selected.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return boolean true if some option has been selected, false otherwise
   */
    var element = this.browserbot.findElement(selectLocator);
    if (!("options" in element)) {
        throw new SeleniumError("Specified element is not a Select (has no options)");
    }

    var selectedOptions = [];

    for (var i = 0; i < element.options.length; i++) {
        if (element.options[i].selected)
        {
            return true;
        }
    }
    return false;
}

Selenium.prototype.findSelectedOptionProperties = function(locator, property) {
   var element = this.browserbot.findElement(locator);
   if (!("options" in element)) {
        throw new SeleniumError("Specified element is not a Select (has no options)");
    }

    var selectedOptions = [];

    for (var i = 0; i < element.options.length; i++) {
        if (element.options[i].selected)
        {
            var propVal = element.options[i][property];
            if (propVal.replace) {
                propVal.replace(/,/g, "\\,");
            }
            selectedOptions.push(propVal);
        }
    }
    if (selectedOptions.length == 0) Assert.fail("No option selected");
    return selectedOptions;
}

Selenium.prototype.findSelectedOptionProperty = function(locator, property) {
    var selectedOptions = this.findSelectedOptionProperties(locator, property);
    if (selectedOptions.length > 1) {
        Assert.fail("More than one selected option!");
    }
    return selectedOptions[0];
}

Selenium.prototype.getSelectOptions = function(selectLocator) {
    /** Gets all option labels in the specified select drop-down.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string[] an array of all option labels in the specified select drop-down
   */
    var element = this.browserbot.findElement(selectLocator);

    var selectOptions = [];

    for (var i = 0; i < element.options.length; i++) {
        var option = element.options[i].text.replace(/,/g, "\\,");
        selectOptions.push(option);
    }

    return selectOptions.join(",");
};


Selenium.prototype.getAttribute = function(attributeLocator) {
    /**
   * Gets the value of an element attribute.
   *
   * @param attributeLocator an element locator followed by an @ sign and then the name of the attribute, e.g. "foo@bar"
   * @return string the value of the specified attribute
   */
   var result = this.browserbot.findAttribute(attributeLocator);
   if (result == null) {
           throw new SeleniumError("Could not find element attribute: " + attributeLocator);
    }
    return result;
};

Selenium.prototype.isTextPresent = function(pattern) {
    /**
   * Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
   * @param pattern a <a href="#patterns">pattern</a> to match with the text of the page
   * @return boolean true if the pattern matches the text, false otherwise
   */
    var allText = this.browserbot.bodyText();

    var patternMatcher = new PatternMatcher(pattern);
    if (patternMatcher.strategy == PatternMatcher.strategies.glob) {
            if (pattern.indexOf("glob:")==0) {
                    pattern = pattern.substring("glob:".length); // strip off "glob:"
                }
        patternMatcher.matcher = new PatternMatcher.strategies.globContains(pattern);
    }
    else if (patternMatcher.strategy == PatternMatcher.strategies.exact) {
                pattern = pattern.substring("exact:".length); // strip off "exact:"
        return allText.indexOf(pattern) != -1;
    }
    return patternMatcher.matches(allText);
};

Selenium.prototype.isElementPresent = function(locator) {
    /**
   * Verifies that the specified element is somewhere on the page.
   * @param locator an <a href="#locators">element locator</a>
   * @return boolean true if the element is present, false otherwise
   */
    try {
        this.browserbot.findElement(locator);
    } catch (e) {
        return false;
    }
    return true;
};

Selenium.prototype.isVisible = function(locator) {
    /**
   * Determines if the specified element is visible. An
   * element can be rendered invisible by setting the CSS "visibility"
   * property to "hidden", or the "display" property to "none", either for the
   * element itself or one if its ancestors.  This method will fail if
   * the element is not present.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @return boolean true if the specified element is visible, false otherwise
   */
    var element;
    element = this.browserbot.findElement(locator);
    var visibility = this.findEffectiveStyleProperty(element, "visibility");
    var _isDisplayed = this._isDisplayed(element);
    return (visibility != "hidden" && _isDisplayed);
};

Selenium.prototype.findEffectiveStyleProperty = function(element, property) {
    var effectiveStyle = this.findEffectiveStyle(element);
    var propertyValue = effectiveStyle[property];
    if (propertyValue == 'inherit' && element.parentNode.style) {
        return this.findEffectiveStyleProperty(element.parentNode, property);
    }
    return propertyValue;
};

Selenium.prototype._isDisplayed = function(element) {
    var display = this.findEffectiveStyleProperty(element, "display");
    if (display == "none") return false;
    if (element.parentNode.style) {
        return this._isDisplayed(element.parentNode);
    }
    return true;
};

Selenium.prototype.findEffectiveStyle = function(element) {
    if (element.style == undefined) {
        return undefined; // not a styled element
    }
    var window = this.browserbot.getCurrentWindow();
    if (window.getComputedStyle) {
        // DOM-Level-2-CSS
        return window.getComputedStyle(element, null);
    }
    if (element.currentStyle) {
        // non-standard IE alternative
        return element.currentStyle;
        // TODO: this won't really work in a general sense, as
        //   currentStyle is not identical to getComputedStyle()
        //   ... but it's good enough for "visibility"
    }
    throw new SeleniumError("cannot determine effective stylesheet in this browser");
};

Selenium.prototype.isEditable = function(locator) {
    /**
   * Determines whether the specified input element is editable, ie hasn't been disabled.
   * This method will fail if the specified element isn't an input element.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @return boolean true if the input element is editable, false otherwise
   */
    var element = this.browserbot.findElement(locator);
    if (element.value == undefined) {
        Assert.fail("Element " + locator + " is not an input.");
    }
    return !element.disabled;
};

Selenium.prototype.getAllButtons = function() {
    /** Returns the IDs of all buttons on the page.
   *
   * <p>If a given button has no ID, it will appear as "" in this array.</p>
   *
   * @return string[] the IDs of all buttons on the page
   */
   return this.browserbot.getAllButtons();
};

Selenium.prototype.getAllLinks = function() {
    /** Returns the IDs of all links on the page.
   *
   * <p>If a given link has no ID, it will appear as "" in this array.</p>
   *
   * @return string[] the IDs of all links on the page
   */
   return this.browserbot.getAllLinks();
};

Selenium.prototype.getAllFields = function() {
    /** Returns the IDs of all input fields on the page.
   *
   * <p>If a given field has no ID, it will appear as "" in this array.</p>
   *
   * @return string[] the IDs of all field on the page
   */
   return this.browserbot.getAllFields();
};

Selenium.prototype.getAttributeFromAllWindows = function(attributeName) {
    /** Returns every instance of some attribute from all known windows.
    *
    * @param attributeName name of an attribute on the windows
    * @return string[] the set of values of this attribute from all known windows.
    */
    var attributes = new Array();
    
    var win = selenium.browserbot.topWindow;
    
    // DGF normally you should use []s instead of eval "win."+attributeName
    // but in this case, attributeName may contain dots (e.g. document.title)
    // in that case, we have no choice but to use eval...
    attributes.push(eval("win."+attributeName));
    for (var windowName in this.browserbot.openedWindows)
    {
        try {
            win = selenium.browserbot.openedWindows[windowName];
            attributes.push(eval("win."+attributeName));
        } catch (e) {} // DGF If we miss one... meh. It's probably closed or inaccessible anyway.
    }
    return attributes;
};

Selenium.prototype.findWindow = function(soughtAfterWindowPropertyValue) {
   var targetPropertyName = "name";
   if (soughtAfterWindowPropertyValue.match("^title=")) {
       targetPropertyName = "document.title";
        soughtAfterWindowPropertyValue = soughtAfterWindowPropertyValue.replace(/^title=/, "");
   }
   else {
       // matching "name":
       // If we are not in proxy injection mode, then the top-level test window will be named myiframe.
        // But as far as the interface goes, we are expected to match a blank string to this window, if
        // we are searching with respect to the widow name.
        // So make a special case so that this logic will work:
        if (PatternMatcher.matches(soughtAfterWindowPropertyValue, "")) {
           return this.browserbot.getCurrentWindow();
        }
   }

   // DGF normally you should use []s instead of eval "win."+attributeName
   // but in this case, attributeName may contain dots (e.g. document.title)
   // in that case, we have no choice but to use eval...
   if (PatternMatcher.matches(soughtAfterWindowPropertyValue, eval("this.browserbot.topWindow." + targetPropertyName))) {
       return this.browserbot.topWindow;
   }
   for (windowName in selenium.browserbot.openedWindows) {
       var openedWindow = selenium.browserbot.openedWindows[windowName];
       if (PatternMatcher.matches(soughtAfterWindowPropertyValue, eval("openedWindow." + targetPropertyName))) {
            return openedWindow;
        }
   }
   throw new SeleniumError("could not find window with property " + targetPropertyName + " matching " + soughtAfterWindowPropertyValue);
};

Selenium.prototype.doDragdrop = function(locator, movementsString) {
/** deprecated - use dragAndDrop instead
   *
   * @param locator an element locator
   * @param movementsString offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
   */
   this.doDragAndDrop(locator, movementsString);
};

Selenium.prototype.doSetMouseSpeed = function(pixels) {
    /** Configure the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
    * <p>Setting this value to 0 means that we'll send a "mousemove" event to every single pixel
    * in between the start location and the end location; that can be very slow, and may
    * cause some browsers to force the JavaScript to timeout.</p>
    * 
    * <p>If the mouse speed is greater than the distance between the two dragged objects, we'll
    * just send one "mousemove" at the start location and then one final one at the end location.</p>
    * @param pixels the number of pixels between "mousemove" events
    */
    this.mouseSpeed = pixels;
}
 
Selenium.prototype.getMouseSpeed = function() {
    /** Returns the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
    * 
    * @return number the number of pixels between "mousemove" events during dragAndDrop commands (default=10)
    */
    this.mouseSpeed = pixels;
}


Selenium.prototype.doDragAndDrop = function(locator, movementsString) {
    /** Drags an element a certain distance and then drops it
    * @param locator an element locator
    * @param movementsString offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
    */
    var element = this.browserbot.findElement(locator);
    var clientStartXY = getClientXY(element)
    var clientStartX = clientStartXY[0];
    var clientStartY = clientStartXY[1];
    
    var movements = movementsString.split(/,/);
    var movementX = Number(movements[0]);
    var movementY = Number(movements[1]);
    
    var clientFinishX = ((clientStartX + movementX) < 0) ? 0 : (clientStartX + movementX);
    var clientFinishY = ((clientStartY + movementY) < 0) ? 0 : (clientStartY + movementY);
    
    var mouseSpeed = this.mouseSpeed;
    var move = function(current, dest) {
        if (current == dest) return current;
        if (Math.abs(current - dest) < mouseSpeed) return dest;
        return (current < dest) ? current + mouseSpeed : current - mouseSpeed;
    }
    
    this.browserbot.triggerMouseEvent(element, 'mousedown', true, clientStartX, clientStartY);
    this.browserbot.triggerMouseEvent(element, 'mousemove',   true, clientStartX, clientStartY);
    var clientX = clientStartX;
    var clientY = clientStartY;
    
    while ((clientX != clientFinishX) || (clientY != clientFinishY)) {
        clientX = move(clientX, clientFinishX);
        clientY = move(clientY, clientFinishY);
        this.browserbot.triggerMouseEvent(element, 'mousemove', true, clientX, clientY);
    }
    
    this.browserbot.triggerMouseEvent(element, 'mousemove',   true, clientFinishX, clientFinishY);
    this.browserbot.triggerMouseEvent(element, 'mouseup',   true, clientFinishX, clientFinishY);
};

Selenium.prototype.doDragAndDropToObject = function(locatorOfObjectToBeDragged, locatorOfDragDestinationObject) {
/** Drags an element and drops it on another element
   *
   * @param locatorOfObjectToBeDragged an element to be dragged
   * @param locatorOfDragDestinationObject an element whose location (i.e., whose center-most pixel) will be the point where locatorOfObjectToBeDragged  is dropped
   */
   var startX = this.getElementPositionLeft(locatorOfObjectToBeDragged);
   var startY = this.getElementPositionTop(locatorOfObjectToBeDragged);
   
   var destinationLeftX = this.getElementPositionLeft(locatorOfDragDestinationObject);
   var destinationTopY = this.getElementPositionTop(locatorOfDragDestinationObject);
   var destinationWidth = this.getElementWidth(locatorOfDragDestinationObject);
   var destinationHeight = this.getElementHeight(locatorOfDragDestinationObject);

   var endX = Math.round(destinationLeftX + (destinationWidth / 2));
   var endY = Math.round(destinationTopY + (destinationHeight / 2));
   
   var deltaX = endX - startX;
   var deltaY = endY - startY;
   
   var movementsString = "" + deltaX + "," + deltaY;
   
   this.doDragAndDrop(locatorOfObjectToBeDragged, movementsString);
};

Selenium.prototype.doWindowFocus = function(windowName) {
/** Gives focus to a window
   *
   * @param windowName name of the window to be given focus
   */
   this.findWindow(windowName).focus();
};


Selenium.prototype.doWindowMaximize = function(windowName) {
/** Resize window to take up the entire screen
   *
   * @param windowName name of the window to be enlarged
   */
   var window = this.findWindow(windowName);
   if (window!=null && window.screen) {
       window.moveTo(0,0);
        window.outerHeight = screen.availHeight;
        window.outerWidth = screen.availWidth;
   }
};

Selenium.prototype.getAllWindowIds = function() {
  /** Returns the IDs of all windows that the browser knows about.
   *
   * @return string[] the IDs of all windows that the browser knows about.
   */
   return this.getAttributeFromAllWindows("id");
};

Selenium.prototype.getAllWindowNames = function() {
  /** Returns the names of all windows that the browser knows about.
   *
   * @return string[] the names of all windows that the browser knows about.
   */
   return this.getAttributeFromAllWindows("name");
};

Selenium.prototype.getAllWindowTitles = function() {
  /** Returns the titles of all windows that the browser knows about.
   *
   * @return string[] the titles of all windows that the browser knows about.
   */
   return this.getAttributeFromAllWindows("document.title");
};

Selenium.prototype.getHtmlSource = function() {
    /** Returns the entire HTML source between the opening and
   * closing "html" tags.
   *
   * @return string the entire HTML source
   */
    return this.browserbot.getDocument().getElementsByTagName("html")[0].innerHTML;
};

Selenium.prototype.doSetCursorPosition = function(locator, position) {
    /**
   * Moves the text cursor to the specified position in the given input element or textarea.
   * This method will fail if the specified element isn't an input element or textarea.
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an input element or textarea
   * @param position the numerical position of the cursor in the field; position should be 0 to move the position to the beginning of the field.  You can also set the cursor to -1 to move it to the end of the field.
   */
   var element = this.browserbot.findElement(locator);
    if (element.value == undefined) {
        Assert.fail("Element " + locator + " is not an input.");
    }
    if (position == -1) {
        position = element.value.length;
    }

   if( element.setSelectionRange && !browserVersion.isOpera) {
       element.focus();
        element.setSelectionRange(/*start*/position,/*end*/position);
   }
   else if( element.createTextRange ) {
      triggerEvent(element, 'focus', false);
      var range = element.createTextRange();
      range.collapse(true);
      range.moveEnd('character',position);
      range.moveStart('character',position);
      range.select();
   }
}

Selenium.prototype.getElementIndex = function(locator) {
    /**
     * Get the relative index of an element to its parent (starting from 0). The comment node and empty text node
     * will be ignored.
     *
     * @param locator an <a href="#locators">element locator</a> pointing to an element
     * @return number of relative index of the element to its parent (starting from 0)
     */
    var element = this.browserbot.findElement(locator);
    var previousSibling;
    var index = 0;
    while ((previousSibling = element.previousSibling) != null) {
        if (!this._isCommentOrEmptyTextNode(previousSibling)) {
            index++;
        }
        element = previousSibling;
    }
    return index;
}

Selenium.prototype.isOrdered = function(locator1, locator2) {
    /**
     * Check if these two elements have same parent and are ordered. Two same elements will
     * not be considered ordered.
     *
     * @param locator1 an <a href="#locators">element locator</a> pointing to the first element
     * @param locator2 an <a href="#locators">element locator</a> pointing to the second element
     * @return boolean true if two elements are ordered and have same parent, false otherwise
     */
    var element1 = this.browserbot.findElement(locator1);
    var element2 = this.browserbot.findElement(locator2);
    if (element1 === element2) return false;

    var previousSibling;
    while ((previousSibling = element2.previousSibling) != null) {
        if (previousSibling === element1) {
            return true;
        }
        element2 = previousSibling;
    }
    return false;
}

Selenium.prototype._isCommentOrEmptyTextNode = function(node) {
    return node.nodeType == 8 || ((node.nodeType == 3) && !(/[^\t\n\r ]/.test(node.data)));
}

Selenium.prototype.getElementPositionLeft = function(locator) {
   /**
   * Retrieves the horizontal position of an element
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an element OR an element itself
   * @return number of pixels from the edge of the frame.
   */
       var element;
        if ("string"==typeof locator) {
            element = this.browserbot.findElement(locator);
        }
        else {
            element = locator;
        }
    var x = element.offsetLeft;
    var elementParent = element.offsetParent;

    while (elementParent != null)
    {
        if(document.all)
        {
            if( (elementParent.tagName != "TABLE") && (elementParent.tagName != "BODY") )
            {
                x += elementParent.clientLeft;
            }
        }
        else // Netscape/DOM
        {
            if(elementParent.tagName == "TABLE")
            {
                var parentBorder = parseInt(elementParent.border);
                if(isNaN(parentBorder))
                {
                    var parentFrame = elementParent.getAttribute('frame');
                    if(parentFrame != null)
                    {
                        x += 1;
                    }
                }
                else if(parentBorder > 0)
                {
                    x += parentBorder;
                }
            }
        }
        x += elementParent.offsetLeft;
        elementParent = elementParent.offsetParent;
    }
    return x;
};

Selenium.prototype.getElementPositionTop = function(locator) {
   /**
   * Retrieves the vertical position of an element
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an element OR an element itself
   * @return number of pixels from the edge of the frame.
   */
       var element;
        if ("string"==typeof locator) {
            element = this.browserbot.findElement(locator);
        }
        else {
            element = locator;
        }

       var y = 0;

       while (element != null)
    {
        if(document.all)
        {
            if( (element.tagName != "TABLE") && (element.tagName != "BODY") )
            {
            y += element.clientTop;
            }
        }
        else // Netscape/DOM
        {
            if(element.tagName == "TABLE")
            {
            var parentBorder = parseInt(element.border);
            if(isNaN(parentBorder))
            {
                var parentFrame = element.getAttribute('frame');
                if(parentFrame != null)
                {
                    y += 1;
                }
            }
            else if(parentBorder > 0)
            {
                y += parentBorder;
            }
            }
        }
        y += element.offsetTop;

            // Netscape can get confused in some cases, such that the height of the parent is smaller
            // than that of the element (which it shouldn't really be). If this is the case, we need to
            // exclude this element, since it will result in too large a 'top' return value.
            if (element.offsetParent && element.offsetParent.offsetHeight && element.offsetParent.offsetHeight < element.offsetHeight)
            {
                // skip the parent that's too small
                element = element.offsetParent.offsetParent;
            }
            else
            {
            // Next up...
            element = element.offsetParent;
        }
       }
    return y;
};

Selenium.prototype.getElementWidth = function(locator) {
   /**
   * Retrieves the width of an element
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an element
   * @return number width of an element in pixels
   */
   var element = this.browserbot.findElement(locator);
   return element.offsetWidth;
};

Selenium.prototype.getElementHeight = function(locator) {
   /**
   * Retrieves the height of an element
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an element
   * @return number height of an element in pixels
   */
   var element = this.browserbot.findElement(locator);
   return element.offsetHeight;
};

Selenium.prototype.getCursorPosition = function(locator) {
    /**
   * Retrieves the text cursor position in the given input element or textarea; beware, this may not work perfectly on all browsers.
   *
   * <p>Specifically, if the cursor/selection has been cleared by JavaScript, this command will tend to
   * return the position of the last location of the cursor, even though the cursor is now gone from the page.  This is filed as <a href="http://jira.openqa.org/browse/SEL-243">SEL-243</a>.</p>
   * This method will fail if the specified element isn't an input element or textarea, or there is no cursor in the element.
   *
   * @param locator an <a href="#locators">element locator</a> pointing to an input element or textarea
   * @return number the numerical position of the cursor in the field
   */
    var element = this.browserbot.findElement(locator);
    var doc = this.browserbot.getDocument();
    var win = this.browserbot.getCurrentWindow();
    if( doc.selection && !browserVersion.isOpera){
        try {
            var selectRange = doc.selection.createRange().duplicate();
            var elementRange = element.createTextRange();
            selectRange.move("character",0);
            elementRange.move("character",0);
            var inRange1 = selectRange.inRange(elementRange);
            var inRange2 = elementRange.inRange(selectRange);
            elementRange.setEndPoint("EndToEnd", selectRange);
        } catch (e) {
            Assert.fail("There is no cursor on this page!");
        }
        var answer = String(elementRange.text).replace(/\r/g,"").length;
        return answer;
    } else {
        if (typeof(element.selectionStart) != "undefined") {
            if (win.getSelection && typeof(win.getSelection().rangeCount) != undefined && win.getSelection().rangeCount == 0) {
                Assert.fail("There is no cursor on this page!");
            }
            return element.selectionStart;
        }
    }
    throw new Error("Couldn't detect cursor position on this browser!");
}


Selenium.prototype.doSetContext = function(context, logLevelThreshold) {
    /**
   * Writes a message to the status bar and adds a note to the browser-side
   * log.
   *
   * <p>If logLevelThreshold is specified, set the threshold for logging
   * to that level (debug, info, warn, error).</p>
   *
   * <p>(Note that the browser-side logs will <i>not</i> be sent back to the
   * server, and are invisible to the Client Driver.)</p>
   *
   * @param context
   *            the message to be sent to the browser
   * @param logLevelThreshold one of "debug", "info", "warn", "error", sets the threshold for browser-side logging
   */
    if  (logLevelThreshold==null || logLevelThreshold=="") {
        return this.browserbot.setContext(context);
    }
    return this.browserbot.setContext(context, logLevelThreshold);
};

Selenium.prototype.getExpression = function(expression) {
    /**
     * Returns the specified expression.
     *
     * <p>This is useful because of JavaScript preprocessing.
     * It is used to generate commands like assertExpression and waitForExpression.</p>
     *
     * @param expression the value to return
     * @return string the value passed in
     */
    return expression;
}

Selenium.prototype.doWaitForCondition = function(script, timeout) {
    /**
   * Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
   * The snippet may have multiple lines, but only the result of the last line
   * will be considered.
   *
   * <p>Note that, by default, the snippet will be run in the runner's test window, not in the window
   * of your application.  To get the window of your application, you can use
   * the JavaScript snippet <code>selenium.browserbot.getCurrentWindow()</code>, and then
   * run your JavaScript in there</p>
   * @param script the JavaScript snippet to run
   * @param timeout a timeout in milliseconds, after which this command will return with an error
   */
    return Selenium.decorateFunctionWithTimeout(function () {
        return eval(script);
    }, timeout);
};

Selenium.prototype.doWaitForCondition.dontCheckAlertsAndConfirms = true;

Selenium.prototype.doSetTimeout = function(timeout) {
    /**
     * Specifies the amount of time that Selenium will wait for actions to complete.
     *
     * <p>Actions that require waiting include "open" and the "waitFor*" actions.</p>
     * The default timeout is 30 seconds.
     * @param timeout a timeout in milliseconds, after which the action will return with an error
     */
    if (!timeout) {
        timeout = Selenium.DEFAULT_TIMEOUT;
    }
    this.defaultTimeout = timeout;
}

Selenium.prototype.doWaitForPageToLoad = function(timeout) {
    /**
     * Waits for a new page to load.
     *
     * <p>You can use this command instead of the "AndWait" suffixes, "clickAndWait", "selectAndWait", "typeAndWait" etc.
     * (which are only available in the JS API).</p>
     *
     * <p>Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
     * flag when it first notices a page load.  Running any other Selenium command after
     * turns the flag to false.  Hence, if you want to wait for a page to load, you must
     * wait immediately after a Selenium command that caused a page-load.</p>
     * @param timeout a timeout in milliseconds, after which this command will return with an error
     */
    // in pi-mode, the test and the harness share the window; thus if we are executing this code, then we have loaded
    if (window["proxyInjectionMode"] == null || !window["proxyInjectionMode"]) {
        return this.makePageLoadCondition(timeout);
    }
};

Selenium.prototype._isNewPageLoaded = function() {
    return this.browserbot.isNewPageLoaded();
};

Selenium.prototype.doWaitForPageToLoad.dontCheckAlertsAndConfirms = true;

/**
 * Evaluate a parameter, performing JavaScript evaluation and variable substitution.
 * If the string matches the pattern "javascript{ ... }", evaluate the string between the braces.
 */
Selenium.prototype.preprocessParameter = function(value) {
    var match = value.match(/^javascript\{((.|\r?\n)+)\}$/);
    if (match && match[1]) {
        return eval(match[1]).toString();
    }
    return this.replaceVariables(value);
};

/*
 * Search through str and replace all variable references ${varName} with their
 * value in storedVars.
 */
Selenium.prototype.replaceVariables = function(str) {
    var stringResult = str;

    // Find all of the matching variable references
    var match = stringResult.match(/\$\{\w+\}/g);
    if (!match) {
        return stringResult;
    }

    // For each match, lookup the variable value, and replace if found
    for (var i = 0; match && i < match.length; i++) {
        var variable = match[i]; // The replacement variable, with ${}
        var name = variable.substring(2, variable.length - 1); // The replacement variable without ${}
        var replacement = storedVars[name];
        if (replacement != undefined) {
            stringResult = stringResult.replace(variable, replacement);
        }
    }
    return stringResult;
};

Selenium.prototype.getCookie = function() {
    /**
     * Return all cookies of the current page under test.
     *
     * @return string all cookies of the current page under test
     */
    var doc = this.browserbot.getDocument();
    return doc.cookie;
};

Selenium.prototype.doCreateCookie = function(nameValuePair, optionsString) {
    /**
     * Create a new cookie whose path and domain are same with those of current page
     * under test, unless you specified a path for this cookie explicitly.
     *
     * @param nameValuePair name and value of the cookie in a format "name=value"
     * @param optionsString options for the cookie. Currently supported options include 'path' and 'max_age'.
     *      the optionsString's format is "path=/path/, max_age=60". The order of options are irrelevant, the unit
     *      of the value of 'max_age' is second.
     */
    var results = /[^\s=\[\]\(\),"\/\?@:;]+=[^\s=\[\]\(\),"\/\?@:;]*/.test(nameValuePair);
    if (!results) {
        throw new SeleniumError("Invalid parameter.");
    }
    var cookie = nameValuePair.trim();
    results = /max_age=(\d+)/.exec(optionsString);
    if (results) {
        var expireDateInMilliseconds = (new Date()).getTime() + results[1] * 1000;
        cookie += "; expires=" + new Date(expireDateInMilliseconds).toGMTString();
    }
    results = /path=([^\s,]+)[,]?/.exec(optionsString);
    if (results) {
        var path = results[1];
        if (browserVersion.khtml) {
            // Safari and conquerer don't like paths with / at the end
            if ("/" != path) {
                path = path.replace(/\/$/, "");
            }
        }
        cookie += "; path=" + path;
    }
    LOG.debug("Setting cookie to: " + cookie);
    this.browserbot.getDocument().cookie = cookie;
}

Selenium.prototype.doDeleteCookie = function(name,path) {
    /**
     * Delete a named cookie with specified path.
     *
     * @param name the name of the cookie to be deleted
     * @param path the path property of the cookie to be deleted
     */
    // set the expire time of the cookie to be deleted to one minute before now.
    path = path.trim();
    if (browserVersion.khtml) {
        // Safari and conquerer don't like paths with / at the end
        if ("/" != path) {
            path = path.replace(/\/$/, "");
        }
    }
    var expireDateInMilliseconds = (new Date()).getTime() + (-1 * 1000);
    var cookie = name.trim() + "=deleted; path=" + path + "; expires=" + new Date(expireDateInMilliseconds).toGMTString();
    LOG.debug("Setting cookie to: " + cookie);
    this.browserbot.getDocument().cookie = cookie;
}


/**
 *  Factory for creating "Option Locators".
 *  An OptionLocator is an object for dealing with Select options (e.g. for
 *  finding a specified option, or asserting that the selected option of 
 *  Select element matches some condition.
 *  The type of locator returned by the factory depends on the locator string:
 *     label=<exp>  (OptionLocatorByLabel)
 *     value=<exp>  (OptionLocatorByValue)
 *     index=<exp>  (OptionLocatorByIndex)
 *     id=<exp>     (OptionLocatorById)
 *     <exp> (default is OptionLocatorByLabel).
 */
function OptionLocatorFactory() {
}

OptionLocatorFactory.prototype.fromLocatorString = function(locatorString) {
    var locatorType = 'label';
    var locatorValue = locatorString;
    // If there is a locator prefix, use the specified strategy
    var result = locatorString.match(/^([a-zA-Z]+)=(.*)/);
    if (result) {
        locatorType = result[1];
        locatorValue = result[2];
    }
    if (this.optionLocators == undefined) {
        this.registerOptionLocators();
    }
    if (this.optionLocators[locatorType]) {
        return new this.optionLocators[locatorType](locatorValue);
    }
    throw new SeleniumError("Unkown option locator type: " + locatorType);
};

/**
 * To allow for easy extension, all of the option locators are found by
 * searching for all methods of OptionLocatorFactory.prototype that start
 * with "OptionLocatorBy".
 * TODO: Consider using the term "Option Specifier" instead of "Option Locator".
 */
OptionLocatorFactory.prototype.registerOptionLocators = function() {
    this.optionLocators={};
    for (var functionName in this) {
      var result = /OptionLocatorBy([A-Z].+)$/.exec(functionName);
      if (result != null) {
          var locatorName = result[1].lcfirst();
          this.optionLocators[locatorName] = this[functionName];
      }
    }
};

/**
 *  OptionLocator for options identified by their labels.
 */
OptionLocatorFactory.prototype.OptionLocatorByLabel = function(label) {
    this.label = label;
    this.labelMatcher = new PatternMatcher(this.label);
    this.findOption = function(element) {
        for (var i = 0; i < element.options.length; i++) {
            if (this.labelMatcher.matches(element.options[i].text)) {
                return element.options[i];
            }
        }
        throw new SeleniumError("Option with label '" + this.label + "' not found");
    };

    this.assertSelected = function(element) {
        var selectedLabel = element.options[element.selectedIndex].text;
        Assert.matches(this.label, selectedLabel)
    };
};

/**
 *  OptionLocator for options identified by their values.
 */
OptionLocatorFactory.prototype.OptionLocatorByValue = function(value) {
    this.value = value;
    this.valueMatcher = new PatternMatcher(this.value);
    this.findOption = function(element) {
        for (var i = 0; i < element.options.length; i++) {
            if (this.valueMatcher.matches(element.options[i].value)) {
                return element.options[i];
            }
        }
        throw new SeleniumError("Option with value '" + this.value + "' not found");
    };

    this.assertSelected = function(element) {
        var selectedValue = element.options[element.selectedIndex].value;
        Assert.matches(this.value, selectedValue)
    };
};

/**
 *  OptionLocator for options identified by their index.
 */
OptionLocatorFactory.prototype.OptionLocatorByIndex = function(index) {
    this.index = Number(index);
    if (isNaN(this.index) || this.index < 0) {
        throw new SeleniumError("Illegal Index: " + index);
    }

    this.findOption = function(element) {
        if (element.options.length <= this.index) {
            throw new SeleniumError("Index out of range.  Only " + element.options.length + " options available");
        }
        return element.options[this.index];
    };

    this.assertSelected = function(element) {
        Assert.equals(this.index, element.selectedIndex);
    };
};

/**
 *  OptionLocator for options identified by their id.
 */
OptionLocatorFactory.prototype.OptionLocatorById = function(id) {
    this.id = id;
    this.idMatcher = new PatternMatcher(this.id);
    this.findOption = function(element) {
        for (var i = 0; i < element.options.length; i++) {
            if (this.idMatcher.matches(element.options[i].id)) {
                return element.options[i];
            }
        }
        throw new SeleniumError("Option with id '" + this.id + "' not found");
    };

    this.assertSelected = function(element) {
        var selectedId = element.options[element.selectedIndex].id;
        Assert.matches(this.id, selectedId)
    };
};
