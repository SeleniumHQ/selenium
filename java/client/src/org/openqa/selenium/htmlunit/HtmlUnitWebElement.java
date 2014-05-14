/*
Copyright 2007-2009 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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


package org.openqa.selenium.htmlunit;

import com.google.common.base.Throwables;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.InvalidElementStateException;
import org.openqa.selenium.InvalidSelectorException;
import org.openqa.selenium.Keys;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Point;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;

import com.gargoylesoftware.htmlunit.ScriptResult;
import com.gargoylesoftware.htmlunit.html.DomElement;
import com.gargoylesoftware.htmlunit.html.DomNode;
import com.gargoylesoftware.htmlunit.html.DomText;
import com.gargoylesoftware.htmlunit.html.HtmlButton;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlForm;
import com.gargoylesoftware.htmlunit.html.HtmlHiddenInput;
import com.gargoylesoftware.htmlunit.html.HtmlImageInput;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.html.HtmlLabel;
import com.gargoylesoftware.htmlunit.html.HtmlOption;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.html.HtmlPreformattedText;
import com.gargoylesoftware.htmlunit.html.HtmlScript;
import com.gargoylesoftware.htmlunit.html.HtmlSelect;
import com.gargoylesoftware.htmlunit.html.HtmlSubmitInput;
import com.gargoylesoftware.htmlunit.html.HtmlTextArea;
import com.gargoylesoftware.htmlunit.javascript.host.Event;
import net.sourceforge.htmlunit.corejs.javascript.Undefined;
import org.w3c.dom.Attr;
import org.w3c.dom.NamedNodeMap;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Callable;


public class HtmlUnitWebElement implements WrapsDriver,
    FindsById, FindsByLinkText, FindsByXPath, FindsByTagName,
    FindsByCssSelector, Locatable, WebElement {

  protected final HtmlUnitDriver parent;
  protected final HtmlElement element;
  private static final char nbspChar = 160;
  private static final String[] blockLevelsTagNames =
  {"p", "h1", "h2", "h3", "h4", "h5", "h6", "dl", "div", "noscript",
      "blockquote", "form", "hr", "table", "fieldset", "address", "ul", "ol", "pre", "br"};
  private static final String[] booleanAttributes = {
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "compact",
    "complete",
    "controls",
    "declare",
    "defaultchecked",
    "defaultselected",
    "defer",
    "disabled",
    "draggable",
    "ended",
    "formnovalidate",
    "hidden",
    "indeterminate",
    "iscontenteditable",
    "ismap",
    "itemscope",
    "loop",
    "multiple",
    "muted",
    "nohref",
    "noresize",
    "noshade",
    "novalidate",
    "nowrap",
    "open",
    "paused",
    "pubdate",
    "readonly",
    "required",
    "reversed",
    "scoped",
    "seamless",
    "seeking",
    "selected",
    "spellcheck",
    "truespeed",
    "willvalidate"
    };

  private String toString;

  public HtmlUnitWebElement(HtmlUnitDriver parent, HtmlElement element) {
    this.parent = parent;
    this.element = element;
  }

  public void click() {
    try {
      verifyCanInteractWithElement();
    } catch (InvalidElementStateException e) {
      Throwables.propagateIfInstanceOf(e, ElementNotVisibleException.class);
      // Swallow disabled element case
      // Clicking disabled elements should still be passed through,
      // we just don't expect any state change

      // TODO: The javadoc for this method implies we shouldn't throw for
      // element not visible either
    }

    if (element instanceof HtmlButton) {
      String type = element.getAttribute("type");
      if (type == DomElement.ATTRIBUTE_NOT_DEFINED || type == DomElement.ATTRIBUTE_VALUE_EMPTY) {
        element.setAttribute("type", "submit");
      }
    }

    HtmlUnitMouse mouse = (HtmlUnitMouse) parent.getMouse();
    mouse.click(getCoordinates());

    if (element instanceof HtmlLabel) {
      HtmlElement referencedElement = ((HtmlLabel)element).getReferencedElement();
      if (referencedElement != null) {
        new HtmlUnitWebElement(parent, referencedElement).click();
      }
    }

  }

  public void submit() {
    try {
      if (element instanceof HtmlForm) {
        submitForm((HtmlForm) element);
        return;
      } else if ((element instanceof HtmlSubmitInput) || (element instanceof HtmlImageInput)) {
        element.click();
        return;
      } else if (element instanceof HtmlInput) {
        HtmlForm form = element.getEnclosingForm();
        if (form == null) {
          throw new NoSuchElementException("Unable to find the containing form");
        }
        submitForm(form);
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

  public void clear() {
    assertElementNotStale();

    if (element instanceof HtmlInput) {
      HtmlInput htmlInput = (HtmlInput) element;
      if (htmlInput.isReadOnly()) {
        throw new InvalidElementStateException("You may only edit editable elements");
      }
      if (htmlInput.isDisabled()) {
        throw new InvalidElementStateException("You may only interact with enabled elements");
      }
      htmlInput.setValueAttribute("");
    } else if (element instanceof HtmlTextArea) {
      HtmlTextArea htmlTextArea = (HtmlTextArea) element;
      if (htmlTextArea.isReadOnly()) {
        throw new InvalidElementStateException("You may only edit editable elements");
      }
      if (htmlTextArea.isDisabled()) {
        throw new InvalidElementStateException("You may only interact with enabled elements");
      }
      htmlTextArea.setText("");
    } else if (element.getAttribute("contenteditable") != HtmlElement.ATTRIBUTE_NOT_DEFINED) {
      element.setTextContent("");
    }
  }

  private void verifyCanInteractWithElement() {
    assertElementNotStale();

    Boolean displayed = parent.implicitlyWaitFor(new Callable<Boolean>() {
      public Boolean call() throws Exception {
        return isDisplayed();
      }
    });

    if (displayed == null || !displayed.booleanValue()) {
      throw new ElementNotVisibleException("You may only interact with visible elements");
    }

    if (!isEnabled()) {
      throw new InvalidElementStateException("You may only interact with enabled elements");
    }
  }

  private void switchFocusToThisIfNeeded() {
    HtmlUnitWebElement oldActiveElement =
        ((HtmlUnitWebElement) parent.switchTo().activeElement());

    boolean jsEnabled = parent.isJavascriptEnabled();
    boolean oldActiveEqualsCurrent = oldActiveElement.equals(this);
    try {
      boolean isBody = oldActiveElement.getTagName().toLowerCase().equals("body");
      if (jsEnabled &&
          !oldActiveEqualsCurrent &&
          !isBody) {
        oldActiveElement.element.blur();
      }
    } catch (StaleElementReferenceException ex) {
      // old element has gone, do nothing
    }
    element.focus();
  }

  /**
   * @deprecated Visibility will soon be reduced.
   */
  public void sendKeyDownEvent(CharSequence modifierKey) {
    sendSingleKeyEvent(modifierKey, Event.TYPE_KEY_DOWN);
  }

  /**
   * @deprecated Visibility will soon be reduced.
   */
  public void sendKeyUpEvent(CharSequence modifierKey) {
    sendSingleKeyEvent(modifierKey, Event.TYPE_KEY_UP);
  }

  private void sendSingleKeyEvent(CharSequence modifierKey, String eventDescription) {
    verifyCanInteractWithElement();
    switchFocusToThisIfNeeded();
    HtmlUnitKeyboard keyboard = (HtmlUnitKeyboard) parent.getKeyboard();
    keyboard.performSingleKeyAction(getElement(), modifierKey, eventDescription);
  }

  public void sendKeys(CharSequence... value) {
    verifyCanInteractWithElement();

    InputKeysContainer keysContainer = new InputKeysContainer(isInputElement(), value);

    switchFocusToThisIfNeeded();

    HtmlUnitKeyboard keyboard = (HtmlUnitKeyboard) parent.getKeyboard();
    keyboard.sendKeys(element, getAttribute("value"), keysContainer);

    if (isInputElement() && keysContainer.wasSubmitKeyFound()) {
      submit();
    }
  }

  private boolean isInputElement() {
    return element instanceof HtmlInput;
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
      return trueOrNull(((HtmlInput) element).isChecked());
    }

    if ("href".equals(lowerName) || "src".equals(lowerName)) {
      if (!element.hasAttribute(name)) {
        return null;
      }

      String link = element.getAttribute(name).trim();
      HtmlPage page = (HtmlPage) element.getPage();
      try {
        return page.getFullyQualifiedUrl(link).toString();
      } catch (MalformedURLException e) {
        return null;
      }
    }
    if ("disabled".equals(lowerName)) {
      return trueOrNull(! isEnabled());
    }

    if ("multiple".equals(lowerName) && element instanceof HtmlSelect) {
      String multipleAttribute = ((HtmlSelect) element).getMultipleAttribute();
      if ("".equals(multipleAttribute)) {
        return trueOrNull(element.hasAttribute("multiple"));
      }
      return "true";
    }

    for (String booleanAttribute : booleanAttributes) {
      if (booleanAttribute.equals(lowerName)) {
        return trueOrNull(element.hasAttribute(lowerName));
      }
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
        return trueOrNull(((HtmlInput) element).isReadOnly());
      }

      if (element instanceof HtmlTextArea) {
        return trueOrNull("".equals(((HtmlTextArea) element).getReadOnlyAttribute()));
      }

      return null;
    }

    if ("value".equals(lowerName)) {
      if (element instanceof HtmlTextArea) {
        return ((HtmlTextArea) element).getText();
      }

      // According to 
      // http://www.w3.org/TR/1999/REC-html401-19991224/interact/forms.html#adef-value-OPTION
      // if the value attribute doesn't exist, getting the "value" attribute defers to the 
      // option's content.
      if (element instanceof HtmlOption && !element.hasAttribute("value")) {
    	  return element.getTextContent();
      }
      
      return value == null ? "" : value;
    }

    if (!"".equals(value)) {
      return value;
    }

    if (element.hasAttribute(name)) {
      return "";
    }

    return null;
  }

  private String trueOrNull(boolean condition) {
    return condition ? "true" : null;
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

  public boolean isEnabled() {
    assertElementNotStale();

    return !element.hasAttribute("disabled");
  }

  public boolean isDisplayed() {
    assertElementNotStale();

    if (!parent.isJavascriptEnabled()) {
      return true;
    }

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
    final String cssValue = getCssValue(property).replaceAll("[^0-9\\.]", "");
    if (cssValue.length() == 0) {
      return 5; // wrong... but better than nothing
    }
    return Math.round(Float.parseFloat(cssValue));
  }

  // This isn't very pretty. Sorry.
  public String getText() {
    assertElementNotStale();

    StringBuffer toReturn = new StringBuffer();
    StringBuffer textSoFar = new StringBuffer();

    boolean isPreformatted = element instanceof HtmlPreformattedText;
    getTextFromNode(element, toReturn, textSoFar, isPreformatted);

    String text = toReturn.toString() + collapseWhitespace(textSoFar);

    if (!isPreformatted) {
      text = text.trim();
    } else {
      if (text.endsWith("\n")) {
        text = text.substring(0, text.length()-1);
      }
    }

    return text.replace(nbspChar, ' ');
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

    } else {
      for (DomNode child : node.getChildren()) {
        // Do we need to collapse the text so far?
        if (child instanceof HtmlPreformattedText) {
          if (child.isDisplayed()) {
            String textToAdd = collapseWhitespace(textSoFar);
            if (! " ".equals(textToAdd)) {
              toReturn.append(textToAdd);
            }
            textSoFar.delete(0, textSoFar.length());
          }
          getTextFromNode(child, toReturn, textSoFar, true);
          continue;
        }

        // Or is this just plain text?
        if (child instanceof DomText) {
          if (child.isDisplayed()) {
            String textToAdd = ((DomText) child).getData();
            textSoFar.append(textToAdd);
          }
          continue;
        }

        // Treat as another child node.
        getTextFromNode(child, toReturn, textSoFar, false);
      }
    }

    if (isBlockLevel(node)) {
      toReturn.append(collapseWhitespace(textSoFar).trim()).append("\n");
      textSoFar.delete(0, textSoFar.length());
    }
  }

  private boolean isBlockLevel(DomNode node) {
    // From the HTML spec (http://www.w3.org/TR/html401/sgml/dtd.html#block)
    // <!ENTITY % block
    // "P | %heading; | %list; | %preformatted; | DL | DIV | NOSCRIPT | BLOCKQUOTE | FORM | HR | TABLE | FIELDSET | ADDRESS">
    // <!ENTITY % heading "H1|H2|H3|H4|H5|H6">
    // <!ENTITY % list "UL | OL">
    // <!ENTITY % preformatted "PRE">

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
      toReturn.append(node.getTextContent());
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

  public List<WebElement> findElementsByCssSelector(String using) {
    List<WebElement> allElements = parent.findElementsByCssSelector(using);

    return findChildNodes(allElements);
  }

  public WebElement findElementByCssSelector(String using) {
    List<WebElement> allElements = parent.findElementsByCssSelector(using);

    allElements = findChildNodes(allElements);

    if (allElements.isEmpty()) {
      throw new NoSuchElementException("Cannot find child element using css: " + using);
    }

    return allElements.get(0);
  }

  private List<WebElement> findChildNodes(List<WebElement> allElements) {
    List<WebElement> toReturn = new LinkedList<WebElement>();

    for (WebElement current : allElements) {
      HtmlElement candidate = ((HtmlUnitWebElement) current).element;
      if (element.isAncestorOf(candidate) && element != candidate) {
        toReturn.add(current);
      }
    }

    return toReturn;
  }

  public WebElement findElementByXPath(String xpathExpr) {
    assertElementNotStale();

    Object node;
    try {
      node = element.getFirstByXPath(xpathExpr);
    } catch (Exception ex) {
      // The xpath expression cannot be evaluated, so the expression is invalid
      throw new InvalidSelectorException(
          String.format(HtmlUnitDriver.INVALIDXPATHERROR, xpathExpr), ex);
    }

    if (node == null) {
      throw new NoSuchElementException("Unable to find an element with xpath " + xpathExpr);
    }
    if (node instanceof HtmlElement) {
      return getParent().newHtmlUnitWebElement((HtmlElement) node);
    }
    // The xpath selector selected something different than a WebElement. The selector is therefore
    // invalid
    throw new InvalidSelectorException(
        String.format(HtmlUnitDriver.INVALIDSELECTIONERROR, xpathExpr, node.getClass().toString()));
  }

  public List<WebElement> findElementsByXPath(String xpathExpr) {
    assertElementNotStale();

    List<WebElement> webElements = new ArrayList<WebElement>();

    List<?> htmlElements;
    try {
      htmlElements = element.getByXPath(xpathExpr);
    } catch (Exception ex) {
      // The xpath expression cannot be evaluated, so the expression is invalid
      throw new InvalidSelectorException(
          String.format(HtmlUnitDriver.INVALIDXPATHERROR, xpathExpr), ex);
    }

    for (Object e : htmlElements) {
      if (e instanceof HtmlElement) {
        webElements.add(getParent().newHtmlUnitWebElement((HtmlElement) e));
      }
      else {
        // The xpath selector selected something different than a WebElement. The selector is
        // therefore invalid
        throw new InvalidSelectorException(
            String.format(HtmlUnitDriver.INVALIDSELECTIONERROR,
                xpathExpr, e.getClass().toString()));
      }
    }
    return webElements;
  }

  public WebElement findElementByLinkText(String linkText) {
    assertElementNotStale();

    List<WebElement> elements = findElementsByLinkText(linkText);
    if (elements.isEmpty()) {
      throw new NoSuchElementException("Unable to find element with linkText " + linkText);
    }
    return elements.get(0);
  }

  public List<WebElement> findElementsByLinkText(String linkText) {
    assertElementNotStale();

    String expectedText = linkText.trim();
    List<? extends HtmlElement> htmlElements = element.getHtmlElementsByTagName("a");
    List<WebElement> webElements = new ArrayList<WebElement>();
    for (HtmlElement e : htmlElements) {
      if (expectedText.equals(e.getTextContent().trim()) && e.getAttribute("href") != null) {
        webElements.add(getParent().newHtmlUnitWebElement(e));
      }
    }
    return webElements;
  }

  public WebElement findElementByPartialLinkText(String linkText) {
    assertElementNotStale();

    List<WebElement> elements = findElementsByPartialLinkText(linkText);
    if (elements.isEmpty()) {
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
    if (elements.isEmpty()) {
      throw new NoSuchElementException("Cannot find element with tag name: " + name);
    }
    return elements.get(0);
  }

  public List<WebElement> findElementsByTagName(String name) {
    assertElementNotStale();

    List<HtmlElement> elements = element.getHtmlElementsByTagName(name);
    List<WebElement> toReturn = new ArrayList<WebElement>(elements.size());
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
    parent.assertElementNotStale(element);
  }

  public String getCssValue(String propertyName) {
    assertElementNotStale();

    return getEffectiveStyle(element, propertyName);
  }

  private String getEffectiveStyle(HtmlElement htmlElement, String propertyName) {
    HtmlElement current = htmlElement;
    String value = "inherit";
    while ("inherit".equals(value)) {
      // Hat-tip to the Selenium team
      Object result =
          parent
              .executeScript(
                  "if (window.getComputedStyle) { "
                      +
                      "    return window.getComputedStyle(arguments[0], null).getPropertyValue(arguments[1]); "
                      +
                      "} "
                      +
                      "if (arguments[0].currentStyle) { "
                      +
                      "    return arguments[0].currentStyle[arguments[1]]; "
                      +
                      "} "
                      +
                      "if (window.document.defaultView && window.document.defaultView.getComputedStyle) { "
                      +
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

    return other instanceof HtmlUnitWebElement &&
        element.equals(((HtmlUnitWebElement) other).element);
  }

  @Override
  public int hashCode() {
    return element.hashCode();
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.selenium.internal.WrapsDriver#getContainingDriver()
   */
  public WebDriver getWrappedDriver() {
    return parent;
  }

  public Coordinates getCoordinates() {
    return new Coordinates() {

      public Point onScreen() {
        throw new UnsupportedOperationException("Not displayed, no screen location.");
      }

      public Point inViewPort() {
        return getLocation();
      }

      public Point onPage() {
        return getLocation();
      }

      public Object getAuxiliary() {
        return getElement();
      }
    };
  }
}
