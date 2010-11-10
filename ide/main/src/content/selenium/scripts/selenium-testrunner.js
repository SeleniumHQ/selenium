(function(){
    // For some reason clicking links doesn't work if selenium-testrunner.js is loaded from Chrome URL. So we are loading it from File URL here.
    var extensionId = "{a6fd85ed-e919-4a43-a5af-8da18bda539f}";
    var file = Components.classes["@mozilla.org/extensions/manager;1"]
        .getService(Components.interfaces.nsIExtensionManager)
        .getInstallLocation(extensionId).getItemLocation(extensionId);
    file.append("content-files");
    file.append("selenium-testrunner.js");
    document.write('<script src="file://' + file.path + '" type="text/javascript"></script>');
})();
