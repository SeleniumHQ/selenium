/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

import static org.openqa.selenium.ie.ExportedWebDriverFunctions.SUCCESS;

import com.sun.jna.Pointer;
import com.sun.jna.ptr.DoubleByReference;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.NativeLongByReference;
import com.sun.jna.ptr.PointerByReference;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.ie.IeReturnTypes;

import java.util.ArrayList;
import java.util.List;

/**
 * @author eran.mes@gmail.com (Eran Mes)
 *
 */
public class JavascriptResultCollection {

  private ExportedWebDriverFunctions lib;
  //private PointerByReference scriptResults;
  ErrorHandler errors;
  InternetExplorerDriver parent;

  /**
   * @param lib the library of webdriver functions.
   * @param parent pointer to the driver. 
   */
  public JavascriptResultCollection(ExportedWebDriverFunctions lib,
      InternetExplorerDriver parent /*, PointerByReference scriptResults*/) {
    this.lib = lib;
    this.parent = parent;
    //this.scriptResults = scriptResults;
    errors = new ErrorHandler();
  }

  /*
  public Object extractReturnValue() {
    return extractReturnValue(scriptResults);
  }*/
  
  /**
   * Parses the results from executing a script into an object.
   * In case the result is a simple data type (string, int, element) an
   * appropriate Java object is returned. In case the result is a list of
   * such element, List<Object> is returned.
   * @param scriptResultRef pointer to the script results
   * @return object containing script execution result(s).
   */
  public Object extractReturnValue(PointerByReference scriptResultRef) {
    int result;
    Pointer scriptResult = scriptResultRef.getValue();
    Pointer driver = parent.getDriverPointer();

    IntByReference type = new IntByReference();
    result = lib.wdGetScriptResultType(driver, scriptResult, type);

    errors.verifyErrorCode(result, "Cannot determine result type");

    try {
      Object toReturn;
      switch (type.getValue()) {
        case IeReturnTypes.STRING: // String
          PointerByReference wrapper = new PointerByReference();
          result = lib.wdGetStringScriptResult(scriptResult, wrapper);
          errors.verifyErrorCode(result, "Cannot extract string result");
          toReturn = new StringWrapper(lib, wrapper).toString();
          break;

        case IeReturnTypes.LONG: // Long
          NativeLongByReference value = new NativeLongByReference();
          result = lib.wdGetNumberScriptResult(scriptResult, value);
          errors.verifyErrorCode(result, "Cannot extract number result");
          toReturn = value.getValue().longValue();
          break;

        case IeReturnTypes.BOOLEAN: // Boolean
          IntByReference boolVal = new IntByReference();
          result = lib.wdGetBooleanScriptResult(scriptResult, boolVal);
          errors.verifyErrorCode(result, "Cannot extract boolean result");
          toReturn = boolVal.getValue() == 1 ? Boolean.TRUE : Boolean.FALSE;
          break;

        case IeReturnTypes.ELEMENT: // WebElement
          PointerByReference element = new PointerByReference();
          result = lib.wdGetElementScriptResult(scriptResult, driver, element);
          errors.verifyErrorCode(result, "Cannot extract element result");
          toReturn = new InternetExplorerElement(lib, parent, element.getValue());
          break;

        case IeReturnTypes.EMPTY: // Nothing
          toReturn = null;
          break;

        case IeReturnTypes.EXCEPTION: // An exception
          PointerByReference message = new PointerByReference();
          result = lib.wdGetStringScriptResult(scriptResult, message);
          errors.verifyErrorCode(result, "Cannot extract string result");
          throw new WebDriverException(new StringWrapper(lib, message).toString());

        case IeReturnTypes.DOUBLE: // Double
          DoubleByReference doubleVal = new DoubleByReference();
          result = lib.wdGetDoubleScriptResult(scriptResult, doubleVal);
          errors.verifyErrorCode(result, "Cannot extract double result");
          toReturn = doubleVal.getValue();
          break;
          
        case IeReturnTypes.ARRAY: // Array
          IntByReference arrayLength = new IntByReference();
          result = lib.wdGetArrayLengthScriptResult(
              driver, scriptResult, arrayLength);
          errors.verifyErrorCode(result, "Cannot extract array length.");
          List<Object> list = new ArrayList<Object>();
          for (int i = 0; i < arrayLength.getValue(); i++) {
            // Get reference to object
            PointerByReference currItem = new PointerByReference();
            int getItemResult = lib.wdGetArrayItemFromScriptResult(
                driver, scriptResult, i, currItem);

            if (getItemResult != SUCCESS) {
              // Note about memory management: Usually memory for this item
              // will be released during the recursive call to
              // extractReturnValue. It is freed explicitly here since a
              // recursive call will not happen.
              lib.wdFreeScriptResult(currItem.getValue());
              throw new IllegalStateException(
                  String.format("Cannot extract element from collection at index: %d (%d)",
                      i, result));
            }

            // Call extractReturnValue with the fetched item (recursive)
            list.add(extractReturnValue(currItem));
          }
          toReturn = list;
          break;

        default:
          throw new WebDriverException("Cannot determine result type");
      }
      return toReturn;
    } finally {
      lib.wdFreeScriptResult(scriptResult);
    }
  }

}
