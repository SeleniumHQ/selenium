package com.thoughtworks.webdriver.firefox;

import com.thoughtworks.webdriver.WebElement;

import java.util.List;
import java.util.ArrayList;

public class FirefoxWebElement implements WebElement {
    private final ExtensionConnection extension;
    private final DocumentLocation identifier;
    private final String elementId;

    public FirefoxWebElement(ExtensionConnection extension, DocumentLocation identifier, String elementId) {
        this.extension = extension;
        this.identifier = identifier;
        this.elementId = elementId;
    }

    public void click() {
        sendMessage("click", elementId);
    }

    public void submit() {
        sendMessage("submitElement", elementId);
    }

    public String getValue() {
        return sendMessage("getElementValue", elementId);
    }

    public void setValue(String value) {
        sendMessage("setElementValue", elementId + " " + value);
    }

    public String getAttribute(String name) {
        return sendMessage("getElementAttribute", elementId + " " + name);
    }

    public boolean toggle() {
        click();
        return isSelected();
    }

    public boolean isSelected() {
        String value = sendMessage("getElementSelected", elementId);
        return Boolean.parseBoolean(value);
    }

    public void setSelected() {
        String response = sendMessage("setElementSelected", elementId);
        if (!Boolean.parseBoolean(response)) {
            throw new UnsupportedOperationException("You may not select an unselectable element");
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
            children.add(new FirefoxWebElement(extension, identifier, ids[i]));

        return children;
    }

    private String sendMessage(String methodName, String argument) {
        Response response = extension.sendMessageAndWaitForResponse(methodName, identifier, argument);
        return response.getResponseText();
    }
}
