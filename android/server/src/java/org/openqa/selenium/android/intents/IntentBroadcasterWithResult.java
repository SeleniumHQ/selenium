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

import java.util.concurrent.Callable;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class IntentBroadcasterWithResult extends BroadcastReceiver implements Callable<String> {
  private static final String LOG_TAG = IntentBroadcasterWithResult.class.getName();
  private static final IntentBroadcasterWithResult INSTANCE = new IntentBroadcasterWithResult();
  private boolean received = false;
  private String toReturn;
  private String action;
  
  public void broadcast(Context sender, String action) {
    received = false;
    this.action = action;
    Intent intent = new Intent(action);
    sender.sendOrderedBroadcast(intent, null, this, null, Activity.RESULT_OK, null, null);
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());
    toReturn = getResultExtras(true).getString(action);
    received = true;
    Log.d(LOG_TAG, "ON RECEIVE TRUE: toReturn: " + toReturn);
  }

  public static IntentBroadcasterWithResult getInstance() {
    return INSTANCE;
  }

  @Override
  public String call() throws Exception {
    Log.d(LOG_TAG, "CALL RECEIVED FALSE");
    while(!received) {
      continue;
    }
    Log.d(LOG_TAG, "CALL RECEIVED TRUE RETURNING: " + toReturn);
    return toReturn;
  }
}
