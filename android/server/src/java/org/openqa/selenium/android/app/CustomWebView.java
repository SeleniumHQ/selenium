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

package org.openqa.selenium.android.app;

import org.openqa.selenium.android.intents.Action;
import org.openqa.selenium.android.intents.IntentSender;

import android.content.Context;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.webkit.WebView;

public class CustomWebView extends WebView {
  private final IntentSender sender = new IntentSender();
  
  public CustomWebView(Context context) {
    super(context);
  }

  public CustomWebView(Context context, AttributeSet attrs, int defStyle) {
    super(context, attrs, defStyle);
  }

  public CustomWebView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }
  
  @Override
  protected void onFocusChanged(boolean focused, int direction,
      Rect previouslyFocusedRect) {
    super.onFocusChanged(focused, direction, previouslyFocusedRect);
    if (!focused) {  // When a text area is focused, webview's focus is false
      sender.broadcast(getContext(), Action.EDITABLE_AERA_FOCUSED);
    }
  }
}
