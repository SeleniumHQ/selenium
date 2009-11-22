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

import com.sun.jna.Pointer;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.PointerByReference;

import org.openqa.selenium.WebElement;
import static org.openqa.selenium.ie.ExportedWebDriverFunctions.SUCCESS;

import java.util.ArrayList;
import java.util.List;

class ElementCollection {
  private final List<WebElement> elements;
  
  public ElementCollection(ExportedWebDriverFunctions lib, InternetExplorerDriver driver, Pointer rawElements) {
    elements = extractElements(lib, driver, rawElements);
  }

  public List<WebElement> toList() {
    return elements;
  }

  private List<WebElement> extractElements(ExportedWebDriverFunctions lib, InternetExplorerDriver driver, Pointer rawElements) {
    IntByReference length = new IntByReference();
    int result = lib.wdcGetElementCollectionLength(rawElements, length);
    if (result != SUCCESS) {
      freeElements(lib, rawElements);
      throw new IllegalStateException("Cannot extract elements from collection: " + result);
    }
    
    List<WebElement> toReturn = new ArrayList<WebElement>(length.getValue());
    for (int i = 0; i < length.getValue(); i++) {
      PointerByReference element = new PointerByReference();
      result = lib.wdcGetElementAtIndex(rawElements, i, element);
      if (result != SUCCESS) {
        freeElements(lib, rawElements);
        throw new IllegalStateException(
            String.format("Cannot extract element from collection at index: %d (%d)", i, result));
      }
      toReturn.add(new InternetExplorerElement(lib, driver, element.getValue()));
    }
    // TODO: Free memory from the collection
    freeCollection(lib, rawElements);
    return toReturn;
  }
  
  private void freeElements(ExportedWebDriverFunctions lib, Pointer rawElements) {
    lib.wdFreeElementCollection(rawElements, 1);
  }
  
  private void freeCollection(ExportedWebDriverFunctions lib, Pointer rawElements) {
    lib.wdFreeElementCollection(rawElements, 0);
  }
}
