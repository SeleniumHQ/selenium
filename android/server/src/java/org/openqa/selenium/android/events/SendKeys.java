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

package org.openqa.selenium.android.events;

import org.openqa.selenium.Keys;
import org.openqa.selenium.android.RunnableWithArgs;
import org.openqa.selenium.android.intents.WebViewAction;
//import org.openqa.selenium.android.intents.DoNativeActionIntent;

import android.os.Bundle;
import android.util.Log;
import android.view.KeyCharacterMap;
import android.view.KeyEvent;
import android.webkit.WebView;

public class SendKeys implements RunnableWithArgs {
  private String text;
  private boolean last;
  private static final String LOG_TAG = SendKeys.class.getName();

  public void init(Bundle bundle) {
    text = bundle.getString("arg_0");
    last = bundle.getBoolean("arg_1");
  }

  public void run(WebView webView) {
    Log.d(LOG_TAG, "SendKeys :: preparing to send " + text);
    if (text == null) {
      return;
    }

    if (text.contains(Keys.SPACE)) {
      text = text.replace(Keys.SPACE, " ");
    }

    KeyCharacterMap keyCharacterMap = KeyCharacterMap.load(KeyCharacterMap.BUILT_IN_KEYBOARD);
    KeyEvent[] events = null;
    if (text.length() == 1) {
      for (Keys key : Keys.values()) {
        if (key.charAt(0) == text.charAt(0)) {
          Log.d(LOG_TAG, "Code " + key.name());
          events = new KeyEvent[2];
          int code = getAndroidKeyEventCode(key);
          if (code != -1) {
            events[0] = new KeyEvent(KeyEvent.ACTION_DOWN, code);
            events[1] = new KeyEvent(KeyEvent.ACTION_UP, code);
            Log.d(LOG_TAG, "Key: " + code);
          } else {
            Log.d(LOG_TAG, "Key was detected, but Android analogue was not found");
            return;
          }
          break;
        }
      }
    }
    if (events == null) {
      events = keyCharacterMap.getEvents(text.toCharArray());
    }

    if (events != null) {
      for (KeyEvent event : events) {
        webView.dispatchKeyEvent(event);
      }
    }

    // TODO(berrada): This is slightly out of kilter with the main webdriver APIs. Might be okay, though
    if (last) {
      WebViewAction.clearTextEntry(webView);
    }
  }

  public static int getAndroidKeyEventCode(Keys key) {
    switch (key) {
      case ARROW_DOWN:
        return KeyEvent.KEYCODE_DPAD_DOWN;
      case DOWN:
        return KeyEvent.KEYCODE_DPAD_DOWN;
      case ARROW_LEFT:
        return KeyEvent.KEYCODE_DPAD_LEFT;
      case LEFT:
        return KeyEvent.KEYCODE_DPAD_LEFT;
      case ARROW_RIGHT:
        return KeyEvent.KEYCODE_DPAD_RIGHT;
      case RIGHT:
        return KeyEvent.KEYCODE_DPAD_RIGHT;
      case ARROW_UP:
        return KeyEvent.KEYCODE_DPAD_UP;
      case UP:
        return KeyEvent.KEYCODE_DPAD_UP;
      case BACK_SPACE:
        return KeyEvent.KEYCODE_DEL;
      case ENTER:
        return KeyEvent.KEYCODE_ENTER;
      case SPACE:
        return KeyEvent.KEYCODE_SPACE;
      default:
        return -1;
    }
  }
}
