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

package org.openqa.selenium.firefox;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WebDriverException;
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

import java.awt.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class FirefoxWebElement implements RenderedWebElement, Locatable,
        FindsByXPath, FindsByLinkText, FindsById, FindsByCssSelector,
    FindsByName, FindsByTagName, FindsByClassName, WrapsDriver {
    private final FirefoxDriver parent;
    private final String elementId;

    public FirefoxWebElement(FirefoxDriver parent, String elementId) {
        this.parent = parent;
        this.elementId = elementId;
    }

    public void click() {
      sendMessage(UnsupportedOperationException.class, "click");
    }

    public void hover() {
      sendMessage(WebDriverException.class, "hover");
    }

    public void submit() {
        sendMessage(WebDriverException.class, "submit");
    }

    public String getValue() {
        try {
          return sendMessage(WebDriverException.class, "getValue");
        } catch (WebDriverException e) {
            return null;
        }
    }

    public void clear() {
    	sendMessage(UnsupportedOperationException.class, "clear");
    }

    public void sendKeys(CharSequence... value) {
    	StringBuilder builder = new StringBuilder();
    	for (CharSequence seq : value) {
    		builder.append(seq);
    	}
        sendMessage(UnsupportedOperationException.class, "sendKeys", builder.toString());
    }

    public String getTagName() {
        String name = sendMessage(WebDriverException.class, "getTagName");
        return name;
    }

  public String getAttribute(String name) {
        return sendMessage(WebDriverException.class, "getAttribute", name);
    }

    public boolean toggle() {
        sendMessage(UnsupportedOperationException.class, "toggle");
        return isSelected();
    }

    public boolean isSelected() {
        String value = sendMessage(WebDriverException.class, "isSelected");
        return Boolean.parseBoolean(value);
    }

    public void setSelected() {
        sendMessage(UnsupportedOperationException.class, "setSelected");
    }

    public boolean isEnabled() {
        String value = getAttribute("disabled");
        return !Boolean.parseBoolean(value);
    }

    public String getText() {
        return sendMessage(WebDriverException.class, "getText");
    }

  public boolean isDisplayed() {
    return Boolean.parseBoolean(sendMessage(WebDriverException.class, "isDisplayed"));
    }

    public Point getLocation() {
        JSONObject result = (JSONObject) executeCommand(WebDriverException.class, "getLocation");
        try {
          return new Point(result.getInt("x"), result.getInt("y"));
        } catch (JSONException e) {
          throw new WebDriverException(e);
        }
    }

    public Dimension getSize() {
        JSONObject result = (JSONObject) executeCommand(WebDriverException.class, "getSize");
        try {
          return new Dimension(result.getInt("width"), result.getInt("height"));
        } catch (JSONException e) {
          throw new WebDriverException(e);
        }
    }

    public void dragAndDropBy(int moveRight, int moveDown) {
        sendMessage(UnsupportedOperationException.class, "dragElement", moveRight, moveDown);
    }

    public void dragAndDropOn(RenderedWebElement element) {
        Point currentLocation = getLocation();
        Point destination = element.getLocation();
        dragAndDropBy(destination.x - currentLocation.x, destination.y - currentLocation.y);
    }

    public WebElement findElement(By by) {
        return by.findElement(this);
    }

    public List<WebElement> findElements(By by) {
        return by.findElements(this);
    }

    public WebElement findElementByXPath(String xpath) {
      return findChildElement("xpath", xpath);
    }

    public List<WebElement> findElementsByXPath(String xpath) {
      return findChildElements("xpath", xpath);
    }

    public WebElement findElementByLinkText(String linkText) {
      return findChildElement("link text", linkText);
    }

    public List<WebElement> findElementsByLinkText(String linkText) {
      return findChildElements("link text", linkText);
    }

    public WebElement findElementByPartialLinkText(String text) {
      return findChildElement("partial link text", text);
    }

    public List<WebElement> findElementsByPartialLinkText(String text) {
      return findChildElements("partial link text", text);
    }

    public WebElement findElementById(String id) {
      return findChildElement("id", id);
    }

    public List<WebElement> findElementsById(String id) {
      return findChildElements("id", id);
    }

    public WebElement findElementByName(String name) {
      return findChildElement("name", name);
    }

    public List<WebElement> findElementsByName(String name) {
      return findChildElements("name", name);
    }

    public WebElement findElementByTagName(String tagName) {
      return findChildElement("tag name", tagName);
    }
    
    public List<WebElement> findElementsByTagName(String tagName) {
      return findChildElements("tag name", tagName);
    }
    
    public WebElement findElementByClassName(String className) {
      return findChildElement("class name", className);
    }

    public List<WebElement> findElementsByClassName(String className) {
      return findChildElements("class name", className);
    }

    public WebElement findElementByCssSelector(String using) {
      return findChildElement("css selector", using);
    }

    public List<WebElement> findElementsByCssSelector(String using) {
      return findChildElements("css selector", using);
    }

  private WebElement findChildElement(String using, String value) {
      String id = sendMessage(NoSuchElementException.class,
          "findChildElement", buildSearchParamsMap(using, value));
      return new FirefoxWebElement(parent, id);
    }

    private List<WebElement> findChildElements(String using, String value) {
      JSONArray ids = (JSONArray) executeCommand(WebDriverException.class,
          "findChildElements", buildSearchParamsMap(using, value));

      List<WebElement> elements = new ArrayList<WebElement>();
      try {
        for (int i = 0; i < ids.length(); i++) {
          elements.add(new FirefoxWebElement(parent, ids.getString(i)));
        }
      } catch (JSONException e) {
        throw new WebDriverException(e);
      }
      return elements;
    }

    private Map<String, String> buildSearchParamsMap(String using, String value) {
      Map<String, String> map = new HashMap<String, String>();
      map.put("id", elementId);
      map.put("using", using);
      map.put("value", value);
      return map;
    }

    public String getValueOfCssProperty(String propertyName) {
      return sendMessage(WebDriverException.class,"getValueOfCssProperty", propertyName);
    }

    private String sendMessage(Class<? extends RuntimeException> throwOnFailure, String methodName, Object... parameters) {
      Object result = executeCommand(throwOnFailure, methodName, parameters);
      return result == null ? null : String.valueOf(result);
    }

    private Object executeCommand(Class<? extends RuntimeException> throwOnFailure, String methodName, Object... parameters) {
      return parent.executeCommand(throwOnFailure, new Command(parent.context, elementId, methodName, parameters));
    }

    public String getElementId() {
        return elementId;
    }

    public Point getLocationOnScreenOnceScrolledIntoView() {
        try {
            JSONObject mapped = (JSONObject) executeCommand(
                WebDriverException.class, "getLocationOnceScrolledIntoView");

            return new Point(mapped.getInt("x"), mapped.getInt("y"));
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
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

    if (!(other instanceof FirefoxWebElement)) {
      return false;
    }
    return elementId.equals(((FirefoxWebElement)other).elementId);
  }

  @Override
  public int hashCode() {
    return elementId.hashCode();
  }

  /* (non-Javadoc)
   * @see org.openqa.selenium.internal.WrapsDriver#getContainingDriver()
   */
  public WebDriver getWrappedDriver() {
    return parent;
  }
}
