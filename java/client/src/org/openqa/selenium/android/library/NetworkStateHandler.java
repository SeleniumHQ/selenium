/*
 * Copyright 2011 Selenium committers
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.openqa.selenium.android.library;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

import java.lang.reflect.Method;

class NetworkStateHandler {
  private Activity activity;
  private IntentFilter filter;
  private BroadcastReceiver receiver;
  private boolean isConnected;
  private boolean isNetworkUp;
  private final ViewAdapter view;
  
  /* package */ NetworkStateHandler(Activity activity, final ViewAdapter view) {
    this.activity = activity;
    this.view = view;
    
    ConnectivityManager cm = (ConnectivityManager) activity
        .getSystemService(Context.CONNECTIVITY_SERVICE);
    NetworkInfo info = cm.getActiveNetworkInfo();
    if (info != null) {
      isConnected = info.isConnected();
      isNetworkUp = info.isAvailable();
    }
    
    filter = new IntentFilter();
    filter.addAction(ConnectivityManager.CONNECTIVITY_ACTION);
    
    receiver = new BroadcastReceiver() {
      public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(ConnectivityManager.CONNECTIVITY_ACTION)) {
          NetworkInfo info = intent.getParcelableExtra(ConnectivityManager.EXTRA_NETWORK_INFO);
          String typeName = info.getTypeName();
          String subType = info.getSubtypeName();
          isConnected = info.isConnected();
          if (view != null) {
            try {
              Method setNetworkType = view.getClass().getMethod("setNetworkType",
                  String.class, String.class);
              setNetworkType.invoke(view, typeName, (subType == null? "" : subType));
              
              boolean noConnection = intent.getBooleanExtra(
                  ConnectivityManager.EXTRA_NO_CONNECTIVITY, false);
              onNetworkChange(!noConnection);
            } catch (Exception e) {
              throw new RuntimeException(e);
            }
          }
        }
      }
    };
  }

  /* package */ void onNetworkChange(boolean up) {
    if (up == isNetworkUp) {
      return;
    } else if (up) {
      isNetworkUp = true;
    } else {
      isNetworkUp = false;
    }
    
    if (view != null) {
      view.setNetworkAvailable(isNetworkUp);
    }
  }
  
  /* package */ boolean isNetworkUp() {
    return isNetworkUp;
  }
  
  /* package */ boolean isConnected() {
    return isConnected;
  }

  /* package */ void onPause() {
    // unregister network state listener
    activity.unregisterReceiver(receiver);
  }

  /* package */ void onResume() {
    activity.registerReceiver(receiver, filter);
  }
}
