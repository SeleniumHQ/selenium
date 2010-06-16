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

import org.openqa.selenium.android.Callback;

import java.io.Serializable;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class DoActionIntent extends BroadcastReceiver {
  private static final String LOG_TAG = DoActionIntent.class.getName();
  private static final DoActionIntent INSTANCE = new DoActionIntent();
  private Callback strCallback;
  
  public void broadcast(String action, Serializable[] args,
      Context sender, Callback callback) {
    strCallback = callback;

    Intent intent = new Intent(Action.DO_ACTION);
    Log.d(LOG_TAG, "Sending intent: " + intent.getAction() + ", action: " + action);

    intent.putExtra(BundleKey.ACTION, action);
    if (args != null && args.length > 0) {
      for (int i = 0; i < args.length; i++) {
        intent.putExtra("arg" + i, args[i]);
      }
    }
    sender.sendOrderedBroadcast(intent, null, this, null, Activity.RESULT_OK, null, null);
  }

  @Override
  public void onReceive(Context ctx, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());
    String res = getResultExtras(true).getString("Result");

    Log.d(LOG_TAG,
        "Got result " + (res != null ? ", result size: " + res.length() + ", result: " + res
                : ", result is null"));

    if (strCallback != null) {
      Log.d("DoActionIntent:onReceive", "Invoking callback");
      strCallback.stringCallback(res);
    }
  }

  public static DoActionIntent getInstance() {
    return INSTANCE;
  }
}
