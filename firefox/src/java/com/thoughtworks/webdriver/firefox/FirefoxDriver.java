package com.thoughtworks.webdriver.firefox;

import com.thoughtworks.webdriver.Alert;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class FirefoxDriver implements WebDriver {
    private final ExtensionConnection extension;
    private long id;

    public FirefoxDriver() {
        this(null);
    }

    public FirefoxDriver(File firefoxBinary) {
        extension = new ExtensionConnection("localhost", 7055);

        if (!(connectToBrowser(1))) {
            startFirefox(firefoxBinary);
            connectToBrowser(10);
        }

        if (!extension.isConnected()) {
            throw new RuntimeException(
                    "Unable to connect to Firefox. Is the WebDriver extension installed, and is there a profile called WebDriver?\n" +
                            "To set up a profile for WebDriver, simply start firefox from the command line with the \"profileManager\" switch\n" +
                            "This will look like: firefox -profileManager");
        }

        fixId();
    }

    private FirefoxDriver(ExtensionConnection extension, long id) {
        this.extension = extension;
        this.id = id;
    }

    public WebDriver close() {
        sendMessage("close", null);
        try {
            return findActiveDriver();
        } catch (NullPointerException e) {
            // All good
            return null;
        }
    }

    public String getPageSource() {
        return sendMessage("getPageSource", null);
    }

    public WebDriver get(String url) {
        sendMessage("get", url);
        return this;
    }

    public String getCurrentUrl() {
        return sendMessage("getCurrentUrl", null);
    }

    public String getTitle() {
        return sendMessage("title", null);
    }

    public boolean getVisible() {
        return true;
    }

    public WebElement selectElement(String selector) {
        String commandName = "selectElementUsingXPath";
        String argument = selector;
        if (selector.startsWith("link=")) {
            commandName = "selectElementUsingLink";
            argument = selector.substring("link=".length());
        } else if (selector.startsWith("id=")) {
            commandName = "selectElementById";
            argument = selector.substring("id=".length());
        }

        String elementId = sendMessage(commandName, argument);
        if (elementId == null || "".equals(elementId)) {
            throw new NoSuchElementException("Unable to find " + argument);
        }

        return new FirefoxWebElement(this, elementId);
    }

    public List<WebElement> selectElements(String xpath) {
        String returnedIds = sendMessage("selectElementsUsingXPath", xpath);
        String[] ids = returnedIds.split(",");
        List<WebElement> elements = new ArrayList<WebElement>();
        for (int i = 0; i < ids.length; i++) {
            elements.add(new FirefoxWebElement(this, ids[i]));
        }
        return elements;

    }

    public String selectText(String xpath) {
        WebElement element = selectElement(xpath);
        return element.getText();
    }

    public WebDriver setVisible(boolean visible) {
        // no-op
        return this;
    }

    public TargetLocator switchTo() {
        return new FirefoxTargetLocator();
    }

    private File locateFirefoxBinary() {
        File potentialPath = locateFirefoxBinaryFromSystemProperty();
        if (potentialPath != null || potentialPath.exists())
          return potentialPath;

        String osName = System.getProperty("os.name").toLowerCase();
        if (osName.startsWith("windows")) {
            potentialPath = new File(
                    "\\Program Files\\Mozilla Firefox\\firefox.exe");
        } else if (osName.startsWith("mac")) {
            potentialPath = new File(
                    "/Applications/Firefox.app/Contents/MacOS/firefox");
        } else {
            potentialPath = shellOutAndFindPathOfFirefox("firefox");
        }

        if (potentialPath.exists())
            return potentialPath;
        throw new RuntimeException(
                "Unable to locate location of firefox binary");
    }

  private File locateFirefoxBinaryFromSystemProperty() {
    String binaryName = System.getProperty("firefox.bin");
    if (binaryName == null)
      return null;

    File binary = new File(binaryName);
    if (binary.exists())
      return binary;

    String osName = System.getProperty("os.name").toLowerCase();
    if (osName.contains("windows"))
      return null;  // Who knows how to handle this

    if (osName.contains("mac")) {
      if (!binaryName.endsWith(".app"))
        binaryName += ".app";
      binaryName += "/Contents/MacOS/firefox";
      return new File(binaryName);
    }

    // Assume that we're on a UNIX variant
    return shellOutAndFindPathOfFirefox(binaryName);

  }

  private File shellOutAndFindPathOfFirefox(String binaryName) {
        // Assume that we're on a unix of some kind. We're going to cheat
        try {
            Process which = Runtime.getRuntime().exec(new String[] {"which", binaryName});
            BufferedReader reader = new BufferedReader(new InputStreamReader(
                    which.getInputStream()));
            return new File(reader.readLine());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void startFirefox(File firefoxBinary) {
        File binary = firefoxBinary;

        if (firefoxBinary == null) {
            binary = locateFirefoxBinary();

        }
        try {
            if (!binary.exists()) {
                throw new RuntimeException("Unable to locate firefox binary. Please check that it is installed in the default location, " +
                        "or the path given points to the firefox binary. I would have used: " + firefoxBinary.getPath());
            }
            Runtime.getRuntime().exec(binary.getAbsolutePath() + " -P WebDriver");
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

    protected WebDriver findActiveDriver() {
        String response = sendMessage("findActiveDriver", null);
        long newId = Long.parseLong(response);
        if (newId == id) {
            return this;
        }
        return new FirefoxDriver(extension, newId);
    }

    protected String sendMessage(String methodName, String argument) {
        Response response = extension.sendMessageAndWaitForResponse(methodName, id, argument);
        return response.getResponseText();
    }

    private void fixId() {
        String response = sendMessage("findActiveDriver", null);
        id = Long.parseLong(response);
    }

    private class FirefoxTargetLocator implements TargetLocator {
        public WebDriver frame(int frameIndex) {
            sendMessage("switchToFrame", String.valueOf(frameIndex));
            return FirefoxDriver.this;
        }

        public WebDriver window(String windowName) {
            String response = sendMessage("switchToWindow", String.valueOf(windowName));
            if (response == null || "No window found".equals(response)) {
                return null;
            }
            try {
                FirefoxDriver.this.id = Long.parseLong(response);
            } catch (NumberFormatException e) {
                throw new RuntimeException("When switching to window: " + windowName + " ---- " + response);
            }
            return FirefoxDriver.this;
        }

        public WebDriver defaultContent() {
            sendMessage("switchToDefaultContent", null);
            return FirefoxDriver.this;
        }

        public Alert alert() {
            throw new UnsupportedOperationException("alert");
        }
    }
}
