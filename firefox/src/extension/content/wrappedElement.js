FirefoxDriver.prototype.click = function(position) {
    var index = position.indexOf(" ");
    index = position.substring(0, index);
    var element = Utils.getElementAt(index);
    if (!element) {
        this.server.respond("click");
        return;
    }

    // Attach a listener so that we can wait until any page load this causes to complete
    var server = this.server;
    var clickListener = new WebLoadingListener(function(request, stateFlags) {
        if (stateFlags & Components.interfaces.nsIWebProgressListener.STATE_STOP) {
            Utils.getBrowser().removeProgressListener(this);
            server.respond("click");
        }
    });
    Utils.getBrowser().addProgressListener(clickListener)

    // Now do the click
    try {
        var button = element.QueryInterface(Components.interfaces.nsIDOMNSHTMLButtonElement);
        button.focus();
        button.click();
    } catch (e) {
        // It's not a button. That's cool. We'll just send the appropriate mouse event
        var event = Utils.getDocument().createEvent("MouseEvents");
        event.initMouseEvent('click', true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        element.dispatchEvent(event);
    }

    var checkForLoad = function() {
        // Returning should be handled by the click listener, unless we're not actually loading something. Do a check and return if we are
        // There's a race condition here, in that the click event and load may have finished before we get here. For now, let's pretend that
        // doesn't happen. The other race condition is that we make this check before the load has begun. With all the javascript out there,
        // this might actually be a bit of a problem.
        //    if (!this.getBrowser().webProgress.isLoadingDocument) {
        var docLoaderService = Utils.getService("@mozilla.org/docloaderservice;1", "nsIWebProgress");
        if (!docLoaderService.isLoadingDocument) {
            Utils.getBrowser().removeProgressListener(clickListener);
            server.respond("click");
        }
    }

    Utils.getBrowser().contentWindow.setTimeout(checkForLoad, 25);
};

FirefoxDriver.prototype.getElementText = function(elementId) {
    var element = Utils.getElementAt(elementId);
    this.server.respond("getElementText", Utils.getText(element));
}

FirefoxDriver.prototype.getElementValue = function(value) {
    var element = Utils.getElementAt(value);
    this.server.respond("getElementValue", element.getAttribute("value"));
}

FirefoxDriver.prototype.setElementValue = function(value) {
    var spaceIndex = value.indexOf(" ");
    var element = Utils.getElementAt(value.substring(0, spaceIndex));
    spaceIndex = value.indexOf(" ", spaceIndex);
    var newValue = value.substring(spaceIndex + 1);

    Utils.type(element, newValue);

    this.server.respond("setElementValue");
}

FirefoxDriver.prototype.getElementAttribute = function(value) {
    var spaceIndex = value.indexOf(" ");
    var element = Utils.getElementAt(value.substring(0, spaceIndex));
    spaceIndex = value.indexOf(" ", spaceIndex);
    var attributeName = value.substring(spaceIndex + 1);

    this.server.respond("getElementAttribute", element.getAttribute(attributeName));
}