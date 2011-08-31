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

import android.os.SystemClock;
import android.view.MotionEvent;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.InvalidElementStateException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Point;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.android.app.WebDriverWebView;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;

import com.google.common.collect.Lists;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Represents an Android HTML element.
 */
public class AndroidWebElement implements WebElement,
    FindsById, FindsByLinkText, FindsByXPath, FindsByTagName,
    SearchContext, WrapsDriver, Locatable  {

  private final AndroidDriver driver;
  private final String elementId;
  private final ActivityController controller;
  private AndroidCoordinates coordinates;
  private final Atoms atoms;

  private static final String LOCATOR_ID = "id";
  private static final String LOCATOR_LINK_TEXT = "linkText";
  private static final String LOCATOR_PARTIAL_LINK_TEXT = "partialLinkText";
  private static final String LOCATOR_NAME = "name";
  private static final String LOCATOR_TAG_NAME = "tagName";
  private static final String LOCATOR_XPATH = "xpath";

  public AndroidWebElement(AndroidDriver driver, String elementId) {
    this.driver = driver;
    this.elementId = elementId;
    controller = ActivityController.getInstance();
    atoms = Atoms.getInstance();
  }

  public String getId() {
    return elementId;
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof WebElement)) {
      return false;
    }
    WebElement e = (WebElement) o;
    if (e instanceof WrapsElement) {
      e = ((WrapsElement) o).getWrappedElement();
    }
    if (!(e instanceof AndroidWebElement)) {
      return false;
    }
    return elementId.equals(((AndroidWebElement) e).getId());
  }

  @Override
  public int hashCode() {
    return elementId.hashCode();
  }

  private Point getCenterCoordinates() {
    if (!isDisplayed()) {
      throw new ElementNotVisibleException("This WebElement is not visisble and may not be clicked.");
    }
    WebDriverWebView.resetEditableAreaHasFocus();
    Point topLeft = getLocation();
    String sizeJs =
        "var w = 0; h = 0;" +
        "if (arguments[0].getClientRects && arguments[0].getClientRects()[0]) {" +
        "  w = arguments[0].getClientRects()[0].width;" +
        "  h = arguments[0].getClientRects()[0].height;" +
        " } else {" +
        "  w = arguments[0].offsetWidth;" +
        "  h = arguments[0].offsetHeight;" +
        "}; return w + ',' + h;";
    String[] result = ((String) driver.executeScript(sizeJs, this)).split(",");
    return new Point(topLeft.x + Integer.parseInt(result[0]) / 2,
        topLeft.y + Integer.parseInt(result[1]) / 2);
  }

  public void click() {
    Point center = getCenterCoordinates();
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

  public void submit() {
    String tagName = getTagName();
    if ("button".equalsIgnoreCase(tagName)
        || "submit".equalsIgnoreCase(getAttribute("type"))
        || "img".equalsIgnoreCase(tagName)) {
      this.click();
    } else {
      driver.executeAtom(atoms.submitJs, false, this);
      controller.blockIfPageIsLoading(driver);
    }
  }

  public void clear() {
    driver.executeAtom(atoms.clearJs, false, this);
  }

  public void sendKeys(CharSequence... value) {
    if (value == null || value.length == 0) {
      return;
    }
    if (!isEnabled()) {
      throw new InvalidElementStateException("Cannot send keys to disabled element.");
    }
    CharSequence[] keys = new CharSequence[value.length];
    for (int i = 0; i < value.length; i++) {
      keys[i] = value[i].toString();
    }

    // focus on the element
    this.click();
    controller.waitUntilEditableAreaFocused();
    // Move the cursor to the end of the test input.
    // The trick is to set the value after the cursor
    driver.executeScript("arguments[0].focus();arguments[0].value=arguments[0].value;",
        this);
    controller.sendKeys(keys);
  }

  public String getTagName() {
    return (String) driver.executeScript("return arguments[0].tagName", this);

  }

  public String getAttribute(String name) {
    return (String) driver.executeAtom(atoms.getAttributeJs, false, this, name);
  }

  public boolean isSelected() {
    return (Boolean) driver.executeAtom(atoms.isSelectedJs, false, this);
  }

  public boolean isEnabled() {
    return (Boolean) driver.executeAtom(atoms.isEnabledJs, false, this);
  }

  public String getText() {
    return (String) driver.executeAtom(atoms.getTextJs, false, this);
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  public WebElement findElementById(String using) {
    return findElement(LOCATOR_ID, using, false);
  }

  public List<WebElement> findElementsById(String using) {
    return findElements(LOCATOR_ID, using, false);
  }

  public WebElement findElementByXPath(String using) {
    return findElement(LOCATOR_XPATH, using, true);
  }

  public List<WebElement> findElementsByXPath(String using) {
    return findElements(LOCATOR_XPATH, using, true);
  }

  public WebElement findElementByLinkText(String using) {
    return findElement(LOCATOR_LINK_TEXT, using, false);
  }

  public List<WebElement> findElementsByLinkText(String using) {
    return findElements(LOCATOR_LINK_TEXT, using, false);
  }

  public WebElement findElementByPartialLinkText(String using) {
    return findElement(LOCATOR_PARTIAL_LINK_TEXT, using, false);
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    return findElements(LOCATOR_PARTIAL_LINK_TEXT, using, false);
  }

  public WebElement findElementByTagName(String using) {
    return findElement(LOCATOR_TAG_NAME, using, false);
  }

  public List<WebElement> findElementsByTagName(String using) {
    return findElements(LOCATOR_TAG_NAME, using, false);
  }

  public WebElement findElementByName(String using) {
    return findElement(LOCATOR_NAME, using, false);
  }

  public List<WebElement> findElementsByName(String using) {
    return findElements(LOCATOR_NAME, using, false);
  }

  private List<WebElement> findElements(String strategy, String locator, boolean xpath) {
    // If the Id is empty, this reffers to the window document context.
    if (elementId.equals("")) {
      return (List<WebElement>) driver.executeAtom(atoms.findElementsJs, xpath, strategy, locator);
    } else {
      return (List<WebElement>) driver.executeAtom(atoms.findElementsJs, xpath, strategy, locator, this);
    }
  }

  private WebElement findElement(String strategy, String locator, boolean xpath) {
    WebElement el;
    // If the element Id is empty, this reffers to the window document context.
    if (elementId.equals("")) {
      el = (WebElement) driver.executeAtom(atoms.findElementJs, xpath, strategy, locator);
    } else {
      el = (WebElement) driver.executeAtom(atoms.findElementJs, xpath, strategy, locator, this);
    }
    if (el == null) {
      throw new NoSuchElementException("Could not find element "
          + "with " + strategy + ": " + locator);
    }
    return el;
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
  public Point getLocation() {
    Map<String, Long> map = (java.util.Map<String, Long>) driver.executeAtom(
        atoms.getLocationJs, false, this);
    return new Point(map.get("x").intValue(), map.get("y").intValue());
  }

  /**
   * @return a {@link Point} where x is the width, and y is the height.
   */
  public Dimension getSize() {
    Map<String, Long> map = (Map<String, Long>) driver.executeAtom(
        atoms.getSizeJs, false, this);
    return new Dimension(map.get("width").intValue(),
        map.get("height").intValue());
  }

  public String getValueOfCssProperty(String property) {
    return (String) driver.executeAtom(atoms.getCssPropJs, false, this, property);
  }

  public void hover() {
    throw new UnsupportedOperationException("Android does not support hover event");
  }

  public boolean isDisplayed() {
    return (Boolean) driver.executeAtom(atoms.isDisplayedJs, true, this);
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
    if (coordinates == null) {
      coordinates = new AndroidCoordinates(elementId,
          elementId.equals("0") ? new Point(0, 0) : getCenterCoordinates());
    }
    return coordinates;
  }

  public org.openqa.selenium.Point getLocationOnScreenOnceScrolledIntoView() {
    return getLocation();
  }
}
