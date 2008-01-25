package com.googlecode.webdriver.firefox;

import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.RenderedWebElement;
import com.googlecode.webdriver.internal.OperatingSystem;

import java.awt.Point;
import java.awt.Dimension;

import java.util.ArrayList;
import java.util.List;

public class FirefoxWebElement implements RenderedWebElement {
    private final FirefoxDriver parent;
    private final String elementId;

    public FirefoxWebElement(FirefoxDriver parent, String elementId) {
        this.parent = parent;
        this.elementId = elementId;
    }

    public void click() {
        parent.sendMessage("click", elementId);
    }

    public void submit() {
        parent.sendMessage("submitElement", elementId);
    }

    public String getValue() {
        String result = parent.sendMessage("getElementValue", elementId);

        int newlineIndex = result.indexOf('\n');

        String status = result;
        String remainder = "";

        if (newlineIndex != -1) {
            status = result.substring(0, newlineIndex);
            remainder = result.substring(newlineIndex + 1);
        }

        if (!"OK".equals(status))
            return null;

        return remainder.replace("\n", OperatingSystem.getCurrentPlatform().getLineEnding());
    }

    public void clear() {
    	parent.sendMessage("clear", elementId);
    }
    
    public void sendKeys(String value) {
        parent.sendMessage("sendKeys", elementId + " " + value);
    }

    public String getAttribute(String name) {
        String result = parent.sendMessage("getElementAttribute", elementId + " " + name);
        String[] parts = result.split("\n");
        if (!"OK".equals(parts[0]))
            return null;

        if (parts.length > 1)
            return parts[1];
        return "";
    }

    public boolean toggle() {
        String response = parent.sendMessage("toggleElement", elementId);
        if (response.length() != 0) {
            throw new UnsupportedOperationException(response);
        }
        return isSelected();
    }

    public boolean isSelected() {
        String value = parent.sendMessage("getElementSelected", elementId);
        return Boolean.parseBoolean(value);
    }

    public void setSelected() {
        String response = parent.sendMessage("setElementSelected", elementId);
        if (!"".equals(response)) {
            throw new UnsupportedOperationException(response);
        }
    }

    public boolean isEnabled() {
        String value = getAttribute("disabled");
        return !Boolean.parseBoolean(value);
    }

    public String getText() {
    	String toReturn = parent.sendMessage("getElementText", elementId);
        return toReturn.replace("\n", OperatingSystem.getCurrentPlatform().getLineEnding());
    }

    public List<WebElement> getChildrenOfType(String tagName) {
        String response = parent.sendMessage("getElementChildren", elementId + " " + tagName);
        String[] ids = response.split(" ");

        ArrayList<WebElement> children = new ArrayList<WebElement>();
        for (int i = 0; i < ids.length; i++)
            children.add(new FirefoxWebElement(parent, ids[i]));

        return children;
    }

    public boolean isDisplayed() {
        return Boolean.parseBoolean(parent.sendMessage("isElementDisplayed", elementId));
    }

    public Point getLocation() {
        String result = parent.sendMessage("getElementLocation", elementId);

        String[] parts = result.split(",");
        int x = Integer.parseInt(parts[0].trim());
        int y = Integer.parseInt(parts[1].trim());

        return new Point(x, y);
    }

    public Dimension getSize() {
        String result = parent.sendMessage("getElementSize", elementId);

        String[] parts = result.split(",");
        int x = Integer.parseInt(parts[0].trim());
        int y = Integer.parseInt(parts[1].trim());

        return new Dimension(x, y);
    }
}
