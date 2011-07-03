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


package org.openqa.selenium.htmlunit;

import com.gargoylesoftware.htmlunit.Page;
import com.gargoylesoftware.htmlunit.ScriptResult;
import com.gargoylesoftware.htmlunit.SgmlPage;
import com.gargoylesoftware.htmlunit.html.DomElement;
import com.gargoylesoftware.htmlunit.html.DomNode;
import com.gargoylesoftware.htmlunit.html.DomText;
import com.gargoylesoftware.htmlunit.html.HtmlButton;
import com.gargoylesoftware.htmlunit.html.HtmlCheckBoxInput;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlForm;
import com.gargoylesoftware.htmlunit.html.HtmlHiddenInput;
import com.gargoylesoftware.htmlunit.html.HtmlHtml;
import com.gargoylesoftware.htmlunit.html.HtmlImageInput;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.html.HtmlOption;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.html.HtmlPreformattedText;
import com.gargoylesoftware.htmlunit.html.HtmlScript;
import com.gargoylesoftware.htmlunit.html.HtmlSelect;
import com.gargoylesoftware.htmlunit.html.HtmlSubmitInput;
import com.gargoylesoftware.htmlunit.html.HtmlTextArea;
import com.gargoylesoftware.htmlunit.javascript.host.Event;

import net.sourceforge.htmlunit.corejs.javascript.Undefined;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.InvalidElementStateException;
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
import org.w3c.dom.Attr;
import org.w3c.dom.NamedNodeMap;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class HtmlUnitWebElement implements WrapsDriver,
    FindsById, FindsByLinkText, FindsByXPath, FindsByTagName,
    FindsByCssSelector, Locatable, WebElement {

  protected final HtmlUnitDriver parent;
  protected final HtmlElement element;
  private static final char nbspChar = (char) 160;
  private static final String[] blockLevelsTagNames =
      {"p", "h1", "h2", "h3", "h4", "h5", "h6", "dl", "div", "noscript",
       "blockquote", "form", "hr", "table", "fieldset", "address", "ul", "ol", "pre", "br"};
  private static final String[] booleanAttributes = {"checked", "selected", "multiple"};

  private String toString;

  public HtmlUnitWebElement(HtmlUnitDriver parent, HtmlElement element) {
    this.parent = parent;
    this.element = element;
  }

  public void click() {
    try {
      verifyCanInteractWithElement();
    }
    catch (InvalidElementStateException e) {
      //Swallow disabled element case
      //Clicking disabled elements should still be passed through,
      //we just don't expect any state change
      
      //TODO: The javadoc for this method implies we shouldn't throw for
      //element not visible either
    }
    
    // TODO(simon): It appears as if clicking on html options doesn't toggle state
    if (element instanceof HtmlOption) {
      boolean currentlySelected = isSelected();
      ((HtmlOption) element).setSelected(!currentlySelected);
      if (currentlySelected) {
    	element.removeAttribute("selected");
      } else {
    	element.setAttribute("selected", "true");
      }
      // Now fall through
    }
    
    HtmlUnitMouse mouse = (HtmlUnitMouse) parent.getMouse();
    mouse.click(getCoordinates());
  }

  public void submit() {
    assertElementNotStale();

    try {
      if (element instanceof HtmlForm) {
        submitForm((HtmlForm) element);
        return;
      } else if ((element instanceof HtmlSubmitInput) || (element instanceof HtmlImageInput)) {
        element.click();
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

  public void clear() {
    assertElementNotStale();

    if (element instanceof HtmlInput) {
      ((HtmlInput) element).setValueAttribute("");
    } else if (element instanceof HtmlTextArea) {
      ((HtmlTextArea) element).setText("");
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
      throw new ElementNotVisibleException("You may only sendKeys to visible elements");
    }
    
    if (!isEnabled()) {
      throw new InvalidElementStateException("You may only sendKeys to enabled elements");
    }
  }

  private void switchFocusToThisIfNeeded() {
    HtmlUnitWebElement oldActiveElement =
        ((HtmlUnitWebElement)parent.switchTo().activeElement());

    boolean jsEnabled = parent.isJavascriptEnabled();
    boolean oldActiveEqualsCurrent = oldActiveElement.equals(this);
    boolean isBody = oldActiveElement.getTagName().toLowerCase().equals("body");
    if (jsEnabled &&
        !oldActiveEqualsCurrent &&
        !isBody) {
      oldActiveElement.element.blur();
      element.focus();
    }
  }

  public void sendKeyDownEvent(Keys modifierKey) {
    sendSingleKeyEvent(modifierKey, Event.TYPE_KEY_DOWN);
  }

  public void sendKeyUpEvent(Keys modifierKey) {
    sendSingleKeyEvent(modifierKey, Event.TYPE_KEY_UP);
  }

  private void sendSingleKeyEvent(Keys modifierKey, String eventDescription) {
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
      return ((HtmlInput)element).isChecked() ? "true" : null;
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
      return isEnabled() ? "false" : "true";
    }

    if ("multiple".equals(lowerName) && element instanceof HtmlSelect) {
      return ((HtmlSelect) element).getMultipleAttribute() == null ?
          "false" : "true";    	
    }
    
    for (String booleanAttribute: booleanAttributes) {
      if (booleanAttribute.equals(lowerName)) {
        if (value.equals(DomElement.ATTRIBUTE_NOT_DEFINED)) {
          return null;
        }

        return "true";
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
        return String.valueOf(((HtmlInput) element).isReadOnly());
      }

      if (element instanceof HtmlTextArea) {
        return "".equals(((HtmlTextArea) element).getReadOnlyAttribute()) ? "false" : "true";
      }

      return null;
    }

    if ("value".equals(lowerName)) {
      if (element instanceof HtmlTextArea) {
        return ((HtmlTextArea) element).getText();
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

  public boolean toggle() {
    assertElementNotStale();

    if (!isDisplayed())
      throw new ElementNotVisibleException("You may only toggle visible elements");

    if (!isEnabled())
      throw new InvalidElementStateException("You may only toggle enabled elements");
    

    try {
      if (element instanceof HtmlCheckBoxInput) {
        element.click();
        return isSelected();
      }

      if (element instanceof HtmlOption) {
        HtmlOption option = (HtmlOption) element;
        HtmlSelect select = option.getEnclosingSelect();
        if (select.isMultipleSelectEnabled()) {
          click();
          return isSelected();
        }
      }

      throw new InvalidElementStateException(
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
      return ((HtmlOption) element).hasAttribute("selected");
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
      throw new InvalidElementStateException("You may not select a disabled element");
    }

    if (element instanceof HtmlInput) {
      ((HtmlInput) element).setChecked(true);
    } else if (element instanceof HtmlOption) {
      if (!isSelected()) {
        click();
      }
    } else {
      throw new InvalidElementStateException(
          "Unable to select element. Tag name is: " + element.getTagName());
    }
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

  public List<WebElement> findElementsByCssSelector(String using) {
    List<WebElement> allElements = parent.findElementsByCssSelector(using);

    return findChildNodes(allElements);
  }

  public WebElement findElementByCssSelector(String using) {
    List<WebElement> allElements = parent.findElementsByCssSelector(using);

    allElements = findChildNodes(allElements);

    if (allElements.size() == 0) {
      throw new NoSuchElementException("Cannot find child element using css: " + using);
    }

    return allElements.get(0);
  }

  private List<WebElement> findChildNodes(List<WebElement> allElements) {
    List<WebElement> toReturn = new LinkedList<WebElement>();

    for (WebElement current : allElements) {
      if (element.isAncestorOf(((HtmlUnitWebElement) current).element)) {
        toReturn.add(current);
      }
    }

    return toReturn;
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
    SgmlPage elementPage = element.getPage();
    Page currentPage = parent.lastPage();

    if (!currentPage.equals(elementPage)) {
      throw new StaleElementReferenceException(
          "Element appears to be stale. Did you navigate away from the page that contained it? "
          + " And is the current window focussed the same as the one holding this element?");
    }

    // We need to walk the DOM to determine if the element is actually attached
    DomNode parentElement = element;
    while (parentElement != null && !(parentElement instanceof HtmlHtml)) {
      parentElement = parentElement.getParentNode();
    }

    if (parentElement == null) {
      throw new StaleElementReferenceException("The element seems to be disconnected from the DOM. "
                                               + " This means that a user cannot interact with it.");
    }
  }

  public String getCssValue(String propertyName) {
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

  public Point getLocationOnScreenOnceScrolledIntoView() {
    return getLocation();
  }

  public Coordinates getCoordinates() {
    return new Coordinates() {

      public Point getLocationOnScreen() {
        throw new UnsupportedOperationException("Not displayed, no screen location.");
      }

      public Point getLocationInViewPort() {
        return getLocation();
      }

      public Point getLocationInDOM() {
        return getLocation();
      }

      public Object getAuxiliry() {
        return getElement(); 
      }
    };
  }
}
