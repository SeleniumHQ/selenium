/*
Copyright 2007-2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;
import org.openqa.selenium.io.Zip;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public class RemoteWebElement implements WebElement, FindsByLinkText, FindsById, FindsByName,
                                         FindsByTagName, FindsByClassName, FindsByCssSelector,
                                         FindsByXPath, WrapsDriver, Locatable {

  private String foundBy;
  protected String id;
  protected RemoteWebDriver parent;
  protected RemoteMouse mouse;
  protected FileDetector fileDetector;

  protected void setFoundBy(SearchContext foundFrom, String locator, String term) {
    this.foundBy = String.format("[%s] -> %s: %s", foundFrom, locator, term);
  }

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

  public void setFileDetector(FileDetector detector) {
    fileDetector = detector;
  }

  public void click() {
    execute(DriverCommand.CLICK_ELEMENT, ImmutableMap.of("id", id));
  }

  public void submit() {
    execute(DriverCommand.SUBMIT_ELEMENT, ImmutableMap.of("id", id));
  }

  public void sendKeys(CharSequence... keysToSend) {
    File localFile = fileDetector.getLocalFile(keysToSend);
    if (localFile == null) {
      execute(DriverCommand.SEND_KEYS_TO_ELEMENT, ImmutableMap.of("id", id, "value", keysToSend));
      return;
    }

    String remotePath = upload(localFile);
    CharSequence[] keys = new CharSequence[]{remotePath};
    execute(DriverCommand.SEND_KEYS_TO_ELEMENT, ImmutableMap.of("id", id, "value", keys));
  }

  private String upload(File localFile) {
    if (!localFile.isFile()) {
      throw new WebDriverException("You may only upload files: " + localFile);
    }

    try {
      String zip = new Zip().zipFile(localFile.getParentFile(), localFile);
      Response response = execute(DriverCommand.UPLOAD_FILE, ImmutableMap.of("file", zip));
      return (String) response.getValue();
    } catch (IOException e) {
      throw new WebDriverException("Cannot upload " + localFile, e);
    }
  }

  public void clear() {
    execute(DriverCommand.CLEAR_ELEMENT, ImmutableMap.of("id", id));
  }

  public String getTagName() {
    return (String) execute(DriverCommand.GET_ELEMENT_TAG_NAME, ImmutableMap.of("id", id))
        .getValue();
  }

  public String getAttribute(String name) {
    Object value =
        execute(DriverCommand.GET_ELEMENT_ATTRIBUTE, ImmutableMap.of("id", id, "name", name))
            .getValue();
    if (value == null) {
      return null;
    }
    return String.valueOf(value);
  }

  public boolean isSelected() {
    return (Boolean) execute(DriverCommand.IS_ELEMENT_SELECTED, ImmutableMap.of("id", id))
        .getValue();
  }

  public boolean isEnabled() {
    return (Boolean) execute(DriverCommand.IS_ELEMENT_ENABLED, ImmutableMap.of("id", id))
        .getValue();
  }

  public String getText() {
    Response response = execute(DriverCommand.GET_ELEMENT_TEXT, ImmutableMap.of("id", id));
    return (String) response.getValue();
  }

  public String getCssValue(String propertyName) {
    Response response = execute(DriverCommand.GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
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

    WebElement element = (WebElement) response.getValue();
    parent.setFoundBy(this, element, using, value);
    return element;
  }

  @SuppressWarnings("unchecked")
  protected List<WebElement> findElements(String using, String value) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS,
                                ImmutableMap.of("id", id, "using", using, "value", value));
    List<WebElement> allElements = (List<WebElement>) response.getValue();
    for (WebElement element : allElements) {
      parent.setFoundBy(this, element, using, value);
    }

    return allElements;
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
    while (other instanceof WrapsElement) {
      other = ((WrapsElement) other).getWrappedElement();
    }

    if (!(other instanceof RemoteWebElement)) {
      return false;
    }

    RemoteWebElement otherRemoteWebElement = (RemoteWebElement) other;
    if (id.equals(otherRemoteWebElement.id)) {
      return true;
    }

    if (parent != null) {
      //TODO(dawagner): Remove this fallback (and wire protocol method)
      Response response = execute(DriverCommand.ELEMENT_EQUALS,
                                  ImmutableMap.of("id", id, "other", otherRemoteWebElement.id));
      Object value = response.getValue();
      return value != null && value instanceof Boolean && (Boolean) value;
    }

    return false;
  }

  /**
   * @return This element's hash code, which is a hash of its internal opaque ID.
   */
  @Override
  public int hashCode() {
    return id.hashCode();
  }

  /*
   * (non-Javadoc)
   * 
   * @see org.openqa.selenium.internal.WrapsDriver#getWrappedDriver()
   */
  public WebDriver getWrappedDriver() {
    return parent;
  }

  public boolean isDisplayed() {
    Response response =
        execute(DriverCommand.IS_ELEMENT_DISPLAYED, ImmutableMap.of("id", id));
    return (Boolean) response.getValue();
  }

  @SuppressWarnings({"unchecked"})
  public Point getLocation() {
    Response response =
        execute(DriverCommand.GET_ELEMENT_LOCATION, ImmutableMap.of("id", id));
    Map<String, Object> rawPoint = (Map<String, Object>) response.getValue();
    int x = ((Number) rawPoint.get("x")).intValue();
    int y = ((Number) rawPoint.get("y")).intValue();
    return new Point(x, y);
  }

  @SuppressWarnings({"unchecked"})
  public Dimension getSize() {
    Response response = execute(DriverCommand.GET_ELEMENT_SIZE, ImmutableMap.of("id", id));
    Map<String, Object> rawSize = (Map<String, Object>) response.getValue();
    int width = ((Number) rawSize.get("width")).intValue();
    int height = ((Number) rawSize.get("height")).intValue();
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

      public Object getAuxiliary() {
        return getId();
      }
    };
  }

  public String toString() {
    if (foundBy == null) {
      return String.format("[%s -> unknown locator]", super.toString());
    }
    return String.format("[%s]", foundBy);
  }
}
