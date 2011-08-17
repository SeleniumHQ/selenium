/*
Copyright 2010 WebDriver committers

Copyright 2010 Google Inc.

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

package org.openqa.selenium.android;

import com.google.common.collect.Lists;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.android.app.WebDriverWebView;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.internal.WrapsDriver;

import android.graphics.Point;
import android.os.SystemClock;
import android.view.MotionEvent;

/**
 * Represents an Android HTML element.
 *
 * TODO (berrada): Rewrite all function that interact with the page using native events and get rid
 * of JS. Only use JS for reading properties.
 */
public class AndroidWebElement implements WebElement, FindsById, FindsByLinkText, FindsByXPath,
    FindsByTagName, SearchContext, WrapsDriver, Locatable  {

  private AndroidDriver driver;
  private String elementId;
  private ActivityController controller;
  private AndroidCoordinates coordinates;

  public AndroidWebElement(AndroidDriver driver, String elementId) {
    this.driver = driver;
    this.elementId = elementId;
    controller = ActivityController.getInstance();
    coordinates = new AndroidCoordinates(elementId,
        elementId.equals("0") ? new org.openqa.selenium.Point(0, 0) : getLocation());
  }

  public AndroidWebElement(AndroidDriver driver) {
    this(driver, "0");
  }

  public String getElementId() {
    return elementId;
  }

  public void click() {
    WebDriverWebView.resetEditableAreaHasFocus();
    // Scroll if the element is not visible so it is in the viewport.
    getDomAccessor().scrollIfNeeded(elementId);
    Point center = getDomAccessor().getCenterCoordinate(elementId);
    long downTime = SystemClock.uptimeMillis();
    List<MotionEvent> events = Lists.newArrayList();

    MotionEvent downEvent = MotionEvent.obtain(downTime,
        SystemClock.uptimeMillis(), MotionEvent.ACTION_DOWN, center.x, center.y, 0);
    events.add(downEvent);
    MotionEvent upEvent = MotionEvent.obtain(downTime,
        SystemClock.uptimeMillis(), MotionEvent.ACTION_UP, center.x, center.y, 0);
    events.add(upEvent);

    controller.sendMotionEvent(events);
    // If the page started loading we should wait
    // until the page is done loading.
    controller.blockIfPageIsLoading(driver);
  }

  public JavascriptDomAccessor getDomAccessor() {
    return driver.getDomAccessor();
  }

  public void submit() {
    String tagName = getTagName();
    if ("button".equalsIgnoreCase(tagName)
        || "submit".equalsIgnoreCase(getAttribute("type"))
        || "img".equalsIgnoreCase(tagName)) {
      this.click();
    } else {
      getDomAccessor().submit(elementId);
      controller.blockIfPageIsLoading(driver);
    }
  }

  public String getValue() {
    return getDomAccessor().getAttributeValue("value", elementId);
  }

  public void clear() {
    String value = getValue();
    if (value == null || value.length() == 0) {
      return;
    }
    CharSequence[] keys = new CharSequence[value.length() + 1];
    keys[0] = value;
    for (int i = 1; i < keys.length; i++) {
      keys[i] = Keys.BACK_SPACE;
    }
    // focus on the element
    this.click();
    controller.waitUntilEditableAreaFocused();
    controller.sendKeys(keys);
  }

  public void sendKeys(CharSequence... value) {
    if (value == null || value.length == 0) {
      return;
    }
    if (!isEnabled()) {
      throw new UnsupportedOperationException("Cannot send keys to disabled element.");
    }
    CharSequence[] keys = new CharSequence[value.length + 1];
    keys[0] = getValue();
    for (int i = 0; i < value.length; i++) {
      keys[i + 1] = value[i].toString();
    }

    // focus on the element
    this.click();
    controller.waitUntilEditableAreaFocused();
    controller.sendKeys(keys);
  }

  public String getTagName() {
    return getDomAccessor().getTagName(elementId).toLowerCase();
  }

  public String getAttribute(String name) {
    return getDomAccessor().getAttributeValue(name, elementId);
  }

  public boolean toggle() {
    return getDomAccessor().toggle(elementId);
  }

  public boolean isSelected() {
    return getDomAccessor().isSelected(elementId);
  }

  public void setSelected() {
    getDomAccessor().setSelected(elementId);
  }

  public boolean isEnabled() {
    return !Boolean.valueOf(getAttribute("disabled"));
  }

  public String getText() {
    return normalize(getDomAccessor().getText(elementId));
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public WebElement findElementById(String using) {
    return getDomAccessor().getElementById(using, elementId);
  }

  public List<WebElement> findElementsById(String using) {
    return getDomAccessor().getElementsById(using, elementId);
  }

  public WebElement findElementByXPath(String using) {
    return getDomAccessor().getElementByXPath(using, elementId);
  }

  public List<WebElement> findElementsByXPath(String using) {
    return getDomAccessor().getElementsByXpath(using, elementId);
  }

  public WebElement findElementByLinkText(String using) {
    return getDomAccessor().getElementByLinkText(using, elementId);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return getDomAccessor().getElementsByLinkText(using, elementId);
  }

  public WebElement findElementByPartialLinkText(String using) {
    return getDomAccessor().getElementByPartialLinkText(using, elementId);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    return getDomAccessor().getElementsByPartialLinkText(using, elementId);
  }

  public WebElement findElementByTagName(String using) {
    return getDomAccessor().getElementByTagName(using, elementId);
  }

  public List<WebElement> findElementsByTagName(String using) {
    return getDomAccessor().getElementsByTagName(using, elementId);
  }

  public WebElement findElementByName(String using) {
    return getDomAccessor().getElementByName(using, elementId);
  }

  public List<WebElement> findElementsByName(String using) {
    return getDomAccessor().getElementsByName(using, elementId);
  }

  /**
   * Normalizes output texts. Users expects the same text no matter which
   * browser they use.
   *
   * @param text
   * @return normalized text
   */
  private String normalize(String text) {
    final String nbsp = new String(new char[] {(char) 160});
    return text.replaceAll("\\s+(" + nbsp + ")+\\s+", "$1")
        .replace((char) 160, ' ')
        .replaceAll(
            "\n+", "\n")
        .replaceAll("\r|\t", "")
        .trim();
  }

  public void dragAndDropBy(int moveRightBy, int moveDownBy) {
    throw new UnsupportedOperationException("Action not supported.");
  }

  public void dragAndDropOn(AndroidWebElement element) {
    throw new UnsupportedOperationException("Action not supported.");
  }

  /**
   * Where on the page is the top left-hand corner of the rendered element? it's
   * part of RenderedWebElement
   *
   * @return A point, containing the location of the top left-hand corner of the
   *         element
   */
  public org.openqa.selenium.Point getLocation() {
    Point result = getDomAccessor().getCoordinate(elementId);
    if (result == null) {
      throw new WebDriverException("Element location is null.");
    }
    return new org.openqa.selenium.Point(result.x, result.y);
  }

  /**
   * @return a {@link Point} where x is the width, and y is the height.
   */
  public Dimension getSize() {
    // TODO(berrada): I don't think this will work ("em", for example). There is an
    // atom for that.
    Point result = getDomAccessor().getSize(elementId);
    return new Dimension(result.x, result.y);
  }

  public String getValueOfCssProperty(String property) {
    String value = getDomAccessor().getValueOfCssProperty(property, true, elementId);
    if (value == null) {
      return "";
    }
    if (value.startsWith("rgb")) {
      return rgbToHex(value);
    }
    return value;
  }

  public void hover() {
    throw new UnsupportedOperationException("Android does not support hover event");
  }

  public boolean isDisplayed() {
    return getDomAccessor().isDisplayed(elementId);
  }

  /**
   * Converts a String of a color to hexadecimal.
   */
  private String rgbToHex(final String value) {
    if ("rgba(0, 0, 0, 0)".equals(value)) {
      return "transparent";
    }
    final Pattern rgb = Pattern.compile("rgb\\((\\d{1,3}),\\s(\\d{1,3}),\\s(\\d{1,3})\\)");
    final Matcher matcher = rgb.matcher(value);
    if (matcher.find()) {
      String hex = "#";
      for (int i = 1; i <= 3; i++) {
        int colour = Integer.parseInt(matcher.group(i));
        String s = Integer.toHexString(colour);
        if (s.length() == 1) {
          s = "0" + s;
        }
        hex += s;
      }
      hex = hex.toLowerCase();
      return hex;
    }
    return value;
  }

  public WebDriver getWrappedDriver() {
    return driver;
  }

  public String getCssValue(String propertyName) {
    throw new UnsupportedOperationException("Getting CSS values is not supported yet.");
  }

  public Coordinates getCoordinates() {
    return coordinates;
  }

  public org.openqa.selenium.Point getLocationOnScreenOnceScrolledIntoView() {
    return getLocation();
  }
}
