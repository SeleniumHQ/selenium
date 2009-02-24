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

import static org.openqa.selenium.ie.ExportedWebDriverFunctions.HWNDByReference;
import static org.openqa.selenium.ie.ExportedWebDriverFunctions.SUCCESS;

import java.awt.Dimension;
import java.awt.Point;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.ie.StringWrapper;
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

    handleErrorCode("click", result);
  }

  public String getElementName() {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetElementName(element, wrapper);
    
    handleErrorCode("element name", result);
    
    return new StringWrapper(lib, wrapper).toString();
  }

  public String getAttribute(String name) {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetAttribute(element, new WString(name), wrapper);

    handleErrorCode("get attribute of", result);

    return new StringWrapper(lib, wrapper).toString();
  }

  public String getText() {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetText(element, wrapper);

    handleErrorCode("get text of", result);

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
    
    handleErrorCode("send keys to", result);

    result = lib.wdWaitForLoadToComplete(driver);
  }

  public void clear() {
    int result = lib.wdeClear(element);

    handleErrorCode("clear", result);
  }

  public boolean isEnabled() {
    IntByReference selected = new IntByReference();
    int result = lib.wdeIsEnabled(element, selected);
    
    handleErrorCode("get enabled state", result);
    
    return selected.getValue() == 1;
  }

  public boolean isSelected() {
    IntByReference selected = new IntByReference();
    int result = lib.wdeIsSelected(element, selected);
    
    handleErrorCode("get selected state", result);
    
    return selected.getValue() == 1;
  }

  public void setSelected() {
    int result = lib.wdeSetSelected(element);

    handleErrorCode("select", result);
  }

  public void submit() {
    int result = lib.wdeSubmit(element);
    
    handleErrorCode("submit", result);
  }

  public boolean toggle() {
    IntByReference toReturn = new IntByReference();
    int result = lib.wdeToggle(element, toReturn);

    handleErrorCode("toggle", result);

    return toReturn.getValue() == 1;
  }

  public boolean isDisplayed() {
    IntByReference displayed = new IntByReference();
    int result = lib.wdeIsDisplayed(element, displayed);

    handleErrorCode("clear", result);

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
    
    handleErrorCode("Unable to get location of element", result);
    
    return new Point(x.getValue().intValue(), y.getValue().intValue());
  }

  public Dimension getSize() {
    NativeLongByReference width = new NativeLongByReference();
    NativeLongByReference height = new NativeLongByReference();
    int result = lib.wdeGetSize(element, width, height);
    
    handleErrorCode("Unable to get element size", result);
    
    return new Dimension(width.getValue().intValue(), height.getValue().intValue());
  }

  public String getValueOfCssProperty(String propertyName) {
    PointerByReference wrapper = new PointerByReference();
    int result = lib.wdeGetValueOfCssProperty(element, new WString(propertyName), wrapper);
    handleErrorCode("Unable to get value of css property: " + propertyName, result);
    
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
  
  private void handleErrorCode(String message, int errorCode) {
    switch (errorCode) {
    case SUCCESS: 
      break; // Do nothing
            
    case -10:
      throw new WebDriverException(
          String.format("You may not %s this element. It looks as if the reference is stale. " +
                        "Did you navigate away from the page with this element on?", message));

    case -11:
      throw new UnsupportedOperationException(
          String.format("You may not %s an element that is not displayed", message));
      
    case -12:
      throw new UnsupportedOperationException(
              String.format("You may not %s an element that is not enabled", message));
      
    case -15:
      throw new UnsupportedOperationException(
              String.format("The element appears to be unselectable", message));
      
    default:
      throw new IllegalStateException(
          String.format("Unable to %s element: %d", message, errorCode));  
  }
  }
}
