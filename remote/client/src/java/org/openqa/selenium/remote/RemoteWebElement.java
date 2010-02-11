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
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;

import java.util.List;

public class RemoteWebElement implements WebElement, FindsByLinkText, FindsById, FindsByName,
    FindsByTagName, FindsByClassName, FindsByXPath, WrapsDriver {

  protected String id;
  protected RemoteWebDriver parent;

  public void setParent(RemoteWebDriver parent) {
    this.parent = parent;
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

  public String getValue() {
    return (String) execute(DriverCommand.GET_ELEMENT_VALUE, ImmutableMap.of("id", id)).getValue();
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
    execute(DriverCommand.SET_ELEMENT_SELECTED, ImmutableMap.of("id", id));
  }

  public boolean isEnabled() {
    return (Boolean) execute(DriverCommand.IS_ELEMENT_ENABLED, ImmutableMap.of("id", id)).getValue();
  }

  public String getText() {
    Response response = execute(DriverCommand.GET_ELEMENT_TEXT, ImmutableMap.of("id", id));
    return (String) response.getValue();
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

 public WebElement findElementById(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENT,
        ImmutableMap.of("id", id, "using", "id", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsById(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS,
        ImmutableMap.of("id", id, "using", "id", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByLinkText(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENT,
        ImmutableMap.of("id", id, "using", "link text", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS,
        ImmutableMap.of("id", id, "using", "link text", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByName(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENT,
        ImmutableMap.of("id", id, "using", "name", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByName(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS,
        ImmutableMap.of("id", id, "using", "name", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByClassName(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENT,
        ImmutableMap.of("id", id, "using", "class name", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByClassName(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS,
        ImmutableMap.of("id", id, "using", "class name", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByXPath(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENT,
        ImmutableMap.of("id", id, "using", "xpath", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByXPath(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS,
        ImmutableMap.of("id", id, "using", "xpath", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByPartialLinkText(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENT,
        ImmutableMap.of("id", id, "using", "partial link text", "value", using));
    return getElementFrom(response); 
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS,
        ImmutableMap.of("id", id, "using", "partial link text", "value", using));
    return getElementsFrom(response);
  }

  public WebElement findElementByTagName(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENT,
        ImmutableMap.of("id", id, "using", "tag name", "value", using));
    return getElementFrom(response);
  }

  public List<WebElement> findElementsByTagName(String using) {
    Response response = execute(DriverCommand.FIND_CHILD_ELEMENTS,
        ImmutableMap.of("id", id, "using", "tag name", "value", using));
    return getElementsFrom(response);
  }

  protected Response execute(DriverCommand command, Object... parameters) {
    return parent.execute(command, parameters);
  }

  protected WebElement getElementFrom(Response response) {
    return parent.getElementFrom(response);
  }

  protected List<WebElement> getElementsFrom(Response response) {
    return parent.getElementsFrom(response);
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

  @Override
  public int hashCode() {
    return id.hashCode();
  }

  /* (non-Javadoc)
   * @see org.openqa.selenium.internal.WrapsDriver#getContainingDriver()
   */
  @Override
  public WebDriver getWrappedDriver() {
    return parent;
  }
}
