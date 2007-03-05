package com.thoughtworks.webdriver.firefox;

import java.io.File;

import com.thoughtworks.webdriver.JavascriptEnabledDriverTest;
import com.thoughtworks.webdriver.WebDriver;

public class FirefoxDriverTest extends JavascriptEnabledDriverTest {
	private File findDirectory(String path) {
		File extensionDir = new File(path);
		if (!extensionDir.exists()) {
			extensionDir = new File("firefox" + path);
		}
		assertTrue("Cannot find the directory: " + path, extensionDir.exists());
		return extensionDir;
	}
	
	protected WebDriver getDriver() {
		return new FirefoxDriver();
	}
	
	protected boolean isUsingSameDriverInstance() {
		return true;
	}
}
