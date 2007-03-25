function WebLoadingListener(toCall) {
    var listener = this;

//    this.func = function(event) {
//        document.getElementById("appcontent").removeEventListener("DOMContentLoaded", listener.func, true);
//        toCall(event);
//    }


     this.func = function(event) {
        // Is there a meta refresh?
        var result = Utils.getDocument().evaluate("/html/head/meta[@http-equiv]", Utils.getDocument(), null, Components.interfaces.nsIDOMXPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        var element = result.iterateNext();
        while (element) {
            if ("refresh" == element.getAttribute("http-equiv").toLowerCase()) {
                var content = element.getAttribute("content");
                if (content) {
                    var bits = content.split(';');
                    dump("First bit of content: " + bits[0] + "\n");
                    if (bits[0] - 0 === 0) {
                        // We have an instant refresh, so return
                        return;
                    }
                }
            }
            element = result.iterateNext();
        }

        document.getElementById("appcontent").removeEventListener("DOMContentLoaded", listener.func, true);
        toCall(event);
    }
    document.getElementById("appcontent").addEventListener("DOMContentLoaded", this.func, true);
}

WebLoadingListener.removeListener = function(listener) {
    document.getElementById("appcontent").removeEventListener("DOMContentLoaded", listener.func, true);
}