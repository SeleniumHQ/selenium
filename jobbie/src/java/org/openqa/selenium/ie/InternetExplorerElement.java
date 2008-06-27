package org.openqa.selenium.ie;

import java.awt.Dimension;
import java.awt.Point;
import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;

public class InternetExplorerElement implements RenderedWebElement, SearchContext {
    @SuppressWarnings("unused")
    private long nodePointer;

    // Called from native code
    private InternetExplorerElement(long nodePointer) {
        this.nodePointer = nodePointer;
    }

    public native void click();

    public native String getAttribute(String name);

    public List<WebElement> getChildrenOfType(String tagName) {
        List<WebElement> toReturn = new ArrayList<WebElement>();
        getChildrenOfTypeNatively(toReturn, tagName);
        return toReturn;
    }	

    public native String getText();

    public native String getValue();

    public void sendKeys(CharSequence... value) {
    	StringBuilder builder = new StringBuilder();
    	for (CharSequence seq : value) {
    		builder.append(seq);
    	}
    	
    	doSendKeys(builder.toString());
    }

    private native void doSendKeys(String string);
    
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

    public WebElement findElement(By by) {
        throw new UnsupportedOperationException();
    }

    public List<WebElement> findElements(By by) {
        throw new UnsupportedOperationException();
    }

    public native String getValueOfCssProperty(String propertyName);
}
