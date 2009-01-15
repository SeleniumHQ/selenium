/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.ie;

import org.openqa.selenium.By;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.Locatable;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class InternetExplorerElement implements RenderedWebElement, SearchContext, Locatable {
    @SuppressWarnings("unused")
    private long nodePointer;

    // Called from native code
    private InternetExplorerElement(long nodePointer) {
        this.nodePointer = nodePointer;
    }

    public native void click();

    public native String getElementName();

    public native String getAttribute(String name);

  public List<WebElement> getElementsByTagName(String tagName) {
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

    public native Point getLocationOnScreenOnceScrolledIntoView();
    
    public native Point getLocation();

    public native Dimension getSize();

    public native String getValueOfCssProperty(String propertyName);
    
    private native long getElementNode();
    private native void releaseElementNode(long node);
    private native long getIePointer();
    private native void releaseIePointer(long pointer);

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
    	long node = getElementNode();
    	long iePointer = getIePointer();
    	try {
    		return new Finder(iePointer, node).findElement(by);
    	} finally {
    		releaseIePointer(iePointer);
    		releaseElementNode(node);
    	}
    }

    public List<WebElement> findElements(By by) {
    	long node = getElementNode();
    	long iePointer = getIePointer();
    	try {
    		return new Finder(iePointer, node).findElements(by);
    	} finally {
    		releaseIePointer(iePointer);
    		releaseElementNode(node);
    	}
    }
}
