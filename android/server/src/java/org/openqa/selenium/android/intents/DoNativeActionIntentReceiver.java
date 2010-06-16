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

import static org.openqa.selenium.android.intents.DoNativeActionIntent.COMMAND;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import org.openqa.selenium.android.RunnableWithArgs;
import org.openqa.selenium.android.events.NativeEvent;

public class DoNativeActionIntentReceiver extends BroadcastReceiver {
  private static final String LOG_TAG = DoNativeActionIntentReceiver.class.getName();
  private NativeActionExecutorListener listener;

  /**
   * Interface definition for a callback to be invoked when native action is
   * received.
   */
  public interface NativeActionExecutorListener {
    /**
     * Execute runnable context.
     * 
     */
    void executeNativeAction(RunnableWithArgs r);
  }

  public void setTitleRequestListener(NativeActionExecutorListener listener) {
    this.listener = listener;
  }

  public void removeTitleRequestListener(NativeActionExecutorListener listener) {
    if (this.listener == listener) {
      this.listener = null;
    }
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());

    String name = intent.getExtras().getString(COMMAND);
    NativeEvent event = Enum.valueOf(NativeEvent.class, name);
    RunnableWithArgs r = event.getCommand();
    r.init(intent.getExtras());

    if (listener != null) {
      listener.executeNativeAction(r);
    }
  }
}
