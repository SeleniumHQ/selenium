
if (HealthService && HealthService.addDiagnostic) {
  HealthService.addDiagnostic('SeleniumIDE', {
    runDiagnostic: function() {
      var version = Components.classes["@mozilla.org/intl/stringbundle;1"]
        .getService(Components.interfaces.nsIStringBundleService)
        .createBundle("chrome://selenium-ide/locale/selenium-ide.properties").GetStringFromName('selenium-ide.version');
      var isSidebar = document.getElementById("selenium-ide-sidebar") ? true : false;
      return {
        version:        version,
        sidebar:        isSidebar
      };
    }
  });
} else {
  alert("Cannot add SeleniumIDE diagnostic provider to HealthService");
}
