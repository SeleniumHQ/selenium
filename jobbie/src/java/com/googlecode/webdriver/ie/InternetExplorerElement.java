package com.googlecode.webdriver.ie;

import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.RenderedWebElement;

import java.util.ArrayList;
import java.util.List;
import java.awt.Dimension;
import java.awt.Point;

public class InternetExplorerElement implements RenderedWebElement {
    @SuppressWarnings("unused")
    private long nodePointer;

    // Called from native code
    private InternetExplorerElement(long nodePointer) {
        this.nodePointer = nodePointer;
    }

    protected static native InternetExplorerElement createInternetExplorerElement(long ieWrapper, ElementNode node);

    public native void click();

    public native String getAttribute(String name);

    public List<WebElement> getChildrenOfType(String tagName) {
        List<WebElement> toReturn = new ArrayList<WebElement>();
        getChildrenOfTypeNatively(toReturn, tagName);
        return toReturn;
    }

    public native String getText();

    public native String getValue();

    public native void sendKeys(String value);

    public native void clear();
    
    public native boolean isEnabled();

    public native boolean isSelected();

    public native void setSelected();

    public native void submit();

    public native boolean toggle();

    public native boolean isDisplayed();

    public native Point getLocation();

    public native Dimension getSize();

  @Override
    protected void finalize() throws Throwable {
        deleteStoredObject();
    }

    private native void deleteStoredObject();

    private native void getChildrenOfTypeNatively(List<WebElement> toReturn, String tagName);

    public void dragAndDropBy(int moveRightBy, int moveDownBy) {
        throw new UnsupportedOperationException();
    }

    public void dragAndDropOn(RenderedWebElement element) {
        throw new UnsupportedOperationException();
    }
}
