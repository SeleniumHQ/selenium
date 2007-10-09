package com.thoughtworks.webdriver.ie;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

import java.util.ArrayList;
import java.util.List;

public class InternetExplorerElement implements WebElement {
    @SuppressWarnings("unused")
    private long nodePointer;

    // Called from native code
    private InternetExplorerElement(long nodePointer) {
        this.nodePointer = nodePointer;
    }

    protected static native InternetExplorerElement createInternetExplorerElement(long ieWrapper, ElementNode node);

    public native WebDriver click();

    public native String getAttribute(String name);

    public List<WebElement> getChildrenOfType(String tagName) {
        List<WebElement> toReturn = new ArrayList<WebElement>();
        getChildrenOfTypeNatively(toReturn, tagName);
        return toReturn;
    }

    public native String getText();

    public native String getValue();

    public native WebDriver setValue(String value);

    public native boolean isEnabled();

    public native boolean isSelected();

    public native WebDriver setSelected();

    public native WebDriver submit();

    public native boolean toggle();

    public boolean isDisplayed() {
        throw new UnsupportedOperationException("isDisplayed");
    }

    @Override
    protected void finalize() throws Throwable {
        deleteStoredObject();
    }

    private native void deleteStoredObject();

    private native void getChildrenOfTypeNatively(List<WebElement> toReturn, String tagName);
}
