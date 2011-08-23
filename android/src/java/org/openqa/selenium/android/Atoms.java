/*
Copyright 2011 WebDriver committers

Copyright 2011 Google Inc.

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

package org.openqa.selenium.android;

import org.openqa.selenium.android.app.R;

/**
 * Class used to load the atoms.
 */
public class Atoms {
  private static Atoms instance;

  // We use public variables for performace reasons. Getter on dalvik
  // are expensive.
  // See http://developer.android.com/guide/practices/design/performance.html
  public static String getAttributeJs;
  public static String getTextJs;
  public static String isEnabledJs;
  public static String isSelectedJs;
  public static String findElementJs;
  public static String findElementsJs;
  public static String getLocationJs;
  public static String getLocationInTopWindowJs;
  public static String getSizeJs;
  public static String getCssPropJs;
  public static String isDisplayedJs;
  public static String submitJs;
  public static String clearJs;

  public static String executeScriptJs;
  public static String defaultContentJs;
  public static String frameByIdOrNameJs;
  public static String frameByIndexJs;
  public static String activeElementJs;

  private Atoms() {
    getAttributeJs = AndroidDriver.getResourceAsString(R.raw.get_attribute_value_android);
    getTextJs = AndroidDriver.getResourceAsString(R.raw.get_text_android);
    isEnabledJs = AndroidDriver.getResourceAsString(R.raw.is_enabled_android);
    isSelectedJs = AndroidDriver.getResourceAsString(R.raw.is_selected_android);
    findElementJs = AndroidDriver.getResourceAsString(R.raw.find_element_android);
    findElementsJs = AndroidDriver.getResourceAsString(R.raw.find_elements_android);
    getLocationJs = AndroidDriver.getResourceAsString(R.raw.get_top_left_coordinates_android);
    getSizeJs = AndroidDriver.getResourceAsString(R.raw.get_size_android);
    getCssPropJs = AndroidDriver.getResourceAsString(R.raw.get_value_of_css_property_android);
    isDisplayedJs = AndroidDriver.getResourceAsString(R.raw.is_displayed_android);
    submitJs = AndroidDriver.getResourceAsString(R.raw.submit_android);
    clearJs = AndroidDriver.getResourceAsString(R.raw.clear_android);

    executeScriptJs = AndroidDriver.getResourceAsString(R.raw.execute_script_android);
    defaultContentJs = AndroidDriver.getResourceAsString(R.raw.default_content_android);
    frameByIdOrNameJs = AndroidDriver.getResourceAsString(R.raw.frame_by_id_or_name_android);
    frameByIndexJs = AndroidDriver.getResourceAsString(R.raw.frame_by_index_android);
    activeElementJs = AndroidDriver.getResourceAsString(R.raw.active_element_android);
  }

  public static Atoms getInstance() {
    if (instance == null) {
      instance = new Atoms();
    }
    return instance;
  }
}
