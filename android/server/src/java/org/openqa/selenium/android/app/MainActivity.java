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

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import org.openqa.selenium.android.Logger;
import org.openqa.selenium.android.intents.Action;
import org.openqa.selenium.android.intents.IntentReceiver;
import org.openqa.selenium.android.intents.IntentReceiver.IntentReceiverListener;
import org.openqa.selenium.android.intents.IntentReceiverRegistrar;
import org.openqa.selenium.android.server.JettyService;

/**
 * Main activity. Loads program configuration and starts the UI.
 */
public class MainActivity extends Activity implements IntentReceiverListener {

  public static final int DEFAULT_REQUEST_CODE = 1001;
  private final IntentReceiverRegistrar intentReg;
  private Intent jettyService;
  
  // Debug parameter to activate and desactivate debug mode.
  // For instance if using the command line do:
  // $./adb shell am start -a android.intent.action.MAIN -n \
  //   org.openqa.selenium.android.app/.MainActivity -e debug true
  //
  // If sending the intent programatically use"
  // intent.putExtra(DEBUG_MODE_ARG, true);
  public static final String DEBUG_MODE_ARG = "debug";
  private boolean debugMode = false;

  public MainActivity() {
    intentReg = new IntentReceiverRegistrar(this);
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    if (getIntent().hasExtra(DEBUG_MODE_ARG)) {
      String debugArg = getIntent().getStringExtra(DEBUG_MODE_ARG);
      debugMode = Boolean.parseBoolean(debugArg);
    }
    Logger.setDebugMode(debugMode);
    
    jettyService = new Intent(this, JettyService.class);
    startService(jettyService);
    startMainScreen();
    initIntentReceivers();
  }

  @Override
  protected void onDestroy() {
    intentReg.unregisterAllReceivers();
    this.stopService(jettyService);
    super.onDestroy();
  }

  private void initIntentReceivers() {
    IntentReceiver intentWithResult = new IntentReceiver();
    intentWithResult.setListener(this);
    intentReg.registerReceiver(intentWithResult, Action.ACTIVITY_QUIT);
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
  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    if (requestCode != DEFAULT_REQUEST_CODE)
      return;
    startMainScreen();
  }
  
  private void startMainScreen() {
    Intent startActivity = new Intent(this, WebDriverActivity.class);
    this.startActivityForResult(startActivity, DEFAULT_REQUEST_CODE);
  }

  public Object onReceiveBroadcast(String action, Object... args) {
    if (Action.ACTIVITY_QUIT.equals(action)) {
      this.finishActivity(DEFAULT_REQUEST_CODE);
    }
    return null;
  }
}
