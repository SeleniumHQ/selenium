/*
Copyright 2011 WebDriver committers

Copyright 2011 Google Inc.

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

package org.openqa.selenium.android;

import com.google.common.collect.Lists;

import android.os.SystemClock;
import android.view.MotionEvent;

import org.openqa.selenium.Point;
import org.openqa.selenium.TouchScreen;
import org.openqa.selenium.android.app.WebDriverWebView;
import org.openqa.selenium.interactions.internal.Coordinates;

import java.util.List;

/**
 * Implements touch capabilities of a device.
 *
 */
public class AndroidTouchScreen implements TouchScreen {

  private final ActivityController controller;
  private final AndroidDriver driver;

  public AndroidTouchScreen(AndroidDriver driver) {
    this.controller = ActivityController.getInstance();
    this.driver = driver;
  }

  public void singleTap(Coordinates where) {
    scrollElementInView(where);
    Point toTap = where.getLocationOnScreen();
    List<MotionEvent> motionEvents = Lists.newArrayList();
    long downTime = SystemClock.uptimeMillis();
    motionEvents.add(getMotionEvent(downTime, downTime, MotionEvent.ACTION_DOWN, toTap));
    motionEvents.add(getMotionEvent(downTime, downTime, MotionEvent.ACTION_UP, toTap));
    sendMotionEvents(motionEvents);
  }

  public void down(int x, int y) {
    List<MotionEvent> event = Lists.newArrayList();
    long downTime = SystemClock.uptimeMillis();
    Point coords = new Point(x, y);
    event.add(getMotionEvent(downTime, downTime, MotionEvent.ACTION_DOWN, coords));
    sendMotionEvents(event);
  }

  public void up(int x, int y) {
    List<MotionEvent> event = Lists.newArrayList();
    long downTime = SystemClock.uptimeMillis();
    Point coords = new Point(x, y);
    event.add(getMotionEvent(downTime, downTime, MotionEvent.ACTION_UP, coords));
    sendMotionEvents(event);
  }

  public void move(int x, int y) {
    List<MotionEvent> event = Lists.newArrayList();
    long downTime = SystemClock.uptimeMillis();
    Point coords = new Point(x, y);
    event.add(getMotionEvent(downTime, downTime, MotionEvent.ACTION_MOVE, coords));
    sendMotionEvents(event);
  }

  private MotionEvent getMotionEvent(long start, long eventTime, int action, Point coords) {
    return MotionEvent.obtain(start, eventTime, action, coords.x, coords.y, 0);
  }

  private void scrollElementInView(Coordinates where) {
    driver.getDomAccessor().scrollIfNeeded((String)where.getAuxiliry());
  }

  private void sendMotionEvents(List<MotionEvent> eventsToSend) {
    WebDriverWebView.resetEditableAreaHasFocus();
    controller.sendMotionEvent(eventsToSend);
    // If the page started loading we should wait until the page is done loading.
    controller.blockIfPageIsLoading(driver);
  }
}