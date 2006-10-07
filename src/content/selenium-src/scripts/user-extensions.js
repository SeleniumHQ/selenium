document.write('<script src="chrome://selenium-ide/content/preferences.js" type="text/javascript"></script>');
document.write('<script src="chrome://selenium-ide/content/selenium-ide-loader.js" type="text/javascript"></script>');

TestResult.prototype.originalPost = TestResult.prototype.post;

TestResult.prototype.post = function() {
    var editor = SeleniumIDE.Loader.getTopEditor();
    if (editor && editor.testRunnerResultCallback) {
        editor.testRunnerResultCallback(this, window);
    } else {
        this.originalPost();
    }
};

var TestRunnerConfig = Class.create();
Object.extend(TestRunnerConfig.prototype, URLConfiguration.prototype);
Object.extend(TestRunnerConfig.prototype, {
        initialize: function() {
            this.queryString = location.search.substr(1);
            this.userExtensionsURL = this._getQueryParameter("userExtensionsURL");
            this.baseURL = this._getQueryParameter("baseURL");
        }
    });

var testRunnerConfig = new TestRunnerConfig();

if (testRunnerConfig.userExtensionsURL) {
	var urls = testRunnerConfig.userExtensionsURL.split(/,/);
	for (var i = 0; i < urls.length; i++) {
		var url = urls[i];
		document.write('<script src="' + url + '" language="JavaScript" type="text/javascript"></script>');
	}
}

Selenium.prototype.real_doOpen = Selenium.prototype.doOpen;

Selenium.prototype.doOpen = function(newLocation) {
    var baseURL = testRunnerConfig.baseURL;
	if (baseURL && newLocation) {
		if (!newLocation.match(/^\w+:\/\//)) {
			if (baseURL[baseURL.length - 1] == '/' && newLocation[0] == '/') {
				newLocation = baseURL + newLocation.substr(1);
			} else {
				newLocation = baseURL + newLocation;
			}
		}
	}
	return this.real_doOpen(newLocation);
};
