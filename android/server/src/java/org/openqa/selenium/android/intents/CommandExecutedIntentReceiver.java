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

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;


public class CommandExecutedIntentReceiver extends BroadcastReceiver {
  private static final String LOG_TAG = CommandExecutedIntentReceiver.class.getName();
  private CommandExecutedListener commandExecutedListener;

  public interface CommandExecutedListener {

    /**
     * Notify that command has been executed.
     * 
     * @param result - result.
     */
    void onCommandExecuted(Object result);
  }

  public void setListener(CommandExecutedListener listener) {
    commandExecutedListener = listener;
  }

  public void removeListener(CommandExecutedListener listener) {
    if (listener == commandExecutedListener) {
      commandExecutedListener = null;
    }
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());

    for (String s : intent.getExtras().keySet()) {
      Log.d(LOG_TAG, "Extra: " + s);
    }
    String res = intent.getExtras().getString(BundleKey.RESULT);
    Log.d(LOG_TAG, String.format("Got result. Size: %d, result: %s.",
        (res != null ? res.length() : 0), res));
    if (commandExecutedListener != null) {
      commandExecutedListener.onCommandExecuted(res);
    }
  }
}
