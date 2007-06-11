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

import java.util.List;

import org.jaxen.JaxenException;

import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

public class InternetExplorerDriver implements WebDriver {
	private long iePointer; // Used by the native code to keep track of the IE instance
	private static boolean comStarted;
	
	public InternetExplorerDriver() {
		startCom();
		openIe();
	}
	
	// We may well need a finalizer to ensure that we release all the resources we should
	
	public native void close();

	public void dumpBody() {
	}

	public native void get(String url);

	public native String getCurrentUrl();

	public native String getTitle();

	public native boolean getVisible();

	public native void setVisible(boolean visible);

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
				return (ElementNode) result;
			} catch (JaxenException e) {
				throw new RuntimeException(e);
			}
		}
	}

	public List selectElements(String xpath) {
		return null;
	}

	public String selectText(String xpath) {
		return null;
	}

	public TargetLocator switchTo() {
		return null;
	}
	
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
	
	private native DocumentNode getDocument();
}
