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

import android.os.SystemClock;
import android.util.Log;
import android.view.KeyCharacterMap;
import android.view.KeyEvent;
import android.webkit.WebView;
import android.webkit.WebView.HitTestResult;

import com.google.common.collect.Lists;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.android.Platform;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.LinkedList;

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
    HitTestResult hitTestResult = webview.getHitTestResult();
    // Ensure this is an edit text area
    if (HitTestResult.EDIT_TEXT_TYPE == hitTestResult.getType()) {
      LinkedList<KeyEvent> eventsQueue = Lists.newLinkedList();
      KeyCharacterMap characterMap = KeyCharacterMap.load(KeyCharacterMap.BUILT_IN_KEYBOARD);
      queueEventsToMoveCursorToRightmostPos(eventsQueue, text[0].toString());
      CharSequence[] inputText = getInputText(text);
      for (CharSequence sequence : inputText) {
        for (int i = 0; i < sequence.length(); i++) {
          char c = sequence.charAt(i);
          int code = AndroidKeys.getKeyEventFromUnicodeKey(c);
          if (code != -1) { 
            long downTime = SystemClock.uptimeMillis();
            eventsQueue.addLast(new KeyEvent(downTime, SystemClock.uptimeMillis(),
                KeyEvent.ACTION_DOWN, code, 0, 0, 0, 0, KeyEvent.FLAG_FROM_SYSTEM));
            eventsQueue.addLast(new KeyEvent(downTime, SystemClock.uptimeMillis(),
                KeyEvent.ACTION_UP, code, 0, 0, 0, 0, KeyEvent.FLAG_FROM_SYSTEM));
          } else {
            eventsQueue.addAll(Arrays.asList(
                characterMap.getEvents(new char[]{c})));
          }
        }
      }
      dispatchEvents(webview, eventsQueue);
    }
  }

  /**
   * Dispatches the events from the queue to the webview.
   * 
   * @param webview
   * @param eventsQueue
   */
  private static void dispatchEvents(WebView webview, LinkedList<KeyEvent> eventsQueue) {
    if (Platform.sdk() <= Platform.DONUT) {
      webview.pauseTimers();
    }
    try {
      for (KeyEvent event : eventsQueue) {
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
    CharSequence[] inputText = new String[text.length -1];
    for (int i = 0; i < text.length -1; i++) {
      inputText[i] = text[i + 1];
    }
    return inputText;
  }

  /**
   * Add KeyEvents to the queue to move the cursor to the rightmost position in the text area.
   * 
   * @param eventsQueue the queue
   * @param textAreaValue the already present in the editable area
   */
  private static void queueEventsToMoveCursorToRightmostPos(LinkedList<KeyEvent> eventsQueue,
      String textAreaValue) {
    if (textAreaValue != null && textAreaValue.length() > 0) {
      long downTime = SystemClock.uptimeMillis();
      eventsQueue.addLast(new KeyEvent(downTime, SystemClock.uptimeMillis(),
        KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_DPAD_RIGHT, 0, 0, 0, 0, KeyEvent.FLAG_FROM_SYSTEM));
      eventsQueue.addLast(new KeyEvent(downTime, SystemClock.uptimeMillis(),
        KeyEvent.ACTION_UP, KeyEvent.KEYCODE_DPAD_RIGHT, 0, 0, 0, 0, KeyEvent.FLAG_FROM_SYSTEM));
    }
  }
}
