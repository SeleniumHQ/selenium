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

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import com.jacob.activeX.ActiveXComponent;
import com.jacob.com.ComFailException;
import com.jacob.com.ComThread;
import com.jacob.com.Variant;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

public class InternetExplorerDriver implements WebDriver {
	private ActiveXComponent ie;

	public InternetExplorerDriver() {
	    ComThread.InitSTA();
	    ie = new ActiveXComponent("InternetExploderFox");
	}
	
	public void close() {
		ie.invoke("Close");
		ComThread.Release();
//		try {
//			Thread.sleep(100);
//		} catch (InterruptedException e) {
			// Does nothing
//		}
	}

	public void get(String url) {
		ie.invoke("Get", url);
	}

	public void dumpBody() {
		ie.invoke("DumpBody");
	}

	public String getTitle() {
		return ie.getPropertyAsString("Title");
	}

	public boolean getVisible() {
		return ie.getPropertyAsBoolean("Visible");
	}

	public void setVisible(boolean visible) {
		ie.setProperty("Visible", visible);
	}
	
	public List selectElements(String xpath) {
		Variant results = safelyInvoke("SelectElementsByXPath", xpath, "Cannot find elements using xpath: " + xpath);
		Iterator i = new JacobIListWrapper(results).iterator();
		
		List elements = new LinkedList();
		while (i.hasNext()) {
			elements.add(new WrappedWebElement((Variant) i.next()));
		}

		return elements;
	}

	public WebElement selectElement(String xpath) {
		Variant result = safelyInvoke("SelectElement", xpath, "Cannot find element using: " + xpath);
		return new WrappedWebElement(result);
	}
	
	public String selectText(String xpath) {
		return safelyInvoke("SelectTextWithXPath", xpath, "Cannot find text using xpath: " + xpath).getString();
	}

	private Variant safelyInvoke(String methodName, String argument, String errorMessage) {
		try {
			return ie.invoke(methodName, argument);
		} catch (ComFailException e) {
			throw new NoSuchElementException(errorMessage);
		}
	}
}
