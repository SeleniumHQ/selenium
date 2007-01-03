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
import com.jacob.com.ComException;
import com.jacob.com.ComFailException;
import com.jacob.com.Variant;
import com.thoughtworks.webdriver.WebElement;

public class WrappedWebElement implements WebElement {
	private final ActiveXComponent element;

	public WrappedWebElement(Variant element) {
		this.element = new ActiveXComponent(element.toDispatch());
	}
		
	public void click() {
		element.invoke("Click");
	}

	public void submit() {
		element.invoke("Submit");
	}
	
	public String getValue() {
		return element.getPropertyAsString("Value");
	}
	
	public void setValue(String value) {
		try {
			element.setProperty("Value", value);
		} catch (ComException e) {
			throw new UnsupportedOperationException(e.getMessage());
		}
	}

	public String getAttribute(String name) {
		return element.invoke("GetAttribute", name).toString();
	}

	public boolean toggle() {
		return element.invoke("Toggle").getBoolean();
	}
	
	public boolean isSelected() {
		return element.getPropertyAsBoolean("Selected");
	}
	
	public void setSelected() {
		try {
			element.invoke("SetSelected");
		} catch (ComFailException e) {
			throw new UnsupportedOperationException(e.getMessage());
		}
	}
	
	public boolean isEnabled() {
		return element.getPropertyAsBoolean("Enabled");
	}
	
	public String getText() {
		return element.getPropertyAsString("Text");
	}
	
	public List getChildrenOfType(String tagName) {
		Variant results = element.invoke("GetChildrenOfType", tagName);
		Iterator i = new JacobIListWrapper(results).iterator();
		
		List elements = new LinkedList();
		while (i.hasNext()) {
			elements.add(new WrappedWebElement((Variant) i.next()));
		}

		return elements;
	}
}
