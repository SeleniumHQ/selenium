/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.android.intents;

public interface Action {
  String NAVIGATE = "navigate";
  String GET_TITLE = "getTitle";
  String GET_URL = "getUrl";
  String PAGE_LOADED = "pageLoaded";
  String PAGE_STARTED_LOADING = "pageStartedLoading";
  String TAKE_SCREENSHOT = "takeScreenshot";
  String NAVIGATE_BACK = "navigateBack";
  String NAVIGATE_FORWARD = "navigateForward";
  String REFRESH = "refresh";
  String EXECUTE_JAVASCRIPT = "executeJavascript";
  String ADD_COOKIE = "addCookie";
  String REMOVE_COOKIE = "removeCookie";
  String REMOVE_ALL_COOKIES = "removeAllCookies";
  String GET_COOKIE = "getCookie";
  String GET_ALL_COOKIES = "getAllCookies";
  
  String JAVASCRIPT_RESULT_AVAILABLE = "javascriptResultAvailable";
  
  String SEND_KEYS = "sendKeys";
  String SEND_MOTION_EVENT = "sendMotionEvent";
  
  String EDITABLE_AERA_FOCUSED = "editableAreaFocused";
}
