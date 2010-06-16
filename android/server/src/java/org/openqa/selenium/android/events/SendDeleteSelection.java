/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium.android.events;

import android.os.Bundle;
import android.text.Spannable;
import android.util.Log;
import android.webkit.WebView;
import android.webkit.WebView.HitTestResult;
import android.widget.EditText;

import org.openqa.selenium.android.RunnableWithArgs;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

public class SendDeleteSelection implements RunnableWithArgs {
  private static final String LOG_TAG = SendDeleteSelection.class.getName();

  public void init(Bundle bundle) {
    // nothing
  }

  public void run(WebView webView) {
    Log.d(LOG_TAG, "Clear() :: preparing");

    HitTestResult r1 = webView.getHitTestResult();

    if (HitTestResult.EDIT_TEXT_TYPE != r1.getType()) {
      Log.e(LOG_TAG, "Cannot clear non text area " + r1.getType() + " " + r1.getExtra());
      return;
    }
    try {
      int end = 0;
      if (NativeUtil.isDonutOrEarlier()) {
        Field mFocusNode = webView.getClass().getDeclaredField("mFocusNode");
        mFocusNode.setAccessible(true);
        Object focusNode = mFocusNode.get(webView);

        Field mText = focusNode.getClass().getDeclaredField("mText");
        mText.setAccessible(true);
        String text = (String) mText.get(focusNode);
        Log.d(LOG_TAG, "Clear() :: Text " + text);
        end = text.length();
      } else {
        Field mWebTextView = webView.getClass().getDeclaredField("mWebTextView");
        mWebTextView.setAccessible(true);
        EditText focusNode = (EditText) mWebTextView.get(webView);
        Spannable spannable = focusNode.getText();
        end = spannable.length();
        Log.d(LOG_TAG, "Clear() :: Length: " + end  + " Text:" + spannable);
      }
      if (end > 0) {
        Method deleteSelection =
            webView.getClass().getDeclaredMethod("deleteSelection",
                new Class[] {Integer.TYPE, Integer.TYPE});
        deleteSelection.setAccessible(true);
        deleteSelection.invoke(webView, new Object[] {0, end});
        Log.d(LOG_TAG, "Clear() :: DeleteSelection - Done");
      }
      NativeUtil.clearFocus(webView);
    } catch (Exception e) {
      Log.e(LOG_TAG, "Clear() :: Cannot clear", e);
      throw new IllegalStateException(e);
    }
  }
}
