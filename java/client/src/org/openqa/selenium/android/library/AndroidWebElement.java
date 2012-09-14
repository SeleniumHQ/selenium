/*
Copyright 2010 Selenium committers


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

package org.openqa.selenium.android.library;

import com.google.common.collect.Lists;

import android.os.SystemClock;
import android.view.MotionEvent;
import android.webkit.WebView;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.InvalidElementStateException;
import org.openqa.selenium.NoSuchElementException;
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
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.Semaphore;

import java.util.List;
import java.util.Map;

/**
 * Represents an Android HTML element.
 */
public class AndroidWebElement implements WebElement,
    SearchContext, WrapsDriver, Locatable {

  private final AndroidWebDriver driver;
  private final String elementId;
  private AndroidCoordinates coordinates;
  private FindByImpl findsBy;
  private Object syncObject = new Object();
  private volatile boolean done;

  private static final String LOCATOR_ID = "id";
  private static final String LOCATOR_LINK_TEXT = "linkText";
  private static final String LOCATOR_PARTIAL_LINK_TEXT = "partialLinkText";
  private static final String LOCATOR_NAME = "name";
  private static final String LOCATOR_TAG_NAME = "tagName";
  private static final String LOCATOR_XPATH = "xpath";
  private static final String LOCATOR_CSS_SELECTOR = "css";
  private static final String LOCATOR_CLASS_NAME = "className";

   AndroidWebElement(AndroidWebDriver driver, String elementId) {
    this.driver = driver;
    this.elementId = elementId;
    findsBy = new FindByImpl();
  }

   String getId() {
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
      throw new ElementNotVisibleException(
          "This WebElement is not visisble and may not be clicked.");
    }
    driver.setEditAreaHasFocus(false);
    Point topLeft = getLocation();
    String sizeJs =
        "var __webdriver_w = 0;" +
        "var __webdriver_h = 0;" +
            "if (arguments[0].getClientRects && arguments[0].getClientRects()[0]) {" +
            "  __webdriver_w = arguments[0].getClientRects()[0].width;" +
            "  __webdriver_h = arguments[0].getClientRects()[0].height;" +
            " } else {" +
            "  __webdriver_w = arguments[0].offsetWidth;" +
            "  __webdriver_h = arguments[0].offsetHeight;" +
            "}; return __webdriver_w + ',' + __webdriver_h;";
    String[] result = ((String) driver.executeScript(sizeJs, this)).split(",");
    return new Point(topLeft.x + Integer.parseInt(result[0]) / 2,
        topLeft.y + Integer.parseInt(result[1]) / 2);
  }

  public void click() {
    if ("OPTION".equals(getTagName().toUpperCase())) {
      driver.resetPageIsLoading();
      driver.executeAtom(AndroidAtoms.CLICK.getValue(), this);
      driver.waitForPageToLoad();
    }

    Point center = getCenterCoordinates();
    long downTime = SystemClock.uptimeMillis();
    final List<MotionEvent> events = Lists.newArrayList();

    MotionEvent downEvent = MotionEvent.obtain(downTime,
        SystemClock.uptimeMillis(), MotionEvent.ACTION_DOWN, center.x, center.y, 0);
    events.add(downEvent);
    MotionEvent upEvent = MotionEvent.obtain(downTime,
        SystemClock.uptimeMillis(), MotionEvent.ACTION_UP, center.x, center.y, 0);

    events.add(upEvent);

    driver.resetPageIsLoading();

    EventSender.sendMotion(events, driver.getWebView(), driver.getActivity());

    // If the page started loading we should wait
    // until the page is done loading.
    driver.waitForPageToLoad();
  }

  public void submit() {
    String tagName = getTagName();
    if ("button".equalsIgnoreCase(tagName)
        || "submit".equalsIgnoreCase(getAttribute("type"))
        || "img".equalsIgnoreCase(tagName)) {
      this.click();
    } else {
      driver.resetPageIsLoading();
      driver.executeAtom(AndroidAtoms.SUBMIT.getValue(), this);
      driver.waitForPageToLoad();
    }
  }

  public void clear() {
    driver.executeAtom(AndroidAtoms.CLEAR.getValue(), this);
  }

  public void sendKeys(final CharSequence... value) {
    if (value == null || value.length == 0) {
      return;
    }
    if (!isEnabled()) {
      throw new InvalidElementStateException("Cannot send keys to disabled element.");
    }
    // focus on the element
    this.click();
    driver.waitUntilEditAreaHasFocus();
    // Move the cursor to the end of the test input.
    // The trick is to set the value after the cursor
    driver.executeScript("arguments[0].focus();arguments[0].value=arguments[0].value;",
        this);

    final WebView view = driver.getWebView();

    final Semaphore sem = new Semaphore(0);
    driver.getActivity().runOnUiThread(new Runnable() {
      public void run() {
        EventSender.sendKeys(view, driver.getActivity(), value);
        sem.release();
      }
    });


    try {
      sem.tryAcquire(AndroidWebDriver.UI_TIMEOUT, TimeUnit.MILLISECONDS);
    } catch (InterruptedException e) {
      throw new WebDriverException("Error while sending keys.", e);
    }
  }

  public String getTagName() {
    return (String) driver.executeScript("return arguments[0].tagName", this);

  }

  public String getAttribute(String name) {
    return (String) driver
        .executeAtom(AndroidAtoms.GET_ATTRIBUTE_VALUE.getValue(), this, name);
  }

  public boolean isSelected() {
    return (Boolean) driver.executeAtom(AndroidAtoms.IS_SELECTED.getValue(), this);
  }

  public boolean isEnabled() {
    return (Boolean) driver.executeAtom(AndroidAtoms.IS_ENABLED.getValue(), this);
  }

  public String getText() {
    return (String) driver.executeAtom(AndroidAtoms.GET_TEXT.getValue(), this);
  }

  public WebElement findElement(By by) {
    return by.findElement(findsBy);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(findsBy);
  }

  FindByImpl getFinder() {
    return findsBy;
  }

  class FindByImpl implements SearchContext, FindsById, FindsByLinkText,
      FindsByXPath, FindsByTagName, FindsByCssSelector, FindsByClassName {

    public WebElement findElement(By by) {
      return by.findElement(findsBy);
    }

    public List<WebElement> findElements(By by) {
      return by.findElements(findsBy);
    }

    public WebElement findElementById(String using) {
      return lookupElement(LOCATOR_ID, using);
    }

    public List<WebElement> findElementsById(String using) {
      return lookupElements(LOCATOR_ID, using);
    }

    public WebElement findElementByXPath(String using) {
      return lookupElement(LOCATOR_XPATH, using);
    }

    public List<WebElement> findElementsByXPath(String using) {
      return lookupElements(LOCATOR_XPATH, using);
    }

    public WebElement findElementByLinkText(String using) {
      return lookupElement(LOCATOR_LINK_TEXT, using);
    }

    public List<WebElement> findElementsByLinkText(String using) {
      return lookupElements(LOCATOR_LINK_TEXT, using);
    }

    public WebElement findElementByPartialLinkText(String using) {
      return lookupElement(LOCATOR_PARTIAL_LINK_TEXT, using);
    }

    public List<WebElement> findElementsByPartialLinkText(String using) {
      return lookupElements(LOCATOR_PARTIAL_LINK_TEXT, using);
    }

    public WebElement findElementByTagName(String using) {
      return lookupElement(LOCATOR_TAG_NAME, using);
    }

    public List<WebElement> findElementsByTagName(String using) {
      return lookupElements(LOCATOR_TAG_NAME, using);
    }

    public WebElement findElementByName(String using) {
      return lookupElement(LOCATOR_NAME, using);
    }

    public List<WebElement> findElementsByName(String using) {
      return lookupElements(LOCATOR_NAME, using);
    }

    public WebElement findElementByCssSelector(String using) {
      return lookupElement(LOCATOR_CSS_SELECTOR, using);
    }

    public List<WebElement> findElementsByCssSelector(String using) {
      return lookupElements(LOCATOR_CSS_SELECTOR, using);
    }

    public WebElement findElementByClassName(String using) {
      return lookupElement(LOCATOR_CLASS_NAME, using);
    }

    public List<WebElement> findElementsByClassName(String using) {
      return lookupElements(LOCATOR_CLASS_NAME, using);
    }
  }

  private List<WebElement> lookupElements(String strategy, String locator) {
    List<WebElement> results;
    try {
      // If the Id is empty, this refers to the window document context.
      if (elementId.equals("")) {
        results = (List<WebElement>) driver
            .executeAtom(AndroidAtoms.FIND_ELEMENTS.getValue(), strategy, locator);
      } else {
        results = (List<WebElement>) driver
            .executeAtom(AndroidAtoms.FIND_ELEMENTS.getValue(), strategy, locator, this);
      }
    } catch (RuntimeException e) {
      // TODO(simon): This is probably not the Right Thing to do.
      results = Lists.newArrayList();
    }

    if (results == null) {
      return Lists.newArrayList();
    }
    return results;
  }

  private WebElement lookupElement(String strategy, String locator) {
    WebElement el;
    // If the element Id is empty, this reffers to the window document context.
    if (elementId.equals("")) {
      el = (WebElement) driver
          .executeAtom(AndroidAtoms.FIND_ELEMENT.getValue(), strategy, locator);
    } else {
      el = (WebElement) driver
          .executeAtom(AndroidAtoms.FIND_ELEMENT.getValue(), strategy, locator, this);
    }
    if (el == null) {
      throw new NoSuchElementException("Could not find element "
          + "with " + strategy + ": " + locator);
    }
    return el;
  }

  /**
   * Normalizes output texts. Users expects the same text no matter which browser they use.
   *
   * @return normalized text
   */
  private String normalize(String text) {
    final String nbsp = new String(new char[]{(char) 160});
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
   * Where on the page is the top left-hand corner of the rendered element? it's part of
   * RenderedWebElement
   *
   * @return A point, containing the location of the top left-hand corner of the element
   */
  public Point getLocation() {
    Map<String, Long> map = (Map<String, Long>) driver.executeAtom(
        AndroidAtoms.GET_TOP_LEFT_COORDINATES.getValue(), this);
    return new Point(map.get("x").intValue(), map.get("y").intValue());
  }

  /**
   * @return a {@link Point} where x is the width, and y is the height.
   */
  public Dimension getSize() {
    Map<String, Long> map = (Map<String, Long>) driver.executeAtom(
        AndroidAtoms.GET_SIZE.getValue(), this);
    return new Dimension(map.get("width").intValue(),
        map.get("height").intValue());
  }

  public String getValueOfCssProperty(String property) {
    return (String) driver
        .executeAtom(AndroidAtoms.GET_VALUE_OF_CSS_PROPERTY.getValue(), this, property);
  }

  public void hover() {
    throw new UnsupportedOperationException("Android does not support hover event");
  }

  public boolean isDisplayed() {
    return (Boolean) driver.executeAtom(AndroidAtoms.IS_DISPLAYED.getValue(), this);
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

  public Point getLocationOnScreenOnceScrolledIntoView() {
    return getLocation();
  }
}
