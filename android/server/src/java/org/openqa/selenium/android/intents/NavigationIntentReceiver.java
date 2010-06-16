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

public class NavigationIntentReceiver extends BroadcastReceiver {
  private NavigateRequestListener navigateRequestListener;
  
  private static final String LOG_TAG = NavigationIntentReceiver.class.getName();

  /**
   * Interface definition for a callback to be invoked when any navigation is
   * requested.
   */
  public interface NavigateRequestListener {
    /**
     * Request to navigate the WebView to a given URL.
     * 
     * @param url URL to navigate to.
     */
    void onNavigateRequest(String url);
  }

  public void setNavigateRequestListener(NavigateRequestListener listener) {
    navigateRequestListener = listener;
  }

  // TODO(berrada): This doesn't look like it's called. Is that right?
  public void removeNavigateRequestListener(NavigateRequestListener listener) {
    if (listener == navigateRequestListener) navigateRequestListener = null;
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    String url = intent.getExtras().getString("URL");
    Log.d(LOG_TAG, String.format("Received intent: %s, URL: %s", intent.getAction(), url));

    if (navigateRequestListener != null) navigateRequestListener.onNavigateRequest(url);

    Bundle result = new Bundle();
    result.putBoolean(BundleKey.OK, true);
    Log.d(LOG_TAG, "Navigated OK");
    this.setResultExtras(result);
  }
}
