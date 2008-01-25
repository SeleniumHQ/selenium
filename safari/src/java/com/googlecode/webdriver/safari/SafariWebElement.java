package com.googlecode.webdriver.safari;

import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.WebDriver;

import java.util.List;

public class SafariWebElement implements WebElement {
    private final int index;
    private final AppleScript appleScript;
    private final SafariDriver parent;
    private final String locator;

    public SafariWebElement(SafariDriver parent, String elementIndex) {
        this.parent = parent;
        index = Integer.parseInt(elementIndex);
        locator = SafariDriver.ELEMENTS + "[" + index + "]";

        appleScript = new AppleScript();
    }

    public WebDriver click() {
        appleScript.executeJavascript(
                "if (" + locator + "[\"click\"])" +
                    locator + ".click();\r" +
                "var event = document.createEvent(\"MouseEvents\");\r" +
                "event.initMouseEvent(\"click\", true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null);" +
                locator + ".dispatchEvent(event);\r" 
        );
        parent.waitForLoadToComplete();
        return parent;
    }

    public WebDriver submit() {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    public String getValue() {
        return appleScript.executeJavascript(
            "if (" + locator + "[\"value\"] !== undefined)\r" +
            "  return " + locator + ".value;\r" +
            "if (" + locator + ".hasAttribute(\"value\"))\r" +
            "  " + locator + ".getAttribute(\"value\");\r");
    }

    public WebDriver setValue(String value) {
        appleScript.executeJavascript(locator + ".focus()");
        appleScript.executeApplescript(
        		"tell application \"System Events\"\r" + 
        		"    keystroke (\"" + value + "\")\r" +
        		"end tell");
        appleScript.executeJavascript(locator + ".blur()");
                
        return parent;
    }

    public String getAttribute(String name) {
        throw new UnsupportedOperationException("getAttribute");
    }

    public boolean toggle() {
    	throw new UnsupportedOperationException("toggle");
    }

    public boolean isSelected() {
        throw new UnsupportedOperationException("isSelected");
    }

    public WebDriver setSelected() {
    	throw new UnsupportedOperationException("setSelected");
    }

    public boolean isEnabled() {
        throw new UnsupportedOperationException("isEnabled");
    }

    public String getText() {
        return appleScript.executeJavascript("return " + locator + ".innerText");
    }

    public List<WebElement> getChildrenOfType(String tagName) {
        throw new UnsupportedOperationException("getChildrenOfType");
    }
}
