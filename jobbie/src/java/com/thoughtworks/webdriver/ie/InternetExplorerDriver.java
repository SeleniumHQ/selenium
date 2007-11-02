/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.thoughtworks.webdriver.ie;

import com.thoughtworks.webdriver.Alert;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

import org.jaxen.JaxenException;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class InternetExplorerDriver implements WebDriver {
    private long iePointer; // Used by the native code to keep track of the IE instance
    private static boolean comStarted;

    public InternetExplorerDriver() {
        startCom();
        openIe();
    }

    @SuppressWarnings("unused")
    private InternetExplorerDriver(long iePointer) {
        this.iePointer = iePointer;
    }

    public String getPageSource() {
        throw new UnsupportedOperationException("getPageSource");
    }

    public native WebDriver close();

    public native WebDriver get(String url);

    public native String getCurrentUrl();

    public native String getTitle();

    public native boolean getVisible();

    public native WebDriver setVisible(boolean visible);

    public WebElement selectElement(String selector) {
        if (selector.startsWith("id=")) {
            return selectElementById(selector.substring("id=".length()));
        } else if (selector.startsWith("link=")) {
            return selectElementByLink(selector.substring("link=".length()));
        } else {
            try {
                Object result = new IeXPath(selector, this).selectSingleNode(getDocument());
                if (result == null)
                    throw new NoSuchElementException("Cannot find element: " + selector);
                return InternetExplorerElement.createInternetExplorerElement(iePointer, ((ElementNode) result));
            } catch (JaxenException e) {
                throw new RuntimeException(e);
            }
        }
    }

    @SuppressWarnings("unchecked")
    public List<WebElement> selectElements(String selector) {
        List<ElementNode> rawElements = new ArrayList<ElementNode>();
        if (selector.startsWith("link=")) {
            selectElementsByLink(selector.substring("link".length()), rawElements);
            return convertRawPointersToElements(rawElements);
        } else {
            try {
                rawElements = new IeXPath(selector, this).selectNodes(getDocument());
                if (rawElements == null)
                    throw new NoSuchElementException("Cannot find element: " + selector);
                return convertRawPointersToElements(rawElements);
            } catch (JaxenException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private List<WebElement> convertRawPointersToElements(List<ElementNode> rawElements) {
        List<WebElement> elements = new ArrayList<WebElement>();
        Iterator<ElementNode> iterator = rawElements.iterator();
        while (iterator.hasNext()) {
            ElementNode element = iterator.next();
            elements.add(InternetExplorerElement.createInternetExplorerElement(iePointer, element));
        }
        return elements;
    }

  @Override
    public String toString() {
        return getClass().getName() + ":" + iePointer;
    }

    public TargetLocator switchTo() {
        return new InternetExplorerTargetLocator();
    }

    protected native void waitForLoadToComplete();

    private void startCom() {
        if (!comStarted) {
            System.loadLibrary("InternetExplorerDriver");
            startComNatively();
            comStarted = true;
        }
    }

    private native void startComNatively();

    private native void openIe();

    private native WebElement selectElementById(String elementId);

    private native WebElement selectElementByLink(String linkText);

    private native void selectElementsByLink(String linkText, List<ElementNode> rawElements);

    private native DocumentNode getDocument();

    @Override
    protected void finalize() throws Throwable {
        deleteStoredObject();
    }

    private native void deleteStoredObject();

    private native void setFrameIndex(int frameIndex);

    private class InternetExplorerTargetLocator implements TargetLocator {
        public WebDriver frame(int frameIndex) {
            setFrameIndex(frameIndex);
            return InternetExplorerDriver.this;
        }

        public WebDriver frame(String frameName) {
            throw new UnsupportedOperationException("frame");
        }

        public WebDriver window(String windowName) {
            return null; // For the sake of getting us off the ground
        }

        public WebDriver defaultContent() {
            throw new UnsupportedOperationException("defaultContent");
        }

        public Alert alert() {
            throw new UnsupportedOperationException("alert");
        }
    }
}
