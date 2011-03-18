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

import org.openqa.selenium.android.Logger;
import org.openqa.selenium.android.intents.IntentReceiverRegistrar;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

/**
 * Main activity. Loads program configuration and starts the UI.
 */
public class MainActivity extends Activity {  
  // Debug parameter to activate and desactivate debug mode.
  // For instance if using the command line do:
  // $./adb shell am start -a android.intent.action.MAIN -n \
  //   org.openqa.selenium.android.app/.MainActivity -e debug true
  //
  // If sending the intent programatically use"
  // intent.putExtra(DEBUG_MODE_ARG, true);
  public static final String DEBUG_MODE_ARG = "debug";
  private boolean debugMode;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    if (getIntent().hasExtra(DEBUG_MODE_ARG)) {
      String debugArg = getIntent().getStringExtra(DEBUG_MODE_ARG);
      debugMode = Boolean.parseBoolean(debugArg);
      Logger.setDebugMode(debugMode);
    }
    startMainScreen();
  }
  
  private void startMainScreen() {
    Intent startActivity = new Intent(this, WebDriverActivity.class);
    startActivity(startActivity);
  }
}
