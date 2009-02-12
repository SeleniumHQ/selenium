package org.openqa.selenium.ie.internal;

import com.sun.jna.Native;
import com.sun.jna.Pointer;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.PointerByReference;

public class StringWrapper {
  private final String value;

  public StringWrapper(ExportedWebDriverFunctions lib, PointerByReference ptr) {
    value = extractString(lib, ptr.getValue());
  }
  
  private String extractString(ExportedWebDriverFunctions lib, Pointer string) {
    IntByReference length = new IntByReference();
    if (lib.wdStringLength(string, length) != 0) {
      lib.wdFreeString(string);
      throw new RuntimeException("Cannot determine length of string");
    }
    char[] rawString = new char[length.getValue()];
    if (lib.wdCopyString(string, length.getValue(), rawString) != 0) { 
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
