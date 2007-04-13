function WindowListener(driver) {
    this.driver = driver;
    var wm = Utils.getService("@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
    wm.addListener(this);
}

WindowListener.prototype.onCloseWindow = function(window) {
    this.driver.location.window = "?";
}

WindowListener.prototype.onOpenWindow = function(window) {
    this.driver.location.window = "?";
}

WindowListener.prototype.onWindowTitleChange = function(window, newTitle) {
    
}