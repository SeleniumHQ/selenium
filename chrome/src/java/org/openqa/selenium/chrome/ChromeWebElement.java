package org.openqa.selenium.chrome;

import org.openqa.selenium.By;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.Locatable;

import java.awt.Dimension;
import java.awt.Point;
import java.util.List;

public class ChromeWebElement implements RenderedWebElement, Locatable, 
FindsByXPath, FindsByLinkText, FindsById, FindsByName, FindsByTagName, FindsByClassName, SearchContext {

  private final ChromeDriver parent;
  private final String elementId;

  public ChromeWebElement(ChromeDriver parent, String elementId) {
      this.parent = parent;
      this.elementId = elementId;
  }
  
  String getElementId() {
    return elementId;
  }
  
  ChromeResponse execute(String commandName, Object... parameters) {
    return parent.execute(commandName, parameters);
  }
  
  public void dragAndDropBy(int moveRightBy, int moveDownBy) {
    throw new UnsupportedOperationException("Not yet supported in Chrome");
  }

  public void dragAndDropOn(RenderedWebElement element) {
    throw new UnsupportedOperationException("Not yet supported in Chrome");
  }

  public Point getLocation() {
    return (Point)parent.execute("getElementLocation", this).getValue();
  }

  public Dimension getSize() {
    return (Dimension)parent.execute("getElementSize", this).getValue();
  }

  public String getValueOfCssProperty(String propertyName) {
    return parent.execute("getElementValueOfCssProperty", this, propertyName)
        .getValue().toString();
  }

  public boolean isDisplayed() {
    ChromeResponse r = execute("isElementDisplayed", this);
    return (Boolean)r.getValue();
  }

  public void clear() {
    parent.execute("clearElement", this);
  }

  public void click() {
    parent.execute("clickElement", this);
  }

  public WebElement findElement(By by) {
    return by.findElement((SearchContext)this);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements((SearchContext)this);
  }

  public String getAttribute(String name) {
    Object value = execute("getElementAttribute", this, name).getValue();
    return (value == null) ? null : value.toString();
  }

  @Deprecated
  public String getElementName() {
    return getTagName();
  }

  public String getTagName() {
    return execute("getElementTagName", this).getValue().toString();
  }

  public String getText() {
    return execute("getElementText", this).getValue().toString();
  }

  public String getValue() {
    return execute("getElementValue", this).getValue().toString();
  }

  public boolean isEnabled() {
    return Boolean.parseBoolean(execute("isElementEnabled", this).getValue().toString());
  }

  public boolean isSelected() {
    return Boolean.parseBoolean(execute("isElementSelected", this)
        .getValue().toString());
  }

  public void sendKeys(CharSequence... keysToSend) {
    StringBuilder builder = new StringBuilder();
    for (CharSequence seq : keysToSend) {
      builder.append(seq);
    }
    execute("sendElementKeys", this, builder.toString());
  }

  public void setSelected() {
    execute("setElementSelected", this);
  }

  public void submit() {
    execute("submitElement", this);
  }

  public boolean toggle() {
    return Boolean.parseBoolean(execute("toggleElement", this)
        .getValue().toString());
  }

  public Point getLocationOnScreenOnceScrolledIntoView() {
    return (Point)parent.execute("getElementLocationOnceScrolledIntoView", this).getValue();
  }

  public WebElement findElementByXPath(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "xpath", using));
  }

  public List<WebElement> findElementsByXPath(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "xpath", using));
  }

  public WebElement findElementByLinkText(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "link text", using));
  }

  public WebElement findElementByPartialLinkText(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "partial link text", using));
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "link text", using));
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "partial link text", using));
  }

  public WebElement findElementById(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "id", using));
  }

  public List<WebElement> findElementsById(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "id", using));
  }

  public WebElement findElementByName(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "name", using));
  }

  public List<WebElement> findElementsByName(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "name", using));
  }

  public WebElement findElementByTagName(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "tag name", using));
  }

  public List<WebElement> findElementsByTagName(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "tag name", using));
  }

  public WebElement findElementByClassName(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "class name", using));
  }

  public List<WebElement> findElementsByClassName(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "class name", using));
  }

  public void hover() {
    //Relies on the user not moving the mouse after the hover moves it into place 
    execute("hoverElement", this);
  }

}
