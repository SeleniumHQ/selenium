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
import android.os.Bundle;
import android.util.Log;

public class IntentBroadcasterWithResultReceiver extends BroadcastReceiver {
  private static final String LOG_TAG = IntentBroadcasterWithResultReceiver.class.getName();
  private BroadcasterWithResultListener listener;
  
  /**
   * Interface definition for a callback to be invoked when title is requested.
   */
  public interface BroadcasterWithResultListener {
    /**
     * Returns current title of the WebView's content.
     * 
     * @return Title of current web page loaded in the WebView.
     */
    String onBroadcastWithResult(String action);
  }

  public void setListener(BroadcasterWithResultListener listener) {
    this.listener = listener;
  }

  public void removeListener(BroadcasterWithResultListener listener) {
    if (this.listener == listener) {
      this.listener = null;
    }
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    String action = intent.getAction();
    Log.d(LOG_TAG, "Received intent: " + action);
    String result = null;
    if (listener != null) 
      result = listener.onBroadcastWithResult(action);
    Bundle res = new Bundle();
    res.putString(action, result);
    Log.d(LOG_TAG, String.format("Returning %s: %s", action, result));
    this.setResultExtras(res);
  }
}
