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

import com.google.common.collect.Lists;

import android.os.SystemClock;
import android.view.KeyCharacterMap;
import android.view.KeyEvent;
import android.webkit.WebView;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.android.Platform;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

/**
 * Helper class to perform action on the webview.
 */
public class WebViewAction {

  /**
   * Called when the current element wants to give up focus.
   * 
   * @param webview
   */
  public static void clearFocusFromCurrentElement(WebView webview) {
    // Froyo fixed the focus issue, so no action is needed.
    if (Platform.FROYO <= Platform.sdk()) {
      return;
    }
	Method clearTextEntry;
    try {
      // This allows to clear the focus from the current element, despite the confusing
      // method name.
      clearTextEntry = webview.getClass().getDeclaredMethod("clearTextEntry");
      clearTextEntry.setAccessible(true);
      clearTextEntry.invoke(webview);
      return;
    } catch (SecurityException e) {
      throw new WebDriverException("clearTextEntry failed!", e);
    } catch (NoSuchMethodException e) {
      throw new WebDriverException("clearTextEntry failed!", e);
    } catch (IllegalArgumentException e) {
      throw new WebDriverException("clearTextEntry failed!", e);
    } catch (IllegalAccessException e) {
      throw new WebDriverException("clearTextEntry failed!", e);
    } catch (InvocationTargetException e) {
      throw new WebDriverException("clearTextEntry failed!", e);
    }
  }
  
  /**
   * Sends key strokes to the given text to the element in focus within the webview.
   * 
   * Note: This assumes that the focus has been set before on the element at sake.
   * 
   * @param webview
   * @param text
   */
  public static void sendKeys(WebView webview, CharSequence... text) {
    LinkedList<KeyEvent> keyEvents = Lists.newLinkedList();
    KeyCharacterMap characterMap = KeyCharacterMap.load(KeyCharacterMap.BUILT_IN_KEYBOARD);
    moveCursorToRightMostPosition(text[0].toString(), webview);
    CharSequence[] inputText = getInputText(text);
    for (CharSequence sequence : inputText) {
      for (int i = 0; i < sequence.length(); i++) {
        char c = sequence.charAt(i);
        int code = AndroidKeys.getKeyEventFromUnicodeKey(c);
        if (code != -1) { 
          keyEvents.addLast(new KeyEvent(KeyEvent.ACTION_DOWN, code));
          keyEvents.addLast(new KeyEvent(KeyEvent.ACTION_UP, code));
        } else {
          keyEvents.addAll(Arrays.asList(
              characterMap.getEvents(new char[]{c})));
        }
      }
    }
    dispatchEvents(webview, keyEvents);
  }
  
  /**
   * Dispatches the events from the queue to the webview.
   * 
   * @param webview
   * @param keyEvents the list of events to send to the webview
   */
  private static void dispatchEvents(WebView webview, List<KeyEvent> keyEvents) {
    if (Platform.sdk() <= Platform.DONUT) {
      webview.pauseTimers();
    }
    try {
      for (KeyEvent event : keyEvents) {
        webview.dispatchKeyEvent(event);
      }
    } finally {
      if (Platform.sdk() <= Platform.DONUT) {
        webview.resumeTimers();
      }
    }
  }

  /**
   * @param text
   * @return the text to enter in the editable text area.
   */
  private static CharSequence[] getInputText(CharSequence... text) {
    CharSequence[] inputText = new CharSequence[text.length -1];
    for (int i = 0; i < text.length -1; i++) {
      inputText[i] = text[i + 1];
    }
    
    return inputText;
  }

  /**
   * Add KeyEvents to the queue to move the cursor to the rightmost position in the text area.
   * 
   * @param textAreaValue the already present in the editable area
   * @param webview the current webview
   */
  private static void moveCursorToRightMostPosition(String textAreaValue, WebView webview) {
    List<KeyEvent> events = Lists.newArrayListWithExpectedSize(2);
    long downTime = SystemClock.uptimeMillis();
    events.add(new KeyEvent(downTime, SystemClock.uptimeMillis(), KeyEvent.ACTION_DOWN,
        KeyEvent.KEYCODE_DPAD_RIGHT, 0));
    events.add(new KeyEvent(downTime, SystemClock.uptimeMillis(), KeyEvent.ACTION_UP,
        KeyEvent.KEYCODE_DPAD_RIGHT, textAreaValue.length()));
    dispatchEvents(webview, events);
  }
}
