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

package com.thoughtworks.webdriver.htmlunit;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.gargoylesoftware.htmlunit.html.ClickableElement;
import com.gargoylesoftware.htmlunit.html.DomNode;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlForm;
import com.gargoylesoftware.htmlunit.html.HtmlImageInput;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.html.HtmlOption;
import com.gargoylesoftware.htmlunit.html.HtmlSubmitInput;
import com.gargoylesoftware.htmlunit.html.HtmlTextArea;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebElement;

public class HtmlUnitWebElement implements WebElement {
	private final HtmlElement element;

	public HtmlUnitWebElement(HtmlElement element) {
		this.element = element;
	}
	
	public void click() {
		if (!(element instanceof ClickableElement))
			return;
		
		ClickableElement clickableElement = ((ClickableElement) element);
		try {
			clickableElement.click();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
	
	public void submit() {
		try {
			if (element instanceof HtmlForm) {
				((HtmlForm) element).submit();
				return;
			} else if (element instanceof HtmlSubmitInput) {
				((HtmlSubmitInput) element).click();
				return;
			} else if (element instanceof HtmlImageInput) {
				((HtmlImageInput) element).click();
				return;
			} else if (element instanceof HtmlInput) {
				((HtmlInput) element).getEnclosingForm().submit();
				return;
			}
			
			HtmlForm form = findParentForm();
			if (form == null) 
				throw new NoSuchElementException("Unable to find the containing form");
			form.submit();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
	
	public String getValue() {
        if (element instanceof HtmlTextArea)
            return ((HtmlTextArea)element).getText();
        return getAttribute("value");
	}
	
	public void setValue(String value) {
		if (element instanceof HtmlInput)
			element.setAttributeValue("value", value);
        else if (element instanceof HtmlTextArea)
            ((HtmlTextArea)element).setText(value);
        else
			throw new UnsupportedOperationException("You may only set the value of elements that are input elements");
	}
	
	public String getAttribute(String name) {
		final String lowerName = name.toLowerCase();

		String value = element.getAttributeValue(name);

		if ("disabled".equals(lowerName)) {
			return isEnabled() ? "false" : "true";
		}
		if ("selected".equals(lowerName)) {
			return (value.equalsIgnoreCase("selected") ? "true" : "false");
		}
		if ("checked".equals(lowerName)) {
			return (value.equalsIgnoreCase("checked") ? "true" : "false");
		}

		if (!"".equals(value))
			return value;
		
		if (element.isAttributeDefined(name))
			return "";
		
		
		return "";
	}

	public boolean toggle() {
		try {
			((ClickableElement) element).click();
		} catch (IOException e) {
			throw new RuntimeException("Unexpected exception: " + e);
		}
		return isSelected();
	}
	
	public boolean isSelected() {
		if (element instanceof HtmlInput) 
			return ((HtmlInput) element).isChecked();
		else if (element instanceof HtmlOption)
			return ((HtmlOption) element).isSelected();
		
		throw new UnsupportedOperationException("Unable to determine if element is selected. Tag name is: " + element.getTagName());
	}
	
	public void setSelected() {
		if (element instanceof HtmlInput) 
			((HtmlInput) element).setChecked(true);
		else if (element instanceof HtmlOption)
			((HtmlOption) element).setSelected(true);
		else
			throw new UnsupportedOperationException("Unable to select element. Tag name is: " + element.getTagName());
	}
	
	public boolean isEnabled() {
		if (element instanceof HtmlInput) 
			return !((HtmlInput) element).isDisabled();
		
		if (element instanceof HtmlTextArea)
			return !((HtmlTextArea) element).isDisabled();
		
		return true;
	}

	public String getText() {
		return element.asText();
	}
	
	public List getChildrenOfType(String tagName) {
		 Iterator allChildren = element.getAllHtmlChildElements();
		 List elements = new ArrayList();
		 while (allChildren.hasNext()) {
			 HtmlElement child = (HtmlElement) allChildren.next();
			 if (tagName.equals(child.getTagName())) {
				 elements.add(new HtmlUnitWebElement(child));
			 }
		 }
		 return elements;
	}

    public boolean isDisplayed() {
        return false;
    }

    private HtmlForm findParentForm() {
		DomNode current = element;
		while (!(current == null || current instanceof HtmlForm)) {
			current = current.getParentNode();
		}
		return (HtmlForm) current;
	}
}
