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

package org.openqa.selenium.remote;

import java.util.EnumSet;

/**
 * Enumeration of all of the commands supported by the WebDriver JSON wire
 * protocol.
 *
 * This file should be kept in sync with common/src/js/command.js
 *  
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public enum DriverCommand {
  NEW_SESSION("newSession"),
  DELETE_SESSION("deleteSession"),

  CLOSE("close"),
  QUIT("quit"),

  GET("get"),
  GO_BACK("goBack"),
  GO_FORWARD("goForward"),
  REFRESH("refresh"),

  ADD_COOKIE("addCookie"),
  GET_COOKIE("getCookie"),
  GET_ALL_COOKIES("getCookies"),
  DELETE_COOKIE("deleteCookie"),
  DELETE_ALL_COOKIES("deleteAllCookies"),

  FIND_ELEMENT("findElement"),
  FIND_ELEMENTS("findElements"),
  FIND_CHILD_ELEMENT("findChildElement"),
  FIND_CHILD_ELEMENTS("findChildElements"),

  CLEAR_ELEMENT("clearElement"),
  CLICK_ELEMENT("clickElement"),
  HOVER_OVER_ELEMENT("hoverOverElement"),
  SEND_KEYS_TO_ELEMENT("sendKeysToElement"),
  SUBMIT_ELEMENT("submitElement"),
  TOGGLE_ELEMENT("toggleElement"),

  GET_CURRENT_WINDOW_HANDLE("getCurrentWindowHandle"),
  GET_WINDOW_HANDLES("getWindowHandles"),

  SWITCH_TO_WINDOW("switchToWindow"),
  SWITCH_TO_FRAME("switchToFrame"),
  SWITCH_TO_FRAME_BY_INDEX("switchToFrameByIndex"),  // TODO(jleyba): standardize Chrome frame switching
  SWITCH_TO_FRAME_BY_NAME("switchToFrameByName"),    //
  SWITCH_TO_DEFAULT_CONTENT("switchToDefaultContent"),
  GET_ACTIVE_ELEMENT("getActiveElement"),

  GET_CURRENT_URL("getCurrentUrl"),
  GET_PAGE_SOURCE("getPageSource"),
  GET_TITLE("getTitle"),

  EXECUTE_SCRIPT("executeScript"),

  GET_SPEED("getSpeed"),
  SET_SPEED("setSpeed"),

  SET_BROWSER_VISIBLE("setBrowserVisible"),
  IS_BROWSER_VISIBLE("isBrowserVisible"),

  GET_ELEMENT_TEXT("getElementText"),
  GET_ELEMENT_VALUE("getElementValue"),
  GET_ELEMENT_TAG_NAME("getElementTagName"),
  SET_ELEMENT_SELECTED("setElementSelected"),
  DRAG_ELEMENT("dragElement"),
  IS_ELEMENT_SELECTED("isElementSelected"),
  IS_ELEMENT_ENABLED("isElementEnabled"),
  IS_ELEMENT_DISPLAYED("isElementDisplayed"),
  GET_ELEMENT_LOCATION("getElementLocation"),
  GET_ELEMENT_LOCATION_ONCE_SCROLLED_INTO_VIEW("getElementLocationOnceScrolledIntoView"),
  GET_ELEMENT_SIZE("getElementSize"),
  GET_ELEMENT_ATTRIBUTE("getElementAttribute"),
  GET_ELEMENT_VALUE_OF_CSS_PROPERTY("getElementValueOfCssProperty"),
  ELEMENT_EQUALS("elementEquals"),

  SCREENSHOT("screenshot");

  private final String commandName;

  private DriverCommand(String name) {
    this.commandName = name;
  }

  @Override
  public String toString() {
    return this.commandName;
  }

  /**
   * Retrieves the enumerated {@link DriverCommand} based on its {@link #commandName} property.
   * 
   * @param name The name to lookup.
   * @return The converted value.
   * @throws IllegalArgumentException
   */
  public static DriverCommand fromName(String name) {
    for (DriverCommand driverCommand : EnumSet.allOf(DriverCommand.class)) {
      if (driverCommand.commandName.equals(name)) {
        return driverCommand;
      }
    }
    throw new IllegalArgumentException(
        "No such " + DriverCommand.class.getName() + " with name '" + name + "'");
  }
}
