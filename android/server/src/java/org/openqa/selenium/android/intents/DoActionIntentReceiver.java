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

public class DoActionIntentReceiver extends BroadcastReceiver {
  private static final String LOG_TAG = DoActionIntentReceiver.class.getName();
  private ActionRequestListener actionRequestListener;
  
  /**
   * Interface definition for a callback to be invoked when any property of the
   * session is changed.
   */
  public interface ActionRequestListener {

    /**
     * Request to perform an action
     * 
     * @param action Action to perform.
     * @param params Argument of an action.
     * @return Result of the action or null if no result was returned.
     */
    Object onActionRequest(String action, Object... params);
  }

  public void setActionRequestListener(ActionRequestListener listener) {
    actionRequestListener = listener;
  }

  public void removeActionRequestListener(ActionRequestListener listener) {
    if (listener == actionRequestListener) {
      actionRequestListener = null;
    }
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());

    String action = intent.getExtras().getString(BundleKey.ACTION);
    if (action == null || action.length() <= 0) {
      Log.e(LOG_TAG, "Action cannot be empty in intent: " + intent.toString());
      return;
    }

    Object[] args = new Object[0];
    if (intent.getExtras() != null && intent.getExtras().size() > 1) {
      args = new Object[intent.getExtras().size() - 1];
      int argCount = 0;
      for (String key : intent.getExtras().keySet()) {
        if (!key.equals(BundleKey.ACTION)) {
          args[argCount++] = intent.getExtras().get(key);
        }
      }
    }

    Log.d(LOG_TAG,
        String.format("Action: %s, args #: %s", action, args.length));

    String actionRes = null;

    Object result = null;
    if (actionRequestListener != null) {
      result = actionRequestListener.onActionRequest(action, args);
    }

    actionRes = result != null ? result.toString() : null;

    Log.d(LOG_TAG, "Action: " + action
        + (actionRes != null ? ", result length: " + actionRes.length() : " result is null"));

    // Returning the result
    Bundle res = new Bundle();
    res.putString(BundleKey.RESULT, actionRes);
    this.setResultExtras(res);
  }
}
