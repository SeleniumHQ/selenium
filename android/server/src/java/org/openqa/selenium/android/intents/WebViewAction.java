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

import org.openqa.selenium.WebDriverException;

import android.webkit.WebView;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Helper class to perform action on the webview.
 */
public class WebViewAction {

  public static void clearTextEntry(WebView webview) {
    Method clearTextEntry;
    try {
      clearTextEntry = webview.getClass().getDeclaredMethod("clearTextEntry");
      clearTextEntry.setAccessible(true);
      clearTextEntry.invoke(webview);
      return;
    } catch (SecurityException e) {
      throw new WebDriverException("clearTextEntry failed!", e);
    } catch (NoSuchMethodException e) {
      throw new WebDriverException("clearTextEntry failed!", e);
    } catch (IllegalArgumentException e) {
      throw new WebDriverException("clearTextEntry failed!", e);
    } catch (IllegalAccessException e) {
      throw new WebDriverException("clearTextEntry failed!", e);
    } catch (InvocationTargetException e) {
      throw new WebDriverException("clearTextEntry failed!", e);
    }
  }
  
}
