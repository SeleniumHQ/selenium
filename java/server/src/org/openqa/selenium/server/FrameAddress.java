/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.server;

import java.util.HashMap;
import java.util.Map;

public class FrameAddress {

  /**
   * the name of the window according to selenium. The main window's name is blank.
   */
  private String windowName;
  private String localFrameAddress;


  /**
   * FrameAddress objects are used as hash keys in several instances, and therefore it is important
   * to prevent the allocation of multiple FrameAddress objects corresponding to the same address.
   * Use the hash to help enforce this prohibition.
   */
  static private Map<String, FrameAddress> stringToFrameAddress =
      new HashMap<String, FrameAddress>();

  private FrameAddress(String windowName, String localFrameAddress) {
    this.windowName =
        (windowName != null) ? windowName : FrameGroupCommandQueueSet.DEFAULT_SELENIUM_WINDOW_NAME;
    this.localFrameAddress =
        (localFrameAddress != null)
            ? localFrameAddress
            : FrameGroupCommandQueueSet.DEFAULT_LOCAL_FRAME_ADDRESS;
  }

  static public FrameAddress make(String windowName, String localFrameAddress) {
    FrameAddress f = new FrameAddress(windowName, localFrameAddress);
    String s = f.toString();
    if (stringToFrameAddress.containsKey(s)) {
      return stringToFrameAddress.get(s);
    }
    stringToFrameAddress.put(s, f);
    return f;
  }

  @Override
  public String toString() {
    return windowName + ":" + localFrameAddress;
  }

  public String getLocalFrameAddress() {
    return localFrameAddress;
  }

  public String getWindowName() {
    return windowName;
  }

  public boolean isDefault() {
    return getWindowName().equals(FrameGroupCommandQueueSet.DEFAULT_SELENIUM_WINDOW_NAME)
        && getLocalFrameAddress().equals(FrameGroupCommandQueueSet.DEFAULT_LOCAL_FRAME_ADDRESS);
  }

  @Override
  public boolean equals(Object obj) {
    if (obj instanceof FrameAddress) {
      FrameAddress other = (FrameAddress) obj;
      return getWindowName().equals(other.getWindowName()) &&
          getLocalFrameAddress().equals(other.getLocalFrameAddress());
    }
    return false;
  }

  @Override
  public int hashCode() {
    return getLocalFrameAddress().hashCode();
  }

  public void setLocalFrameAddress(String localFrameAddress) {
    assert this == stringToFrameAddress.remove(toString());
    this.localFrameAddress = localFrameAddress;
    stringToFrameAddress.put(toString(), this);
  }

  public void setWindowName(String windowName) {
    assert this == stringToFrameAddress.remove(toString());
    this.windowName = windowName;
    stringToFrameAddress.put(toString(), this);
  }
}
