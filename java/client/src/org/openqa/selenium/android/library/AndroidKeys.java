/*
Copyright 2010 Selenium committers

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

package org.openqa.selenium.android.library;

import android.view.KeyEvent;

import org.openqa.selenium.Keys;

import java.util.HashMap;
import java.util.Map;

/**
 * Maps unicode keys to Android keys codes.
 */
class AndroidKeys {

  private static final Map<Keys, Integer> keyMapping = new HashMap<Keys, Integer>() {{
    put(Keys.SPACE, KeyEvent.KEYCODE_SPACE);
    put(Keys.ARROW_DOWN, KeyEvent.KEYCODE_DPAD_DOWN);
    put(Keys.DOWN, KeyEvent.KEYCODE_DPAD_DOWN);
    put(Keys.ARROW_LEFT, KeyEvent.KEYCODE_DPAD_LEFT);
    put(Keys.LEFT, KeyEvent.KEYCODE_DPAD_LEFT);
    put(Keys.ARROW_RIGHT, KeyEvent.KEYCODE_DPAD_RIGHT);
    put(Keys.RIGHT, KeyEvent.KEYCODE_DPAD_RIGHT);
    put(Keys.ARROW_UP, KeyEvent.KEYCODE_DPAD_UP);
    put(Keys.UP, KeyEvent.KEYCODE_DPAD_UP);
    put(Keys.BACK_SPACE, KeyEvent.KEYCODE_DEL);
    put(Keys.DELETE, KeyEvent.KEYCODE_DEL);
    put(Keys.ENTER, KeyEvent.KEYCODE_ENTER);
    put(Keys.RETURN, KeyEvent.KEYCODE_ENTER);
    put(Keys.TAB, KeyEvent.KEYCODE_TAB);
    put(Keys.CLEAR, KeyEvent.KEYCODE_CLEAR);
    put(Keys.SHIFT, KeyEvent.KEYCODE_SHIFT_RIGHT);
    put(Keys.LEFT_SHIFT, KeyEvent.KEYCODE_SHIFT_LEFT);
    put(Keys.ALT, KeyEvent.KEYCODE_ALT_RIGHT);
    put(Keys.LEFT_ALT, KeyEvent.KEYCODE_ALT_LEFT);
    put(Keys.PAUSE, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE);
    put(Keys.HOME, KeyEvent.KEYCODE_HOME);
    put(Keys.SEMICOLON, KeyEvent.KEYCODE_SEMICOLON);
    put(Keys.EQUALS, KeyEvent.KEYCODE_EQUALS);
    put(Keys.NUMPAD0, KeyEvent.KEYCODE_0);
    put(Keys.NUMPAD1, KeyEvent.KEYCODE_1);
    put(Keys.NUMPAD2, KeyEvent.KEYCODE_2);
    put(Keys.NUMPAD3, KeyEvent.KEYCODE_3);
    put(Keys.NUMPAD4, KeyEvent.KEYCODE_4);
    put(Keys.NUMPAD5, KeyEvent.KEYCODE_5);
    put(Keys.NUMPAD6, KeyEvent.KEYCODE_6);
    put(Keys.NUMPAD7, KeyEvent.KEYCODE_7);
    put(Keys.NUMPAD8, KeyEvent.KEYCODE_8);
    put(Keys.NUMPAD9, KeyEvent.KEYCODE_9);
    put(Keys.ADD, KeyEvent.KEYCODE_PLUS);
    put(Keys.SUBTRACT, KeyEvent.KEYCODE_MINUS);
    put(Keys.DECIMAL, KeyEvent.KEYCODE_NUM);
  }};
  
  /* package */ static int getKeyEventFromUnicodeKey(char key) {
    if (key == '\b') {
      return KeyEvent.KEYCODE_DEL;
    } else if (key == '\r') {
      return KeyEvent.KEYCODE_ENTER;
    }
    for (Keys seleniumKey : keyMapping.keySet()) {
      if (seleniumKey.charAt(0) == key) {
        return keyMapping.get(seleniumKey);
      }
    }
    return -1;
  }
}
