package org.openqa.selenium.ie.internal;

import com.sun.jna.Native;
import com.sun.jna.Pointer;
import com.sun.jna.ptr.IntByReference;
import com.sun.jna.ptr.PointerByReference;

public class StringWrapper {
  private final ExportedWebDriverFunctions lib;
  private final Pointer string;
  private String value;

  public StringWrapper(ExportedWebDriverFunctions lib, PointerByReference ptr) {
    this.lib = lib;
    string = ptr.getValue();
  }
  
  @Override
  public String toString() {
    if (value != null) {
      return value;
    }
    
    IntByReference length = new IntByReference();
    if (lib.wdStringLength(string, length) != 0)
            throw new RuntimeException("Cannot determine length of string");
    char[] rawString = new char[length.getValue()];
    if (lib.wdCopyString(string, length.getValue(), rawString) != 0) 
            throw new RuntimeException("Cannot copy string from native data to Java string");
    
    value = Native.toString(rawString);
    lib.wdFreeString(string);
    
    return value;
  }
}
