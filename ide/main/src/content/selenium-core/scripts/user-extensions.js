document.write('<script src="chrome://selenium-ide/content/preferences.js" type="text/javascript"></script>');
document.write('<script src="chrome://selenium-ide/content/selenium-ide-loader.js" type="text/javascript"></script>');

SeleniumTestResult.prototype.originalPost = SeleniumTestResult.prototype.post;

SeleniumTestResult.prototype.post = function() {
    var editor = SeleniumIDE.Loader.getTopEditor();
    if (editor && editor.testRunnerResultCallback) {
        editor.testRunnerResultCallback(this, window);
    } else {
        this.originalPost();
    }
};

HtmlTestRunnerControlPanel.prototype.getBaseUrl = function() {
    // it is recommended to use baseUrl, but for backward compatibility we also accept baseURL
    return URLConfiguration.prototype.getBaseUrl.call(this) || this._getQueryParameter("baseURL");
};

var TestRunnerConfig = Class.create();
Object.extend(TestRunnerConfig.prototype, URLConfiguration.prototype);
Object.extend(TestRunnerConfig.prototype, {
        initialize: function() {
            this.queryString = location.search.substr(1);
            this.userExtensionsURL = this._getQueryParameter("userExtensionsURL");
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

HtmlTestSuiteFrame.prototype._setLocation =
HtmlTestFrame.prototype._setLocation =
SeleniumFrame.prototype._setLocation = function(location) {
    // Using frame.src because location.replace fails in Firefox 3 chrome
    var isChrome = browserVersion.isChrome || false;
    var isHTA = browserVersion.isHTA || false;
    location += (location.indexOf("?") == -1 ? "?" : "&");
    location += "thisIsChrome=" + isChrome + "&thisIsHTA=" + isHTA; 
    this.frame.src = location;
};

MozillaBrowserBot.prototype.modifyWindowToRecordPopUpDialogsWithoutRecorder = MozillaBrowserBot.prototype.modifyWindowToRecordPopUpDialogs;

MozillaBrowserBot.prototype.modifyWindowToRecordPopUpDialogs = function(windowToModify, browserBot) {
    this.modifyWindowToRecordPopUpDialogsWithoutRecorder(windowToModify, browserBot);

    // modifyWindowToRecordPopUpDialogs may overwrite functions registered by the recorder,
    // so we are registering them again here
    var recorder = SeleniumIDE.Loader.getRecorder(windowToModify);
    if (recorder) {
        recorder.reattachWindowMethods();
    }
};
