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
  
  Response execute(String commandName, Object... parameters) {
    return parent.execute(commandName, parameters);
  }
  
  @Override
  public void dragAndDropBy(int moveRightBy, int moveDownBy) {
    throw new UnsupportedOperationException("Not yet supported in Chrome");
  }

  @Override
  public void dragAndDropOn(RenderedWebElement element) {
    throw new UnsupportedOperationException("Not yet supported in Chrome");
  }

  @Override
  public Point getLocation() {
    return (Point)parent.execute("getElementLocation", this).getValue();
  }

  @Override
  public Dimension getSize() {
    return (Dimension)parent.execute("getElementSize", this).getValue();
  }

  @Override
  public String getValueOfCssProperty(String propertyName) {
    return parent.execute("getElementValueOfCssProperty", this, propertyName)
        .getValue().toString();
  }

  @Override
  public boolean isDisplayed() {
    return Boolean.parseBoolean(execute("isElementDisplayed", this)
        .getValue().toString());
  }

  @Override
  public void clear() {
    parent.execute("clearElement", this);
  }

  @Override
  public void click() {
    parent.execute("clickElement", this);
  }

  @Override
  public WebElement findElement(By by) {
    return by.findElement((SearchContext)this);
  }

  @Override
  public List<WebElement> findElements(By by) {
    return by.findElements((SearchContext)this);
  }

  @Override
  public String getAttribute(String name) {
    Object value = execute("getElementAttribute", this, name).getValue();
    return (value == null) ? null : value.toString();
  }

  @Override
  public String getElementName() {
    //TODO(danielwh)
    throw new UnsupportedOperationException("Not yet supported in Chrome");
    //return execute("getElementName", this).getValue().toString();
  }

  @Override
  public String getTagName() {
    return execute("getElementTagName", this).getValue().toString();
  }

  @Override
  public String getText() {
    return execute("getElementText", this).getValue().toString();
  }

  @Override
  public String getValue() {
    return execute("getElementValue", this).getValue().toString();
  }

  @Override
  public boolean isEnabled() {
    return Boolean.parseBoolean(execute("isElementEnabled", this).getValue().toString());
  }

  @Override
  public boolean isSelected() {
    return Boolean.parseBoolean(execute("isElementSelected", this)
        .getValue().toString());
  }

  @Override
  public void sendKeys(CharSequence... keysToSend) {
    StringBuilder builder = new StringBuilder();
    for (CharSequence seq : keysToSend) {
      builder.append(seq);
    }
    execute("sendElementKeys", this, builder.toString());
  }

  @Override
  public void setSelected() {
    execute("setElementSelected", this);
  }

  @Override
  public void submit() {
    execute("submitElement", this);
  }

  @Override
  public boolean toggle() {
    return Boolean.parseBoolean(execute("toggleElement", this)
        .getValue().toString());
  }

  @Override
  public Point getLocationOnScreenOnceScrolledIntoView() {
    return (Point)parent.execute("getElementLocationOnceScrolledIntoView", this).getValue();
  }

  @Override
  public WebElement findElementByXPath(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "xpath", using));
  }

  @Override
  public List<WebElement> findElementsByXPath(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "xpath", using));
  }

  @Override
  public WebElement findElementByLinkText(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "link text", using));
  }

  @Override
  public WebElement findElementByPartialLinkText(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "partial link text", using));
  }

  @Override
  public List<WebElement> findElementsByLinkText(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "link text", using));
  }

  @Override
  public List<WebElement> findElementsByPartialLinkText(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "partial link text", using));
  }

  @Override
  public WebElement findElementById(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "id", using));
  }

  @Override
  public List<WebElement> findElementsById(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "id", using));
  }

  @Override
  public WebElement findElementByName(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "name", using));
  }

  @Override
  public List<WebElement> findElementsByName(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "name", using));
  }

  @Override
  public WebElement findElementByTagName(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "tag name", using));
  }

  @Override
  public List<WebElement> findElementsByTagName(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "tag name", using));
  }

  @Override
  public WebElement findElementByClassName(String using) {
    return parent.getElementFrom(execute("findChildElement", this, "class name", using));
  }

  @Override
  public List<WebElement> findElementsByClassName(String using) {
    return parent.getElementsFrom(execute("findChildElements", this, "class name", using));
  }

}
