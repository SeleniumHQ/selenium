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

import static org.openqa.selenium.android.events.NativeEvent.MOTION_EVENT;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.MotionEvent;

import org.openqa.selenium.android.Callback;
import org.openqa.selenium.android.events.NativeEvent;

public class DoNativeActionIntent extends BroadcastReceiver {
  private static final String LOG_TAG = DoNativeActionIntent.class.getName();
  private static final DoNativeActionIntent INSTANCE = new DoNativeActionIntent();
  private Callback callback;

  public static final String COMMAND = "command";
  public static final String MOTION_EVENT_PARAM = "motionEvent";
  public static final String SEND_KEYS_TEXT_PARAM = "sendKeys";
  // Indicates that it's the last input key, we can blur and cleanup
  public static final String LAST_KEY_PARAM = "lastKey";

  public void broadcastMotionEvent(MotionEvent event, Context sender, Callback callback) {
    this.callback = callback;
    Intent intent = new Intent(Action.DO_NATIVE_ACTION);
    intent.putExtra(COMMAND, MOTION_EVENT.name());
    intent.putExtra(MOTION_EVENT_PARAM, event);

    sender.sendOrderedBroadcast(intent, null, this, null, Activity.RESULT_OK, null, null);
  }

  public void broadcastSendKeys(String text, boolean last, Context sender, Callback callback) {
    this.callback = callback;
    Intent intent = new Intent(Action.DO_NATIVE_ACTION);
    intent.putExtra(COMMAND, NativeEvent.SEND_KEYS.name());
    intent.putExtra(SEND_KEYS_TEXT_PARAM, text);
    intent.putExtra(LAST_KEY_PARAM, last);

    sender.sendOrderedBroadcast(intent, null, this, null, Activity.RESULT_OK, null, null);
  }

  public void broadcastSendClear(Context sender, Callback callback) {
    this.callback = callback;
    Intent intent = new Intent(Action.DO_NATIVE_ACTION);
    intent.putExtra(COMMAND, NativeEvent.CLEAR.name());

    sender.sendOrderedBroadcast(intent, null, this, null, Activity.RESULT_OK, null, null);
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());

    // sync
    if (callback != null) {
      callback.stringCallback("");
    }
  }

  public static DoNativeActionIntent getInstance() {
    return INSTANCE;
  }
}
