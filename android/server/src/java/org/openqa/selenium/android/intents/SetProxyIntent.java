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

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class SetProxyIntent extends BroadcastReceiver implements Callable<Boolean> {
  private static final String LOG_TAG = SetProxyIntent.class.getName();
  private static final SetProxyIntent INSTANCE = new SetProxyIntent();
  private boolean toReturn;
  private boolean received = false;

  public void broadcast(String host, String port, Context sender) {
    Intent intent = new Intent(Action.SET_PROXY);
    intent.putExtra(BundleKey.HOST, host);
    intent.putExtra(BundleKey.PORT, port);
    sender.sendBroadcast(intent);
    received = false;
  }

  public static SetProxyIntent getInstance() {
    return INSTANCE;
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());
    toReturn = getResultExtras(true).getBoolean(BundleKey.PROXY);
    received = true;
  }

  public Boolean call() throws Exception {
    while(!received) {
      continue;
    }
    return toReturn;
  }
}
