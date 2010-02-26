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

package org.openqa.selenium.ie;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.IllegalLocatorException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;

import com.sun.jna.Pointer;
import com.sun.jna.WString;
import com.sun.jna.ptr.PointerByReference;

// Kept package level deliberately.

class Finder implements SearchContext, FindsByClassName, FindsById, FindsByLinkText, FindsByName,
        FindsByTagName, FindsByXPath {

  private final ExportedWebDriverFunctions lib;
  private final InternetExplorerDriver parent;
  private final Pointer driver;
  private final Pointer element;

  public Finder(ExportedWebDriverFunctions lib, InternetExplorerDriver parent, Pointer element) {
    this.lib = lib;
    this.parent = parent;
    this.driver = parent.getUnderlyingPointer();
    this.element = element;
  }

  public WebElement findElementByClassName(String using) {
    if (using == null)
     throw new IllegalArgumentException("Cannot find elements when the class name expression is null.");

    if (using.matches(".*\\s+.*")) {
      throw new IllegalLocatorException(
          "Compound class names are not supported. Consider searching for one class name and filtering the results.");
    }

    PointerByReference rawElement = new PointerByReference();
    int result = lib.wdFindElementByClassName(driver, element, new WString(using), rawElement);

    handleErrorCode("class name", using, result);

    return new InternetExplorerElement(lib, parent, rawElement.getValue());
  }

  public List<WebElement> findElementsByClassName(String using) {
    if (using == null)
     throw new IllegalArgumentException("Cannot find elements when the class name expression is null.");

    if (using.matches(".*\\s+.*")) {
      throw new IllegalLocatorException(
          "Compound class names are not supported. Consider searching for one class name and filtering the results.");
    }

    PointerByReference elements = new PointerByReference();
    int result = lib.wdFindElementsByClassName(driver, element, new WString(using), elements);

    handleErrorCode("class name", using, result);

    return new ElementCollection(lib, parent, elements.getValue()).toList();
  }

  public WebElement findElementById(String using) {
    PointerByReference rawElement = new PointerByReference();
    int result = lib.wdFindElementById(driver, element, new WString(using), rawElement);

    handleErrorCode("id", using, result);

    return new InternetExplorerElement(lib, parent, rawElement.getValue());
  }

  public List<WebElement> findElementsById(String using) {
    PointerByReference elements = new PointerByReference();
    int result = lib.wdFindElementsById(driver, element, new WString(using), elements);

    handleErrorCode("id", using, result);

    return new ElementCollection(lib, parent, elements.getValue()).toList();
  }

  public WebElement findElementByLinkText(String using) {
    PointerByReference rawElement = new PointerByReference();
    int result = lib.wdFindElementByLinkText(driver, element, new WString(using), rawElement);

    handleErrorCode("link text", using, result);

    return new InternetExplorerElement(lib, parent, rawElement.getValue());
  }

  public List<WebElement> findElementsByLinkText(String using) {
    PointerByReference elements = new PointerByReference();
    int result = lib.wdFindElementsByLinkText(driver, element, new WString(using), elements);

    handleErrorCode("link text", using, result);

    return new ElementCollection(lib, parent, elements.getValue()).toList();
  }

  public WebElement findElementByPartialLinkText(String using) {
    PointerByReference rawElement = new PointerByReference();
    int result = lib.wdFindElementByPartialLinkText(driver, element, new WString(using), rawElement);

    handleErrorCode("link text", using, result);

    return new InternetExplorerElement(lib, parent, rawElement.getValue());
  }

  public List<WebElement> findElementsByPartialLinkText(String using) {
    PointerByReference elements = new PointerByReference();
    int result = lib.wdFindElementsByPartialLinkText(driver, element, new WString(using), elements);

    handleErrorCode("link text", using, result);

    return new ElementCollection(lib, parent, elements.getValue()).toList();
  }  
  public WebElement findElementByName(String using) {
    PointerByReference rawElement = new PointerByReference();
    int result = lib.wdFindElementByName(driver, element, new WString(using), rawElement);

    handleErrorCode("name", using, result);

    return new InternetExplorerElement(lib, parent, rawElement.getValue());
  }

  public List<WebElement> findElementsByName(String using) {
    PointerByReference elements = new PointerByReference();
    int result = lib.wdFindElementsByName(driver, element, new WString(using), elements);

    handleErrorCode("name", using, result);

    return new ElementCollection(lib, parent, elements.getValue()).toList();
  }

  public WebElement findElementByTagName(String using) {
    PointerByReference rawElement = new PointerByReference();
    int result = lib.wdFindElementByTagName(driver, element, new WString(using), rawElement);

    handleErrorCode("xpath", using, result);

    return new InternetExplorerElement(lib, parent, rawElement.getValue());
  }

  public List<WebElement> findElementsByTagName(String using) {
    PointerByReference elements = new PointerByReference();
    int result = lib.wdFindElementsByTagName(driver, element, new WString(using), elements);

    handleErrorCode("tag name", using, result);

    return new ElementCollection(lib, parent, elements.getValue()).toList();
  }

  public WebElement findElementByXPath(String using) {
    PointerByReference rawElement = new PointerByReference();
    int result = lib.wdFindElementByXPath(driver, element, new WString(using), rawElement);

    try {
      handleErrorCode("xpath", using, result);
    } catch (UnexpectedJavascriptExecutionException e) {
      // Looks like the page was reloading. Fine. We didn't find the element
      throw new NoSuchElementException("Unable to find element by xpath: " + using);
    }

    return new InternetExplorerElement(lib, parent, rawElement.getValue());
  }

  public List<WebElement> findElementsByXPath(String using) {
    PointerByReference elements = new PointerByReference();
    int result = lib.wdFindElementsByXPath(driver, element, new WString(using), elements);

    try {
      handleErrorCode("xpath", using, result);
    } catch (UnexpectedJavascriptExecutionException e) {
      // Looks like the page was reloading. Fine. We didn't find the element
      throw new NoSuchElementException("Unable to find element by xpath: " + using);
    }

    return new ElementCollection(lib, parent, elements.getValue()).toList();
  }

  public WebElement findElement(By by) {
    return by.findElement(this);
  }

  public List<WebElement> findElements(By by) {
    return by.findElements(this);
  }

  private void handleErrorCode(String how, String using, int errorCode) {
    ErrorHandler errors = new ErrorHandler();
    
    String message = String.format(
            "Unable to find element by %s using \"%s\" (%d)", how, using, errorCode);
    errors.verifyErrorCode(errorCode, message);
  }
}
