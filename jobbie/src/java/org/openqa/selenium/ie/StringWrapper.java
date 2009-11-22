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

import static org.openqa.selenium.ie.ExportedWebDriverFunctions.SUCCESS;

import com.sun.jna.Native;
import com.sun.jna.Pointer;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.PointerByReference;

class StringWrapper {
  private final String value;

  public StringWrapper(ExportedWebDriverFunctions lib, PointerByReference ptr) {
    value = extractString(lib, ptr.getValue());
  }
  
  private String extractString(ExportedWebDriverFunctions lib, Pointer string) {
    IntByReference length = new IntByReference();
    if (lib.wdStringLength(string, length) != SUCCESS) {
      lib.wdFreeString(string);
      throw new RuntimeException("Cannot determine length of string");
    }
    char[] rawString = new char[length.getValue()];
    if (lib.wdCopyString(string, length.getValue(), rawString) != SUCCESS) { 
      lib.wdFreeString(string);
      throw new RuntimeException("Cannot copy string from native data to Java string");
    }
    
    String value = Native.toString(rawString);
    lib.wdFreeString(string);
    
    return value;
  }
  
  @Override
  public String toString() {
    if (value != null) {
      return value;
    }
    return null;
  }
}
