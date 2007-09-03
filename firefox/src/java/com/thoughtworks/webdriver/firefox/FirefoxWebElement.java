package com.thoughtworks.webdriver.firefox;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

import java.util.ArrayList;
import java.util.List;

public class FirefoxWebElement implements WebElement {
    private final FirefoxDriver parent;
    private final String elementId;

    public FirefoxWebElement(FirefoxDriver parent, String elementId) {
        this.parent = parent;
        this.elementId = elementId;
    }

    public WebDriver click() {
        parent.sendMessage("click", elementId);
        return parent.findActiveDriver();
    }

    public WebDriver submit() {
        parent.sendMessage("submitElement", elementId);
        return parent.findActiveDriver();
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

        return remainder;
    }

    public WebDriver setValue(String value) {
        parent.sendMessage("setElementValue", elementId + " " + value);
        return parent.findActiveDriver();
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

    public WebDriver setSelected() {
        String response = parent.sendMessage("setElementSelected", elementId);
        if (!"".equals(response)) {
            throw new UnsupportedOperationException(response);
        }
        return parent.findActiveDriver();
    }

    public boolean isEnabled() {
        String value = getAttribute("disabled");
        return !Boolean.parseBoolean(value);
    }

    public String getText() {
        return parent.sendMessage("getElementText", elementId);
    }

    public List getChildrenOfType(String tagName) {
        String response = parent.sendMessage("getElementChildren", elementId + " " + tagName);
        String[] ids = response.split(" ");

        ArrayList children = new ArrayList();
        for (int i = 0; i < ids.length; i++)
            children.add(new FirefoxWebElement(parent, ids[i]));

        return children;
    }

    public boolean isDisplayed() {
        return Boolean.parseBoolean(parent.sendMessage("isElementDisplayed", elementId));
    }
}
