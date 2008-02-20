FirefoxDriver.prototype.click = function(respond) {
    respond.context = this.context;

    var element = Utils.getElementAt(respond.elementId, this.context);
    if (!element) {
        respond.send();
        return;
    }

    // Attach a listener so that we can wait until any page load this causes to complete
    var driver = this;
    var alreadyReplied = false;
    var browser = Utils.getBrowser(driver.context);
    var contentWindow = Utils.getBrowser(driver.context).contentWindow;
    var fireMouseEventOn = Utils.fireMouseEventOn;

    var clickListener = new WebLoadingListener(driver, function(event) {
        if (!alreadyReplied) {
            alreadyReplied = true;
            respond.send();
        }
    });

    var clickEvents = function() {
        element.focus();

        fireMouseEventOn(driver.context, element, "mousedown");
        fireMouseEventOn(driver.context, element, "mouseup");

        // Now do the click. I'm a little surprised that this works as often as it does:
        // http://developer.mozilla.org/en/docs/DOM:element.click#Notes
        if (element["click"]) {
            element.click();
        } else {
            // Send the mouse event too. Not sure if this will cause the thing to be double clicked....
            fireMouseEventOn(driver.context, element, "click");
        }

        var checkForLoad = function() {
            // Returning should be handled by the click listener, unless we're not actually loading something. Do a check and return if we are.
            // There's a race condition here, in that the click event and load may have finished before we get here. For now, let's pretend that
            // doesn't happen. The other race condition is that we make this check before the load has begun. With all the javascript out there,
            // this might actually be a bit of a problem.
            var docLoaderService = browser.webProgress
            if (!docLoaderService.isLoadingDocument) {
                WebLoadingListener.removeListener(browser, clickListener);
                if (!alreadyReplied) {
                    alreadyReplied = true;
                    respond.send();
                }
            }
        }
        contentWindow.setTimeout(checkForLoad, 50);
    }

    contentWindow.setTimeout(clickEvents, 50);
};

FirefoxDriver.prototype.getElementText = function(respond) {
    respond.context = this.context;

    var element = Utils.getElementAt(respond.elementId, this.context);
    if (element.tagName == "TITLE") {
        respond.response = Utils.getBrowser(this.context).contentTitle;
    } else {
        respond.response = Utils.getText(element, true);
    }

    respond.send();
}

FirefoxDriver.prototype.getElementValue = function(respond) {
    respond.context = this.context;

    var element = Utils.getElementAt(respond.elementId, this.context);

    if (element["value"] !== undefined) {
        respond.response = element.value;
        respond.send();
        return;
    }

    if (element.hasAttribute("value")) {
        respond.response = element.getAttribute("value");
        respond.send();
        return;
    }

    respond.isError = true;
    respond.response = "No match";
    respond.send();
};

FirefoxDriver.prototype.sendKeys = function(respond, value) {
    respond.context = this.context;

    var element = Utils.getElementAt(respond.elementId, this.context);

    element.focus();
    Utils.type(this.context, element, value[0]);
    element.blur();

    respond.context = this.context;
    respond.send();
};

FirefoxDriver.prototype.clear = function(respond) {
   respond.context = this.context;

   var element = Utils.getElementAt(respond.elementId, this.context);
   var isTextField = element["value"] !== undefined;

   if (isTextField) {
     element.value = "";
   } else {
     element.setAttribute("value", "");
   }
   
   respond.send();
}

FirefoxDriver.prototype.getElementAttribute = function(respond, value) {
    var element = Utils.getElementAt(respond.elementId, this.context);
    var attributeName = value[0];

    if (element.hasAttribute(attributeName)) {
        respond.response = element.getAttribute(attributeName);

        if (attributeName.toLowerCase() == "disabled") {
            respond.response = element.disabled;
        } else if (attributeName.toLowerCase() == "selected") {
            respond.response = element.selected;
        } else if (attributeName.toLowerCase() == "checked") {
            respond.response = response.toLowerCase() == "checked" || response.toLowerCase() == "true";
        }

        respond.send();
        return;
    }

    attributeName = attributeName.toLowerCase();

    if (attributeName == "disabled") {
        respond.response = element.disabled;
        respond.send();
        return;
    } else if (attributeName == "checked" && element.tagName.toLowerCase() == "input") {
        respond.response = element.checked;
        respond.send();
        return;
    } else if (attributeName == "selected" && element.tagName.toLowerCase() == "option") {
        respond.response = element.selected;
        respond.send();
        return;
    }

    respond.isError = true;
    respond.response = "No match";
    respond.send();
}

FirefoxDriver.prototype.submitElement = function(respond) {
    var element = Utils.getElementAt(respond.elementId, this.context);

    var submitElement = Utils.findForm(element);
    if (submitElement) {
        var driver = this;
        new WebLoadingListener(this, function(event) {
            respond.context = driver.context;
            respond.send();
        });
        if (submitElement["submit"])
            submitElement.submit();
        else
            submitElement.click();
    } else {
        respond.context = this.context;
        respond.send();
    }
}

FirefoxDriver.prototype.getElementChildren = function(respond, name) {
    var element = Utils.getElementAt(respond.elementId, this.context);

    var children = element.getElementsByTagName(name[0]);
    var response = "";
    for (var i = 0; i < children.length; i++) {
        response += Utils.addToKnownElements(children[i], this.context) + " ";
    }

    respond.context = this.context;
    respond.response = response;
    respond.send();
}

FirefoxDriver.prototype.getElementSelected = function(respond) {
    var element = Utils.getElementAt(respond.elementId, this.context);
    var selected = false;

    try {
        var option = element.QueryInterface(Components.interfaces.nsIDOMHTMLOptionElement)
        selected = option.selected;
    } catch(e) {
    }

    try {
        var inputElement = element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement)
        if (inputElement.type == "checkbox" || inputElement.type == "radio") {
            selected = inputElement.checked;
        }
    } catch(e) {
    }

    respond.context = this.context;
    respond.response = selected;
    respond.send();
}

FirefoxDriver.prototype.setElementSelected = function(respond) {
    var element = Utils.getElementAt(respond.elementId, this.context);

    var wasSet = "You may not select an unselectable element";
    respond.context = this.context;
    respond.isError = true;

    try {
        var inputElement = element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement)
        if (inputElement.disabled) {
            respond.response = "You may not select a disabled element";
            respond.send();
            return;
        }
    } catch(e) {
    }

    try {
        var option = element.QueryInterface(Components.interfaces.nsIDOMHTMLOptionElement)
        respond.isError = false;
        if (!option.selected) {
            option.selected = true;
            Utils.fireHtmlEvent(this.context, option, "change");
        }
        wasSet = "";
    } catch(e) {
    }

    try {
        var checkbox = element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement)
        respond.isError = false;
        if (checkbox.type == "checkbox" || checkbox.type == "radio") {
            if (!checkbox.checked) {
                checkbox.checked = true;
                Utils.fireHtmlEvent(this.context, checkbox, "change");
            }
            wasSet = "";
        }
    } catch(e) {
    }

    respond.response = wasSet;
    respond.send();
}

FirefoxDriver.prototype.toggleElement = function(respond) {
    respond.context = this.context;

    var element = Utils.getElementAt(respond.elementId, this.context);

    try {
        var checkbox = element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement);
        if (checkbox.type == "checkbox") {
            checkbox.checked = !checkbox.checked;
            Utils.fireHtmlEvent(this.context, checkbox, "change");
            respond.send();
            return;
        }
    } catch(e) {
    }

    try {
        var option = element.QueryInterface(Components.interfaces.nsIDOMHTMLOptionElement);

        // Find our containing select and see if it allows multiple selections
        var select = option.parentNode;
        while (select && select.tagName != "SELECT") {
            select = select.parentNode;
        }

        if (select && select.multiple) {
            option.selected = !option.selected;
            Utils.fireHtmlEvent(this.context, option, "change");
            respond.send();
            return;
        }
    } catch(e) {
    }

    respond.isError = true;
    respond.response = "You may only toggle an element that is either a checkbox or an option in a select that allows multiple selections";
    respond.send();
};

FirefoxDriver.prototype.isElementDisplayed = function(respond) {
    var element = Utils.getElementAt(respond.elementId, this.context);

    var isDisplayed = true;
    do {
        var display = Utils.getStyleProperty(element, "display");
        var visible = Utils.getStyleProperty(element, "visibility");
        isDisplayed &= display != "none" && visible != "hidden";

        element = element.parentNode;
    } while (element.tagName.toLowerCase() != "body" && isDisplayed);

    respond.context = this.context;
    respond.response = isDisplayed ? "true" : "false";
    respond.send();
};

FirefoxDriver.prototype.getElementLocation = function(respond) {
    var element = Utils.getElementAt(respond.elementId, this.context);
    var location = Utils.getElementLocation(element, this.context);

    respond.context = this.context;
    respond.response = location.x + ", " + location.y;
    respond.send();
};

FirefoxDriver.prototype.getElementSize = function(respond) {
    var element = Utils.getElementAt(respond.elementId, this.context);

    var width = element.offsetWidth;
    var height = element.offsetHeight;

    respond.context = this.context;
    respond.response = width + ", " + height;
    respond.send();
};

FirefoxDriver.prototype.dragAndDrop = function(respond, movementString) {
    var element = Utils.getElementAt(respond.elementId, this.context);
    
    var clientStartXY = Utils.getElementLocation(element, this.context);
    
    var clientStartX = clientStartXY.x;
    var clientStartY = clientStartXY.y;
    
    var movementX = movementString[0];
    var movementY = movementString[1];

    var clientFinishX = ((clientStartX + movementX) < 0) ? 0 : (clientStartX + movementX);
    var clientFinishY = ((clientStartY + movementY) < 0) ? 0 : (clientStartY + movementY);
    // Restrict the desitnation into the sensible dimension
    var window = Utils.getBrowser(this.context).contentWindow;
    if (clientFinishX > window.innerWidth)
        clientFinishX = window.innerWidth;
    if (clientFinishY > window.innerHeight)
        clientFinishY = window.innerHeight;

    var mouseSpeed = this.mouseSpeed;
    var move = function(current, dest) {
        if (current == dest) return current;
        if (Math.abs(current - dest) < mouseSpeed) return dest;
        return (current < dest) ? current + mouseSpeed : current - mouseSpeed;
    }

    Utils.triggerMouseEvent(element, 'mousedown', clientStartX, clientStartY);
    Utils.triggerMouseEvent(element, 'mousemove', clientStartX, clientStartY);
    var clientX = clientStartX;
    var clientY = clientStartY;

    while ((clientX != clientFinishX) || (clientY != clientFinishY)) {
        clientX = move(clientX, clientFinishX);
        clientY = move(clientY, clientFinishY);
        
        Utils.triggerMouseEvent(element, 'mousemove', clientX, clientY);
    }

    Utils.triggerMouseEvent(element, 'mousemove', clientFinishX, clientFinishY);
    Utils.triggerMouseEvent(element, 'mouseup',  clientFinishX, clientFinishY);

    var finalLoc = Utils.getElementLocation(element, this.context)

    respond.context = this.context;
    respond.response = finalLoc.x + "," + finalLoc.y;
    respond.send();
};
