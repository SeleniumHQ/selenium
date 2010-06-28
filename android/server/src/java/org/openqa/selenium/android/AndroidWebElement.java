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

import static org.openqa.selenium.android.JavascriptDomAccessor.STALE;
import static org.openqa.selenium.android.JavascriptDomAccessor.UNSELECTABLE;
import android.graphics.Point;
import android.util.Log;
import android.view.MotionEvent;

import org.openqa.selenium.By;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.android.intents.Action;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Represents an Android HTML element.
 */
public class AndroidWebElement implements WebElement, FindsById, FindsByLinkText, FindsByXPath,
    FindsByTagName, SearchContext, AndroidRenderedWebElement {

  private static final String LOG_TAG = AndroidWebElement.class.getName();
  private final AndroidDriver driver;
  private final JavascriptDomAccessor domAccessor;
  private final String elementId;

  public AndroidWebElement(AndroidDriver driver, String elementId) {
    this.driver = driver;
    this.elementId = elementId;
    domAccessor = new JavascriptDomAccessor(driver);
  }

  public AndroidWebElement(AndroidDriver driver) {
    this(driver, "0");
  }

  public String getElementId() {
    return elementId;
  }

  public void click() {
    assertElementIsDisplayed();
    // Native touch event
    Point p = getLocation();
    Log.d(LOG_TAG, "click on " + p.toString());
    // TODO(berrada): Aim for the centre of the element (so get size as well)
    // Comment on why we don't need an ACTION_UP
    MotionEvent motionEvent =
        MotionEvent.obtain(System.currentTimeMillis(), System.currentTimeMillis(),
            MotionEvent.ACTION_DOWN, new Float(p.x + 1), new Float(p.y + 1), 1.0f, 0,
            0, 0f, 0, 0, 0);
    
    driver.resetPageHasStartedLoading();
    driver.resetPageHasLoaded();
    driver.sendIntent(Action.SEND_MOTION_EVENT, motionEvent);

    // If the page started loading and the element is clickable, we should wait
    // until the page is done loading.
    if (driver.pageHasStartedLoading() && p.x != 0 && p.y != 0) {
      driver.waitUntilPageFinishedLoading();
    }
  }

  public void submit() {
    // TODO(berrada): For the else condition, it would be better to walk up the
    // form, then down to the first valid submit element and click that.
    String tagName = getTagName();
    driver.resetPageHasLoaded();
    driver.resetPageHasStartedLoading();
    if ("button".equalsIgnoreCase(tagName) || "input".equalsIgnoreCase(tagName)
        || getAttribute("type").equalsIgnoreCase("submit")
        || "img".equalsIgnoreCase(tagName)) {      
      this.click();
      domAccessor.submit(elementId);
      if (driver.pageHasStartedLoading()) {
        driver.waitUntilPageFinishedLoading();
      }
    }
  }

  public String getValue() {
    return domAccessor.getAttributeValue("value", elementId);
  }

  public void clear() {
    Log.d(LOG_TAG, "clear");
    // focus
    this.click();
    driver.sendIntent(Action.CLEAR_TEXT);
    domAccessor.blur(elementId);
  }

  public void sendKeys(CharSequence... value) {
    // assertElementIsDisplayed() is not required - it will be check in click
    if (value == null || value.length == 0) {
      return;
    }
    // focus
    this.click();
    for (int i = 0; i < value.length; i++) {
    boolean last = (i == value.length - 1);
      driver.sendIntent(Action.SEND_KEYS, value[i].toString(), last);
    }
  }

  public String getTagName() {
    return domAccessor.getTagName(elementId).toLowerCase();
  }

  public String getAttribute(String name) {
    String value = domAccessor.getAttributeValue(name, elementId);
    Log.d(LOG_TAG,
        "GetAttribute " + name + "  " + value + " " + (value != null ? value.length() : ""));
    if ("selected".equalsIgnoreCase(name) || "checked".equalsIgnoreCase(name)) {
      return Boolean.toString(isSelected());
    } else if ("disabled".equalsIgnoreCase(name)) {
      return Boolean.toString(value != null && value.length() > 0);
    }
    return value;
  }

  public boolean toggle() {
    if (!isDisplayed()) {
      throw new ElementNotVisibleException("Element: " + elementId);
    }
    return domAccessor.toggle(elementId);
  }

  public boolean isSelected() {
    return domAccessor.isSelected(elementId);
  }

  public void setSelected() {
    assertElementIsDisplayed();
    assertElementIsEnabled();
    String result = domAccessor.setSelected(elementId);
    if (result == UNSELECTABLE) {
      throw new WebDriverException("Element is not selectable.");
    } else if (result == STALE) {
      throw new StaleElementReferenceException("Element is stale.");
    }
  }

  public boolean isEnabled() {
    return !Boolean.parseBoolean(getAttribute("disabled"));
  }

  public String getText() {
    return normalize(domAccessor.getText(elementId));
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public WebElement findElementById(String using) {
    return domAccessor.getElementById(using, elementId);
  }

  public List<WebElement> findElementsById(String using) {
    return domAccessor.getElementsById(using, elementId);
  }

  public WebElement findElementByXPath(String using) {
    return domAccessor.getElementByXPath(using, elementId);
  }

  public List<WebElement> findElementsByXPath(String using) {
    return domAccessor.getElementsByXpath(using, elementId);
  }

  public WebElement findElementByLinkText(String using) {
    return domAccessor.getElementByLinkText(using, elementId);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return domAccessor.getElementsByLinkText(using, elementId);
  }

  public WebElement findElementByPartialLinkText(String using) {
    return domAccessor.getElementByPartialLinkText(using, elementId);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    return domAccessor.getElementsByPartialLinkText(using, elementId);
  }

  public WebElement findElementByTagName(String using) {
    return domAccessor.getElementByTagName(using, elementId);
  }

  public List<WebElement> findElementsByTagName(String using) {
    return domAccessor.getElementsByTagName(using, elementId);
  }

  public WebElement findElementByName(String using) {
    return domAccessor.getElementByName(using, elementId);
  }

  public List<WebElement> findElementsByName(String using) {
    return domAccessor.getElementsByName(using, elementId);
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

  public void dragAndDropOn(AndroidRenderedWebElement element) {
    throw new UnsupportedOperationException("Action not supported.");
  }

  /**
   * Where on the page is the top left-hand corner of the rendered element? it's
   * part of RenderedWebElement
   *
   * @return A point, containing the location of the top left-hand corner of the
   *         element
   */
  public Point getLocation() {
    String result = domAccessor.getXYCordinate(elementId);
    if (result == null) {
      throw new WebDriverException("Element location is null.");
    }

    Log.d(LOG_TAG, "getLocation result: " + result);
    String[] coordinate = result.split(",");
    if (coordinate.length == 2) {
      return new Point(Integer.parseInt(coordinate[0]), Integer.parseInt(coordinate[1]));
    }
    Log.e(LOG_TAG, "Cannot parse result of getXYCoordinate " + result + " " + result.length());
    throw new WebDriverException("Cannot parse result of getXYCoordinate " + result);
  }

  public Point getSize() {
    try {
            // TODO(berrada): I don't think this will work ("em", for example)
      int width = Integer.parseInt(getAttribute("offsetWidth").replace("px", ""));
      int height = Integer.parseInt(getAttribute("offsetHeight").replace("px", ""));
      System.out.println("WIDTH : " + width + ", HEIGHT: " + height);
      return new Point(width, height);
    } catch (NumberFormatException e) {
      throw new WebDriverException("Cannot determine size of element", e);
    }
  }

  public String getValueOfCssProperty(String property) {
    String value = domAccessor.getValueOfCssProperty(property, true, elementId);
    Log.d(LOG_TAG, "ValueOfCssProperty: " + property + " = " + value);
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
    boolean visibility = domAccessor.isDisplayed(elementId);
    if ("input".equalsIgnoreCase(getTagName())) {
      return !"hidden".equalsIgnoreCase(getAttribute("type")) && visibility;
    }
    return visibility;
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

  protected void assertElementIsDisplayed() {
    if (!isDisplayed()) {
      throw new ElementNotVisibleException("Element: " + elementId);
    }
  }

  protected void assertElementIsEnabled() {
    if (!isEnabled()) {
      throw new UnsupportedOperationException("Element: " + elementId);
    }
  }
}
