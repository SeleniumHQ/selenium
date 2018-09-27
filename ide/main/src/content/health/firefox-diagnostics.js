
if (HealthService && HealthService.addDiagnostic) {
  HealthService.addDiagnostic('Browser', {
    runDiagnostic: function() {
      var appinfo = Services.appinfo;
      return {
        os:               appinfo.OS,
        name:             appinfo.name,
        version:          appinfo.version,
        ID:               appinfo.ID,
        vendor:           appinfo.vendor,
        platformBuildID:  appinfo.platformBuildID,
        platformVersion:  appinfo.platformVersion,
        userAgent:        window.navigator.userAgent
      };
    }
  });
} else {
  alert("Cannot add Browser diagnostic provider to HealthService");
}
