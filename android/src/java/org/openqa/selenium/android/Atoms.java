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

  // Local Storage Atoms
  public static String getLocalStorageKeysJs;
  public static String getLocalStorageItemJs;
  public static String setLocalStorageItemJs;
  public static String removeLocalStorageItemJs;
  public static String clearLocalStorageJs;
  public static String getLocalStorageSizeJs;

  // Session Storage Atoms
  public static String getSessionStorageKeysJs;
  public static String getSessionStorageItemJs;
  public static String setSessionStorageItemJs;
  public static String removeSessionStorageItemJs;
  public static String clearSessionStorageJs;
  public static String getSessionStorageSizeJs;

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

    // Local Storage Atoms
    getLocalStorageKeysJs = AndroidDriver.getResourceAsString(R.raw.get_local_storage_keys_android);
    getLocalStorageItemJs = AndroidDriver.getResourceAsString(R.raw.get_local_storage_item_android);
    setLocalStorageItemJs = AndroidDriver.getResourceAsString(R.raw.set_local_storage_item_android);
    removeLocalStorageItemJs = AndroidDriver.getResourceAsString(
        R.raw.remove_local_storage_item_android);
    clearLocalStorageJs = AndroidDriver.getResourceAsString(R.raw.clear_local_storage_android);
    getLocalStorageSizeJs = AndroidDriver.getResourceAsString(R.raw.get_local_storage_size_android);

    // Session Storage Atoms
    getSessionStorageKeysJs = AndroidDriver.getResourceAsString(
        R.raw.get_session_storage_keys_android);
    getSessionStorageItemJs = AndroidDriver.getResourceAsString(
        R.raw.get_session_storage_item_android);
    setSessionStorageItemJs = AndroidDriver.getResourceAsString(
        R.raw.set_session_storage_item_android);
    removeSessionStorageItemJs = AndroidDriver.getResourceAsString(
        R.raw.remove_session_storage_item_android);
    clearSessionStorageJs = AndroidDriver.getResourceAsString(R.raw.clear_session_storage_android);
    getSessionStorageSizeJs = AndroidDriver.getResourceAsString(
        R.raw.get_session_storage_size_android);

  }

  public static Atoms getInstance() {
    if (instance == null) {
      instance = new Atoms();
    }
    return instance;
  }
}
