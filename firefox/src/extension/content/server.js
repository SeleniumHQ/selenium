var driver = false;

window.addEventListener("load", function(e) {
    handle = Components.classes["@thoughtworks.com/webdriver/fxdriver;1"].createInstance(Components.interfaces.nsISupports);
    var server = handle.wrappedJSObject;

    server.startListening();

    if (!driver) {
        driver = server.newDriver(window);
    } else {
        if (window.content)
            var frames = window.content.frames;

        // If we are already focused on a frame, try and stay focused
        if (driver.context.frameId !== undefined && frames) {
            if (frames && frames.length > driver.context.frameId) {
                // do nothing
            } else {
                if (frames && frames.length && "FRAME" == frames[0].frameElement.tagName) {
                    if (!frames[driver.context.frameId]) {
                        driver.context.frameId = 0;
                    }
                } else {
                    driver.context.frameId = undefined;
                }

            }
        } else {
            // Other use a sensible default
            if (frames && frames.length && "FRAME" == frames[0].frameElement.tagName) {
                if (!frames[driver.context.frameId]) {
                    driver.context.frameId = 0;
                }
            } else {
                driver.context.frameId = undefined;
            }
        }
    }
}, true);

window.addEventListener("focus", function(e) {
    var active = e.originalTarget;
    var doc = gBrowser.selectedBrowser.contentDocument;
    if (active.ownerDocument == doc) {
        driver.activeElement = active;
    }
}, true);
