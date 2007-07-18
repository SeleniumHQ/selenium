//var LOAD_EVENT = "DOMContentLoaded";
var LOAD_EVENT = "load";

function WebLoadingListener(driver, toCall) {
    var listener = this;
	var browser = Utils.getBrowser(driver.context);
	
    this.func = function(event) {
        // Is there a meta refresh?
        var doc = Utils.getDocument(driver.context)
        var result = doc.evaluate("/html/head/meta[@http-equiv]", doc, null, Components.interfaces.nsIDOMXPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        var element = result.iterateNext();
        while (element) {
            if ("refresh" == element.getAttribute("http-equiv").toLowerCase()) {
                var content = element.getAttribute("content");
                if (content) {
                    var bits = content.split(';');
                    if (bits[0] - 0 === 0) {
                        // We have an instant refresh, so return
                        return;
                    }
                }
            }
            element = result.iterateNext();
        }
        WebLoadingListener.removeListener(browser, listener);
        toCall(event);
    }

	browser.addEventListener(LOAD_EVENT, this.func, true);
}

WebLoadingListener.removeListener = function(browser, listener) {
    browser.removeEventListener(LOAD_EVENT, listener.func, true);
}