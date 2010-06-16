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

import java.util.UUID;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class CommandExecutedIntent extends BroadcastReceiver {
  private static final String LOG_TAG = CommandExecutedIntent.class.getName();
  private static final CommandExecutedIntent INSTANCE = new CommandExecutedIntent();

  public static CommandExecutedIntent getInstance() {
    return INSTANCE;
  }

  public void broadcast(Context sender, String result) {
    Intent intent = new Intent(Action.COMMAND_EXECUTED);
    intent.putExtra(BundleKey.RESULT, result);
    intent.putExtra(BundleKey.UID, UUID.randomUUID());
    sender.sendOrderedBroadcast(intent, null, this, null, Activity.RESULT_OK, null, null);
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.e(LOG_TAG, "Received intent: " + intent.getAction());
  }
}
