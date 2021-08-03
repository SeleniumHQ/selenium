var browserbot = {
    

    getTagName : function(element) {
        var tagName;
        if (element && element.tagName && element.tagName.toLowerCase) {
            tagName = element.tagName.toLowerCase();
        }
        return tagName;
    },

    replaceText : function(element, stringValue) {
        this.triggerEvent(element, 'focus', false);
        this.triggerEvent(element, 'select', true);
        var maxLengthAttr = element.getAttribute("maxLength");
        var actualValue = stringValue;
        if (maxLengthAttr != null) {
            var maxLength = parseInt(maxLengthAttr);
            if (stringValue.length > maxLength) {
                actualValue = stringValue.substr(0, maxLength);
            }
        }

        if (this.getTagName(element) == "body") {
            if (element.ownerDocument && element.ownerDocument.designMode) {
                var designMode = new String(element.ownerDocument.designMode).toLowerCase();
                if (designMode = "on") {
                    // this must be a rich text control!
                    element.innerHTML = actualValue;
                }
            }
        } else {
            element.value = actualValue;
        }
        // DGF this used to be skipped in chrome URLs, but no longer.  Is xpcnativewrappers to blame?
        try {
            this.triggerEvent(element, 'change', true);
        } catch (e) {
        }
    },

    getKeyCodeFromKeySequence : function(keySequence) {
        var match = /^\\(\d{1,3})$/.exec(keySequence);
        if (match != null) {
            return match[1];
        }
        match = /^.$/.exec(keySequence);
        if (match != null) {
            return match[0].charCodeAt(0);
        }
        // this is for backward compatibility with existing tests
        // 1 digit ascii codes will break however because they are used for the digit chars
        match = /^\d{2,3}$/.exec(keySequence);
        if (match != null) {
            return match[0];
        }
        throw "invalid keySequence";
    },

    createEventObject : function(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
        var evt = element.ownerDocument.createEventObject();
        evt.shiftKey = shiftKeyDown;
        evt.metaKey = metaKeyDown;
        evt.altKey = altKeyDown;
        evt.ctrlKey = controlKeyDown;
        return evt;
    },


    triggerEvent : function(element, eventType, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
        canBubble = (typeof(canBubble) == 'undefined') ? true : canBubble;
        if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) { // IE
            var evt = this.createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);
            element.fireEvent('on' + eventType, evt);
        } else {
            var evt = document.createEvent('HTMLEvents');

            try {
                evt.shiftKey = shiftKeyDown;
                evt.metaKey = metaKeyDown;
                evt.altKey = altKeyDown;
                evt.ctrlKey = controlKeyDown;
            } catch (e) {
                // Nothing sane to do
            }

            evt.initEvent(eventType, canBubble, true);
            element.dispatchEvent(evt);
        }
    },

    triggerKeyEvent : function(element, eventType, keySequence, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
        var keycode = this.getKeyCodeFromKeySequence(keySequence);
        canBubble = (typeof(canBubble) == 'undefined') ? true : canBubble;
        if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) { // IE
            var keyEvent = this.createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);
            keyEvent.keyCode = keycode;
            element.fireEvent('on' + eventType, keyEvent);
        } else {
            var evt;
            if (window.KeyEvent) {
                evt = document.createEvent('KeyEvents');
                evt.initKeyEvent(eventType, true, true, window, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown, keycode, keycode);
            } else {
                evt = document.createEvent('UIEvents');

                evt.shiftKey = shiftKeyDown;
                evt.metaKey = metaKeyDown;
                evt.altKey = altKeyDown;
                evt.ctrlKey = controlKeyDown;

                evt.initUIEvent(eventType, true, true, window, 1);
                evt.keyCode = keycode;
                evt.which = keycode;
            }

            element.dispatchEvent(evt);
        }
    },

    triggerMouseEvent : function(element, eventType, canBubble, clientX, clientY, button) {
        clientX = clientX ? clientX : 0;
        clientY = clientY ? clientY : 0;

        var screenX = 0;
        var screenY = 0;

        canBubble = (typeof(canBubble) == 'undefined') ? true : canBubble;
        if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject && this.getInternetExplorerVersion() < 9) { //IE
            var evt = this.createEventObject(element, this.controlKeyDown, this.altKeyDown, this.shiftKeyDown, this.metaKeyDown);
            evt.detail = 0;
            evt.button = button ? button : 1;
            // default will be the left mouse click ( http://www.javascriptkit.com/jsref/event.shtml )
            evt.relatedTarget = null;
            if (!screenX && !screenY && !clientX && !clientY) {
                element.fireEvent('on' + eventType);
            } else {
                evt.screenX = screenX;
                evt.screenY = screenY;
                evt.clientX = clientX;
                evt.clientY = clientY;

                // when we go this route, window.event is never set to contain the event we have just created.
                // ideally we could just slide it in as follows in the try-block below, but this normally
                // doesn't work.  This is why I try to avoid this code path, which is only required if we need to
                // set attributes on the event (e.g., clientX).
                try {
                    window.event = evt;
                }
                catch(e) {
                    // work around for http://jira.openqa.org/browse/SEL-280 -- make the event available somewhere:
                }
                element.fireEvent('on' + eventType, evt);
            }
        } else {
            var evt = document.createEvent('MouseEvents');
            if (evt.initMouseEvent) {
                // see http://developer.mozilla.org/en/docs/DOM:event.button and
                // http://developer.mozilla.org/en/docs/DOM:event.initMouseEvent for button ternary logic logic
                //Safari
                evt.initMouseEvent(eventType, canBubble, true, document.defaultView, 1, screenX, screenY, clientX, clientY,
                        this.controlKeyDown, this.altKeyDown, this.shiftKeyDown, this.metaKeyDown, button ? button : 0, null);
            } else {
                evt.initEvent(eventType, canBubble, true);

                evt.shiftKey = this.shiftKeyDown;
                evt.metaKey = this.metaKeyDown;
                evt.altKey = this.altKeyDown;
                evt.ctrlKey = this.controlKeyDown;
                if (button) {
                    evt.button = button;
                }
            }
            element.dispatchEvent(evt);
        }
    },

    doFireEvent : function(element, eventName) {
      /**
       * Explicitly simulate an event, to trigger the corresponding &quot;on<em>event</em>&quot;
       * handler.
       *
       * @param locator an <a href="#locators">element locator</a>
       * @param eventName the event name, e.g. "focus" or "blur"
       */
       this.triggerEvent(element, eventName, false);
    },

    getClientXY : function(element, coordString) {
        // Parse coordString
        var coords = null;
        var x;
        var y;
        if (coordString) {
            coords = coordString.split(/,/);
            x = Number(coords[0]);
            y = Number(coords[1]);
        } else {
            x = y = 0;
        }

        // Get position of element,
        // Return 2 item array with clientX and clientY
        return [this.getElementPositionLeft(element) + x, this.getElementPositionTop(element) + y];
    },

    getElementPositionLeft : function(element) {
        var x = element.offsetLeft;
        var elementParent = element.offsetParent;

        while (elementParent != null)
        {
            if (document.all)
            {
                if ((elementParent.tagName != "TABLE") && (elementParent.tagName != "BODY"))
                {
                    x += elementParent.clientLeft;
                }
            }
            else // Netscape/DOM
            {
                if (elementParent.tagName == "TABLE")
                {
                    var parentBorder = parseInt(elementParent.border);
                    if (isNaN(parentBorder))
                    {
                        var parentFrame = elementParent.getAttribute('frame');
                        if (parentFrame != null)
                        {
                            x += 1;
                        }
                    }
                    else if (parentBorder > 0)
                    {
                        x += parentBorder;
                    }
                }
            }
            x += elementParent.offsetLeft;
            elementParent = elementParent.offsetParent;
        }
        return x;
    },

    getElementPositionTop : function(element) {
        /**
         * Retrieves the vertical position of an element
         *
         * @param locator an <a href="#locators">element locator</a> pointing to an element OR an element itself
         * @return number of pixels from the edge of the frame.
         */

        var y = 0;

        while (element != null)
        {
            if (document.all)
            {
                if ((element.tagName != "TABLE") && (element.tagName != "BODY"))
                {
                    y += element.clientTop;
                }
            }
            else // Netscape/DOM
            {
                if (element.tagName == "TABLE")
                {
                    var parentBorder = parseInt(element.border);
                    if (isNaN(parentBorder))
                    {
                        var parentFrame = element.getAttribute('frame');
                        if (parentFrame != null)
                        {
                            y += 1;
                        }
                    }
                    else if (parentBorder > 0)
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
    },


    triggerMouseEventAt : function(element, eventName, coordString) {
        var clientXY = this.getClientXY(element, coordString)

        this.triggerMouseEvent(element, eventName, true, clientXY[0], clientXY[1]);
    },

    doKeyDown : function(element, keySequence, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
        /**
         * Simulates a user pressing a key (without releasing it yet).
         *
         * @param locator an <a href="#locators">element locator</a>
         * @param keySequence Either be a string("\" followed by the numeric keycode
         *  of the key to be pressed, normally the ASCII value of that key), or a single
         *  character. For example: "w", "\119".
         */
        this.triggerKeyEvent(element, 'keydown', keySequence, true,
                controlKeyDown,
                altKeyDown,
                shiftKeyDown,
                metaKeyDown);
    },

    doKeyUp : function(element, keySequence, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
        /**
         * Simulates a user releasing a key.
         *
         * @param locator an <a href="#locators">element locator</a>
         * @param keySequence Either be a string("\" followed by the numeric keycode
         *  of the key to be pressed, normally the ASCII value of that key), or a single
         *  character. For example: "w", "\119".
         */
        this.triggerKeyEvent(element, 'keyup', keySequence, true,
                controlKeyDown,
                altKeyDown,
                shiftKeyDown,
                metaKeyDown);
    },

    getInternetExplorerVersion : function() {
        // Returns the version of Internet Explorer or a -1 (indicating the use of another browser).
        // See http://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx
        var rv = -1; // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null) {
                rv = parseFloat( RegExp.$1 );
            }
        }
        return rv;
    }

};

