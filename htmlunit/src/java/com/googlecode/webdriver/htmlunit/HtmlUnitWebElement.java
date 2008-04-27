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

package com.googlecode.webdriver.htmlunit;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.gargoylesoftware.htmlunit.html.ClickableElement;
import com.gargoylesoftware.htmlunit.html.DomNode;
import com.gargoylesoftware.htmlunit.html.DomText;
import com.gargoylesoftware.htmlunit.html.HtmlButton;
import com.gargoylesoftware.htmlunit.html.HtmlCheckBoxInput;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlForm;
import com.gargoylesoftware.htmlunit.html.HtmlImageInput;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.html.HtmlOption;
import com.gargoylesoftware.htmlunit.html.HtmlPreformattedText;
import com.gargoylesoftware.htmlunit.html.HtmlSelect;
import com.gargoylesoftware.htmlunit.html.HtmlSubmitInput;
import com.gargoylesoftware.htmlunit.html.HtmlTextArea;
import com.googlecode.webdriver.NoSuchElementException;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.internal.OperatingSystem;

public class HtmlUnitWebElement implements WebElement {
    private final HtmlUnitDriver parent;
    private final HtmlElement element;
    private final static char nbspChar = (char) 160;
    private final static String[] blockLevelsTagNames =
            {"p", "h1", "h2", "h3", "h4", "h5", "h6", "dl", "div", "noscript",
                    "blockquote", "form", "hr", "table", "fieldset", "address", "ul", "ol", "pre", "br"};

    public HtmlUnitWebElement(HtmlUnitDriver parent, HtmlElement element) {
        this.parent = parent;
        this.element = element;
        
        
    }

    public void click() {
        if (!(element instanceof ClickableElement))
            return;

        ClickableElement clickableElement = ((ClickableElement) element);
        try {
            clickableElement.click();
            return;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void submit() {
        try {
            if (element instanceof HtmlForm) {
                submitForm((HtmlForm) element);
                return;
            } else if (element instanceof HtmlSubmitInput) {
                ((HtmlSubmitInput) element).click();
                return;
            } else if (element instanceof HtmlImageInput) {
                ((HtmlImageInput) element).click();
                return;
            } else if (element instanceof HtmlInput) {
                submitForm(((HtmlInput) element).getEnclosingForm());
                return;
            }

            WebElement form = findParentForm();
            if (form == null)
                throw new NoSuchElementException("Unable to find the containing form");
            form.submit();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void submitForm(HtmlForm form) {
    	List<String> names = new ArrayList<String>();
    	names.add("input");
    	names.add("button");
    	List<? extends HtmlElement> allElements = form.getHtmlElementsByTagNames(names);
    	
    	HtmlElement submit = null;
    	for (HtmlElement element : allElements) {
    		if (!isSubmitElement(element))
    			continue;
    		
    		if (isBefore(submit, element))
    			submit = element;
    	}
    	
    	if (submit == null)
    		throw new RuntimeException("Cannot locate element used to submit form");
    	try {
			((ClickableElement) submit).click();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	private boolean isSubmitElement(HtmlElement element) {
		HtmlElement candidate = null;
		
		if (element instanceof HtmlSubmitInput && !((HtmlSubmitInput)element).isDisabled())
			candidate = element;
		else if (element instanceof HtmlImageInput && !((HtmlImageInput)element).isDisabled())
			candidate = element;
		else if (element instanceof HtmlButton) {
			HtmlButton button = (HtmlButton) element;
			if ("submit".equalsIgnoreCase(button.getTypeAttribute()) && !button.isDisabled()) 
				candidate = element;
		}
		
		return candidate != null;
	}

	private boolean isBefore(HtmlElement submit, HtmlElement element) {
		if (submit == null)
			return true;
		
		return false;
	}

	public String getValue() {
        if (element instanceof HtmlTextArea)
            return ((HtmlTextArea) element).getText();
        return getAttribute("value");
    }

    public void clear() {
    	if (element instanceof HtmlInput) {
            element.setAttributeValue("value", "");
        } else if (element instanceof HtmlTextArea) {
            ((HtmlTextArea) element).setText("");
        }
    }
    
    public void sendKeys(CharSequence... value) {
        StringBuilder builder = new StringBuilder();
        for (CharSequence seq : value) {
            builder.append(seq);
        }

        if (element instanceof HtmlInput) {
        	String currentValue = getValue();
            element.setAttributeValue("value", (currentValue == null ? "" : currentValue) + builder.toString());
        } else if (element instanceof HtmlTextArea) {
        	String currentValue = getValue();
            ((HtmlTextArea) element).setText((currentValue == null ? "" : currentValue) + builder.toString());
        } else
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


        return null;
    }

    public boolean toggle() {
        try {
            if (element instanceof HtmlCheckBoxInput) {
                ((HtmlCheckBoxInput) element).click();
                return isSelected();
            }

            if (element instanceof HtmlOption) {
                HtmlOption option = (HtmlOption) element;
                HtmlSelect select = option.getEnclosingSelect();
                if (select.isMultipleSelectEnabled()) {
                    option.setSelected(!option.isSelected());
                    return isSelected();
                }
            }

            throw new UnsupportedOperationException("You may only toggle checkboxes or options in a select which allows multiple selections");
        } catch (IOException e) {
            throw new RuntimeException("Unexpected exception: " + e);
        }
    }

    public boolean isSelected() {
        if (element instanceof HtmlInput)
            return ((HtmlInput) element).isChecked();
        else if (element instanceof HtmlOption)
            return ((HtmlOption) element).isSelected();

        throw new UnsupportedOperationException("Unable to determine if element is selected. Tag name is: " + element.getTagName());
    }

    public void setSelected() {
        String disabledValue = element.getAttributeValue("disabled");
        if (disabledValue.length() > 0) {
            throw new UnsupportedOperationException("You may not select a disabled element");
        }

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

    // This isn't very pretty. Sorry.
    public String getText() {
        StringBuffer toReturn = new StringBuffer();
        StringBuffer textSoFar = new StringBuffer();

        getTextFromNode(element, toReturn, textSoFar, element instanceof HtmlPreformattedText);

        String text = collapseWhitespace(textSoFar) + toReturn.toString();

        int index = text.length();
        while (index > 0 && isWhiteSpace(text.charAt(index - 1))) {
            index--;
        }

        return text.substring(0, index);
    }


    protected HtmlUnitDriver getParent() {
        return parent;
    }

    protected HtmlElement getElement() {
        return element;
    }

    private boolean isWhiteSpace(int lastChar) {
        return lastChar == '\n' || lastChar == ' ' || lastChar == '\t' || lastChar == '\r';
    }

    @SuppressWarnings("unchecked")
    private void getTextFromNode(DomNode node, StringBuffer toReturn, StringBuffer textSoFar, boolean isPreformatted) {
        if (isPreformatted) {
            getPreformattedText(node, toReturn);
        }

        for (DomNode child : node.getChildren()) {
            // Do we need to collapse the text so far?
            if (child instanceof HtmlPreformattedText) {
                toReturn.append(collapseWhitespace(textSoFar));
                textSoFar.delete(0, textSoFar.length());
                getTextFromNode(child, toReturn, textSoFar, true);
                continue;
            }

            // Or is this just plain text?
            if (child instanceof DomText) {
                String textToAdd = ((DomText) child).getData();
                textToAdd = textToAdd.replace(nbspChar, ' ');
                textSoFar.append(textToAdd);
                continue;
            }

            // Treat as another child node.
            getTextFromNode(child, toReturn, textSoFar, false);
        }

        if (isBlockLevel(node)) {
            toReturn.append(collapseWhitespace(textSoFar)).append(OperatingSystem.getCurrentPlatform().getLineEnding());
            textSoFar.delete(0, textSoFar.length());
        }
    }

    private boolean isBlockLevel(DomNode node) {
        // From the HTML spec (http://www.w3.org/TR/html401/sgml/dtd.html#block)
//		 <!ENTITY % block "P | %heading; | %list; | %preformatted; | DL | DIV | NOSCRIPT | BLOCKQUOTE | FORM | HR | TABLE | FIELDSET | ADDRESS">
//	     <!ENTITY % heading "H1|H2|H3|H4|H5|H6">
//	     <!ENTITY % list "UL | OL">
//	     <!ENTITY % preformatted "PRE">

        if (!(node instanceof HtmlElement))
            return false;

        String tagName = ((HtmlElement) node).getTagName().toLowerCase();
        for (int i = 0; i < blockLevelsTagNames.length; i++) {
            if (blockLevelsTagNames[i].equals(tagName))
                return true;
        }
        return false;
    }

    private String collapseWhitespace(StringBuffer textSoFar) {
        String textToAdd = textSoFar.toString();
        return textToAdd.replaceAll("\\p{javaWhitespace}+", " ").replaceAll("\r", "");
    }

    private void getPreformattedText(DomNode node, StringBuffer toReturn) {
        String xmlText = node.asXml();
        toReturn.append(xmlText.replaceAll("^<pre.*?>", "").replaceAll("</pre.*>$", ""));
    }

    @SuppressWarnings("unchecked")
    public List<WebElement> getChildrenOfType(String tagName) {
        Iterable<HtmlElement> allChildren = element.getAllHtmlChildElements();
        List<WebElement> elements = new ArrayList<WebElement>();
        for (HtmlElement child : allChildren) {
            if (tagName.equals(child.getTagName())) {
                elements.add(new HtmlUnitWebElement(parent, child));
            }
        }
        return elements;
    }

    public boolean isDisplayed() {
        return true; // Always assume that the element is displayed
    }

    private WebElement findParentForm() {
        DomNode current = element;
        while (!(current == null || current instanceof HtmlForm)) {
            current = current.getParentNode();
        }
        return new HtmlUnitWebElement(parent, (HtmlForm) current);
    }
}
