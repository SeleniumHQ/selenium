package com.thoughtworks.webdriver.firefox;

import com.thoughtworks.webdriver.WebElement;

import java.util.List;
import java.util.ArrayList;

public class FirefoxWebElement implements WebElement {
    private final ExtensionConnection extension;
    private final String elementId;

    public FirefoxWebElement(ExtensionConnection extension, String elementId) {
        this.extension = extension;
        this.elementId = elementId;
    }

    public void click() {
        extension.sendMessageAndWaitForResponse("click", elementId);
    }

    public void submit() {
        extension.sendMessageAndWaitForResponse("submitElement", elementId);
    }

    public String getValue() {
        return extension.sendMessageAndWaitForResponse("getElementValue", elementId);
    }

    public void setValue(String value) {
        extension.sendMessageAndWaitForResponse("setElementValue", elementId + " " + value);
    }

    public String getAttribute(String name) {
        return extension.sendMessageAndWaitForResponse("getElementAttribute", elementId + " " + name);
    }

    public boolean toggle() {
        return false;
    }

    public boolean isSelected() {
        return false;
    }

    public void setSelected() {
    }

    public boolean isEnabled() {
        return false;
    }

    public String getText() {
        return extension.sendMessageAndWaitForResponse("getElementText", elementId);
    }

    public List getChildrenOfType(String tagName) {
        String response = extension.sendMessageAndWaitForResponse("getElementChildren", elementId + " " + tagName);
        String[] ids = response.split(" ");

        ArrayList children = new ArrayList();
        for (int i = 0; i < ids.length; i++)
            children.add(new FirefoxWebElement(extension, ids[i]));

        return children;
    }
}
