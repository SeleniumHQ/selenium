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

import com.gargoylesoftware.htmlunit.Page;

import com.gargoylesoftware.htmlunit.ScriptException;
import com.gargoylesoftware.htmlunit.ScriptResult;
import com.gargoylesoftware.htmlunit.SgmlPage;
import com.gargoylesoftware.htmlunit.html.DomNode;
import com.gargoylesoftware.htmlunit.html.DomText;
import com.gargoylesoftware.htmlunit.html.HtmlButton;
import com.gargoylesoftware.htmlunit.html.HtmlCheckBoxInput;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlFileInput;
import com.gargoylesoftware.htmlunit.html.HtmlForm;
import com.gargoylesoftware.htmlunit.html.HtmlHtml;
import com.gargoylesoftware.htmlunit.html.HtmlImageInput;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.html.HtmlOption;
import com.gargoylesoftware.htmlunit.html.HtmlPreformattedText;
import com.gargoylesoftware.htmlunit.html.HtmlScript;
import com.gargoylesoftware.htmlunit.html.HtmlSelect;
import com.gargoylesoftware.htmlunit.html.HtmlSubmitInput;
import com.gargoylesoftware.htmlunit.html.HtmlTextArea;
import com.gargoylesoftware.htmlunit.html.HtmlHiddenInput;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;
import org.w3c.dom.Attr;
import org.w3c.dom.NamedNodeMap;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.awt.Point;
import java.awt.Dimension;

import static org.openqa.selenium.Keys.ENTER;
import static org.openqa.selenium.Keys.RETURN;
import net.sourceforge.htmlunit.corejs.javascript.Undefined;

public class HtmlUnitWebElement implements RenderedWebElement,
    FindsById, FindsByLinkText, FindsByXPath, FindsByTagName, WrapsDriver {

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
    assertElementNotStale();

    if (!isDisplayed())
      throw new ElementNotVisibleException("You may only click visible elements");

    try {
      if (parent.isJavascriptEnabled()) {
        if (!(element instanceof HtmlInput)) {
          element.focus();
        }
        
        element.mouseOver();
        element.mouseMove();
      }

      element.click();
    } catch (IOException e) {
      throw new WebDriverException(e);
    } catch (ScriptException e) {
      // TODO(simon): This isn't good enough.
      System.out.println(e.getMessage());
      // Press on regardless
    }
  }

  public void submit() {
    assertElementNotStale();

    try {
      if (element instanceof HtmlForm) {
        submitForm((HtmlForm) element);
        return;
      } else if (element instanceof HtmlSubmitInput) {
        element.click();
        return;
      } else if (element instanceof HtmlImageInput) {
        ((HtmlImageInput) element).click();
        return;
      } else if (element instanceof HtmlInput) {
        submitForm(element.getEnclosingForm());
        return;
      }

      WebElement form = findParentForm();
      if (form == null) {
        throw new NoSuchElementException("Unable to find the containing form");
      }
      form.submit();
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  private void submitForm(HtmlForm form) {
    assertElementNotStale();

    List<String> names = new ArrayList<String>();
    names.add("input");
    names.add("button");
    List<? extends HtmlElement> allElements = form.getHtmlElementsByTagNames(names);

    HtmlElement submit = null;
    for (HtmlElement element : allElements) {
      if (!isSubmitElement(element)) {
        continue;
      }

      if (isBefore(submit)) {
        submit = element;
      }
    }

    if (submit == null) {
      if (parent.isJavascriptEnabled()) {
        ScriptResult eventResult = form.fireEvent("submit");
        if (!ScriptResult.isFalse(eventResult)) {
          parent.executeScript("arguments[0].submit()", form);
        }
        return;
      } else {
        throw new WebDriverException("Cannot locate element used to submit form");
      }
    }
    try {
      submit.click();
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  private boolean isSubmitElement(HtmlElement element) {
    HtmlElement candidate = null;

    if (element instanceof HtmlSubmitInput && !((HtmlSubmitInput) element).isDisabled()) {
      candidate = element;
    } else if (element instanceof HtmlImageInput && !((HtmlImageInput) element).isDisabled()) {
      candidate = element;
    } else if (element instanceof HtmlButton) {
      HtmlButton button = (HtmlButton) element;
      if ("submit".equalsIgnoreCase(button.getTypeAttribute()) && !button.isDisabled()) {
        candidate = element;
      }
    }

    return candidate != null;
  }

  private boolean isBefore(HtmlElement submit) {
    return submit == null;
  }

  public String getValue() {
    assertElementNotStale();

    if (element instanceof HtmlTextArea) {
      return ((HtmlTextArea) element).getText();
    }
    String value = getAttribute("value");
    return (value == null) ? "" : value;
  }

  public void clear() {
    assertElementNotStale();

    if (element instanceof HtmlInput) {
      ((HtmlInput) element).setValueAttribute("");
    } else if (element instanceof HtmlTextArea) {
      ((HtmlTextArea) element).setText("");
    }
  }

  public void sendKeys(CharSequence... value) {
    assertElementNotStale();

    String originalValue = getValue();

    if (!isDisplayed())
      throw new ElementNotVisibleException("You may only sendKeys to visible elements");

    StringBuilder builder = new StringBuilder();
    for (CharSequence seq : value) {
      builder.append(seq);
    }

    // If the element is an input element, and the string contains one of
    // ENTER or RETURN, break the string at that point and submit the form
    int indexOfSubmitKey = indexOfSubmitKey(element, builder);
    if (indexOfSubmitKey != -1) {
      builder.delete(indexOfSubmitKey, builder.length());
    }

    HtmlUnitWebElement oldActiveElement =
        ((HtmlUnitWebElement)parent.switchTo().activeElement());
    if (parent.isJavascriptEnabled() &&
        !oldActiveElement.equals(this) &&
        !oldActiveElement.getTagName().toLowerCase().equals("body")) {
      oldActiveElement.element.blur();
      element.focus();
    }
    if (parent.isJavascriptEnabled() && !(element instanceof HtmlFileInput)) {
      try {
        element.type(builder.toString());
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    } else if (element instanceof HtmlInput) {
      HtmlInput input = (HtmlInput) element;

      String currentValue = getValue();
      input.setValueAttribute((currentValue == null ? "" : currentValue) + builder.toString());
    } else if (element instanceof HtmlTextArea) {
      String currentValue = getValue();
      ((HtmlTextArea) element).setText(
          (currentValue == null ? "" : currentValue) + builder.toString());
    } else {
      throw new UnsupportedOperationException(
          "You may only set the value of elements that are input elements");
    }

    if (indexOfSubmitKey != -1) {
      submit();
    }
  }

  private int indexOfSubmitKey(HtmlElement element, StringBuilder builder) {
    if (!(element instanceof HtmlInput))
      return -1;

    CharSequence[] terminators = { "\n", ENTER, RETURN };
    for (CharSequence terminator : terminators) {
      String needle = String.valueOf(terminator);
      int index = builder.indexOf(needle);
      if (index != -1) {
        return index;
      }
    }
    return -1;
  }

  public String getTagName() {
    assertElementNotStale();
    return element.getNodeName();
  }

  public String getAttribute(String name) {
    assertElementNotStale();

    final String lowerName = name.toLowerCase();

    String value = element.getAttribute(name);

    if (element instanceof HtmlInput &&
        ("selected".equals(lowerName) || "checked".equals(lowerName))) {
      return ((HtmlInput)element).isChecked() ? "true" : null;
    }
    if ("disabled".equals(lowerName)) {
      return isEnabled() ? null : "true";
    }
    if ("selected".equals(lowerName)) {
      return (value.equalsIgnoreCase("selected") ? "true" : null);
    }
    if ("checked".equals(lowerName)) {
      return (value.equalsIgnoreCase("checked") ? "true" : null);
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

    if (!"".equals(value)) {
      return value;
    }

    if (element.hasAttribute(name)) {
      return "";
    }

    return null;
  }

  public boolean toggle() {
    assertElementNotStale();

    if (!isDisplayed())
      throw new ElementNotVisibleException("You may only toggle visible elements");


    try {
      if (element instanceof HtmlCheckBoxInput) {
        element.click();
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

      throw new UnsupportedOperationException(
          "You may only toggle checkboxes or options in a select which allows multiple selections: "
          + getTagName());
    } catch (IOException e) {
      throw new WebDriverException("Unexpected exception: " + e);
    }
  }

  public boolean isSelected() {
    assertElementNotStale();

    if (element instanceof HtmlInput) {
      return ((HtmlInput) element).isChecked();
    } else if (element instanceof HtmlOption) {
      return ((HtmlOption) element).isSelected();
    }

    throw new UnsupportedOperationException(
        "Unable to determine if element is selected. Tag name is: " + element.getTagName());
  }

  public void setSelected() {
    assertElementNotStale();

    if (!isDisplayed())
      throw new ElementNotVisibleException("You may only select visible elements");


    String disabledValue = element.getAttribute("disabled");
    if (disabledValue.length() > 0) {
      throw new UnsupportedOperationException("You may not select a disabled element");
    }

    if (element instanceof HtmlInput) {
      ((HtmlInput) element).setChecked(true);
    } else if (element instanceof HtmlOption) {
      ((HtmlOption) element).setSelected(true);
    } else {
      throw new UnsupportedOperationException(
          "Unable to select element. Tag name is: " + element.getTagName());
    }
  }

  public void hover() {
    throw new UnsupportedOperationException("Hover is not supported by the htmlunit driver");
  }

  public boolean isEnabled() {
    assertElementNotStale();

    return !element.hasAttribute("disabled");
  }

  public boolean isDisplayed() {
    assertElementNotStale();

    if (!parent.isJavascriptEnabled())
      return true;
    return !(element instanceof HtmlHiddenInput) && element.isDisplayed();
  }

  public Point getLocation() {
    assertElementNotStale();

    try {
      return new Point(readAndRound("left"), readAndRound("top"));
    } catch (Exception e) {
      throw new WebDriverException("Cannot determine size of element", e);
    }
  }

  public Dimension getSize() {
    assertElementNotStale();

    try {
      final int width = readAndRound("width");
      final int height = readAndRound("height");
      return new Dimension(width, height);
    } catch (Exception e) {
      throw new WebDriverException("Cannot determine size of element", e);
    }
  }

  private int readAndRound(final String property) {
    final String cssValue = getValueOfCssProperty(property).replaceAll("[^0-9\\.]", "");
    if (cssValue.length() == 0) {
      return 5; // wrong... but better than nothing
    }
    return Math.round(Float.parseFloat(cssValue));
  }

    public void dragAndDropBy(int moveRightBy, int moveDownBy) {
    assertElementNotStale();
    throw new UnsupportedOperationException("dragAndDropBy");
  }

  public void dragAndDropOn(RenderedWebElement element) {
    assertElementNotStale();
    throw new UnsupportedOperationException("dragAndDropOn");
  }

  // This isn't very pretty. Sorry.
  public String getText() {
    assertElementNotStale();

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

  private void getTextFromNode(DomNode node, StringBuffer toReturn, StringBuffer textSoFar,
                               boolean isPreformatted) {
    if (node instanceof HtmlScript) {
      return;
    }
    if (isPreformatted) {
      getPreformattedText(node, toReturn);
    }

    for (DomNode child : node.getChildren()) {
      // Do we need to collapse the text so far?
      if (child instanceof HtmlPreformattedText) {
        if (child.isDisplayed()) {
          toReturn.append(collapseWhitespace(textSoFar));
          textSoFar.delete(0, textSoFar.length());
        }
        getTextFromNode(child, toReturn, textSoFar, true);
        continue;
      }

      // Or is this just plain text?
      if (child instanceof DomText) {
        if (child.isDisplayed()) {
          String textToAdd = ((DomText) child).getData();
          textToAdd = textToAdd.replace(nbspChar, ' ');
          textSoFar.append(textToAdd);
        }
        continue;
      }

      // Treat as another child node.
      getTextFromNode(child, toReturn, textSoFar, false);
    }

    if (isBlockLevel(node)) {
      toReturn.append(collapseWhitespace(textSoFar)).append("\n");
      textSoFar.delete(0, textSoFar.length());
    }
  }

  private boolean isBlockLevel(DomNode node) {
    // From the HTML spec (http://www.w3.org/TR/html401/sgml/dtd.html#block)
    //     <!ENTITY % block "P | %heading; | %list; | %preformatted; | DL | DIV | NOSCRIPT | BLOCKQUOTE | FORM | HR | TABLE | FIELDSET | ADDRESS">
    //     <!ENTITY % heading "H1|H2|H3|H4|H5|H6">
    //     <!ENTITY % list "UL | OL">
    //     <!ENTITY % preformatted "PRE">

    if (!(node instanceof HtmlElement)) {
      return false;
    }

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
    if (node.isDisplayed()) {
      String xmlText = node.asXml();
      toReturn.append(xmlText.replaceAll("^<pre.*?>", "").replaceAll("</pre.*>$", ""));
    }
  }

  public List<WebElement> getElementsByTagName(String tagName) {
    assertElementNotStale();

    List<?> allChildren = element.getByXPath(".//" + tagName);
    List<WebElement> elements = new ArrayList<WebElement>();
    for (Object o : allChildren) {
      if (!(o instanceof HtmlElement)) {
        continue;
      }

      HtmlElement child = (HtmlElement) o;
      elements.add(getParent().newHtmlUnitWebElement(child));
    }
    return elements;
  }

  public WebElement findElement(By by) {
    assertElementNotStale();
    return parent.findElement(by, this);
  }

  public List<WebElement> findElements(By by) {
    assertElementNotStale();
    return parent.findElements(by, this);
  }

  public WebElement findElementById(String id) {
    assertElementNotStale();

    return findElementByXPath(".//*[@id = '" + id + "']");
  }

  public List<WebElement> findElementsById(String id) {
    assertElementNotStale();

    return findElementsByXPath(".//*[@id = '" + id + "']");
  }

  public WebElement findElementByXPath(String xpathExpr) {
    assertElementNotStale();

    HtmlElement match = (HtmlElement) element.getFirstByXPath(xpathExpr);
    if (match == null) {
      throw new NoSuchElementException("Unable to find element with xpath "
                                       + xpathExpr);
    }
    return getParent().newHtmlUnitWebElement(match);
  }

  public List<WebElement> findElementsByXPath(String xpathExpr) {
    assertElementNotStale();

    List<WebElement> webElements = new ArrayList<WebElement>();
    List<?> htmlElements = element.getByXPath(xpathExpr);
    for (Object e : htmlElements) {
      webElements.add(getParent().newHtmlUnitWebElement((HtmlElement) e));
    }
    return webElements;
  }

  public WebElement findElementByLinkText(String linkText) {
    assertElementNotStale();

    List<WebElement> elements = findElementsByLinkText(linkText);
    if (elements.size() == 0) {
      throw new NoSuchElementException(
          "Unable to find element with linkText " + linkText);
    }
    return elements.size() > 0 ? elements.get(0) : null;
  }

  public List<WebElement> findElementsByLinkText(String linkText) {
    assertElementNotStale();

    List<? extends HtmlElement> htmlElements = element.getHtmlElementsByTagName("a");
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
    assertElementNotStale();

    List<WebElement> elements = findElementsByPartialLinkText(linkText);
    if (elements.size() == 0) {
      throw new NoSuchElementException(
          "Unable to find element with linkText " + linkText);
    }
    return elements.size() > 0 ? elements.get(0) : null;
  }

  public List<WebElement> findElementsByPartialLinkText(String linkText) {
    assertElementNotStale();

    List<? extends HtmlElement> htmlElements = element.getHtmlElementsByTagName("a");
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
    assertElementNotStale();

    List<WebElement> elements = findElementsByTagName(name);
    if (elements.size() == 0) {
      throw new NoSuchElementException("Cannot find element with tag name: " + name);
    }
    return elements.get(0);
  }

  public List<WebElement> findElementsByTagName(String name) {
    assertElementNotStale();

    List<HtmlElement> elements = element.getHtmlElementsByTagName(name);
    ArrayList<WebElement> toReturn = new ArrayList<WebElement>(elements.size());
    for (HtmlElement element : elements) {
      toReturn.add(parent.newHtmlUnitWebElement(element));
    }

    return toReturn;
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
        sb.append(' ').append(a.getName()).append("=\"")
            .append(a.getValue().replace("\"", "&quot;")).append("\"");
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

  protected void assertElementNotStale() {
    SgmlPage elementPage = element.getPage();
    Page currentPage = parent.lastPage();

    if (!currentPage.equals(elementPage)) {
      throw new StaleElementReferenceException(
          "Element appears to be stale. Did you navigate away from the page that contained it? "
          + " And is the current window focussed the same as the one holding this element?");
    }

    // We need to walk the DOM to determine if the element is actually attached
    DomNode parent = element;
    while (parent != null && !(parent instanceof HtmlHtml)) {
      parent = parent.getParentNode();
    }

    if (parent == null) {
      throw new StaleElementReferenceException("The element seems to be disconnected from the DOM. "
                                               + " This means that a user cannot interact with it.");
    }
  }

  public String getValueOfCssProperty(String propertyName) {
    assertElementNotStale();

    return getEffectiveStyle(element, propertyName);
  }

  private String getEffectiveStyle(HtmlElement htmlElement, String propertyName) {
    HtmlElement current = htmlElement;
    String value = "inherit";
    while (current instanceof HtmlElement && "inherit".equals(value)) {
      // Hat-tip to the Selenium team
      Object result = parent.executeScript(
          "if (window.getComputedStyle) { " +
          "    return window.getComputedStyle(arguments[0], null).getPropertyValue(arguments[1]); " +
          "} " +
          "if (arguments[0].currentStyle) { " +
          "    return arguments[0].currentStyle[arguments[1]]; " +
          "} " +
          "if (window.document.defaultView && window.document.defaultView.getComputedStyle) { " +
          "    return window.document.defaultView.getComputedStyle(arguments[0], null)[arguments[1]]; "
          +
          "} ",
          current, propertyName
      );

      if (!(result instanceof Undefined)) {
        value = String.valueOf(result);
      }

      current = (HtmlElement) current.getParentNode();
    }

    if (value.startsWith("rgb")) {
      return rgbToHex(value);
    }

    return value;
  }

  // Convert colours to hex if possible
  private String rgbToHex(final String value) {
    final Pattern pattern = Pattern.compile("rgb\\((\\d{1,3}),\\s(\\d{1,3}),\\s(\\d{1,3})\\)");
    final Matcher matcher = pattern.matcher(value);
    if (matcher.find()) {
      String hex = "#";
      for (int i = 1; i <= 3; i++) {
        int colour = Integer.parseInt(matcher.group(i));
        String s = Integer.toHexString(colour);
        if (s.length() == 1)
          s = "0" + s;
        hex += s;
      }
      hex = hex.toLowerCase();
      return hex;
    }

    return value;
  }

  @Override
  public boolean equals(Object obj) {
    if (!(obj instanceof WebElement)) {
      return false;
    }

    WebElement other = (WebElement) obj;
    if (other instanceof WrapsElement) {
      other = ((WrapsElement) obj).getWrappedElement();
    }

    return other instanceof HtmlUnitWebElement && element.equals(((HtmlUnitWebElement) other).element);
  }

  @Override
  public int hashCode() {
    return element.hashCode();
  }

  /* (non-Javadoc)
   * @see org.openqa.selenium.internal.WrapsDriver#getContainingDriver()
   */
  public WebDriver getWrappedDriver() {
    return parent;
  }
}
