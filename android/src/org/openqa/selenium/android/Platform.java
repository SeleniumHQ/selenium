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

import android.os.Build;

/**
 * Holds data about the android platform.
 */
public class Platform {
  public static final int CUPCAKE = 3;
  public static final int DONUT = 4;
  public static final int ECLAIR = 7;
  public static final int FROYO = 8;
  public static final int GINGERBREAD = 9;
  public static final int GINGERBREAD_MR1 = 10;
  public static final int HONEYCOMB = 11;
  public static final int HONEYCOMB_MR1 = 12;
  public static final int HONEYCOMB_MR2 = 13;
  public static final int ICE_CREAM_SANDWICH = 14;
  public static final int ICE_CREAM_SANDWICH_MR1 = 15;
  public static final int JELLY_BEAN = 16;
  public static final int JELLY_BEAN_MR1 = 17;

  public static int sdk() {
    return Integer.parseInt(Build.VERSION.SDK);
  }
}
