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

package org.openqa.selenium.htmlunit;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Platform;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Attr;

import com.gargoylesoftware.htmlunit.ScriptException;
import com.gargoylesoftware.htmlunit.html.*;

public class HtmlUnitWebElement implements WebElement,
    FindsById, FindsByLinkText, FindsByXPath, FindsByTagName, SearchContext {
    protected final HtmlUnitDriver parent;
    protected final HtmlElement element;
    private final static char nbspChar = (char) 160;
    private final static String[] blockLevelsTagNames =
            {"p", "h1", "h2", "h3", "h4", "h5", "h6", "dl", "div", "noscript",
                    "blockquote", "form", "hr", "table", "fieldset", "address", "ul", "ol", "pre", "br"};
    private String toString;

    public HtmlUnitWebElement(HtmlUnitDriver parent, HtmlElement element) {
        this.parent = parent;
        this.element = element;
    }

    public void click() {
        if (!(element instanceof ClickableElement))
            return;

        ClickableElement clickableElement = ((ClickableElement) element);
        try {
            if (parent.isJavascriptEnabled() && !(element instanceof HtmlInput)) {
                element.focus();
            }

            clickableElement.click();
        } catch (IOException e) {
            throw new WebDriverException(e);
        } catch (ScriptException e) {
          System.out.println(e.getMessage());
          // Press on regardless
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
                submitForm(element.getEnclosingForm());
                return;
            }

            WebElement form = findParentForm();
            if (form == null)
                throw new NoSuchElementException("Unable to find the containing form");
            form.submit();
        } catch (IOException e) {
            throw new WebDriverException(e);
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
    		throw new WebDriverException("Cannot locate element used to submit form");
    	try {
			((ClickableElement) submit).click();
		} catch (IOException e) {
			throw new WebDriverException(e);
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
      return submit == null;
    }

	public String getValue() {
        if (element instanceof HtmlTextArea)
            return ((HtmlTextArea) element).getText();
        return getAttribute("value");
    }

    public void clear() {
        if (element instanceof HtmlInput) {
            ((HtmlInput)element).setValueAttribute("");
        } else if (element instanceof HtmlTextArea) {
            ((HtmlTextArea) element).setText("");
        }
    }

    public void sendKeys(CharSequence... value) {
        StringBuilder builder = new StringBuilder();
        for (CharSequence seq : value) {
            builder.append(seq);
        }

        if (parent.isJavascriptEnabled() && !(element instanceof HtmlFileInput)) {
          try {
            element.type(builder.toString());
            return;
          } catch (IOException e) {
            throw new WebDriverException(e);
          }
        }

        if (element instanceof HtmlInput) {
            String currentValue = getValue();
            element.setAttribute("value", (currentValue == null ? "" : currentValue) + builder.toString());
        } else if (element instanceof HtmlTextArea) {
            String currentValue = getValue();
            ((HtmlTextArea) element).setText((currentValue == null ? "" : currentValue) + builder.toString());
        } else {
            throw new UnsupportedOperationException("You may only set the value of elements that are input elements");
        }
    }

    public String getElementName() {
        return element.getNodeName();
    }

    public String getAttribute(String name) {
        final String lowerName = name.toLowerCase();

        String value = element.getAttribute(name);

        if ("disabled".equals(lowerName)) {
            return isEnabled() ? "false" : "true";
        }
        if ("selected".equals(lowerName)) {
            return (value.equalsIgnoreCase("selected") ? "true" : "false");
        }
        if ("checked".equals(lowerName)) {
            return (value.equalsIgnoreCase("checked") ? "true" : "false");
        }
        if ("index".equals(lowerName) && element instanceof HtmlOption) {
          HtmlSelect select = ((HtmlOption) element).getEnclosingSelect();
          List<HtmlOption> allOptions = select.getOptions();
          for (int i = 0; i < allOptions.size(); i++) {
            HtmlOption option = select.getOption(i);
            if (element.equals(option)) {
              return String.valueOf(i);
            }
          }

          return null;
        }
        if ("readonly".equalsIgnoreCase(lowerName)) {
          if (element instanceof HtmlInput) {
            return String.valueOf(((HtmlInput) element).isReadOnly());
          }

          if (element instanceof HtmlTextArea) {
            return "".equals(((HtmlTextArea) element).getReadOnlyAttribute()) ? "false" : "true";
          }

          return null;
        }

        if (!"".equals(value))
            return value;

        if (element.hasAttribute(name))
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

            throw new UnsupportedOperationException("You may only toggle checkboxes or options in a select which allows multiple selections: " + getElementName());
        } catch (IOException e) {
            throw new WebDriverException("Unexpected exception: " + e);
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
        String disabledValue = element.getAttribute("disabled");
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
      return !element.hasAttribute("disabled");
    }

    // This isn't very pretty. Sorry.
    public String getText() {
        StringBuffer toReturn = new StringBuffer();
        StringBuffer textSoFar = new StringBuffer();

        getTextFromNode(element, toReturn, textSoFar, element instanceof HtmlPreformattedText);

        String text = toReturn.toString() + collapseWhitespace(textSoFar);

        return text.trim();
    }

  protected HtmlUnitDriver getParent() {
        return parent;
    }

    protected HtmlElement getElement() {
        return element;
    }

    private void getTextFromNode(DomNode node, StringBuffer toReturn, StringBuffer textSoFar, boolean isPreformatted) {
        if (node instanceof HtmlScript) {
            return;
        }
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
            toReturn.append(collapseWhitespace(textSoFar)).append(Platform.getCurrent().getLineEnding());
            textSoFar.delete(0, textSoFar.length());
        }
    }

    private boolean isBlockLevel(DomNode node) {
        // From the HTML spec (http://www.w3.org/TR/html401/sgml/dtd.html#block)
        //     <!ENTITY % block "P | %heading; | %list; | %preformatted; | DL | DIV | NOSCRIPT | BLOCKQUOTE | FORM | HR | TABLE | FIELDSET | ADDRESS">
        //     <!ENTITY % heading "H1|H2|H3|H4|H5|H6">
        //     <!ENTITY % list "UL | OL">
        //     <!ENTITY % preformatted "PRE">

        if (!(node instanceof HtmlElement))
            return false;

        String tagName = ((HtmlElement) node).getTagName().toLowerCase();
      for (String blockLevelsTagName : blockLevelsTagNames) {
        if (blockLevelsTagName.equals(tagName)) {
          return true;
        }
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

  public List<WebElement> getElementsByTagName(String tagName) {
    List<?> allChildren =  element.getByXPath(".//" + tagName);
    List<WebElement> elements = new ArrayList<WebElement>();
    for (Object o : allChildren) {
      if (!(o instanceof HtmlElement))
        continue;

      HtmlElement child = (HtmlElement) o;
      elements.add(getParent().newHtmlUnitWebElement(child));
    }
    return elements;
  }

  public WebElement findElement(By by) {
        return by.findElement(this);
    }

    public List<WebElement> findElements(By by) {
        return by.findElements(this);
    }

    public WebElement findElementById(String id) {
        return findElementByXPath(".//*[@id = '" + id + "']");
    }

    public List<WebElement> findElementsById(String id) {
        return findElementsByXPath(".//*[@id = '" + id + "']");
    }

    public WebElement findElementByXPath(String xpathExpr) {
        HtmlElement match = (HtmlElement) element.getFirstByXPath(xpathExpr);
        if (match == null) {
            throw new NoSuchElementException("Unable to find element with xpath "
                    + xpathExpr);
        }
        return getParent().newHtmlUnitWebElement(match);
    }

    public List<WebElement> findElementsByXPath(String xpathExpr) {
        List<WebElement> webElements = new ArrayList<WebElement>();
        List<?> htmlElements = element.getByXPath(xpathExpr);
        for (Object e : htmlElements) {
            webElements.add(getParent().newHtmlUnitWebElement((HtmlElement) e));
        }
        return webElements;
    }

    public WebElement findElementByLinkText(String linkText) {
        List<WebElement> elements = findElementsByLinkText(linkText);
        if (elements.size() == 0) {
            throw new NoSuchElementException(
                    "Unable to find element with linkText " + linkText);
        }
        return elements.size() > 0 ? elements.get(0) : null;
    }

    public List<WebElement> findElementsByLinkText(String linkText) {
        List<HtmlElement> htmlElements =
            (List<HtmlElement>) element.getHtmlElementsByTagName("a");
        List<WebElement> webElements = new ArrayList<WebElement>();
        for (HtmlElement e : htmlElements) {
            if (e.getTextContent().equals(linkText)
                    && e.getAttribute("href") != null) {
                webElements.add(getParent().newHtmlUnitWebElement(e));
            }
        }
        return webElements;
    }

    public WebElement findElementByPartialLinkText(String linkText) {
        List<WebElement> elements = findElementsByPartialLinkText(linkText);
        if (elements.size() == 0) {
            throw new NoSuchElementException(
                    "Unable to find element with linkText " + linkText);
        }
        return elements.size() > 0 ? elements.get(0) : null;
    }

    public List<WebElement> findElementsByPartialLinkText(String linkText) {
        List<HtmlElement> htmlElements =
            (List<HtmlElement>) element.getHtmlElementsByTagName("a");
        List<WebElement> webElements = new ArrayList<WebElement>();
        for (HtmlElement e : htmlElements) {
            if (e.getTextContent().contains(linkText)
                    && e.getAttribute("href") != null) {
                webElements.add(getParent().newHtmlUnitWebElement(e));
            }
        }
        return webElements;
    }

    public WebElement findElementByTagName(String name) {
      List<WebElement> elements = findElementsByTagName(name);
      if (elements.size() == 0) {
        throw new NoSuchElementException("Cannot find element with tag name: " + name);
      }
      return elements.get(0);
    }

    public List<WebElement> findElementsByTagName(String name) {
      return findElementsByXPath(".//*[local-name()='" + name + "']");

      /* TODO(simon.m.stewart): Update this once the next version of HtmlUnit is released
      NodeList elements = element.getElementsByTagName(name);
      ArrayList<WebElement> toReturn = new ArrayList<WebElement>(elements.getLength());
      for (int i = 0; i < elements.getLength(); i++) {
        toReturn.add(parent.newHtmlUnitWebElement((HtmlElement) elements.item(i)));
      }

      return toReturn;
      */
    }

    private WebElement findParentForm() {
        DomNode current = element;
        while (!(current == null || current instanceof HtmlForm)) {
            current = current.getParentNode();
        }
        return getParent().newHtmlUnitWebElement((HtmlForm) current);
    }

    @Override
    public String toString() {
        if (toString == null) {
            StringBuilder sb = new StringBuilder();
            sb.append('<').append(element.getTagName());
            NamedNodeMap attributes = element.getAttributes();
            int n = attributes.getLength();
            for (int i = 0; i < n; ++i) {
                Attr a = (Attr) attributes.item(i);
                sb.append(' ').append(a.getName()).append("=\"").append(a.getValue().replace("\"", "&quot;")).append("\"");
            }
            if (element.hasChildNodes()) {
                sb.append('>');
            } else {
                sb.append(" />");
            }
            toString = sb.toString();
        }
        return toString;
    }
}
