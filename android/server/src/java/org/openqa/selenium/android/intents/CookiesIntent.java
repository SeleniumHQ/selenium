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

import org.openqa.selenium.android.sessions.SessionCookieManager;
import org.openqa.selenium.android.sessions.SessionCookieManager.CookieActions;

import org.openqa.selenium.android.AndroidDriver;
import org.openqa.selenium.android.Callback;

import java.io.Serializable;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class CookiesIntent extends BroadcastReceiver {
  private static final String LOG_TAG = CookiesIntent.class.getName();
  private static final CookiesIntent INSTANCE = new CookiesIntent();
  private Callback strCallback;
  private String cookieValue;
  public static final String NAME_PARAM = "name";
  public static final String VALUE_PARAM = "value";
  public static final String PATH_PARAM = "path";

  public String broadcastSync(CookieActions action, Map<String, Serializable> args,
      Context sender) {
    cookieValue = "";
    final CountDownLatch latch = new CountDownLatch(1);
    broadcast(action, args, sender, new Callback() {
      @Override
      public void stringCallback(String arg0) {
        cookieValue = arg0;
        latch.countDown();
      }
    });

    try {
      latch.await(AndroidDriver.INTENT_TIMEOUT, TimeUnit.SECONDS);
    } catch (Exception e) {
      Log.e(LOG_TAG, "CookiesIntent", e);
    }
    return cookieValue;
  }

  public void broadcast(SessionCookieManager.CookieActions action,
      Map<String, Serializable> args, Context sender, Callback callback) {
    strCallback = callback;

    Intent intent = new Intent(Action.GET_COOKIES);
    Log.d(LOG_TAG, String.format("Sending intent: %s, action: %s",
        intent.getAction(), action.name()));

    intent.putExtra(BundleKey.ACTION, action.name());
    if (args != null) {
      for (Map.Entry<String, Serializable> entry : args.entrySet()) {
        intent.putExtra(entry.getKey(), entry.getValue());
      }
    }
    sender.sendOrderedBroadcast(intent, null, this, null, Activity.RESULT_OK, null, null);
  }

  @Override
  public void onReceive(Context ctx, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());

    for (String s : getResultExtras(true).keySet()) {
      Log.d(LOG_TAG, "Extra: " + s);
    }

    String res = getResultExtras(true).getString(BundleKey.RESULT);

    if (res == null)
      res = "";

    Log.d(LOG_TAG, "Got result: " + res);

    if (strCallback != null) {
      Log.d(LOG_TAG, "Invoking callback");
      strCallback.stringCallback(res);
    }
  }

  public static CookiesIntent getInstance() {
    return INSTANCE;
  }
}
