package com.thoughtworks.webdriver.firefox;

import com.thoughtworks.webdriver.WebElement;

import java.util.List;
import java.util.ArrayList;

public class FirefoxWebElement implements WebElement {
    private final ExtensionConnection extension;
    private final Context context;
    private final String elementId;

    public FirefoxWebElement(ExtensionConnection extension, Context context, String elementId) {
        this.extension = extension;
        this.context = context;
        this.elementId = elementId;
    }

    public void click() {
        sendMessage("click", elementId);
    }

    public void submit() {
        sendMessage("submitElement", elementId);
    }

    public String getValue() {
        String result = sendMessage("getElementValue", elementId);
        String[] parts = result.split("\n");
        if (!"OK".equals(parts[0]))
        	return null;
        
        if (parts.length > 1)
        	return parts[1];
        return "";
    }

    public void setValue(String value) {
        sendMessage("setElementValue", elementId + " " + value);
    }

    public String getAttribute(String name) {
        String result = sendMessage("getElementAttribute", elementId + " " + name);
        String[] parts = result.split("\n");
        if (!"OK".equals(parts[0]))
        	return null;
        
        if (parts.length > 1)
        	return parts[1];
        return "";
    }

    public boolean toggle() {
        String response = sendMessage("toggleElement", elementId);
        if (response.length() != 0) {
        	throw new UnsupportedOperationException(response);
        }
        return isSelected();
    }

    public boolean isSelected() {
        String value = sendMessage("getElementSelected", elementId);
        return Boolean.parseBoolean(value);
    }

    public void setSelected() {
        String response = sendMessage("setElementSelected", elementId);
        if (!"".equals(response)) {
            throw new UnsupportedOperationException(response);
        }
    }

    public boolean isEnabled() {
        String value = getAttribute("disabled");
        return !Boolean.parseBoolean(value);
    }

    public String getText() {
        return sendMessage("getElementText", elementId);
    }

    public List getChildrenOfType(String tagName) {
        String response = sendMessage("getElementChildren", elementId + " " + tagName);
        String[] ids = response.split(" ");

        ArrayList children = new ArrayList();
        for (int i = 0; i < ids.length; i++)
            children.add(new FirefoxWebElement(extension, context, ids[i]));

        return children;
    }

    private String sendMessage(String methodName, String argument) {
        Response response = extension.sendMessageAndWaitForResponse(methodName, context, argument);
        return response.getResponseText();
    }
}
