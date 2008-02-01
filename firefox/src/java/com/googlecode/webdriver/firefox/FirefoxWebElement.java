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
        parent.sendMessage(RuntimeException.class, "click", elementId);
    }

    public void submit() {
        parent.sendMessage(RuntimeException.class, "submitElement", elementId);
    }

    public String getValue() {
        try {
            return parent.sendMessage(RuntimeException.class, "getElementValue", elementId);
        } catch (RuntimeException e) {
            return null;
        }
    }

    public void clear() {
    	parent.sendMessage(RuntimeException.class, "clear", elementId);
    }
    
    public void sendKeys(String value) {
        parent.sendMessage(RuntimeException.class, "sendKeys", elementId + " " + value);
    }

    public String getAttribute(String name) {
        try {
            return parent.sendMessage(RuntimeException.class, "getElementAttribute", elementId + " " + name);
        } catch (RuntimeException e) {
            return null;
        }
    }

    public boolean toggle() {
        parent.sendMessage(UnsupportedOperationException.class, "toggleElement", elementId);
        return isSelected();
    }

    public boolean isSelected() {
        String value = parent.sendMessage(RuntimeException.class, "getElementSelected", elementId);
        return Boolean.parseBoolean(value);
    }

    public void setSelected() {
        parent.sendMessage(UnsupportedOperationException.class, "setElementSelected", elementId);
    }

    public boolean isEnabled() {
        String value = getAttribute("disabled");
        return !Boolean.parseBoolean(value);
    }

    public String getText() {
    	String toReturn = parent.sendMessage(RuntimeException.class, "getElementText", elementId);
        return toReturn.replace("\n", OperatingSystem.getCurrentPlatform().getLineEnding());
    }

    public List<WebElement> getChildrenOfType(String tagName) {
        String response = parent.sendMessage(RuntimeException.class, "getElementChildren", elementId + " " + tagName);
        String[] ids = response.split(" ");

        ArrayList<WebElement> children = new ArrayList<WebElement>();
        for (String id : ids)
            children.add(new FirefoxWebElement(parent, id));

        return children;
    }

    public boolean isDisplayed() {
        return Boolean.parseBoolean(parent.sendMessage(RuntimeException.class, "isElementDisplayed", elementId));
    }

    public Point getLocation() {
        String result = parent.sendMessage(RuntimeException.class, "getElementLocation", elementId);

        String[] parts = result.split(",");
        int x = Integer.parseInt(parts[0].trim());
        int y = Integer.parseInt(parts[1].trim());

        return new Point(x, y);
    }

    public Dimension getSize() {
        String result = parent.sendMessage(RuntimeException.class, "getElementSize", elementId);

        String[] parts = result.split(",");
        int x = Integer.parseInt(parts[0].trim());
        int y = Integer.parseInt(parts[1].trim());

        return new Dimension(x, y);
    }
    
    public void dragAndDropBy(int moveRight, int moveDown) {
        parent.sendMessage(RuntimeException.class,
                "dragAndDrop", elementId, moveRight + "," + moveDown);
    }

    public void dragAndDropOn(RenderedWebElement element) {
        Point currentLocation = getLocation();
        Point destination = element.getLocation();
        dragAndDropBy(destination.x - currentLocation.x, destination.y - currentLocation.y);
    }
}
