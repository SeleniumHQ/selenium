package org.openqa.selenium.firefox;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.OperatingSystem;

import java.awt.Point;
import java.awt.Dimension;

import java.util.ArrayList;
import java.util.List;

public class FirefoxWebElement implements RenderedWebElement, FindsByXPath,
        FindsByLinkText, FindsById, FindsByName, FindsByClassName, SearchContext {
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
    
    public void sendKeys(CharSequence... value) {
    	StringBuilder builder = new StringBuilder();
    	for (CharSequence seq : value) {
    		builder.append(seq);
    	}
        sendMessage(RuntimeException.class, "sendKeys", builder.toString());
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
 
    public WebElement findElement(By by) {
        return by.findElement(this);
    }

    public List<WebElement> findElements(By by) {
        return by.findElements(this);
    }
    
    public WebElement findElementByXPath(String xpath) {
        List<WebElement> elements = findElementsByXPath(xpath);
        if (elements.size() == 0) {
            throw new NoSuchElementException(
                    "Unable to find element with xpath " + xpath);
        }
        return elements.get(0);
    }
    
    public List<WebElement> findElementsByXPath(String xpath) {
        String indices = sendMessage(RuntimeException.class, 
                "findElementsByXPath", xpath);
        return getElementsFromIndices(indices);
    }

    public WebElement findElementByLinkText(String linkText) {
        List<WebElement> elements = findElementsByLinkText(linkText);
        if (elements.size() == 0) {
            throw new NoSuchElementException(
                    "Unable to find element with linkText" + linkText);
        }
        return elements.get(0);
    }

    public List<WebElement> findElementsByLinkText(String linkText) {
        String indices = sendMessage(RuntimeException.class, 
                "findElementsByLinkText", linkText);
        return getElementsFromIndices(indices);
    }
    
    private List<WebElement> getElementsFromIndices(String indices) {
        List<WebElement> elements = new ArrayList<WebElement>();

        if (indices.length() == 0)
            return elements;

        String[] ids = indices.split(",");
        for (String id : ids) {
            elements.add(new FirefoxWebElement(parent, id));
        }
        return elements;
    }
    
    public WebElement findElementById(String id) {
    	String response = sendMessage(RuntimeException.class, "findElementById", id);
    	if (response.equals("-1"))
    		throw new NoSuchElementException("Unable to find element with id" + id);
    	return new FirefoxWebElement(parent, response);
    }

    public List<WebElement> findElementsById(String id) {
    	return findElementsByXPath(".//*[@id = '" + id + "']");  
    }

    public WebElement findElementByName(String name) {
        return findElementByXPath(".//*[@name = '" + name + "']");
    }

    public List<WebElement> findElementsByName(String name) {
        return findElementsByXPath(".//*[@name = '" + name + "']");
    }
    
    public WebElement findElementByClassName(String using) {
        List<WebElement> elements = findElementsByClassName(using);
        if (elements.size() == 0) {
            throw new NoSuchElementException(
                    "Unable to find element by class name " + using);
        }
        return elements.get(0);
    }
    
    public List<WebElement> findElementsByClassName(String using) {
    	String indices = sendMessage(RuntimeException.class, "findElementsByClassName", using);
        return getElementsFromIndices(indices);
    }
    
    public String getValueOfCssProperty(String propertyName) {
    	return sendMessage(RuntimeException.class,"getElementCssProperty", propertyName);
    }
    
    private String sendMessage(Class<? extends RuntimeException> throwOnFailure, String methodName, Object... parameters) {
        return parent.sendMessage(throwOnFailure, new Command(parent.context, elementId, methodName, parameters));
    }

    public String getElementId() {
        return elementId;
    }

    public WebElement findElementByPartialLinkText(String using) {
    	String id = sendMessage(RuntimeException.class, 
                "findElementByPartialLinkText", using);
    	return new FirefoxWebElement(parent, id);
    }

    public List<WebElement> findElementsByPartialLinkText(String using) {
        String indices = sendMessage(RuntimeException.class, 
                "findElementsByPartialLinkText", using);
        return getElementsFromIndices(indices);
    }
}
