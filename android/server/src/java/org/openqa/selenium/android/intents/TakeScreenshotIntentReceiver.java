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

public class TakeScreenshotIntentReceiver extends BroadcastReceiver {
  private TakeScreenshotListener takeScreenshotListener;
  private static final String LOG_TAG = TakeScreenshotIntentReceiver.class.getName();

  public interface TakeScreenshotListener {
    /**
     * Takes a screenshot of the current page displayed in the browser.
     */
    byte[] takeScreenshot();
  }

  public void setListener(TakeScreenshotListener listener) {
    takeScreenshotListener = listener;
  }

  public void removeListener(TakeScreenshotListener listener) {
    if (listener == takeScreenshotListener) takeScreenshotListener = null;
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Received intent: " + intent.getAction());
    byte[] rawPng = null;
    if (takeScreenshotListener != null) {
      rawPng = takeScreenshotListener.takeScreenshot();
    }

    Bundle res = new Bundle();
    res.putByteArray(BundleKey.SCREENSHOT, rawPng);
    this.setResultExtras(res);
  }
}
