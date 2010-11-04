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

package org.openqa.selenium.android;

import android.util.Log;

/**
 * @author berrada@google.com (Dounia Berrada)
 */
public class Logger {
  // Set to false for release apk, true when debugging.
  public static final boolean DEBUG = false;

  // Should be left to true in release apk.
  public static final boolean ERROR = true;
  public static final boolean INFO = true;

  public static void log(int level, String tag, String message) {
    if (ERROR && Log.ERROR == level) {
      Log.e(tag, message);
    } else if (INFO && Log.INFO == level) {
      Log.i(tag, message);
    } else if (DEBUG) {
     Log.println(level, tag, message);
    }
  }
}
