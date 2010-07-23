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
import android.os.SystemClock;
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
 * 
 * TODO (berrada): Rewrite all function that interact with the page using native events and get rid
 * of JS. Only use JS for reading properties.
 */
public class AndroidWebElement implements WebElement, FindsById, FindsByLinkText, FindsByXPath,
    FindsByTagName, SearchContext, AndroidRenderedWebElement {

  private static final String LOG_TAG = AndroidWebElement.class.getName();
  private final AndroidDriver driver;
  private final String elementId;

  public AndroidWebElement(AndroidDriver driver, String elementId) {
    this.driver = driver;
    this.elementId = elementId;
  }

  public AndroidWebElement(AndroidDriver driver) {
    this(driver, "0");
  }

  public String getElementId() {
    return elementId;
  }

  public void click() {
    assertElementIsDisplayed();    
    Point center = getCenterElementLocation();
    Log.d(LOG_TAG, "Clicking on " + center.toString());
    
    MotionEvent downEvent = MotionEvent.obtain(SystemClock.uptimeMillis(),
        SystemClock.uptimeMillis(), MotionEvent.ACTION_DOWN, center.x, center.y, 0,
        0, 0, 0, 0, 0, 0);
    MotionEvent upEvent = MotionEvent.obtain(downEvent.getDownTime(),
        SystemClock.uptimeMillis() + 1, MotionEvent.ACTION_UP, center.x, center.y, 1,
        0, 0, 0, 0, 0, 0);
    
    driver.sendIntent(Action.SEND_MOTION_EVENT, downEvent, upEvent);

    // If the page started loading we should wait
    // until the page is done loading.
    if (driver.pageHasStartedLoading()) {
      driver.waitUntilPageFinishedLoading();
    }
  }

  private Point getCenterElementLocation() {
    Point topLeft = getLocation();
    Point size = getSize();
    int centerX = topLeft.x + (size.x > 0 ? size.x/2 : 0);
    int centerY = topLeft.y + (size.y > 0 ? size.y/2 : 0);
    // In case of links starting on end of a line and continuing on the following
    // line, the center coordinate will be somewhere outside the screen, we need
    // to re-adjust.
    Point center = getDomAccessor().adjustCoordinateIfNeeded(centerX, centerY, elementId);
    return center;    
  }
  
  public JavascriptDomAccessor getDomAccessor() {
    return driver.getDomAccessor();
  }
  
  public void submit() {
    // TODO(berrada): For the else condition, it would be better to walk up the
    // form, then down to the first valid submit element and click that.
    String tagName = getTagName();
    driver.resetPageHasLoaded();
    driver.resetPageHasStartedLoading();
    if ("button".equalsIgnoreCase(tagName) || "input".equalsIgnoreCase(tagName)
        || "submit".equalsIgnoreCase(getAttribute("type"))
        || "img".equalsIgnoreCase(tagName)) {   
      this.click();
    } else {
      // TODO (berrada): Get rid of the JS implementation, and send keyboard events instead.
      getDomAccessor().submit(elementId);
    }
    if (driver.pageHasStartedLoading()) {
      driver.waitUntilPageFinishedLoading();
    }
  }

  public String getValue() {
    return getDomAccessor().getAttributeValue("value", elementId);
  }

  public void clear() {
    Log.d(LOG_TAG, "clear");
    // focus
    this.click();
    driver.sendIntent(Action.CLEAR_TEXT);
    getDomAccessor().blur(elementId);
  }

  public void sendKeys(CharSequence... value) {
    if (value == null || value.length == 0) {
      return;
    }
    // focus on the element
    this.click();
    
    String[] serializableArgs = new String[value.length +1];
    serializableArgs[0] = getValue();
    for (int i = 0; i < value.length; i++) {
      serializableArgs[i + 1] = value[i].toString();
    }
    driver.sendIntent(Action.SEND_KEYS, serializableArgs);
    
    if (driver.pageHasStartedLoading()) {
      driver.waitUntilPageFinishedLoading();
    }
    
  }
  public String getTagName() {
    return getDomAccessor().getTagName(elementId).toLowerCase();
  }

  public String getAttribute(String name) {
    String value = getDomAccessor().getAttributeValue(name, elementId);
    Log.d(LOG_TAG,
        "GetAttribute " + name + ": value: " + value);
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
    return getDomAccessor().toggle(elementId);
  }

  public boolean isSelected() {
    return getDomAccessor().isSelected(elementId);
  }

  public void setSelected() {
    assertElementIsDisplayed();
    assertElementIsEnabled();
    String result = getDomAccessor().setSelected(elementId);
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
    Point result = getDomAccessor().getCoordinate(elementId);
    if (result == null) {
      throw new WebDriverException("Element location is null.");
    }
    return result;
  }

  /**
   * @return a {@link Point} where x is the width, and y is the height.
   */
  public Point getSize() {
    // TODO(berrada): I don't think this will work ("em", for example). There is an
    // atom for that.
    return getDomAccessor().getSize(elementId);
  }

  public String getValueOfCssProperty(String property) {
    String value = getDomAccessor().getValueOfCssProperty(property, true, elementId);
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
    boolean visibility = getDomAccessor().isDisplayed(elementId);
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
