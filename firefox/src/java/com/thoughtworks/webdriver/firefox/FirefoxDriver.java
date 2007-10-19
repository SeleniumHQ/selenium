package com.thoughtworks.webdriver.firefox;

import com.thoughtworks.webdriver.Alert;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * An implementation of the {#link WebDriver} interface that drives Firefox. This works through a firefox extension,
 * which can be installed via the {#link FirefoxLauncher}. Important system variables are:
 * <ul>
 *  <li><b>webdriver.firefox.bin</b> - Which firefox binary to use (normally "firefox" on the PATH).</li>
 *  <li><b>webdriver.firefox.profile</b> - The name of the profile to use (normally "WebDriver").</li>
 * </ul>
 *
 * When the driver starts, it will make a copy of the profile it is using, rather than using that profile directly.
 * This allows multiple instances of firefox to be started.
 */
public class FirefoxDriver implements WebDriver {
    private final ExtensionConnection extension;
    private long id;

    public FirefoxDriver() {
        this(null);
    }

    public FirefoxDriver(String profileName) {
        extension = new ExtensionConnection("localhost", 7055);

        if (!(connectToBrowser(1))) {
            new FirefoxLauncher().startProfile(profileName);
            connectToBrowser(10);
        }

        if (!extension.isConnected()) {
            throw new RuntimeException(
                    "Unable to connect to Firefox. Is the WebDriver extension installed, and is there a profile called WebDriver?\n" +
                            "To set up a profile for WebDriver, simply start firefox from the command line with the \"ProfileManager\" switch\n" +
                            "This will look like: firefox -ProfileManager. Alternatively, use the FirefoxLauncher support class from this project");
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
        for (String id : ids) {
            elements.add(new FirefoxWebElement(this, id));
        }
        return elements;

    }

  public WebDriver setVisible(boolean visible) {
        // no-op
        return this;
    }

    public TargetLocator switchTo() {
        return new FirefoxTargetLocator();
    }

    private boolean connectToBrowser(int timeToWaitInSeconds) {
        long waitUntil = System.currentTimeMillis() + timeToWaitInSeconds * 1000;
        while (!extension.isConnected() && waitUntil > System.currentTimeMillis()) {
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

    public void quit() {
        try {
            sendMessage("quit", null);
        } catch (NullPointerException e) {
            // This is expected. Swallow it.
        }
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
