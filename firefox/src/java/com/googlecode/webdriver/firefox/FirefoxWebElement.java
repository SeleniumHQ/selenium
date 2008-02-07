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
        sendMessage(RuntimeException.class, "click");
    }

    public void submit() {
        sendMessage(RuntimeException.class, "submitElement");
    }

    public String getValue() {
        try {
            String toReturn = sendMessage(RuntimeException.class, "getElementValue");
            return toReturn.replace("\n", OperatingSystem.getCurrentPlatform().getLineEnding());
        } catch (RuntimeException e) {
            return null;
        }
    }

    public void clear() {
    	sendMessage(RuntimeException.class, "clear");
    }
    
    public void sendKeys(String value) {
        sendMessage(RuntimeException.class, "sendKeys", value);
    }

    public String getAttribute(String name) {
        try {
            return sendMessage(RuntimeException.class, "getElementAttribute", name);
        } catch (RuntimeException e) {
            return null;
        }
    }

    public boolean toggle() {
        sendMessage(UnsupportedOperationException.class, "toggleElement");
        return isSelected();
    }

    public boolean isSelected() {
        String value = sendMessage(RuntimeException.class, "getElementSelected");
        return Boolean.parseBoolean(value);
    }

    public void setSelected() {
        sendMessage(UnsupportedOperationException.class, "setElementSelected");
    }

    public boolean isEnabled() {
        String value = getAttribute("disabled");
        return !Boolean.parseBoolean(value);
    }

    public String getText() {
    	String toReturn = sendMessage(RuntimeException.class, "getElementText");
        return toReturn.replace("\n", OperatingSystem.getCurrentPlatform().getLineEnding());
    }

    public List<WebElement> getChildrenOfType(String tagName) {
        String response = sendMessage(RuntimeException.class, "getElementChildren", tagName);
        String[] ids = response.split(" ");

        ArrayList<WebElement> children = new ArrayList<WebElement>();
        for (String id : ids)
            children.add(new FirefoxWebElement(parent, id));

        return children;
    }

    public boolean isDisplayed() {
        return Boolean.parseBoolean(sendMessage(RuntimeException.class, "isElementDisplayed"));
    }

    public Point getLocation() {
        String result = sendMessage(RuntimeException.class, "getElementLocation");

        String[] parts = result.split(",");
        int x = Integer.parseInt(parts[0].trim());
        int y = Integer.parseInt(parts[1].trim());

        return new Point(x, y);
    }

    public Dimension getSize() {
        String result = sendMessage(RuntimeException.class, "getElementSize");

        String[] parts = result.split(",");
        int x = Integer.parseInt(parts[0].trim());
        int y = Integer.parseInt(parts[1].trim());

        return new Dimension(x, y);
    }
    
    public void dragAndDropBy(int moveRight, int moveDown) {
        sendMessage(RuntimeException.class, "dragAndDrop", moveRight, moveDown);
    }

    public void dragAndDropOn(RenderedWebElement element) {
        Point currentLocation = getLocation();
        Point destination = element.getLocation();
        dragAndDropBy(destination.x - currentLocation.x, destination.y - currentLocation.y);
    }

    private String sendMessage(Class<? extends RuntimeException> throwOnFailure, String methodName, Object... parameters) {
        return parent.sendMessage(throwOnFailure, new Command(parent.context, elementId, methodName, parameters));
    }
}
