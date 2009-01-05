/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;

import java.util.ArrayList;
import java.util.List;

// Kept package level deliberately.

class Finder implements SearchContext,
	FindsById, FindsByClassName, FindsByLinkText, FindsByName, FindsByXPath {

	private final long iePointer;
	private final long domNodePointer;
	
	public Finder(long iePointer, long domNodePointer) {
		this.iePointer = iePointer;
		this.domNodePointer = domNodePointer;		
	}
	
	public WebElement findElementById(String using) {
		return selectElementById(iePointer, domNodePointer, using);
	}
	private native WebElement selectElementById(long iePointer, long domNodePointer, String using);

	public List<WebElement> findElementsById(String using) {
		List<WebElement> rawElements = new ArrayList<WebElement>();
		selectElementsById(iePointer, domNodePointer, using, rawElements);
        return rawElements;
	}		
    private native void selectElementsById(long iePointer, long domNodePointer, String using, List<WebElement> rawElements);
	
	public WebElement findElementByName(String using) {
		return selectElementByName(iePointer, domNodePointer, using);
	}
	private native WebElement selectElementByName(long iePointer, long domNodePointer, String using);
	
	public List<WebElement> findElementsByName(String using) {
		List<WebElement> rawElements = new ArrayList<WebElement>();
		selectElementsByName(iePointer, domNodePointer, using, rawElements);
        return rawElements;
	}		
    private native void selectElementsByName(long iePointer, long domNodePointer, String using, List<WebElement> rawElements);

	public WebElement findElementByClassName(String using) {
		return selectElementByClassName(iePointer, domNodePointer, using);
	}
	private native WebElement selectElementByClassName(long iePointer, long domNodePointer, String using);
	
	public List<WebElement> findElementsByClassName(String using) {
		List<WebElement> rawElements = new ArrayList<WebElement>();
		selectElementsByClassName(iePointer, domNodePointer, using, rawElements);
        return rawElements;
	}		
    private native void selectElementsByClassName(long iePointer, long domNodePointer, String using, List<WebElement> rawElements);

    public WebElement findElementByLinkText(String using) {
		return selectElementByLinkText(iePointer, domNodePointer, using);
	}
	private native WebElement selectElementByLinkText(long iePointer, long domNodePointer, String using);
	
	public List<WebElement> findElementsByLinkText(String using) {
		List<WebElement> rawElements = new ArrayList<WebElement>();
		selectElementsByLinkText(iePointer, domNodePointer, using, rawElements);
        return rawElements;
	}		
    private native void selectElementsByLinkText(long iePointer, long domNodePointer, String using, List<WebElement> rawElements);
    
    public WebElement findElementByXPath(String using) {
		return selectElementByXPath(iePointer, domNodePointer, using);
	}
	private native WebElement selectElementByXPath(long iePointer, long domNodePointer, String using);
	
	public List<WebElement> findElementsByXPath(String using) {
		List<WebElement> rawElements = new ArrayList<WebElement>();
		selectElementsByXPath(iePointer, domNodePointer, using, rawElements);
        return rawElements;
	}		
    private native void selectElementsByXPath(long iePointer, long domNodePointer, String using, List<WebElement> rawElements);
    
	public WebElement findElement(By by) {
		return by.findElement(this);
	}
	public List<WebElement> findElements(By by) {
		return by.findElements(this);
	}

	public WebElement findElementByPartialLinkText(String using) {
		throw new UnsupportedOperationException();
	}

	public List<WebElement> findElementsByPartialLinkText(String using) {
		throw new UnsupportedOperationException();
	}
}