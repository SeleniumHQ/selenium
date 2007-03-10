function WebLoadingListener(toCall)
{
    this.toCall = toCall;
    var docLoaderService = Utils.getService("@mozilla.org/docloaderservice;1", "nsIWebProgress");
    docLoaderService.addProgressListener(this, Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
}

WebLoadingListener.prototype.QueryInterface = function(aIID)
{
    if (aIID.equals(Components.interfaces.nsIWebProgressListener) || aIID.equals(Components.interfaces.nsISupportsWeakReference) || aIID.equals(Components.interfaces.nsISupports))
        return this;
    throw Components.results.NS_NOINTERFACE;
}

WebLoadingListener.prototype.onLocationChange = function(webProgress, request, location)
{
    return 0;
};

WebLoadingListener.prototype.onProgressChange = function(webProgress, request, curSelfProgress, maxSelfProgress, curTotalProgress, maxTotalProgress)
{
    return 0;
};

WebLoadingListener.prototype.onSecurityChange = function(webProgress, request, state)
{
    return 0;
};

WebLoadingListener.prototype.onStateChange = function(webProgress, request, stateFlags, aStatus)
{
    if (stateFlags & Components.interfaces.nsIWebProgressListener.STATE_STOP && stateFlags & Components.interfaces.nsIWebProgressListener.STATE_IS_DOCUMENT)
    {
        this.toCall(request);
    }
};

WebLoadingListener.prototype.onStatusChange = function(webProgress, request, status, message)
{
    return 0;
};
