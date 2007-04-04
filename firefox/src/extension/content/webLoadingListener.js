//var LOAD_EVENT = "DOMContentLoaded";
var LOAD_EVENT = "load";

function WebLoadingListener(toCall) {
    var listener = this;

    this.func = function(event) {
        // Is there a meta refresh?
        var result = Utils.getDocument().evaluate("/html/head/meta[@http-equiv]", Utils.getDocument(), null, Components.interfaces.nsIDOMXPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
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

        WebLoadingListener.removeListener(listener);
        toCall(event);
    }
    document.getElementById("appcontent").addEventListener(LOAD_EVENT, this.func, true);
}

WebLoadingListener.removeListener = function(listener) {
    document.getElementById("appcontent").removeEventListener(LOAD_EVENT, listener.func, true);
}