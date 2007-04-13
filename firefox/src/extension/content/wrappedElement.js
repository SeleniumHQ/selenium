FirefoxDriver.prototype.click = function(position) {
    var element = Utils.getElementAt(position, this.location);
    if (!element) {
        this.server.respond(this.location, "click");
        return;
    }

    // Attach a listener so that we can wait until any page load this causes to complete
    var server = this.server;
    var driver = this;
    var clickListener = new WebLoadingListener(this, function(event) {
        server.respond(driver.location, "click");
    });

    element.focus();
    Utils.fireMouseEventOn(this.location, element, "mousedown");

    // Now do the click
    if (element["click"]) {
        element.click();
    } else {
        // Send the mouse event too. Not sure if this will cause the thing to be double clicked....
        Utils.fireMouseEventOn(this.location, element, "click");
    }

    Utils.fireMouseEventOn(this.location, element, "mouseup");


    var checkForLoad = function() {
        // Returning should be handled by the click listener, unless we're not actually loading something. Do a check and return if we are.
        // There's a race condition here, in that the click event and load may have finished before we get here. For now, let's pretend that
        // doesn't happen. The other race condition is that we make this check before the load has begun. With all the javascript out there,
        // this might actually be a bit of a problem.
        var docLoaderService = Utils.getBrowser(driver.location).webProgress
        if (!docLoaderService.isLoadingDocument) {
            WebLoadingListener.removeListener(clickListener);
            server.respond(driver.location, "click");
        }
    }

    Utils.getBrowser(this.location).contentWindow.setTimeout(checkForLoad, 50);
};

FirefoxDriver.prototype.getElementText = function(elementId) {
    var element = Utils.getElementAt(elementId, this.location);
    this.server.respond(this.location, "getElementText", Utils.getText(element));
}

FirefoxDriver.prototype.getElementValue = function(value) {
    var element = Utils.getElementAt(value, this.location);
    if (element.tagName.toLowerCase() == "textarea")
        this.server.respond(this.location, "getElementValue", element.value);
    else
        this.server.respond(this.location, "getElementValue", element.getAttribute("value"));
}

FirefoxDriver.prototype.setElementValue = function(value) {
    var spaceIndex = value.indexOf(" ");
    var element = Utils.getElementAt(value.substring(0, spaceIndex), this.location);
    spaceIndex = value.indexOf(" ", spaceIndex);
    var newValue = value.substring(spaceIndex + 1);

    Utils.type(this.location, element, newValue);

    this.server.respond(this.location, "setElementValue");
}

FirefoxDriver.prototype.getElementAttribute = function(value) {
    var spaceIndex = value.indexOf(" ");
    var element = Utils.getElementAt(value.substring(0, spaceIndex), this.location);
    spaceIndex = value.indexOf(" ", spaceIndex);
    var attributeName = value.substring(spaceIndex + 1);

    if (element.hasAttribute(attributeName)) {
        var response = element.getAttribute(attributeName);

        if (attributeName.toLowerCase() == "disabled") {
            response = response.toLowerCase() == "disabled" || response.toLowerCase() == "true";
        } else if (attributeName.toLowerCase() == "selected") {
            response = response.toLowerCase() == "selected" || response.toLowerCase() == "true";
        } else if (attributeName.toLowerCase() == "checked") {
            response = response.toLowerCase() == "checked" || response.toLowerCase() == "true";
        }

        this.server.respond(this.location, "getElementAttribute", response);
        return;
    }

    attributeName = attributeName.toLowerCase();
    if (attributeName == "disabled") {
        this.server.respond(this.location, "getElementAttribute", element.disabled);
        return;
    } else if (attributeName == "checked" && element.tagName.toLowerCase() == "input") {
        this.server.respond(this.location, "getElementAttribute", element.checked);
        return;
    } else if (attributeName == "selected" && element.tagName.toLowerCase() == "option") {
        this.server.respond(this.location, "getElementAttribute", element.selected);
        return;
    }

    this.server.respond(this.location, "getElementAttribute", "");
}

FirefoxDriver.prototype.submitElement = function(elementId) {
    var element = Utils.getElementAt(elementId, this.location);

    var submitElement = Utils.findForm(element);
    if (submitElement) {
        var server = this.server;
        var driver = this;
        new WebLoadingListener(this, function(event) {
            server.respond(driver.location, "submitElement");
        });
        if (submitElement["submit"])
            submitElement.submit();
        else
            submitElement.click();
    } else {
        server.respond(this.location, "submitElement");
    }
}

FirefoxDriver.prototype.getElementChildren = function(elementIdAndTagName) {
    var parts = elementIdAndTagName.split(" ");
    var element = Utils.getElementAt(parts[0], this.location);

    var children = element.getElementsByTagName(parts[1]);
    var response = "";
    for (var i = 0; i < children.length; i++) {
        response += Utils.addToKnownElements(children[i], this.location) + " ";
    }
    this.server.respond(this.location, "getElementChildren", response);
}

FirefoxDriver.prototype.getElementSelected = function(elementId) {
    var element = Utils.getElementAt(elementId, this.location);
    var selected = false;

    try {
        var option = element.QueryInterface(Components.interfaces.nsIDOMHTMLOptionElement)
        selected = option.selected;
    } catch(e) {}

    try {
        var inputElement = element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement)
        if (inputElement.type == "checkbox" || inputElement.type == "radio") {
            selected = inputElement.checked;
        }
    } catch(e) {}

    this.server.respond(this.location, "getElementSelected", selected);
}

FirefoxDriver.prototype.setElementSelected = function(elementId) {
    var element = Utils.getElementAt(elementId, this.location);
    var wasSet = false;

    try {
        var option = element.QueryInterface(Components.interfaces.nsIDOMHTMLOptionElement)
        option.selected = true;
        wasSet = true;
    } catch(e) {}

    try {
        var checkbox = element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement)
        if (checkbox.type == "checkbox") {
            checkbox.checked = true;
            wasSet = true;
        }
    } catch(e) {}

    this.server.respond(this.location, "setElementSelected", wasSet);
}