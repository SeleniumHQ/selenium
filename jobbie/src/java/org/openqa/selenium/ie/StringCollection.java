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

import static org.openqa.selenium.ie.ExportedWebDriverFunctions.SUCCESS;

import java.util.Set;
import java.util.LinkedHashSet;

class StringCollection {
  private final Set<String> strings;

  public StringCollection(ExportedWebDriverFunctions lib, Pointer rawStrings) {
    strings = extractStrings(lib, rawStrings);
  }

  public Set<String> toSet() {
    return strings;
  }

  private Set<String> extractStrings(ExportedWebDriverFunctions lib, Pointer rawStrings) {
    IntByReference length = new IntByReference();
    int result = lib.wdcGetStringCollectionLength(rawStrings, length);
    if (result != SUCCESS) {
      freeCollection(lib, rawStrings);
      throw new IllegalStateException("Cannot extract strings from collection: " + result);
    }

    Set<String> toReturn = new LinkedHashSet<String>(length.getValue());
    for (int i = 0; i < length.getValue(); i++) {
      PointerByReference string = new PointerByReference();
      result = lib.wdcGetStringAtIndex(rawStrings, i, string);
      if (result != SUCCESS) {
        freeCollection(lib, rawStrings);
        throw new IllegalStateException(
            String.format("Cannot extract string from collection at index: %d (%d)", i, result));
      }
      String value = new StringWrapper(lib, string).toString();
      toReturn.add(value);
    }
    // TODO: Free memory from the collection
    freeCollection(lib, rawStrings);
    return toReturn;
  }

  private void freeCollection(ExportedWebDriverFunctions lib, Pointer rawElements) {
    lib.wdFreeStringCollection(rawElements);
  }
}