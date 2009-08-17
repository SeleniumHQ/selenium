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
    // TODO Auto-generated method stub
    
  }

  @Override
  public void dragAndDropOn(RenderedWebElement element) {
    // TODO Auto-generated method stub
    
  }

  @Override
  public Point getLocation() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Dimension getSize() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getValueOfCssProperty(String propertyName) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public boolean isDisplayed() {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public void clear() {
    // TODO Auto-generated method stub
    
  }

  @Override
  public void click() {
    // TODO Auto-generated method stub
    
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
    return null;
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
    // TODO Auto-generated method stub
    
  }

  @Override
  public void setSelected() {
    execute("setElementSelected", this);
  }

  @Override
  public void submit() {
    execute("submit", this);
  }

  @Override
  public boolean toggle() {
    // TODO Auto-generated method stub
    return false;
  }

  @Override
  public Point getLocationOnScreenOnceScrolledIntoView() {
    // TODO Auto-generated method stub
    return null;
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
