package org.openqa.selenium.ie;

import static org.openqa.selenium.ie.ExportedWebDriverFunctions.SUCCESS;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.ie.ExportedWebDriverFunctions;
import org.openqa.selenium.ie.InternetExplorerElement;

import com.sun.jna.Pointer;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.PointerByReference;

class ElementCollection {
  private final List<WebElement> elements;
  
  public ElementCollection(ExportedWebDriverFunctions lib, Pointer driver, Pointer rawElements) {
    elements = extractElements(lib, driver, rawElements);
  }

  public List<WebElement> toList() {
    return elements;
  }

  private List<WebElement> extractElements(ExportedWebDriverFunctions lib, Pointer driver, Pointer rawElements) {
    IntByReference length = new IntByReference();
    int result = lib.wdcGetCollectionLength(rawElements, length);
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
