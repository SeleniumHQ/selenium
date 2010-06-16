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

package org.openqa.selenium.android.app;

import org.openqa.selenium.android.server.JettyService;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

/**
 * Main activity. Loads program configuration and starts the UI.
 */
public class MainActivity extends Activity {

  public static final int DEFAULT_REQUEST_CODE = 1001;
  private static final String LOG_TAG = "MainActivity";
  
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Intent intent = new Intent(this, JettyService.class);
    startService(intent);
    Log.w(LOG_TAG, "Started");
    startMainScreen();
  }

  /**
   * This event is invoked when activity exits current view.
   * In any way the view that corresponds to the working mode should
   * be reloaded.
   * 
   * @param requestCode The original request code that the view had been
   *    initialized with. If view exited as a result of a working mode change
   *    this should be equal to {@link #DEFAULT_REQUEST_CODE}.
   */
  @Override
  protected void onActivityResult(int requestCode,
      int resultCode, Intent data) {
    if (requestCode != DEFAULT_REQUEST_CODE)
      return;

    startMainScreen();
  }
  
  private void startMainScreen() {
    Intent i = new Intent(this, SingleSessionActivity.class);
    this.startActivityForResult(i, DEFAULT_REQUEST_CODE);
  }
}
