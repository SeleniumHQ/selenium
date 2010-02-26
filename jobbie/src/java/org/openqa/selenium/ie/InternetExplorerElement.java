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

package org.openqa.selenium.ie;

import com.sun.jna.NativeLong;
import com.sun.jna.Pointer;
import com.sun.jna.WString;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.NativeLongByReference;
import com.sun.jna.ptr.PointerByReference;

import org.openqa.selenium.By;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.ie.ExportedWebDriverFunctions.HWNDByReference;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;

import java.awt.*;
import java.util.List;

public class InternetExplorerElement implements RenderedWebElement, Locatable,
  WrapsDriver {

  private final ExportedWebDriverFunctions lib;
  private final InternetExplorerDriver parent;
  private final Pointer element;
  private final ErrorHandler errors = new ErrorHandler();

  // Called from native code
  public InternetExplorerElement(ExportedWebDriverFunctions lib, InternetExplorerDriver parent,
                                 Pointer element) {
    this.lib = lib;
    this.parent = parent;
    this.element = element;

    if (element == null) {
      throw new IllegalStateException("Element pointer is null.");
    }
  }

  public void click() {
    int result = lib.wdeClick(element);

    errors.verifyErrorCode(result, "click");
  }

  public String getTagName() {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetTagName(element, wrapper);

    errors.verifyErrorCode(result, "element name");

    return new StringWrapper(lib, wrapper).toString();
  }

  public String getAttribute(String name) {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetAttribute(
        parent.getDriverPointer(), element, new WString(name), wrapper);

    errors.verifyErrorCode(result, "get attribute of");

    return wrapper.getValue() == null ? null : new StringWrapper(lib, wrapper).toString();
  }

  public String getText() {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetText(element, wrapper);

    errors.verifyErrorCode(result, "get text of");

    return new StringWrapper(lib, wrapper).toString().replace("\r\n", "\n");
  }

  public String getValue() {
    return getAttribute("value").replace("\r\n", "\n");
  }

  public void sendKeys(CharSequence... value) {
    StringBuilder builder = new StringBuilder();
    for (CharSequence seq : value) {
      builder.append(seq);
    }

    int result = lib.wdeSendKeys(element, new WString(builder.toString()));

    errors.verifyErrorCode(result, "send keys to");

    parent.waitForLoadToComplete();
  }

  public void clear() {
    int result = lib.wdeClear(element);

    errors.verifyErrorCode(result, "clear");
  }

  public boolean isEnabled() {
    IntByReference selected = new IntByReference();
    int result = lib.wdeIsEnabled(element, selected);

    errors.verifyErrorCode(result, "get enabled state");

    return selected.getValue() == 1;
  }

  public boolean isSelected() {
    IntByReference selected = new IntByReference();
    int result = lib.wdeIsSelected(element, selected);

    errors.verifyErrorCode(result, "get selected state");

    return selected.getValue() == 1;
  }

  public void setSelected() {
    int result = lib.wdeSetSelected(element);

    errors.verifyErrorCode(result, "select");
  }

  public void hover() {
    HWNDByReference hwnd = new HWNDByReference();
    NativeLongByReference x = new NativeLongByReference();
    NativeLongByReference y = new NativeLongByReference();
    NativeLongByReference width = new NativeLongByReference();
    NativeLongByReference height = new NativeLongByReference();
    int result = lib.wdeGetDetailsOnceScrolledOnToScreen(element, hwnd, x, y, width, height);

    errors.verifyErrorCode(result, "hover");

    long midX = x.getValue().longValue() + (width.getValue().longValue() / 2);
    long midY = y.getValue().longValue() + (height.getValue().longValue() / 2);

    result = lib.wdeMouseMoveTo(hwnd.getValue(), new NativeLong(100),
                                new NativeLong(0), new NativeLong(0),
                                new NativeLong(midX), new NativeLong(midY));

    errors.verifyErrorCode(result, "hover mouse move");
  }

  public void submit() {
    int result = lib.wdeSubmit(element);

    errors.verifyErrorCode(result, "submit");
  }

  public boolean toggle() {
    IntByReference toReturn = new IntByReference();
    int result = lib.wdeToggle(element, toReturn);

    if (result == 9) {
      throw new UnsupportedOperationException("You may not toggle this element: " + getTagName());
    }

    errors.verifyErrorCode(result, "toggle");

    return toReturn.getValue() == 1;
  }

  public boolean isDisplayed() {
    IntByReference displayed = new IntByReference();
    int result = lib.wdeIsDisplayed(element, displayed);

    errors.verifyErrorCode(result, "clear");

    return displayed.getValue() == 1;
  }

  public Point getLocationOnScreenOnceScrolledIntoView() {
    HWNDByReference hwnd = new HWNDByReference();
    NativeLongByReference x = new NativeLongByReference();
    NativeLongByReference y = new NativeLongByReference();
    NativeLongByReference width = new NativeLongByReference();
    NativeLongByReference height = new NativeLongByReference();
    if (lib.wdeGetDetailsOnceScrolledOnToScreen(element, hwnd, x, y, width, height) != 0) {
      return null;
    }

    return new Point(x.getValue().intValue(), y.getValue().intValue());
  }

  public Point getLocation() {
    NativeLongByReference x = new NativeLongByReference();
    NativeLongByReference y = new NativeLongByReference();

    int result = lib.wdeGetLocation(element, x, y);
    errors.verifyErrorCode(result, "Unable to get location of element");

    return new Point(x.getValue().intValue(), y.getValue().intValue());
  }

  public Dimension getSize() {
    NativeLongByReference width = new NativeLongByReference();
    NativeLongByReference height = new NativeLongByReference();
    int result = lib.wdeGetSize(element, width, height);

    errors.verifyErrorCode(result, "Unable to get element size");

    return new Dimension(width.getValue().intValue(), height.getValue().intValue());
  }

  public String getValueOfCssProperty(String propertyName) {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetValueOfCssProperty(element, new WString(propertyName), wrapper);
    errors.verifyErrorCode(result, ("Unable to get value of css property: " + propertyName));

    return new StringWrapper(lib, wrapper).toString();
  }

  @Override
  protected void finalize() throws Throwable {
    super.finalize();
    lib.wdeFreeElement(element);
  }

  public void dragAndDropBy(int moveRightBy, int moveDownBy) {
    HWNDByReference hwnd = new HWNDByReference();
    NativeLongByReference x = new NativeLongByReference();
    NativeLongByReference y = new NativeLongByReference();
    NativeLongByReference width = new NativeLongByReference();
    NativeLongByReference height = new NativeLongByReference();
    int result = lib.wdeGetDetailsOnceScrolledOnToScreen(element, hwnd, x, y, width, height);
    errors.verifyErrorCode(result, "Unable to determine location once scrolled on to screen");

    lib.wdeMouseDownAt(hwnd.getValue(), x.getValue(), y.getValue());

    long endX = x.getValue().longValue() + moveRightBy;
    long endY = y.getValue().longValue() + moveDownBy;

    int duration = parent.manage().getSpeed().getTimeOut();
    lib.wdeMouseMoveTo(hwnd.getValue(), new NativeLong(duration), x.getValue(), y.getValue(),
                       new NativeLong(endX), new NativeLong(endY));
    lib.wdeMouseUpAt(hwnd.getValue(), new NativeLong(endX), new NativeLong(endY));
  }

  public void dragAndDropOn(RenderedWebElement toElement) {
    HWNDByReference hwnd = new HWNDByReference();
    NativeLongByReference x = new NativeLongByReference();
    NativeLongByReference y = new NativeLongByReference();
    NativeLongByReference width = new NativeLongByReference();
    NativeLongByReference height = new NativeLongByReference();
    int result = lib.wdeGetDetailsOnceScrolledOnToScreen(element, hwnd, x, y, width, height);
    errors.verifyErrorCode(result, "Unable to determine location once scrolled on to screen");

    NativeLong
        startX =
        new NativeLong(x.getValue().longValue() + (width.getValue().longValue() / 2));
    NativeLong
        startY =
        new NativeLong(y.getValue().longValue() + (height.getValue().longValue() / 2));

    lib.wdeMouseDownAt(hwnd.getValue(), startX, startY);

    Pointer other = ((InternetExplorerElement) toElement).element;
    result = lib.wdeGetDetailsOnceScrolledOnToScreen(other, hwnd, x, y, width, height);
    errors.verifyErrorCode(result,
                           "Unable to determine location of target once scrolled on to screen");

    NativeLong endX = new NativeLong(x.getValue().longValue() + (width.getValue().longValue() / 2));
    NativeLong
        endY =
        new NativeLong(y.getValue().longValue() + (height.getValue().longValue() / 2));

    int duration = parent.manage().getSpeed().getTimeOut();
    lib.wdeMouseMoveTo(hwnd.getValue(), new NativeLong(duration), startX, startY, endX, endY);
    lib.wdeMouseUpAt(hwnd.getValue(), endX, endY);
  }

  public WebElement findElement(By by) {
    return new Finder(lib, parent, element).findElement(by);
  }

  public List<WebElement> findElements(By by) {
    return new Finder(lib, parent, element).findElements(by);
  }

  protected int addToScriptArgs(Pointer scriptArgs) {
    return lib.wdAddElementScriptArg(scriptArgs, element);
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

    if (!(other instanceof InternetExplorerElement)) {
      return false;
    }

    Boolean
        result =
        (Boolean) parent.executeScript("return arguments[0] === arguments[1];", this, other);
    return result != null && result;
  }

  @Override
  public int hashCode() {
    // TODO(simon): Implement something better
    return element.hashCode();
  }

  /* (non-Javadoc)
   * @see org.openqa.selenium.internal.WrapsDriver#getContainingDriver()
   */
  public WebDriver getWrappedDriver() {
    return parent;
  }
}
