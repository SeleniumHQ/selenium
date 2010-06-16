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

package org.openqa.selenium.android.events;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

import android.os.Build;
import android.util.Log;
import android.webkit.WebView;

public class NativeUtil {
  private static final String LOG_TAG = NativeUtil.class.getName();

  public static void clearFocus(WebView webView) {
    if (isDonutOrEarlier()) {
      try {
        Method nativeClearFocus =
            webView.getClass().getDeclaredMethod("nativeClearFocus",
                new Class[] {Integer.TYPE, Integer.TYPE});
        nativeClearFocus.setAccessible(true);
        nativeClearFocus.invoke(webView, new Object[] {-1, -1});
        Log.d(LOG_TAG, "NativeClear Focus - Done");
      } catch (Exception e) {
        Log.e(LOG_TAG, "Could not clear focus", e);
      }
    } else {
      try {
        Method clearTextEntry = webView.getClass().getDeclaredMethod("clearTextEntry");
        clearTextEntry.setAccessible(true);
        clearTextEntry.invoke(webView);
        Log.d(LOG_TAG, "NativeClear Focus - Done");
      } catch (Exception e) {
        Log.e(LOG_TAG, "Could not clear focus", e);
      }
    }
  }

  public static boolean isDonutOrEarlier() {
    try {
      Field field = Build.VERSION.class.getField("SDK_INT");
      Integer sdkVersion = field.getInt(Build.VERSION.class);
      if (sdkVersion <= 4) {
        return true;
      }
    } catch (Exception e) {
      Log.d(LOG_TAG, "Detecting version " + e.getMessage());
      return true;
    }
    return false;
  }
}
