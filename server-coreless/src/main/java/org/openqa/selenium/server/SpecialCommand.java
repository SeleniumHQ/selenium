package org.openqa.selenium.server;

public enum SpecialCommand {
	getNewBrowserSession,
	testComplete,
	shutDown,
	getLogMessages,
	retrieveLastRemoteControlLogs,
	captureEntirePageScreenshotToString,
	attachFile,
	captureScreenshot,
	captureScreenshotToString,
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
	nonSpecial;
	
	public static SpecialCommand getValue(final String command) {
		try {
			return valueOf(command);
		} catch(Exception e) {
			return nonSpecial;
		}
	}
}
