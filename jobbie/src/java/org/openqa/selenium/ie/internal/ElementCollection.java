package org.openqa.selenium.ie.internal;

import static org.openqa.selenium.ie.internal.ExportedWebDriverFunctions.SUCCESS;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.ie.InternetExplorerElement;

import com.sun.jna.Pointer;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.PointerByReference;

public class ElementCollection {

  private final ExportedWebDriverFunctions lib;
  private final Pointer driver;
  private final Pointer elements;
  
  public ElementCollection(ExportedWebDriverFunctions lib, Pointer driver, Pointer elements) {
    this.lib = lib;
    this.driver = driver;
    this.elements = elements;
  }

  public List<WebElement> toList() {
    IntByReference length = new IntByReference();
    int result = lib.wdcGetCollectionLength(elements, length);
    if (result != SUCCESS) {
      throw new IllegalStateException("Cannot find element by tag name: " + result);
    }
    
    List<WebElement> toReturn = new ArrayList<WebElement>(length.getValue());
    for (int i = 0; i < length.getValue(); i++) {
      PointerByReference element = new PointerByReference();
      lib.wdcGetElementAtIndex(elements, i, element);
      toReturn.add(new InternetExplorerElement(lib, driver, element.getValue()));
    }
    // TODO: Free memory from the collection
    
    return toReturn;
  }

}
