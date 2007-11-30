var STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
var STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

function WebLoadingListener(driver, toCall) {
  var listener = this;
  var browser = Utils.getBrowser(driver.context);

  this.handler = {
    QueryInterface: function(iid) {
      if (iid.equals(Components.interfaces.nsIWebProgressListener) ||
          iid.equals(Components.interfaces.nsISupportsWeakReference) ||
          iid.equals(Components.interfaces.nsISupports))
        return this;
      throw Components.results.NS_NOINTERFACE;
    },

    onStateChange: function(webProgress, request, flags, status) {
      if (flags & STATE_STOP) {
        if (request.URI) {
          WebLoadingListener.removeListener(browser, listener);
          toCall();
        }
      }
      return 0;
    },

    onLocationChange: function(aProgress, aRequest, aURI) { return 0; },
    onProgressChange: function() { return 0; },
    onStatusChange: function() { return 0; },
    onSecurityChange: function() { return 0; },
    onLinkIconAvailable: function() { return 0; }
  }

  browser.addProgressListener(this.handler,
      Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
}

WebLoadingListener.removeListener = function(browser, listener) {
  browser.removeProgressListener(listener.handler);
}
