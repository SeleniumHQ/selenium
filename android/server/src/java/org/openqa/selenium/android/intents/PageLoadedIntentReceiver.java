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

public class PageLoadedIntentReceiver extends BroadcastReceiver {
  private PageLoadedListener pageLoadedListener;

  public interface PageLoadedListener {
    /**
     * Is called when the page load is completed.
     */
    void onPageLoaded();
  }

  public void setPageLoadedListener(PageLoadedListener listener) {
    pageLoadedListener = listener;
  }

  // TODO(berrada): Apparently this is never called.
  public void removeListener(PageLoadedListener listener) {
    if (listener == pageLoadedListener) pageLoadedListener = null;
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    if (pageLoadedListener != null) {
      pageLoadedListener.onPageLoaded();
    }
  }
}
