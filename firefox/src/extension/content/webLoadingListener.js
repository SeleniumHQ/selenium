function WebLoadingListener(toCall) {
    var listener = this;

    this.func = function(event) {
        document.getElementById("appcontent").removeEventListener("DOMContentLoaded", listener.func, true);
        toCall(event);
    }

    document.getElementById("appcontent").addEventListener("DOMContentLoaded", this.func, true);
}

WebLoadingListener.removeListener = function(listener) {
    document.getElementById("appcontent").removeEventListener("DOMContentLoaded", listener.func, true);
}