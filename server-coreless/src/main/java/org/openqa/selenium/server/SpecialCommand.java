package org.openqa.selenium.server;

public enum SpecialCommand {
	getNewBrowserSession,
	testComplete,
	shutDownSeleniumServer,
	getLogMessages,
	retrieveLastRemoteControlLogs,
	captureEntirePageScreenshotToString,
	attachFile,
	captureScreenshot,
	captureScreenshotToString,
	captureNetworkTraffic,
	addCustomRequestHeader,
	keyDownNative,
	keyUpNative,
	keyPressNative,
	isPostSupported,
	setSpeed,
	getSpeed,
	addStaticContent,
	runHTMLSuite,
	launchOnly,
	slowResources,
	open,
	getLog,
	nonSpecial;
	
	public static SpecialCommand getValue(final String command) {
		try {
			return valueOf(command);
		} catch(Exception e) {
			return nonSpecial;
		}
	}
}
