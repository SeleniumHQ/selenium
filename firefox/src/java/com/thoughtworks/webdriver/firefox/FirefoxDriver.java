package com.thoughtworks.webdriver.firefox;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

public class FirefoxDriver implements WebDriver {
	private final ExtensionConnection extension;

	public FirefoxDriver() {
		extension = new ExtensionConnection("localhost", 7055);

		if (!(connectToBrowser(1))) {
			startFirefox();
			connectToBrowser(10);
		}

		if (!extension.isConnected()) {
			throw new RuntimeException(
					"Unable to connect to Firefox. Is the WebDriver extension installed, and is there a profile called WebDriver?\n" +
                            "To set up a profile for WebDriver, simply start firefox from the command line with the \"profileManager\" switch\n" +
                            "This will look like: firefox -profileManager");
		}
	}

	public void close() {
		// TODO Auto-generated method stub

	}

	public void dumpBody() {
		// TODO Auto-generated method stub
	}

	public void get(String url) {
		extension.sendMessageAndWaitForResponse("get", url);
	}

	public String getTitle() {
		return extension.sendMessageAndWaitForResponse("title", null);
	}

	public boolean getVisible() {
		return true;
	}

	public WebElement selectElement(String selector) {
		// TODO Auto-generated method stub
		return null;
	}

	public List selectElements(String xpath) {
		// TODO Auto-generated method stub
		return null;
	}

	public String selectText(String xpath) {
        return extension.sendMessageAndWaitForResponse("selectText", xpath);
    }

	public void setVisible(boolean visible) {
        // no-op
	}

	private String locateFirefoxBinary() {
		String osName = System.getProperty("os.name").toLowerCase();
		File potentialPath;
		if (osName.startsWith("windows")) {
			potentialPath = new File(
					"\\Program Files\\Mozilla Firefox\\firefox.exe");
		} else if (osName.startsWith("mac")) {
			potentialPath = new File(
					"/Applications/Firefox.app/Contents/MacOS/firefox");
		} else {
			potentialPath = shellOutAndFindPathOfFirefox();
		}

		if (potentialPath.exists())
			return potentialPath.getAbsolutePath();
		throw new RuntimeException(
				"Unable to locate location of firefox binary");
	}

	private File shellOutAndFindPathOfFirefox() {
		// Assume that we're on a unix of some kind. We're going to cheat
		try {
			Process which = Runtime.getRuntime().exec("which firefox");
			BufferedReader reader = new BufferedReader(new InputStreamReader(
					which.getInputStream()));
			return new File(reader.readLine());
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	private void startFirefox() {
		String binaryPath = locateFirefoxBinary();
		try {
			Runtime.getRuntime().exec(binaryPath + " -P WebDriver");
		} catch (IOException e) {
			throw new RuntimeException("Cannot load firefox");
		}
	}

	private boolean connectToBrowser(int timeToWaitInSeconds) {
		int tries = timeToWaitInSeconds * 4;
		int i = 0;
		while (!extension.isConnected() && i++ <= tries) {
			try {
			extension.connect();
			} catch (IOException e) {
				try {
					Thread.sleep(250);
				} catch (InterruptedException ie) {
					throw new RuntimeException(ie); 
				}
			}
		}
        return extension.isConnected();
    }
}
