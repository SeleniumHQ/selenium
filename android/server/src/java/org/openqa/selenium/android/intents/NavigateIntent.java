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

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.android.AndroidDriver.INTENT_TIMEOUT;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import org.openqa.selenium.android.Callback;

import java.util.concurrent.CountDownLatch;

public class NavigateIntent extends BroadcastReceiver {
  private Callback intCallback;
  private static final NavigateIntent INSTANCE = new NavigateIntent();
  private boolean navigateOk = false;
  
  private static final String LOG_TAG = NavigateIntent.class.getName();

  public boolean broadcastSync(Context sender, String url,
      boolean blocking) {
    navigateOk = false;
    final CountDownLatch loading = new CountDownLatch(1);
    broadcast(sender, url, blocking, new Callback() {
      @Override
      public void booleanCallabck(boolean resultOk) {
        loading.countDown();
        navigateOk = resultOk;
      }
    });
    try {
      loading.await(INTENT_TIMEOUT, MILLISECONDS);
    } catch (InterruptedException e) {
      Log.e(LOG_TAG, "Loading lock was interrupted ", e);
    }
    return navigateOk;
  }

  public void broadcast(Context sender, String url,
      boolean blocking, Callback callback) {

    intCallback = callback;

    Intent intent = new Intent(Action.NAVIGATE);
    intent.putExtra(BundleKey.URL, url);
    intent.putExtra(BundleKey.BLOCKING, blocking);

    sender.sendOrderedBroadcast(intent, null, this, null, Activity.RESULT_OK, null, null);
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());

    boolean resultOk = getResultExtras(true).getBoolean("OK", false);
    if (intCallback != null) {
      intCallback.booleanCallabck(resultOk);
    }
  }

  public static NavigateIntent getInstance() {
    return INSTANCE;
  }
}
