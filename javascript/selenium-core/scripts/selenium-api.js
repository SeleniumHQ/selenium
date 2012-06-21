/*
 * Copyright 2011 Software Freedom Conservancy
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
     * Select the element with the specified &#064;id attribute. If no match is
     * found, select the first element whose &#064;name attribute is <em>id</em>.
     * (This is normally the default; see below.)</li>
     * <li><strong>id</strong>=<em>id</em>:
     * Select the element with the specified &#064;id attribute.</li>
     *
     * <li><strong>name</strong>=<em>name</em>:
     * Select the first element with the specified &#064;name attribute.
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
     * <li>xpath=//img[&#064;alt='The image alt text']</li>
     * <li>xpath=//table[&#064;id='table1']//tr[4]/td[2]</li>
     * <li>xpath=//a[contains(&#064;href,'#id1')]</li>
     * <li>xpath=//a[contains(&#064;href,'#id1')]/&#064;class</li>
     * <li>xpath=(//table[&#064;class='stylee'])//th[text()='theHeaderText']/../td</li>
     * <li>xpath=//input[&#064;name='name2' and &#064;value='yes']</li>
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
     * 
     * <li><strong>ui</strong>=<em>uiSpecifierString</em>:
     * Locate an element by resolving the UI specifier string to another locator, and evaluating it. See the <a href="http://svn.openqa.org/fisheye/browse/~raw,r=trunk/selenium/trunk/src/main/resources/core/scripts/ui-doc.html">Selenium UI-Element Reference</a> for more details.
     * <ul class="first last simple">
     * <li>ui=loginPages::loginButton()</li>
     * <li>ui=settingsPages::toggle(label=Hide Email)</li>
     * <li>ui=forumPages::postBody(index=2)//a[2]</li>
     * </ul>
     * </li>
     *
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
     * <li><strong>regexpi:</strong><em>regexpi</em>:
     * Match a string using a case-insensitive regular-expression.</li>
     * <li><strong>exact:</strong><em>string</em>:
     *
     * Match a string exactly, verbatim, without any of that fancy wildcard
     * stuff.</li>
     * </ul>
     * <p>
     * If no pattern prefix is specified, Selenium assumes that it's a "glob"
     * pattern.
     * </p>
     * <p>
     * For commands that return multiple values (such as verifySelectOptions),
     * the string being matched is a comma-separated list of the return values,
     * where both commas and backslashes in the values are backslash-escaped.
     * When providing a pattern, the optional matching syntax (i.e. glob,
     * regexp, etc.) is specified once, as usual, at the beginning of the
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
    this.mouseSpeed = Selenium.DEFAULT_MOUSE_SPEED;


    // TODO(simon): This guard should not be necessary. Remove it,
    if (bot && bot.locators && bot.locators.add) {
      bot.locators.add('xpath', {
        single: function(target, opt_root) {
          return browserbot.locateElementByXPath(target, opt_root);
        },
        many: function(target, opt_root) {
          return browserbot.locateElementsByXPath(target, opt_root);
        }
      });

      bot.locators.add('css', {
        single: function(target, opt_root) {
          return browserbot.locateElementByCss(target, opt_root);
        },
        many: function(target, opt_root) {
          return eval_css(target, opt_root);
        }
      });
    }
}

Selenium.DEFAULT_TIMEOUT = 30 * 1000;
Selenium.DEFAULT_MOUSE_SPEED = 10;
Selenium.RIGHT_MOUSE_CLICK = 2;

Selenium.decorateFunctionWithTimeout = function(f, timeout, callback) {
    if (f == null) {
        return null;
    }
    
    var timeoutTime = getTimeoutTime(timeout);
   
    return function() {
        if (new Date().getTime() > timeoutTime) {
            if (callback != null) {
                 callback();
            }
            throw new SeleniumError("Timed out after " + timeout + "ms");
        }
        return f();
    };
};

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
    var elementWithHref = getAncestorOrSelfWithJavascriptHref(element);
   
    if (browserVersion.isChrome && elementWithHref != null) {
        // SEL-621: Firefox chrome: Race condition bug in alert-handling code
        //
        // This appears to be because javascript href's are being executed in a
        // separate thread from the main thread when running in chrome mode.
        //
        // This workaround injects a callback into the executing href that
        // lowers a flag, which is initially raised. Execution of this click
        // command will wait for the flag to be lowered.
        
        var win = elementWithHref.ownerDocument.defaultView;
        var originalLocation = win.location.href.replace(/#.*/,"");
        var originalHref = elementWithHref.href;
        
        var newHref = 'javascript:try { '
            + originalHref.replace(/^\s*javascript:/i, "")
            + ' } finally { window._executingJavascriptHref = undefined; }' ;
        elementWithHref.href = newHref; 
        
        win._executingJavascriptHref = true;

        var savedEvent = null;
        var evtListener =  function(evt) {
          savedEvent = evt;
        };

        element.addEventListener("click", evtListener, false);

        this.browserbot.clickElement(element);

        element.removeEventListener("click", evtListener, false);

        // We're relying on javascript that's owned by
        // elementWithHref getting executed.  It might not
        // get executed if:
        // 1) the click event was cancelled
        // 2) the page changed the href value on us
        // 3) the elementWithHref was removed from the document

        if (savedEvent && savedEvent.getPreventDefault()) {
          // click was canceled by event listener
          win._executingJavascriptHref = undefined;
        } else if (elementWithHref.href != newHref) {
          // the page changed the href value on us
          win._executingJavascriptHref = undefined;
        } else {
          // check that elementWithHref is still in the document
          var d = elementWithHref.ownerDocument;
          var html = d ? d.documentElement : null;
          var curElem = elementWithHref;
          while (curElem && html && (curElem.isSameNode ? !curElem.isSameNode(html) : curElem != html)) {
            curElem = curElem.parentNode;
          }
          if (!html || !curElem) {
            win._executingJavascriptHref = undefined;
          }
        }
        
        return Selenium.decorateFunctionWithTimeout(function() {
            if (win.closed) {
                return true;
            }
            if (win.location.href.replace(/#.*/,"") != originalLocation) {
                // navigated to some other page ... javascript from previous
                // page can't still be executing!
                return true;
            }
            if (! win._executingJavascriptHref) {
                try {
                    elementWithHref.href = originalHref;
                }
                catch (e) {
                    // maybe the javascript removed the element ... should be
                    // no danger in not reverting its href attribute
                }
                return true;
            }
            
            return false;
        }, this.defaultTimeout);
    }
    
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

Selenium.prototype.doContextMenu = function(locator) {
    /**
   * Simulates opening the context menu for the specified element (as might happen if the user "right-clicked" on the element).
   *
   * @param locator an element locator
   *
   */
   var element = this.browserbot.findElement(locator);
   this.browserbot.contextMenuOnElement(element);
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
    this.doMouseMove(locator);
    this.doMouseDown(locator);
    this.browserbot.clickElement(element, clientXY[0], clientXY[1]);
    this.doMouseUp(locator);
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
    this.doMouseMove(locator);
    this.doMouseDown(locator);
    this.browserbot.doubleClickElement(element, clientXY[0], clientXY[1]);
    this.doMouseUp(locator);
};

Selenium.prototype.doContextMenuAt = function(locator, coordString) {
    /**
   * Simulates opening the context menu for the specified element (as might happen if the user "right-clicked" on the element).
   *
   * @param locator an element locator
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse
   *      event relative to the element returned by the locator.
   *
   */
    var element = this.browserbot.findElement(locator);
    var clientXY = getClientXY(element, coordString)
    this.browserbot.contextMenuOnElement(element, clientXY[0], clientXY[1]);
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

Selenium.prototype.doFocus = function(locator) {
    /** Move the focus to the specified element; for example, if the element is an input field, move the cursor to that field.
    *
    * @param locator an <a href="#locators">element locator</a>
    */
    var element = this.browserbot.findElement(locator);
    if (element.focus) {
        element.focus();
    } else {
         triggerEvent(element, "focus", false);
    }
}

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
   core.events.shiftKeyDown_ = true;
};

Selenium.prototype.doShiftKeyUp = function() {
    /**
   * Release the shift key.
   *
   */
   this.browserbot.shiftKeyDown = false;
   core.events.shiftKeyDown_ = false;
};

Selenium.prototype.doMetaKeyDown = function() {
    /**
   * Press the meta key and hold it down until doMetaUp() is called or a new page is loaded.
   *
   */
   this.browserbot.metaKeyDown = true;
   core.events.metaKeyDown_ = true;
};

Selenium.prototype.doMetaKeyUp = function() {
    /**
   * Release the meta key.
   *
   */
   this.browserbot.metaKeyDown = false;
   core.events.metaKeyDown_ = false;
};

Selenium.prototype.doAltKeyDown = function() {
    /**
   * Press the alt key and hold it down until doAltUp() is called or a new page is loaded.
   *
   */
   this.browserbot.altKeyDown = true;
   core.events.altKeyDown_ = true;
};

Selenium.prototype.doAltKeyUp = function() {
    /**
   * Release the alt key.
   *
   */
   this.browserbot.altKeyDown = false;
   core.events.altKeyDown_ = false;
};

Selenium.prototype.doControlKeyDown = function() {
    /**
   * Press the control key and hold it down until doControlUp() is called or a new page is loaded.
   *
   */
   this.browserbot.controlKeyDown = true;
   core.events.controlKeyDown_ = true;
};

Selenium.prototype.doControlKeyUp = function() {
    /**
   * Release the control key.
   *
   */
   this.browserbot.controlKeyDown = false;
   core.events.controlKeyDown_ = false;
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
   * Simulates a user pressing the left mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
   var element = this.browserbot.findElement(locator);
   this.browserbot.triggerMouseEvent(element, 'mousedown', true);
};

Selenium.prototype.doMouseDownRight = function(locator) {
    /**
   * Simulates a user pressing the right mouse button (without releasing it yet) on
   * the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
   var element = this.browserbot.findElement(locator);
   this.browserbot.triggerMouseEvent(element, 'mousedown', true, undefined, undefined, Selenium.RIGHT_MOUSE_CLICK);
};

Selenium.prototype.doMouseDownAt = function(locator, coordString) {
    /**
   * Simulates a user pressing the left mouse button (without releasing it yet) at
   * the specified location.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse
   *      event relative to the element returned by the locator.
   */
    var element = this.browserbot.findElement(locator);
    var clientXY = getClientXY(element, coordString)

    this.browserbot.triggerMouseEvent(element, 'mousedown', true, clientXY[0], clientXY[1]);
};

Selenium.prototype.doMouseDownRightAt = function(locator, coordString) {
    /**
   * Simulates a user pressing the right mouse button (without releasing it yet) at
   * the specified location.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse
   *      event relative to the element returned by the locator.
   */
    var element = this.browserbot.findElement(locator);
    var clientXY = getClientXY(element, coordString)

    this.browserbot.triggerMouseEvent(element, 'mousedown', true, clientXY[0], clientXY[1], Selenium.RIGHT_MOUSE_CLICK);
};

Selenium.prototype.doMouseUp = function(locator) {
    /**
   * Simulates the event that occurs when the user releases the mouse button (i.e., stops
   * holding the button down) on the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
   var element = this.browserbot.findElement(locator);
   this.browserbot.triggerMouseEvent(element, 'mouseup', true);
};

Selenium.prototype.doMouseUpRight = function(locator) {
    /**
   * Simulates the event that occurs when the user releases the right mouse button (i.e., stops
   * holding the button down) on the specified element.
   *
   * @param locator an <a href="#locators">element locator</a>
   */
   var element = this.browserbot.findElement(locator);
   this.browserbot.triggerMouseEvent(element, 'mouseup', true, undefined, undefined, Selenium.RIGHT_MOUSE_CLICK);
};

Selenium.prototype.doMouseUpAt = function(locator, coordString) {
    /**
   * Simulates the event that occurs when the user releases the mouse button (i.e., stops
   * holding the button down) at the specified location.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse
   *      event relative to the element returned by the locator.
   */
    var element = this.browserbot.findElement(locator);
    var clientXY = getClientXY(element, coordString)

    this.browserbot.triggerMouseEvent(element, 'mouseup', true, clientXY[0], clientXY[1]);
};

Selenium.prototype.doMouseUpRightAt = function(locator, coordString) {
    /**
   * Simulates the event that occurs when the user releases the right mouse button (i.e., stops
   * holding the button down) at the specified location.
   *
   * @param locator an <a href="#locators">element locator</a>
   * @param coordString specifies the x,y position (i.e. - 10,20) of the mouse
   *      event relative to the element returned by the locator.
   */
    var element = this.browserbot.findElement(locator);
    var clientXY = getClientXY(element, coordString)

    this.browserbot.triggerMouseEvent(element, 'mouseup', true, clientXY[0], clientXY[1], Selenium.RIGHT_MOUSE_CLICK);
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
	
    var element = this.browserbot.findElement(locator);

	core.events.setValue(element, value);
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

Selenium.prototype.getSpeed = function() {
 /**
 * Get execution speed (i.e., get the millisecond length of the delay following each selenium operation).  By default, there is no such delay, i.e.,
 * the delay is 0 milliseconds.
   *
   * See also setSpeed.
   *
   * @return string the execution speed in milliseconds.
   */
   throw new SeleniumError("this operation is only implemented in selenium-rc, and should never result in a request making it across the wire");
};

Selenium.prototype.findToggleButton = function(locator) {
    var element = this.browserbot.findElement(locator);
    if (element.checked == null) {
        Assert.fail("Element " + locator + " is not a toggle-button.");
    }
    return element;
};

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
    // if the timeout is zero, we won't wait for the page to load before returning
    if (timeout == 0) {
	  // abort XHR request  
          this._abortXhrRequest(); 	   
    	  return;
    }
    return Selenium.decorateFunctionWithTimeout(fnBind(this._isNewPageLoaded, this), timeout, fnBind(this._abortXhrRequest, this));
};

Selenium.prototype.doOpen = function(url, ignoreResponseCode) {
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
   * @param ignoreResponseCode (optional) turn off ajax head request functionality
   *
   */
    if (ignoreResponseCode == null || ignoreResponseCode.length == 0) {
        this.browserbot.ignoreResponseCode = true;
    } else if (ignoreResponseCode.toLowerCase() == "true") {
        this.browserbot.ignoreResponseCode = true;
    } else {
        this.browserbot.ignoreResponseCode = false;
    }
    this.browserbot.openLocation(url);
    if (window["proxyInjectionMode"] == null || !window["proxyInjectionMode"]) {
        return this.makePageLoadCondition();
    } // in PI mode, just return "OK"; the server will waitForLoad
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
   * Selects a popup window using a window locator; once a popup window has been selected, all
   * commands go to that window. To select the main window again, use null
   * as the target.
   *
   * <p>
   * 
   * Window locators provide different ways of specifying the window object:
   * by title, by internal JavaScript "name," or by JavaScript variable.
   * </p>
   * <ul>
   * <li><strong>title</strong>=<em>My Special Window</em>:
   * Finds the window using the text that appears in the title bar.  Be careful;
   * two windows can share the same title.  If that happens, this locator will
   * just pick one.
   * </li>
   * <li><strong>name</strong>=<em>myWindow</em>:
   * Finds the window using its internal JavaScript "name" property.  This is the second 
   * parameter "windowName" passed to the JavaScript method window.open(url, windowName, windowFeatures, replaceFlag)
   * (which Selenium intercepts).
   * </li>
   * <li><strong>var</strong>=<em>variableName</em>:
   * Some pop-up windows are unnamed (anonymous), but are associated with a JavaScript variable name in the current
   * application window, e.g. "window.foo = window.open(url);".  In those cases, you can open the window using
   * "var=foo".
   * </li>
   * </ul>
   * <p>
   * If no window locator prefix is provided, we'll try to guess what you mean like this:</p>
   * <p>1.) if windowID is null, (or the string "null") then it is assumed the user is referring to the original window instantiated by the browser).</p>
   * <p>2.) if the value of the "windowID" parameter is a JavaScript variable name in the current application window, then it is assumed
   * that this variable contains the return value from a call to the JavaScript window.open() method.</p>
   * <p>3.) Otherwise, selenium looks in a hash it maintains that maps string names to window "names".</p>
   * <p>4.) If <em>that</em> fails, we'll try looping over all of the known windows to try to find the appropriate "title".
   * Since "title" is not necessarily unique, this may have unexpected behavior.</p>
   * 
   * <p>If you're having trouble figuring out the name of a window that you want to manipulate, look at the Selenium log messages
   * which identify the names of windows created via window.open (and therefore intercepted by Selenium).  You will see messages
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

Selenium.prototype.doSelectPopUp = function(windowID) {
    /**
    * Simplifies the process of selecting a popup window (and does not offer
    * functionality beyond what <code>selectWindow()</code> already provides).
    * <ul>
    * <li>If <code>windowID</code> is either not specified, or specified as
    * "null", the first non-top window is selected. The top window is the one
    * that would be selected by <code>selectWindow()</code> without providing a
    * <code>windowID</code> . This should not be used when more than one popup
    * window is in play.</li>
    * <li>Otherwise, the window will be looked up considering
    * <code>windowID</code> as the following in order: 1) the "name" of the
    * window, as specified to <code>window.open()</code>; 2) a javascript
    * variable which is a reference to a window; and 3) the title of the
    * window. This is the same ordered lookup performed by
    * <code>selectWindow</code> .</li>
    * </ul>
    *
    * @param windowID  an identifier for the popup window, which can take on a
    *                  number of different meanings
    */
    this.browserbot.selectPopUp(windowID);
};

Selenium.prototype.doDeselectPopUp = function() {
    /**
    * Selects the main window. Functionally equivalent to using
    * <code>selectWindow()</code> and specifying no value for
    * <code>windowID</code>.
    */
    this.browserbot.selectWindow();
}

Selenium.prototype.doSelectFrame = function(locator) {
    /**
    * Selects a frame within the current window.  (You may invoke this command
    * multiple times to select nested frames.)  To select the parent frame, use
    * "relative=parent" as a locator; to select the top frame, use "relative=top".
    * You can also select a frame by its 0-based index number; select the first frame with
    * "index=0", or the third frame with "index=2".
    *
    * <p>You may also use a DOM expression to identify the frame you want directly,
    * like this: <code>dom=frames["main"].frames["subframe"]</code></p>
    *
    * @param locator an <a href="#locators">element locator</a> identifying a frame or iframe
    */
        this.browserbot.selectFrame(locator);
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
    return this.browserbot.doesThisFrameMatchFrameExpression(currentFrameString, target);
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
    * @param windowID the JavaScript window "name" of the window that will appear (not the text of the title bar)
    *                 If unspecified, or specified as "null", this command will
    *                 wait for the first non-top window to appear (don't rely
    *                 on this if you are working with multiple popups
    *                 simultaneously). 
    * @param timeout a timeout in milliseconds, after which the action will return with an error.
    *                If this value is not specified, the default Selenium
    *                timeout will be used. See the setTimeout() command.
    */
    if (! timeout) {
        timeout = this.defaultTimeout;
    }
    var timeoutTime = getTimeoutTime(timeout);
    
    var popupLoadedPredicate = function () {
        var targetWindow;
        try {
            if (windowID && windowID != 'null') {
                targetWindow = selenium.browserbot.getWindowByName(windowID, true);
            }
            else {
                var names = selenium.browserbot.getNonTopWindowNames();
                targetWindow = selenium.browserbot.getWindowByName(names[0], true);
            }
        }
        catch (e) {
            if (new Date().getTime() > timeoutTime) {
                throw e;
            }
        }
        
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
   * <p>
   * By default, Selenium's overridden window.confirm() function will
   * return true, as if the user had manually clicked OK; after running
   * this command, the next call to confirm() will return false, as if
   * the user had clicked Cancel.  Selenium will then resume using the
   * default behavior for future confirmations, automatically returning 
   * true (OK) unless/until you explicitly call this command for each
   * confirmation.
   * </p>
   * <p>
   * Take note - every time a confirmation comes up, you must
   * consume it with a corresponding getConfirmation, or else
   * the next selenium operation will fail.
   * </p>
   */
    this.browserbot.cancelNextConfirmation(false);
};

Selenium.prototype.doChooseOkOnNextConfirmation = function() {
    /**
   * <p>
   * Undo the effect of calling chooseCancelOnNextConfirmation.  Note
   * that Selenium's overridden window.confirm() function will normally automatically
   * return true, as if the user had manually clicked OK, so you shouldn't
   * need to use this command unless for some reason you need to change
   * your mind prior to the next confirmation.  After any confirmation, Selenium will resume using the
   * default behavior for future confirmations, automatically returning 
   * true (OK) unless/until you explicitly call chooseCancelOnNextConfirmation for each
   * confirmation.
   * </p>
   * <p>
   * Take note - every time a confirmation comes up, you must
   * consume it with a corresponding getConfirmation, or else
   * the next selenium operation will fail.
   * </p>
   *
   */
    this.browserbot.cancelNextConfirmation(true);
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
   * alert is generated but you do not consume it with getAlert, the next Selenium action
   * will fail.</p>
   *
   * <p>Under Selenium, JavaScript alerts will NOT pop up a visible alert
   * dialog.</p>
   *
   * <p>Selenium does NOT support JavaScript alerts that are generated in a
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
   * chooseCancelOnNextConfirmation command. 
   * </p>
   * <p>
   * If an confirmation is generated but you do not consume it with getConfirmation,
   * the next Selenium action will fail.
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
    return this.browserbot.getCurrentWindow().location.href;
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
};

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
    return core.text.getText(element);
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
   * object itself, so <code>this</code> will refer to the Selenium object.  Use <code>window</code> to
   * refer to the window of your application, e.g. <code>window.document.getElementById('foo')</code></p>
   *
   * <p>If you need to use
   * a locator to refer to a single element in your application page, you can
   * use <code>this.browserbot.findElement("id=foo")</code> where "id=foo" is your locator.</p>
   *
   * @param script the JavaScript snippet to run
   * @return string the results of evaluating the snippet
   */
    try {
        LOG.info('script is: ' + script);
        var window = this.browserbot.getCurrentWindow();
        var result = eval(script);
        // Selenium RC doesn't allow returning null
        if (null == result) return "null";
        return result;
    } catch (e) {
        throw new SeleniumError("Threw an exception: " + extractExceptionMessage(e));
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
    return this.findSelectedOptionProperties(selectLocator, "text");
};

Selenium.prototype.getSelectedLabel = function(selectLocator) {
    /** Gets option label (visible text) for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string the selected option label in the specified select drop-down
   */
    return this.findSelectedOptionProperty(selectLocator, "text");
};

Selenium.prototype.getSelectedValues = function(selectLocator) {
    /** Gets all option values (value attributes) for selected options in the specified select or multi-select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string[] an array of all selected option values in the specified select drop-down
   */
    return this.findSelectedOptionProperties(selectLocator, "value");
};

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
    return this.findSelectedOptionProperties(selectLocator, "index");
};

Selenium.prototype.getSelectedIndex = function(selectLocator) {
    /** Gets option index (option number, starting at 0) for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string the selected option index in the specified select drop-down
   */
    return this.findSelectedOptionProperty(selectLocator, "index");
};

Selenium.prototype.getSelectedIds = function(selectLocator) {
    /** Gets all option element IDs for selected options in the specified select or multi-select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string[] an array of all selected option IDs in the specified select drop-down
   */
    return this.findSelectedOptionProperties(selectLocator, "id");
};

Selenium.prototype.getSelectedId = function(selectLocator) {
    /** Gets option element ID for selected option in the specified select element.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string the selected option ID in the specified select drop-down
   */
    return this.findSelectedOptionProperty(selectLocator, "id");
};

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
};

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
            selectedOptions.push(propVal);
        }
    }
    if (selectedOptions.length == 0) Assert.fail("No option selected");
    return selectedOptions;
};

Selenium.prototype.findSelectedOptionProperty = function(locator, property) {
    var selectedOptions = this.findSelectedOptionProperties(locator, property);
    if (selectedOptions.length > 1) {
        Assert.fail("More than one selected option!");
    }
    return selectedOptions[0];
};

Selenium.prototype.getSelectOptions = function(selectLocator) {
    /** Gets all option labels in the specified select drop-down.
   *
   * @param selectLocator an <a href="#locators">element locator</a> identifying a drop-down menu
   * @return string[] an array of all option labels in the specified select drop-down
   */
    var element = this.browserbot.findElement(selectLocator);

    var selectOptions = [];

    for (var i = 0; i < element.options.length; i++) {
        var option = element.options[i].text;
        selectOptions.push(option);
    }

    return selectOptions;
};


Selenium.prototype.getAttribute = function(attributeLocator) {
    /**
   * Gets the value of an element attribute. The value of the attribute may
   * differ across browsers (this is the case for the "style" attribute, for
   * example).
   *
   * @param attributeLocator an element locator followed by an &#064; sign and then the name of the attribute, e.g. "foo&#064;bar"
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
    var element = this.browserbot.findElementOrNull(locator);
    if (element == null) {
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
    // DGF if it's an input tag of type "hidden" then it's not visible
    if (element.tagName) {
        var tagName = new String(element.tagName).toLowerCase();
        if (tagName == "input") {
            if (element.type) {
                var elementType = new String(element.type).toLowerCase();
                if (elementType == "hidden") {
                    return false;
                }
            }
        }
    }
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

    if (window.document.defaultView && window.document.defaultView.getComputedStyle) {
        return window.document.defaultView.getComputedStyle(element, null);
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
    if (element.disabled) {
        return false;
    }
    // DGF "readonly" is a bit goofy... it doesn't necessarily have a value
    // You can write <input readonly value="black">
    var readOnlyNode = element.getAttributeNode('readonly');
    if (readOnlyNode) {
        // DGF on IE, every input element has a readOnly node, but it may be false
        if (typeof(readOnlyNode.nodeValue) == "boolean") {
            var readOnly = readOnlyNode.nodeValue;
            if (readOnly) {
                return false;
            }
        } else {
            return false;
        }
    }
    return true;
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
    /** Returns an array of JavaScript property values from all known windows having one.
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
       // If we are not in proxy injection mode, then the top-level test window will be named selenium_myiframe.
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
    var intValue = new Number(pixels);
    if (intValue.constructor != Number ||
    		intValue < 0 ) {
    	this.mouseSpeed = Selenium.DEFAULT_MOUSE_SPEED;
    } else {
    	this.mouseSpeed = pixels;
    }
}
 
Selenium.prototype.getMouseSpeed = function() {
    /** Returns the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
    * 
    * @return number the number of pixels between "mousemove" events during dragAndDrop commands (default=10)
    */
    return this.mouseSpeed;
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

Selenium.prototype.doWindowFocus = function() {
/** Gives focus to the currently selected window
   *
   */
   this.browserbot.getCurrentWindow().focus();
};


Selenium.prototype.doWindowMaximize = function() {
/** Resize currently selected window to take up the entire screen
   *
   */
   var window = this.browserbot.getCurrentWindow();
   if (window!=null && window.screen) {
       window.moveTo(0,0);

       // It appears Firefox on Mac won't move a window to (0,0).  But, you can move it to (0,1), which
       // seems to do basically the same thing.  In my (KJM - 6/20/10) tests, anything less than (0, 22)
       // pushed the browser to (0,0), so it seems it's improperly accounting for something in the browser chrome.
       if (window.screenX != 0) {
           window.moveTo(0, 1);
       }

       window.resizeTo(screen.availWidth, screen.availHeight);
   }
};

Selenium.prototype.getAllWindowIds = function() {
  /** Returns the IDs of all windows that the browser knows about in an array.
   *
   * @return string[] Array of identifiers of all windows that the browser knows about.
   */
   return this.getAttributeFromAllWindows("id");
};

Selenium.prototype.getAllWindowNames = function() {
  /** Returns the names of all windows that the browser knows about in an array.
   *
   * @return string[] Array of names of all windows that the browser knows about.
   */
   return this.getAttributeFromAllWindows("name");
};

Selenium.prototype.getAllWindowTitles = function() {
  /** Returns the titles of all windows that the browser knows about in an array.
   *
   * @return string[] Array of titles of all windows that the browser knows about.
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
     * Check if these two elements have same parent and are ordered siblings in the DOM. Two same elements will
     * not be considered ordered.
     *
     * @param locator1 an <a href="#locators">element locator</a> pointing to the first element
     * @param locator2 an <a href="#locators">element locator</a> pointing to the second element
     * @return boolean true if element1 is the previous sibling of element2, false otherwise
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
};

Selenium.prototype.getXpathCount = function(xpath) {
    /**
    * Returns the number of nodes that match the specified css selector, eg. "css=table" would give
    * the number of tables.
    * 
    * @param css the css selector to evaluate. do NOT wrap this expression in a 'count()' function; we will do that for you.
    * @return the number of nodes that match the specified selector
    */
    var result = this.browserbot.evaluateXPathCount(xpath, this.browserbot.getDocument());
    return result;
};

Selenium.prototype.getCssCount = function(css) {
    /**
    * Returns the number of nodes that match the specified xpath, eg. "//table" would give
    * the number of tables.
    * 
    * @param xpath the xpath expression to evaluate. do NOT wrap this expression in a 'count()' function; we will do that for you.
    * @return number the number of nodes that match the specified xpath
    */
    var result = this.browserbot.evaluateCssCount(css, this.browserbot.getDocument());
    return result;
};

Selenium.prototype.doAssignId = function(locator, identifier) {
    /**
    * Temporarily sets the "id" attribute of the specified element, so you can locate it in the future
    * using its ID rather than a slow/complicated XPath.  This ID will disappear once the page is
    * reloaded.
    * @param locator an <a href="#locators">element locator</a> pointing to an element
    * @param identifier a string to be used as the ID of the specified element
    */
    var element = this.browserbot.findElement(locator);
    element.id = identifier;
};

Selenium.prototype.doAllowNativeXpath = function(allow) {
    /**
    * Specifies whether Selenium should use the native in-browser implementation
    * of XPath (if any native version is available); if you pass "false" to
    * this function, we will always use our pure-JavaScript xpath library.
    * Using the pure-JS xpath library can improve the consistency of xpath
    * element locators between different browser vendors, but the pure-JS
    * version is much slower than the native implementations.
    * @param allow boolean, true means we'll prefer to use native XPath; false means we'll only use JS XPath
    */
    if ("false" == allow || "0" == allow) { // The strings "false" and "0" are true values in JS
        allow = false;
    }
    this.browserbot.setAllowNativeXPath(allow);
}

Selenium.prototype.doIgnoreAttributesWithoutValue = function(ignore) {
    /**
    * Specifies whether Selenium will ignore xpath attributes that have no
    * value, i.e. are the empty string, when using the non-native xpath
    * evaluation engine. You'd want to do this for performance reasons in IE.
    * However, this could break certain xpaths, for example an xpath that looks
    * for an attribute whose value is NOT the empty string.
    *
    * The hope is that such xpaths are relatively rare, but the user should
    * have the option of using them. Note that this only influences xpath
    * evaluation when using the ajaxslt engine (i.e. not "javascript-xpath").
    *
    * @param ignore boolean, true means we'll ignore attributes without value
    *                        at the expense of xpath "correctness"; false means
    *                        we'll sacrifice speed for correctness.
    */
    if ('false' == ignore || '0' == ignore) {
        ignore = false;
    }
    this.browserbot.setIgnoreAttributesWithoutValue(ignore);
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
        var window = selenium.browserbot.getCurrentWindow();
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

Selenium.prototype.doWaitForFrameToLoad = function(frameAddress, timeout) {
    /**
     * Waits for a new frame to load.
     *
     * <p>Selenium constantly keeps track of new pages and frames loading, 
     * and sets a "newPageLoaded" flag when it first notices a page load.</p>
     * 
     * See waitForPageToLoad for more information.
     * 
     * @param frameAddress FrameAddress from the server side
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

Selenium.prototype._abortXhrRequest = function() {
    return this.browserbot.abortXhrRequest();
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
        if (replacement && typeof(replacement) === 'string' && replacement.indexOf('$') != -1) {
            replacement = replacement.replace(/\$/g, '$$$$'); //double up on $'s because of the special meaning these have in 'replace'
        }
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

Selenium.prototype.getCookieByName = function(name) {
    /**
     * Returns the value of the cookie with the specified name, or throws an error if the cookie is not present.
     * @param name the name of the cookie
     * @return string the value of the cookie
     */
    var v = this.browserbot.getCookieByName(name);
    if (v === null) {
        throw new SeleniumError("Cookie '"+name+"' was not found");
    }
    return v;
};

Selenium.prototype.isCookiePresent = function(name) {
    /**
     * Returns true if a cookie with the specified name is present, or false otherwise.
     * @param name the name of the cookie
     * @return boolean true if a cookie with the specified name is present, or false otherwise.
     */
    var v = this.browserbot.getCookieByName(name);
    var absent = (v === null);
    return !absent;
}   

Selenium.prototype.doCreateCookie = function(nameValuePair, optionsString) {
    /**
     * Create a new cookie whose path and domain are same with those of current page
     * under test, unless you specified a path for this cookie explicitly.
     *
     * @param nameValuePair name and value of the cookie in a format "name=value"
     * @param optionsString options for the cookie. Currently supported options include 'path', 'max_age' and 'domain'.
     *      the optionsString's format is "path=/path/, max_age=60, domain=.foo.com". The order of options are irrelevant, the unit
     *      of the value of 'max_age' is second.  Note that specifying a domain that isn't a subset of the current domain will
     *      usually fail.
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
    results = /domain=([^\s,]+)[,]?/.exec(optionsString);
    if (results) {
        var domain = results[1];
        cookie += "; domain=" + domain;
    }
    LOG.debug("Setting cookie to: " + cookie);
    this.browserbot.getDocument().cookie = cookie;
};

Selenium.prototype.doDeleteCookie = function(name,optionsString) {
    /**
     * Delete a named cookie with specified path and domain.  Be careful; to delete a cookie, you
     * need to delete it using the exact same path and domain that were used to create the cookie.
     * If the path is wrong, or the domain is wrong, the cookie simply won't be deleted.  Also
     * note that specifying a domain that isn't a subset of the current domain will usually fail.
     *
     * Since there's no way to discover at runtime the original path and domain of a given cookie,
     * we've added an option called 'recurse' to try all sub-domains of the current domain with
     * all paths that are a subset of the current path.  Beware; this option can be slow.  In
     * big-O notation, it operates in O(n*m) time, where n is the number of dots in the domain
     * name and m is the number of slashes in the path.
     *
     * @param name the name of the cookie to be deleted
     * @param optionsString options for the cookie. Currently supported options include 'path', 'domain'
     *      and 'recurse.' The optionsString's format is "path=/path/, domain=.foo.com, recurse=true".
     *      The order of options are irrelevant. Note that specifying a domain that isn't a subset of
     *      the current domain will usually fail.
     */
    // set the expire time of the cookie to be deleted to one minute before now.
    var path = "";
    var domain = "";
    var recurse = false;
    var matched = false;
    results = /path=([^\s,]+)[,]?/.exec(optionsString);
    if (results) {
        matched = true;
        path = results[1];
    }
    results = /domain=([^\s,]+)[,]?/.exec(optionsString);
    if (results) {
        matched = true;
        domain = results[1];
    }
    results = /recurse=([^\s,]+)[,]?/.exec(optionsString);
    if (results) {
        matched = true;
        recurse = results[1];
        if ("false" == recurse) {
            recurse = false;
        }
    }
    // Treat the entire optionsString as a path (for backwards compatibility)
    if (optionsString && !matched) {
        LOG.warn("Using entire optionsString as a path; please change the argument to deleteCookie to use path="+optionsString);
        path = optionsString;
    }
    if (browserVersion.khtml) {
        // Safari and conquerer don't like paths with / at the end
        if ("/" != path) {
            path = path.replace(/\/$/, "");
        }
    }    
    path = path.trim();
    domain = domain.trim();
    var cookieName = name.trim();
    if (recurse) {
        this.browserbot.recursivelyDeleteCookie(cookieName, domain, path);
    } else {
        this.browserbot.deleteCookie(cookieName, domain, path);
    }
}

Selenium.prototype.doDeleteAllVisibleCookies = function() {
    /** Calls deleteCookie with recurse=true on all cookies visible to the current page.
    * As noted on the documentation for deleteCookie, recurse=true can be much slower
    * than simply deleting the cookies using a known domain/path.
    */
    var win = this.browserbot.getCurrentWindow();
    var doc = win.document;
    var cookieNames = this.browserbot.getAllCookieNames(doc);
    var domain = doc.domain;
    var path = win.location.pathname;
    for (var i = 0; i < cookieNames.length; i++) {
        this.browserbot.recursivelyDeleteCookie(cookieNames[i], domain, path, win);
    }
}

Selenium.prototype.doSetBrowserLogLevel = function(logLevel) {
    /**
    * Sets the threshold for browser-side logging messages; log messages beneath this threshold will be discarded.
    * Valid logLevel strings are: "debug", "info", "warn", "error" or "off".
    * To see the browser logs, you need to
    * either show the log window in GUI mode, or enable browser-side logging in Selenium RC.
    *
    * @param logLevel one of the following: "debug", "info", "warn", "error" or "off"
    */
    if (logLevel == null || logLevel == "") {
        throw new SeleniumError("You must specify a log level");
    }
    logLevel = logLevel.toLowerCase();
    if (LOG.logLevels[logLevel] == null) {
        throw new SeleniumError("Invalid log level: " + logLevel);
    }
    LOG.setLogLevelThreshold(logLevel);
}

Selenium.prototype.doRunScript = function(script) {
    /**
    * Creates a new "script" tag in the body of the current test window, and 
    * adds the specified text into the body of the command.  Scripts run in
    * this way can often be debugged more easily than scripts executed using
    * Selenium's "getEval" command.  Beware that JS exceptions thrown in these script
    * tags aren't managed by Selenium, so you should probably wrap your script
    * in try/catch blocks if there is any chance that the script will throw
    * an exception.
    * @param script the JavaScript snippet to run
    */
    var win = this.browserbot.getCurrentWindow();
    var doc = win.document;
    var scriptTag = doc.createElement("script");
    scriptTag.type = "text/javascript"
    scriptTag.text = script;
    doc.body.appendChild(scriptTag);
}

Selenium.prototype.doAddLocationStrategy = function(strategyName, functionDefinition) {
    /**
    * Defines a new function for Selenium to locate elements on the page.
    * For example,
    * if you define the strategy "foo", and someone runs click("foo=blah"), we'll
    * run your function, passing you the string "blah", and click on the element 
    * that your function
    * returns, or throw an "Element not found" error if your function returns null.
    *
    * We'll pass three arguments to your function:
    * <ul>
    * <li>locator: the string the user passed in</li>
    * <li>inWindow: the currently selected window</li>
    * <li>inDocument: the currently selected document</li>
    * </ul>
    * The function must return null if the element can't be found.
    * 
    * @param strategyName the name of the strategy to define; this should use only
    *   letters [a-zA-Z] with no spaces or other punctuation.
    * @param functionDefinition a string defining the body of a function in JavaScript.
    *   For example: <code>return inDocument.getElementById(locator);</code>
    */
    if (!/^[a-zA-Z]+$/.test(strategyName)) {
        throw new SeleniumError("Invalid strategy name: " + strategyName);
    }
    var strategyFunction;
    try {
        strategyFunction = new Function("locator", "inDocument", "inWindow", functionDefinition);
    } catch (ex) {
        throw new SeleniumError("Error evaluating function definition: " + extractExceptionMessage(ex));
    }
    var safeStrategyFunction = function() {
        try {
            return strategyFunction.apply(this, arguments);
        } catch (ex) {
            throw new SeleniumError("Error executing strategy function " + strategyName + ": " + extractExceptionMessage(ex));
        }
    }
    this.browserbot.locationStrategies[strategyName] = safeStrategyFunction;
}

Selenium.prototype.doCaptureEntirePageScreenshot = function(filename, kwargs) {
    /**
     * Saves the entire contents of the current window canvas to a PNG file.
     * Contrast this with the captureScreenshot command, which captures the
     * contents of the OS viewport (i.e. whatever is currently being displayed
     * on the monitor), and is implemented in the RC only. Currently this only
     * works in Firefox when running in chrome mode, and in IE non-HTA using
     * the EXPERIMENTAL "Snapsie" utility. The Firefox implementation is mostly
     * borrowed from the Screengrab! Firefox extension. Please see
     * http://www.screengrab.org and http://snapsie.sourceforge.net/ for
     * details.
     *
     * @param filename  the path to the file to persist the screenshot as. No
     *                  filename extension will be appended by default.
     *                  Directories will not be created if they do not exist,  
     *                  and an exception will be thrown, possibly by native
     *                  code.
     * @param kwargs    a kwargs string that modifies the way the screenshot
     *                  is captured. Example: "background=#CCFFDD" .
     *                  Currently valid options:
     *                  <dl>
     *                   <dt>background</dt>
     *                     <dd>the background CSS for the HTML document. This
     *                     may be useful to set for capturing screenshots of
     *                     less-than-ideal layouts, for example where absolute
     *                     positioning causes the calculation of the canvas
     *                     dimension to fail and a black background is exposed
     *                     (possibly obscuring black text).</dd>
     *                  </dl>
     */
    if (! browserVersion.isChrome &&
        ! (browserVersion.isIE && ! browserVersion.isHTA)) {
        throw new SeleniumError('captureEntirePageScreenshot is only '
            + 'implemented for Firefox ("firefox" or "chrome", NOT '
            + '"firefoxproxy") and IE non-HTA ("iexploreproxy", NOT "iexplore" '
            + 'or "iehta"). The current browser isn\'t one of them!');
    }
    
    // do or do not ... there is no try
    
    if (browserVersion.isIE) {
        // targeting snapsIE >= 0.2
        function getFailureMessage(exceptionMessage) {
            var msg = 'Snapsie failed: ';
            if (exceptionMessage) {
                if (exceptionMessage ==
                    "Automation server can't create object") {
                    msg += 'Is it installed? Does it have permission to run '
                        + 'as an add-on? See http://snapsie.sourceforge.net/';
                }
                else {
                    msg += exceptionMessage;
                }
            }
            else {
                msg += 'Undocumented error';
            }
            return msg;
        }
    
        if (typeof(runOptions) != 'undefined' &&
            runOptions.isMultiWindowMode() == false) {
            // framed mode
            try {
                new Snapsie().saveSnapshot(filename, 'selenium_myiframe');
            }
            catch (e) {
                throw new SeleniumError(getFailureMessage(e.message));
            }
        }
        else {
            // multi-window mode
            if (!this.snapsieSrc) {
                // XXX - cache snapsie, and capture the screenshot as a
                // callback. Definitely a hack, because we may be late taking
                // the first screenshot, but saves us from polluting other code
                // for now. I wish there were an easier way to get at the
                // contents of a referenced script!
                var snapsieUrl = (this.browserbot.buttonWindow.location.href)
                    .replace(/(Test|Remote)Runner\.html/, 'lib/snapsie.js');
                var self = this;
                new Ajax.Request(snapsieUrl, {
                    method: 'get'
                    , onSuccess: function(transport) {
                        self.snapsieSrc = transport.responseText;
                        self.doCaptureEntirePageScreenshot(filename, kwargs);
                    }
                });
                return;
            }

            // it's going into a string, so escape the backslashes
            filename = filename.replace(/\\/g, '\\\\');
            
            // this is sort of hackish. We insert a script into the document,
            // and remove it before anyone notices.
            var doc = selenium.browserbot.getDocument();
            var script = doc.createElement('script'); 
            var scriptContent = this.snapsieSrc 
                + 'try {'
                + '    new Snapsie().saveSnapshot("' + filename + '");'
                + '}'
                + 'catch (e) {'
                + '    document.getElementById("takeScreenshot").failure ='
                + '        e.message;'
                + '}';
            script.id = 'takeScreenshot';
            script.language = 'javascript';
            script.text = scriptContent;
            doc.body.appendChild(script);
            script.parentNode.removeChild(script);
            if (script.failure) {
                throw new SeleniumError(getFailureMessage(script.failure));
            }
        }
        return;
    }
    
    var grabber = {
        prepareCanvas: function(width, height) {
            var styleWidth = width + 'px';
            var styleHeight = height + 'px';
            
            var grabCanvas = document.getElementById('screenshot_canvas');
            if (!grabCanvas) {
                // create the canvas
                var ns = 'http://www.w3.org/1999/xhtml';
                grabCanvas = document.createElementNS(ns, 'html:canvas');
                grabCanvas.id = 'screenshot_canvas';
                grabCanvas.style.display = 'none';
                document.documentElement.appendChild(grabCanvas);
            }
            
            grabCanvas.width = width;
            grabCanvas.style.width = styleWidth;
            grabCanvas.style.maxWidth = styleWidth;
            grabCanvas.height = height;
            grabCanvas.style.height = styleHeight;
            grabCanvas.style.maxHeight = styleHeight;
        
            return grabCanvas;
        },
        
        prepareContext: function(canvas, box) {
            var context = canvas.getContext('2d');
            context.clearRect(box.x, box.y, box.width, box.height);
            context.save();
            return context;
        }
    };
    
    var SGNsUtils = {
        dataUrlToBinaryInputStream: function(dataUrl) {
            var nsIoService = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService);
            var channel = nsIoService
                .newChannelFromURI(nsIoService.newURI(dataUrl, null, null));
            var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
                .createInstance(Components.interfaces.nsIBinaryInputStream);
            
            binaryInputStream.setInputStream(channel.open());
            return binaryInputStream;
        },
        
        newFileOutputStream: function(nsFile) {
            var writeFlag = 0x02; // write only
            var createFlag = 0x08; // create
            var truncateFlag = 0x20; // truncate
            var fileOutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                .createInstance(Components.interfaces.nsIFileOutputStream);
                
            // Apparently octal permissions are deprecated, but the suggested alternative is broken in Firefox (and not backwards-compatible from FF 4.0): https://bugzilla.mozilla.org/show_bug.cgi?id=433295
            fileOutputStream.init(nsFile,
                                  writeFlag | createFlag | truncateFlag,
                                  0664,
                                  null);
            return fileOutputStream;
        },
        
        writeBinaryInputStreamToFileOutputStream:
        function(binaryInputStream, fileOutputStream) {
            var numBytes = binaryInputStream.available();
            var bytes = binaryInputStream.readBytes(numBytes);
            fileOutputStream.write(bytes, numBytes);
        }
    };
    
    // compute dimensions
    var window = this.browserbot.getCurrentWindow();
    var doc = window.document.documentElement;
    var box = {
        x: 0,
        y: 0,
        width: doc.scrollWidth,
        height: doc.scrollHeight
    };
    LOG.debug('computed dimensions');
    
    var originalBackground = doc.style.background;
    
    if (kwargs) {
        var args = parse_kwargs(kwargs);
        if (args.background) {
            doc.style.background = args.background;
        }
    }
    
    // grab
    var format = 'png';
    var canvas = grabber.prepareCanvas(box.width, box.height);
    var context = grabber.prepareContext(canvas, box);
    context.drawWindow(window, box.x, box.y, box.width, box.height,
        'rgb(0, 0, 0)');
    context.restore();
    var dataUrl = canvas.toDataURL("image/" + format);
    LOG.debug('grabbed to canvas');
    
    doc.style.background = originalBackground;
    
    // save to file
    var nsFile = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
    try {
        nsFile.initWithPath(filename);
    }
    catch (e) {
        if (/NS_ERROR_FILE_UNRECOGNIZED_PATH/.test(e.message)) {
            // try using the opposite file separator
            if (filename.indexOf('/') != -1) {
                filename = filename.replace(/\//g, '\\');
            }
            else {
                filename = filename.replace(/\\/g, '/');
            }
            nsFile.initWithPath(filename);
        }
        else {
            throw e;
        }
    }
    var binaryInputStream = SGNsUtils.dataUrlToBinaryInputStream(dataUrl);
    var fileOutputStream = SGNsUtils.newFileOutputStream(nsFile);
    SGNsUtils.writeBinaryInputStreamToFileOutputStream(binaryInputStream,
        fileOutputStream);
    fileOutputStream.close();
    LOG.debug('saved to file');
};

Selenium.prototype.doRollup = function(rollupName, kwargs) {
    /**
     * Executes a command rollup, which is a series of commands with a unique
     * name, and optionally arguments that control the generation of the set of
     * commands. If any one of the rolled-up commands fails, the rollup is
     * considered to have failed. Rollups may also contain nested rollups.
     *
     * @param rollupName  the name of the rollup command
     * @param kwargs      keyword arguments string that influences how the
     *                    rollup expands into commands
     */
    // we have to temporarily hijack the commandStarted, nextCommand(),
    // commandComplete(), and commandError() methods of the TestLoop object.
    // When the expanded rollup commands are done executing (or an error has
    // occurred), we'll restore them to their original values.
    var loop = currentTest || htmlTestRunner.currentTest;
    var backupManager = {
        backup: function() {
            for (var item in this.data) {
                this.data[item] = loop[item];
            }
        }
        , restore: function() {
            for (var item in this.data) {
                loop[item] = this.data[item];
            }
        }
        , data: {
            requiresCallBack: null
            , commandStarted: null
            , nextCommand: null
            , commandComplete: null
            , commandError: null
            , pendingRollupCommands: null
            , rollupFailed: null
            , rollupFailedMessage: null
        }
    };
    
    var rule = RollupManager.getInstance().getRollupRule(rollupName);
    var expandedCommands = rule.getExpandedCommands(kwargs);
    
    // hold your breath ...
    try {
        backupManager.backup();
        loop.requiresCallBack = false;
        loop.commandStarted = function() {};
        loop.nextCommand = function() {
            if (this.pendingRollupCommands.length == 0) {
                return null;
            }
            var command = this.pendingRollupCommands.shift();
            return command;
        };
        loop.commandComplete = function(result) {
            if (result.failed) {
                this.rollupFailed = true;
                this.rollupFailureMessages.push(result.failureMessage);
            }
            
            if (this.pendingRollupCommands.length == 0) {
                result = {
                    failed: this.rollupFailed
                    , failureMessage: this.rollupFailureMessages.join('; ')
                };
                LOG.info('Rollup execution complete: ' + (result.failed
                    ? 'failed! (see error messages below)' : 'ok'));
                backupManager.restore();
                this.commandComplete(result);
            }
        };
        loop.commandError = function(errorMessage) {
            LOG.info('Rollup execution complete: bombed!');
            backupManager.restore();
            this.commandError(errorMessage);
        };
        
        loop.pendingRollupCommands = expandedCommands;
        loop.rollupFailed = false;
        loop.rollupFailureMessages = [];
    }
    catch (e) {
        LOG.error('Rollup error: ' + e);
        backupManager.restore();
    }
};

Selenium.prototype.doAddScript = function(scriptContent, scriptTagId) {
    /**
    * Loads script content into a new script tag in the Selenium document. This
    * differs from the runScript command in that runScript adds the script tag
    * to the document of the AUT, not the Selenium document. The following
    * entities in the script content are replaced by the characters they
    * represent:
    *
    *     &lt;
    *     &gt;
    *     &amp;
    *
    * The corresponding remove command is removeScript.
    *
    * @param scriptContent  the Javascript content of the script to add
    * @param scriptTagId    (optional) the id of the new script tag. If
    *                       specified, and an element with this id already
    *                       exists, this operation will fail.
    */
    if (scriptTagId && document.getElementById(scriptTagId)) {
        var msg = "Element with id '" + scriptTagId + "' already exists!";
        throw new SeleniumError(msg);
    }
    
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    
    script.type = 'text/javascript';
    
    if (scriptTagId) {
        script.id = scriptTagId;
    }
    
    // replace some entities
    scriptContent = scriptContent
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    
    script.text = scriptContent;
    head.appendChild(script);
};

Selenium.prototype.doRemoveScript = function(scriptTagId) {
    /**
    * Removes a script tag from the Selenium document identified by the given
    * id. Does nothing if the referenced tag doesn't exist.
    *
    * @param scriptTagId  the id of the script element to remove.
    */
    var script = document.getElementById(scriptTagId);
    
    if (script && getTagName(script) == 'script') {
        script.parentNode.removeChild(script);
    }
};

Selenium.prototype.doUseXpathLibrary = function(libraryName) {
    /**
    * Allows choice of one of the available libraries.
    * @param libraryName name of the desired library
    * Only the following can be chosen:
    * <ul>
    *   <li>"ajaxslt" - Google's library</li>
    *   <li>"javascript-xpath" - Cybozu Labs' faster library</li>
    *   <li>"rpc-optimizing-ajaxslt" - the RPC optimizing strategy, delegating to ajaxslt</li>
    *   <li>"rpc-optimizing-jsxpath" - the RPC optimizing strategy, delegating to javascript-xpath</li>
    *   <li>"default" - The default library.  Currently the default library is "ajaxslt" .</li>
    * </ul>
    * If libraryName isn't one of these, it may be the name of another engine
    * registered to the browserbot's XPathEvaluator, for example by overriding
    * XPathEvaluator.prototype.init() . If it is not a registered engine
    * either, then no change will be made.
    */

    if (! this.browserbot.getXPathEngine(libraryName)) {
        return;
    }
    
    this.browserbot.setXPathEngine(libraryName);
};

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
    throw new SeleniumError("Unknown option locator type: " + locatorType);
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

