package org.openqa.selenium.chrome;

import org.openqa.selenium.By;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.internal.WrapsElement;

import java.awt.Dimension;
import java.awt.Point;
import java.util.List;

public class ChromeWebElement implements RenderedWebElement, Locatable, 
FindsByXPath, FindsByLinkText, FindsById, FindsByName, FindsByTagName, FindsByClassName, FindsByCssSelector {

  private final ChromeDriver parent;
  private final String elementId;

  public ChromeWebElement(ChromeDriver parent, String elementId) {
      this.parent = parent;
      this.elementId = elementId;
  }
  
  String getElementId() {
    return elementId;
  }
  
  ChromeResponse execute(DriverCommand driverCommand, Object... parameters) {
    return parent.execute(driverCommand, parameters);
  }
  
  public void dragAndDropBy(int moveRightBy, int moveDownBy) {
    throw new UnsupportedOperationException("Not yet supported in Chrome");
  }

  public void dragAndDropOn(RenderedWebElement element) {
    throw new UnsupportedOperationException("Not yet supported in Chrome");
  }

  public Point getLocation() {
    return (Point)parent.execute(DriverCommand.GET_ELEMENT_LOCATION, this).getValue();
  }

  public Dimension getSize() {
    return (Dimension)parent.execute(DriverCommand.GET_ELEMENT_SIZE, this).getValue();
  }

  public String getValueOfCssProperty(String propertyName) {
    return parent.execute(DriverCommand.GET_ELEMENT_VALUE_OF_CSS_PROPERTY, this, propertyName)
        .getValue().toString();
  }

  public boolean isDisplayed() {
    ChromeResponse r = execute(DriverCommand.IS_ELEMENT_DISPLAYED, this);
    return (Boolean)r.getValue();
  }

  public void clear() {
    parent.execute(DriverCommand.CLEAR_ELEMENT, this);
  }

  public void click() {
    parent.execute(DriverCommand.CLICK_ELEMENT, this);
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public String getAttribute(String name) {
    Object value = execute(DriverCommand.GET_ELEMENT_ATTRIBUTE, this, name).getValue();
    return (value == null) ? null : value.toString();
  }

  public String getTagName() {
    return execute(DriverCommand.GET_ELEMENT_TAG_NAME, this).getValue().toString();
  }

  public String getText() {
    return execute(DriverCommand.GET_ELEMENT_TEXT, this).getValue().toString();
  }

  public String getValue() {
    return execute(DriverCommand.GET_ELEMENT_VALUE, this).getValue().toString();
  }

  public boolean isEnabled() {
    return Boolean.parseBoolean(execute(DriverCommand.IS_ELEMENT_ENABLED, this).getValue().toString());
  }

  public boolean isSelected() {
    return Boolean.parseBoolean(execute(DriverCommand.IS_ELEMENT_SELECTED, this)
        .getValue().toString());
  }

  public void sendKeys(CharSequence... keysToSend) {
    StringBuilder builder = new StringBuilder();
    for (CharSequence seq : keysToSend) {
      builder.append(seq);
    }
    execute(DriverCommand.SEND_KEYS_TO_ELEMENT, this, builder.toString());
  }

  public void setSelected() {
    execute(DriverCommand.SET_ELEMENT_SELECTED, this);
  }

  public void submit() {
    execute(DriverCommand.SUBMIT_ELEMENT, this);
  }

  public boolean toggle() {
    return Boolean.parseBoolean(execute(DriverCommand.TOGGLE_ELEMENT, this)
        .getValue().toString());
  }

  public Point getLocationOnScreenOnceScrolledIntoView() {
    return (Point)parent.execute(DriverCommand.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW, this).getValue();
  }

  public WebElement findElementByXPath(String using) {
    return parent.getElementFrom(execute(DriverCommand.FIND_CHILD_ELEMENT, this, "xpath", using));
  }

  public List<WebElement> findElementsByXPath(String using) {
    return parent.getElementsFrom(execute(DriverCommand.FIND_CHILD_ELEMENTS, this, "xpath", using));
  }

  public WebElement findElementByLinkText(String using) {
    return parent.getElementFrom(execute(DriverCommand.FIND_CHILD_ELEMENT, this, "link text", using));
  }

  public WebElement findElementByPartialLinkText(String using) {
    return parent.getElementFrom(execute(DriverCommand.FIND_CHILD_ELEMENT, this, "partial link text", using));
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return parent.getElementsFrom(execute(DriverCommand.FIND_CHILD_ELEMENTS, this, "link text", using));
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    return parent.getElementsFrom(execute(DriverCommand.FIND_CHILD_ELEMENTS, this, "partial link text", using));
  }

  public WebElement findElementById(String using) {
    return parent.getElementFrom(execute(DriverCommand.FIND_CHILD_ELEMENT, this, "id", using));
  }

  public List<WebElement> findElementsById(String using) {
    return parent.getElementsFrom(execute(DriverCommand.FIND_CHILD_ELEMENTS, this, "id", using));
  }

  public WebElement findElementByName(String using) {
    return parent.getElementFrom(execute(DriverCommand.FIND_CHILD_ELEMENT, this, "name", using));
  }

  public List<WebElement> findElementsByName(String using) {
    return parent.getElementsFrom(execute(DriverCommand.FIND_CHILD_ELEMENTS, this, "name", using));
  }

  public WebElement findElementByTagName(String using) {
    return parent.getElementFrom(execute(DriverCommand.FIND_CHILD_ELEMENT, this, "tag name", using));
  }

  public List<WebElement> findElementsByTagName(String using) {
    return parent.getElementsFrom(execute(DriverCommand.FIND_CHILD_ELEMENTS, this, "tag name", using));
  }

  public WebElement findElementByClassName(String using) {
    return parent.getElementFrom(execute(DriverCommand.FIND_CHILD_ELEMENT, this, "class name", using));
  }

  public List<WebElement> findElementsByClassName(String using) {
    return parent.getElementsFrom(execute(DriverCommand.FIND_CHILD_ELEMENTS, this, "class name", using));
  }
  
  public WebElement findElementByCssSelector(String using) {
    return parent.getElementFrom(execute(DriverCommand.FIND_CHILD_ELEMENT, this, "css", using));
  }

  public List<WebElement> findElementsByCssSelector(String using) {
    return parent.getElementsFrom(execute(DriverCommand.FIND_CHILD_ELEMENTS, this, "css", using));
  }

  public void hover() {
    //Relies on the user not moving the mouse after the hover moves it into place 
    execute(DriverCommand.HOVER_OVER_ELEMENT, this);
  }

  @Override
  public int hashCode() {
    return elementId.hashCode();
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

    if (!(other instanceof ChromeWebElement)) {
      return false;
    }

    return elementId.equals(((ChromeWebElement)other).elementId);
  }
}
