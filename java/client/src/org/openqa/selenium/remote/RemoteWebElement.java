// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Beta;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsDriver;
import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.interactions.Coordinates;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.io.Zip;

import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class RemoteWebElement implements WebElement, FindsByLinkText, FindsById, FindsByName,
                                         FindsByTagName, FindsByClassName, FindsByCssSelector,
                                         FindsByXPath, WrapsDriver, TakesScreenshot, Locatable {
  private String foundBy;
  protected String id;
  protected RemoteWebDriver parent;
  protected FileDetector fileDetector;

  protected void setFoundBy(SearchContext foundFrom, String locator, String term) {
    this.foundBy = String.format("[%s] -> %s: %s", foundFrom, locator, term);
  }

  public void setParent(RemoteWebDriver parent) {
    this.parent = parent;
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

  @Override
  public void click() {
    execute(DriverCommand.CLICK_ELEMENT(id));
  }

  @Override
  public void submit() {
    execute(DriverCommand.SUBMIT_ELEMENT(id));
  }

  @Override
  public void sendKeys(CharSequence... keysToSend) {
    if (keysToSend == null || keysToSend.length == 0) {
      throw new IllegalArgumentException("Keys to send should be a not null CharSequence");
    }
    for (CharSequence cs : keysToSend) {
      if (cs == null) {
        throw new IllegalArgumentException("Keys to send should be a not null CharSequence");
      }
    }
    File localFile = fileDetector.getLocalFile(keysToSend);
    if (localFile != null) {
      String remotePath = upload(localFile);
      keysToSend = new CharSequence[]{remotePath};
    }

    execute(DriverCommand.SEND_KEYS_TO_ELEMENT(id, keysToSend));
  }

  private String upload(File localFile) {
    if (!localFile.isFile()) {
      throw new WebDriverException("You may only upload files: " + localFile);
    }

    try {
      String zip = Zip.zip(localFile);
      Response response = execute(DriverCommand.UPLOAD_FILE(zip));
      return (String) response.getValue();
    } catch (IOException e) {
      throw new WebDriverException("Cannot upload " + localFile, e);
    }
  }

  @Override
  public void clear() {
    execute(DriverCommand.CLEAR_ELEMENT(id));
  }

  @Override
  public String getTagName() {
    return (String) execute(DriverCommand.GET_ELEMENT_TAG_NAME(id))
        .getValue();
  }

  @Override
  public String getAttribute(String name) {
    return stringValueOf(
        execute(DriverCommand.GET_ELEMENT_ATTRIBUTE(id, name))
        .getValue());
  }

  private static String stringValueOf(Object o) {
    if (o == null) {
      return null;
    }
    return String.valueOf(o);
  }

  @Override
  public boolean isSelected() {
    Object value = execute(DriverCommand.IS_ELEMENT_SELECTED(id))
        .getValue();
    try {
      return (Boolean) value;
    } catch (ClassCastException ex) {
      throw new WebDriverException("Returned value cannot be converted to Boolean: " + value, ex);
    }
  }

  @Override
  public boolean isEnabled() {
    Object value = execute(DriverCommand.IS_ELEMENT_ENABLED(id))
        .getValue();
    try {
      return (Boolean) value;
    } catch (ClassCastException ex) {
      throw new WebDriverException("Returned value cannot be converted to Boolean: " + value, ex);
    }
  }

  @Override
  public String getText() {
    Response response = execute(DriverCommand.GET_ELEMENT_TEXT(id));
    return (String) response.getValue();
  }

  @Override
  public String getCssValue(String propertyName) {
    Response response = execute(DriverCommand.GET_ELEMENT_VALUE_OF_CSS_PROPERTY(id, propertyName));
    return (String) response.getValue();
  }

  @Override
  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  @Override
  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  protected WebElement findElement(String using, String value) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENT(id, using, value));

    Object responseValue = response.getValue();
    if (responseValue == null) { // see https://github.com/SeleniumHQ/selenium/issues/5809
      throw new NoSuchElementException(String.format("Cannot locate an element using %s=%s", using, value));
    }
    WebElement element;
    try {
      element = (WebElement) responseValue;
    } catch (ClassCastException ex) {
      throw new WebDriverException("Returned value cannot be converted to WebElement: " + value, ex);
    }
    parent.setFoundBy(this, element, using, value);
    return element;
  }

  @SuppressWarnings("unchecked")
  protected List<WebElement> findElements(String using, String value) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS(id, using, value));
    Object responseValue = response.getValue();
    if (responseValue == null) { // see https://github.com/SeleniumHQ/selenium/issues/4555
      return Collections.emptyList();
    }
    List<WebElement> allElements;
    try {
      allElements = (List<WebElement>) responseValue;
    } catch (ClassCastException ex) {
      throw new WebDriverException("Returned value cannot be converted to List<WebElement>: " + responseValue, ex);
    }
    allElements.forEach(element -> parent.setFoundBy(this, element, using, value));
    return allElements;
  }

  @Override
  public WebElement findElementById(String using) {
    return findElement("id", using);
  }

  @Override
  public List<WebElement> findElementsById(String using) {
    return findElements("id", using);
  }

  @Override
  public WebElement findElementByLinkText(String using) {
    return findElement("link text", using);
  }

  @Override
  public List<WebElement> findElementsByLinkText(String using) {
    return findElements("link text", using);
  }

  @Override
  public WebElement findElementByName(String using) {
    return findElement("name", using);
  }

  @Override
  public List<WebElement> findElementsByName(String using) {
    return findElements("name", using);
  }

  @Override
  public WebElement findElementByClassName(String using) {
    return findElement("class name", using);
  }

  @Override
  public List<WebElement> findElementsByClassName(String using) {
    return findElements("class name", using);
  }

  @Override
  public WebElement findElementByCssSelector(String using) {
    return findElement("css selector", using);
  }

  @Override
  public List<WebElement> findElementsByCssSelector(String using) {
    return findElements("css selector", using);
  }

  @Override
  public WebElement findElementByXPath(String using) {
    return findElement("xpath", using);
  }

  @Override
  public List<WebElement> findElementsByXPath(String using) {
    return findElements("xpath", using);
  }

  @Override
  public WebElement findElementByPartialLinkText(String using) {
    return findElement("partial link text", using);
  }

  @Override
  public List<WebElement> findElementsByPartialLinkText(String using) {
    return findElements("partial link text", using);
  }

  @Override
  public WebElement findElementByTagName(String using) {
    return findElement("tag name", using);
  }

  @Override
  public List<WebElement> findElementsByTagName(String using) {
    return findElements("tag name", using);
  }

  Response execute(CommandPayload payload) {
    return parent.execute(payload);
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

    return id.equals(otherRemoteWebElement.id);
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
  @Override
  public WebDriver getWrappedDriver() {
    return parent;
  }

  @Override
  public boolean isDisplayed() {
    Object value = execute(DriverCommand.IS_ELEMENT_DISPLAYED(id))
        .getValue();
    try {
      return (Boolean) value;
    } catch (ClassCastException ex) {
      throw new WebDriverException("Returned value cannot be converted to Boolean: " + value, ex);
    }
  }

  @Override
  @SuppressWarnings({"unchecked"})
  public Point getLocation() {
    Response response = execute(DriverCommand.GET_ELEMENT_LOCATION(id));
    Map<String, Object> rawPoint = (Map<String, Object>) response.getValue();
    int x = ((Number) rawPoint.get("x")).intValue();
    int y = ((Number) rawPoint.get("y")).intValue();
    return new Point(x, y);
  }

  @Override
  @SuppressWarnings({"unchecked"})
  public Dimension getSize() {
    Response response = execute(DriverCommand.GET_ELEMENT_SIZE(id));
    Map<String, Object> rawSize = (Map<String, Object>) response.getValue();
    int width = ((Number) rawSize.get("width")).intValue();
    int height = ((Number) rawSize.get("height")).intValue();
    return new Dimension(width, height);
  }

  @Override
  @SuppressWarnings({"unchecked"})
  public Rectangle getRect() {
    Response response = execute(DriverCommand.GET_ELEMENT_RECT(id));
    Map<String, Object> rawRect = (Map<String, Object>) response.getValue();
    int x = ((Number) rawRect.get("x")).intValue();
    int y = ((Number) rawRect.get("y")).intValue();
    int width = ((Number) rawRect.get("width")).intValue();
    int height = ((Number) rawRect.get("height")).intValue();
    return new Rectangle(x, y, height, width);
  }

  @Override
  public Coordinates getCoordinates() {
    return new Coordinates() {

      @Override
      public Point onScreen() {
        throw new UnsupportedOperationException("Not supported yet.");
      }

      @Override
      public Point inViewPort() {
        Response response = execute(DriverCommand.GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW(getId()));

        @SuppressWarnings("unchecked")
        Map<String, Number> mapped = (Map<String, Number>) response.getValue();
        return new Point(mapped.get("x").intValue(), mapped.get("y").intValue());
      }

      @Override
      public Point onPage() {
        return getLocation();
      }

      @Override
      public Object getAuxiliary() {
        return getId();
      }
    };
  }

  @Override
  @Beta
  public <X> X getScreenshotAs(OutputType<X> outputType) throws WebDriverException {
    Response response = execute(DriverCommand.ELEMENT_SCREENSHOT(id));
    Object result = response.getValue();
    if (result instanceof String) {
      String base64EncodedPng = (String) result;
      return outputType.convertFromBase64Png(base64EncodedPng);
    } else if (result instanceof byte[]) {
      String base64EncodedPng = new String((byte[]) result);
      return outputType.convertFromBase64Png(base64EncodedPng);
    } else {
      throw new RuntimeException(String.format("Unexpected result for %s command: %s",
                                               DriverCommand.ELEMENT_SCREENSHOT,
                                               result == null ? "null" : result.getClass().getName() + " instance"));
    }
  }

  public String toString() {
    if (foundBy == null) {
      return String.format("[%s -> unknown locator]", super.toString());
    }
    return String.format("[%s]", foundBy);
  }

  public Map<String, Object> toJson() {
    return ImmutableMap.of(
        Dialect.OSS.getEncodedElementKey(), getId(),
        Dialect.W3C.getEncodedElementKey(), getId());
  }
}
