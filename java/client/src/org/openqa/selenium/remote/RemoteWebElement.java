/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.*;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.*;

import java.util.List;
import java.util.Map;

public class RemoteWebElement implements WebElement, FindsByLinkText, FindsById, FindsByName,
    FindsByTagName, FindsByClassName, FindsByCssSelector, FindsByXPath, WrapsDriver, Locatable {

  protected String id;
  protected RemoteWebDriver parent;
  protected RemoteMouse mouse;

  public void setParent(RemoteWebDriver parent) {
    this.parent = parent;
    mouse = (RemoteMouse) parent.getMouse();
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public void click() {
    execute(DriverCommand.CLICK_ELEMENT, ImmutableMap.of("id", id));
  }

  public void submit() {
    execute(DriverCommand.SUBMIT_ELEMENT, ImmutableMap.of("id", id));
  }

  public void sendKeys(CharSequence... keysToSend) {
    execute(DriverCommand.SEND_KEYS_TO_ELEMENT, ImmutableMap.of("id", id, "value", keysToSend));
  }

  public void clear() {
    execute(DriverCommand.CLEAR_ELEMENT, ImmutableMap.of("id", id));
  }

  public String getTagName() {
    return (String) execute(DriverCommand.GET_ELEMENT_TAG_NAME, ImmutableMap.of("id", id)).getValue();
  }

  public String getAttribute(String name) {
    Object value = execute(DriverCommand.GET_ELEMENT_ATTRIBUTE, ImmutableMap.of("id", id, "name", name))
        .getValue();
    if (value == null) {
      return null;
    }
    return String.valueOf(value);
  }

  public boolean toggle() {
    return (Boolean) execute(DriverCommand.TOGGLE_ELEMENT, ImmutableMap.of("id", id)).getValue();
  }

  public boolean isSelected() {
    return (Boolean) execute(DriverCommand.IS_ELEMENT_SELECTED, ImmutableMap.of("id", id)).getValue();
  }

  public void setSelected() {
    if (!isDisplayed()) {
      throw new ElementNotVisibleException("You may not select an element that is not displayed");
    }

    if (!isEnabled()) {
      throw new InvalidElementStateException("Cannot select a disabled element");
    }

    if (!isSelectable()) {
      throw new InvalidElementStateException("You may only set selectable items selected");
    }

    if (!isSelected()) {
      click();
    }
  }

  private boolean isSelectable() {
    String tagName = getTagName().toLowerCase();
    String type = getAttribute("type");
    type = type == null ? "" : type.toLowerCase();

    return "option".equals(tagName) ||
        ("input".equals(tagName) && ("radio".equals(type) || "checkbox".equals(type)));
  }

  public boolean isEnabled() {
    return (Boolean) execute(DriverCommand.IS_ELEMENT_ENABLED, ImmutableMap.of("id", id)).getValue();
  }

  public String getText() {
    Response response = execute(DriverCommand.GET_ELEMENT_TEXT, ImmutableMap.of("id", id));
    return (String) response.getValue();
  }

  public String getCssValue(String propertyName) {
    Response response = parent.execute(DriverCommand.GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
        ImmutableMap.of("id", id, "propertyName", propertyName));
    return (String) response.getValue();
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  protected WebElement findElement(String using, String value) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENT,
        ImmutableMap.of("id", id, "using", using, "value", value));
    return (WebElement) response.getValue();
  }

  @SuppressWarnings("unchecked")
  protected List<WebElement> findElements(String using, String value) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS,
        ImmutableMap.of("id", id, "using", using, "value", value));
    return (List<WebElement>) response.getValue();
  }

 public WebElement findElementById(String using) {
    return findElement("id", using);
  }

  public List<WebElement> findElementsById(String using) {
    return findElements("id", using);
  }

  public WebElement findElementByLinkText(String using) {
    return findElement("link text", using);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return findElements("link text", using);
  }

  public WebElement findElementByName(String using) {
    return findElement("name", using);
  }

  public List<WebElement> findElementsByName(String using) {
    return findElements("name", using);
  }

  public WebElement findElementByClassName(String using) {
    return findElement("class name", using);
  }

  public List<WebElement> findElementsByClassName(String using) {
    return findElements("class name", using);
  }

  public WebElement findElementByCssSelector(String using) {
    return findElement("css selector", using);
  }

  public List<WebElement> findElementsByCssSelector(String using) {
    return findElements("css selector", using);
  }

  public WebElement findElementByXPath(String using) {
    return findElement("xpath", using);
  }

  public List<WebElement> findElementsByXPath(String using) {
    return findElements("xpath", using);
  }

  public WebElement findElementByPartialLinkText(String using) {
    return findElement("partial link text", using);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    return findElements("partial link text", using);
  }

  public WebElement findElementByTagName(String using) {
    return findElement("tag name", using);
  }

  public List<WebElement> findElementsByTagName(String using) {
    return findElements("tag name", using);
  }

  protected Response execute(String command, Map<String, ?> parameters) {
    return parent.execute(command, parameters);
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

    if (!(other instanceof RemoteWebElement)) {
      return false;
    }

    Response response = execute(DriverCommand.ELEMENT_EQUALS,
        ImmutableMap.of("id", id, "other", ((RemoteWebElement) other).id));
    Object value = response.getValue();
    return value != null && value instanceof Boolean && (Boolean) value;
  }

  /**
   * @return This element's hash code, which is a hash of its internal opaque ID.
   */
  @Override
  public int hashCode() {
    return id.hashCode();
  }

  /* (non-Javadoc)
   * @see org.openqa.selenium.internal.WrapsDriver#getWrappedDriver()
   */
  public WebDriver getWrappedDriver() {
    return parent;
  }

  public boolean isDisplayed() {
    Response response = parent.execute(DriverCommand.IS_ELEMENT_DISPLAYED, ImmutableMap.of("id", id));
    return (Boolean) response.getValue();
  }

  @SuppressWarnings({"unchecked"})
  public Point getLocation() {
    Response response = parent.execute(DriverCommand.GET_ELEMENT_LOCATION, ImmutableMap.of("id", id));
    Map<String, Object> rawPoint = (Map<String, Object>) response.getValue();
    int x = ((Long) rawPoint.get("x")).intValue();
    int y = ((Long) rawPoint.get("y")).intValue();
    return new Point(x, y);
  }

  @SuppressWarnings({"unchecked"})
  public Dimension getSize() {
    Response response = parent.execute(DriverCommand.GET_ELEMENT_SIZE, ImmutableMap.of("id", id));
    Map<String, Object> rawSize = (Map<String, Object>) response.getValue();
    int width = ((Long) rawSize.get("width")).intValue();
    int height = ((Long) rawSize.get("height")).intValue();
    return new Dimension(width, height);
  }

  public Point getLocationOnScreenOnceScrolledIntoView() {
    Response response = execute(DriverCommand.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW,
        ImmutableMap.of("id", getId()));

    @SuppressWarnings("unchecked")
    Map<String, Number> mapped = (Map<String, Number>) response.getValue();

    return new Point(mapped.get("x").intValue(), mapped.get("y").intValue());
  }

  public Coordinates getCoordinates() {
    return new Coordinates() {

      public Point getLocationOnScreen() {
        return getLocationOnScreenOnceScrolledIntoView();
      }

      public Point getLocationInViewPort() {
        throw new UnsupportedOperationException("Not supported yet.");
      }

      public Point getLocationInDOM() {
        throw new UnsupportedOperationException("Not supported yet.");
      }

      public Object getAuxiliry() {
        return getId();
      }
    };
  }
}
