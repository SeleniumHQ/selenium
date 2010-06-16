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

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class PageStartedLoadingIntent extends BroadcastReceiver {
  private static final String LOG_TAG = PageStartedLoadingIntent.class.getName();
  private static final PageStartedLoadingIntent INSTANCE = new PageStartedLoadingIntent();

  private PageStartedLoadingIntent() {
  }

  public static PageStartedLoadingIntent getInstance() {
    return INSTANCE;
  }

  public void broadcast(Context sender, boolean result) {
    Intent intent = new Intent(Action.PAGE_STARTED_LOADING);
    Log.d(LOG_TAG, "Sending intent: " + Action.PAGE_STARTED_LOADING);
    sender.sendOrderedBroadcast(intent, null, this, null, Activity.RESULT_OK, null, null);
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.e(LOG_TAG, "received intent: " + intent.getAction());
  }

}
