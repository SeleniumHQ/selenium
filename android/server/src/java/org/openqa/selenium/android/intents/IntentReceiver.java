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

import org.openqa.selenium.WebDriverException;

import java.io.Serializable;
import java.util.Set;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

public class IntentReceiver extends BroadcastReceiver {
  private static final String LOG_TAG = IntentReceiver.class.getName();
  private IntentReceiverListener listener;

  public interface IntentReceiverListener {
    Object onReceiveBroadcast(String action, Object... args);
  }

  public void setListener(IntentReceiverListener listener) {
    this.listener = listener;
  }

  public void removeListener(IntentReceiverListener listener) {
    if (this.listener == listener) {
      this.listener = null;
    }
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    String action = intent.getAction();
    Object result = null;
    if (listener == null) {
      throw new WebDriverException(LOG_TAG + " Intent listener null! Action: " + action);
    }
    
    if ((intent.getExtras() != null) && (intent.getExtras().size() > 0)) {
      Bundle extras = intent.getExtras();
      Object[] args = null;
      if (extras.getBoolean(IntentSender.IS_PARCELABLE)) {
        args = extractParcelable(extras);
      } else { // Treat as serializables
        args = extractSerialazable(extras);
      }
      result = listener.onReceiveBroadcast(action, args);
    } else {
      result = listener.onReceiveBroadcast(action);
    }
    Bundle res = new Bundle();
    res.putSerializable(action, (Serializable) result);

    Log.d(LOG_TAG, String.format("Received intent: %s, from context: %s. Returning: %s",
        action, context, result));
    this.setResultExtras(res);
  }

  private Object[] extractSerialazable(Bundle extras) {
    Set<String> keys = getActiveKeys(extras);
    Object[] toReturn = new Object[keys.size()];
    int index = 0;
    for (String key : keys) {
      if (extras.getSerializable(key) != null) {
        toReturn[index] = extras.getSerializable(key);
      }
      index ++;
    }
    return toReturn;
  }

  private Object[] extractParcelable(Bundle extras) {
    Set<String> keys = getActiveKeys(extras);
    Object[] toReturn = new Object[keys.size()];
    int index = keys.size() - 1;
    for (String key : keys) {
      if (extras.getParcelable(key) != null) {
        // Extract the arguments starting from the last argument added (FILO)
        // because order matters for motion event.
        toReturn[index] = extras.getParcelable(key);
      }
     index --; 
    }
    return toReturn;
  }

  private Set<String> getActiveKeys(Bundle extras) {
    Set<String> keys = extras.keySet();
    // Remove this from the key set as it is only used to detect parcels
    keys.remove(IntentSender.IS_PARCELABLE);
    return keys;
  }
}
