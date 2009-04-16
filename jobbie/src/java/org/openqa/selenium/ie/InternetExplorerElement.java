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

import java.awt.Dimension;
import java.awt.Point;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.ie.ExportedWebDriverFunctions.HWNDByReference;
import org.openqa.selenium.internal.Locatable;

import com.sun.jna.Pointer;
import com.sun.jna.WString;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.NativeLongByReference;
import com.sun.jna.ptr.PointerByReference;

public class InternetExplorerElement implements RenderedWebElement, SearchContext, Locatable {

  private final ExportedWebDriverFunctions lib;
  private final Pointer driver;
  private final Pointer element;
  private final ErrorHandler errors = new ErrorHandler();

  // Called from native code
  public InternetExplorerElement(ExportedWebDriverFunctions lib, Pointer driver, Pointer element) {
    this.lib = lib;
    this.driver = driver;
    this.element = element;

    if (element == null) {
      throw new IllegalStateException("Element pointer is null.");
    }
  }

  public void click() {
    int result = lib.wdeClick(element);

    errors.verifyErrorCode(result, "click");
  }

  public String getElementName() {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetElementName(element, wrapper);
    
    errors.verifyErrorCode(result, "element name");
    
    return new StringWrapper(lib, wrapper).toString();
  }

  public String getAttribute(String name) {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetAttribute(element, new WString(name), wrapper);

    errors.verifyErrorCode(result, "get attribute of");

    return new StringWrapper(lib, wrapper).toString();
  }

  public String getText() {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetText(element, wrapper);

    errors.verifyErrorCode(result, "get text of");

    return new StringWrapper(lib, wrapper).toString();
  }

  public String getValue() {
    return getAttribute("value");
  }

  public void sendKeys(CharSequence... value) {
    StringBuilder builder = new StringBuilder();
    for (CharSequence seq : value) {
      builder.append(seq);
    }

    int result = lib.wdeSendKeys(element, new WString(builder.toString()));
    
    errors.verifyErrorCode(result, "send keys to");

    result = lib.wdWaitForLoadToComplete(driver);
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

  public void submit() {
    int result = lib.wdeSubmit(element);
    
    errors.verifyErrorCode(result, "submit");
  }

  public boolean toggle() {
    IntByReference toReturn = new IntByReference();
    int result = lib.wdeToggle(element, toReturn);

    if (result == 9) {
      throw new UnsupportedOperationException("You may not toggle this element: " + getElementName());
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
    IntByReference x = new IntByReference();
    IntByReference y = new IntByReference();
    IntByReference width = new IntByReference();
    IntByReference height = new IntByReference();
    if (lib.wdeGetDetailsOnceScrolledOnToScreen(element, hwnd, x, y, width, height) != 0) 
            return null;
    
    return new Point(x.getValue(), y.getValue());
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
    lib.wdFreeElement(element);
  }

  public void dragAndDropBy(int moveRightBy, int moveDownBy) {
    throw new UnsupportedOperationException();
  }

  public void dragAndDropOn(RenderedWebElement element) {
    throw new UnsupportedOperationException();
  }
  
  public WebElement findElement(By by) {
    return new Finder(lib, driver, element).findElement(by);
  }
  
  public List<WebElement> findElements(By by) {
    return new Finder(lib, driver, element).findElements(by);
  }
  
  protected int addToScriptArgs(Pointer scriptArgs) {
    return lib.wdAddElementScriptArg(scriptArgs, element);
  }
}
