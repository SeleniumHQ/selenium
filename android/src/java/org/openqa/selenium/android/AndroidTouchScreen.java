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

  public void scroll(Coordinates where, int xOffset, int yOffset) {
    long downTime = SystemClock.uptimeMillis();
    List<MotionEvent> motionEvents = Lists.newArrayList();
    Point origin = where.getLocationOnScreen();
    Point destination = new Point(origin.x + xOffset, origin.y + yOffset);
    motionEvents.add(getMotionEvent(downTime, downTime, MotionEvent.ACTION_DOWN, origin));

    Scroll scroll = new Scroll(origin, destination, downTime);
    // Initial acceleration from origin to reference point
    motionEvents.addAll(getMoveEvents(downTime, downTime, origin, scroll.getDecelerationPoint(),
        scroll.INITIAL_STEPS, scroll.TIME_BETWEEN_EVENTS));
    // Deceleration phase from reference point to destination
    motionEvents.addAll(getMoveEvents(downTime, scroll.getEventTimeForReferencePoint(),
        scroll.getDecelerationPoint(), destination, scroll.DECELERATION_STEPS,
        scroll.TIME_BETWEEN_EVENTS));

    motionEvents.add(getMotionEvent(downTime, (downTime + scroll.getEventTimeForDestinationPoint()),
        MotionEvent.ACTION_UP, destination));
    sendMotionEvents(motionEvents);
  }

  public void doubleTap(Coordinates where) {
    scrollElementInView(where);
    Point toDoubleTap = where.getLocationOnScreen();
    List<MotionEvent> motionEvents = Lists.newArrayList();
    long downTime = SystemClock.uptimeMillis();
    motionEvents.add(getMotionEvent(downTime, downTime, MotionEvent.ACTION_DOWN, toDoubleTap));
    motionEvents.add(getMotionEvent(downTime, downTime, MotionEvent.ACTION_UP, toDoubleTap));
    motionEvents.add(getMotionEvent(downTime, downTime, MotionEvent.ACTION_DOWN, toDoubleTap));
    motionEvents.add(getMotionEvent(downTime, downTime, MotionEvent.ACTION_UP, toDoubleTap));
    sendMotionEvents(motionEvents);
  }

  private MotionEvent getMotionEvent(long start, long eventTime, int action, Point coords) {
    return MotionEvent.obtain(start, eventTime, action, coords.x, coords.y, 0);
  }

  private List<MotionEvent> getMoveEvents(long downTime, long startingEVentTime, Point origin,
    Point destination, int steps, long timeBetweenEvents) {
    List<MotionEvent> move = Lists.newArrayList();
    MotionEvent event = null;

    float xStep = (destination.x - origin.x) / steps;
    float yStep = (destination.y - origin.y) / steps;
    float x = origin.x;
    float y = origin.y;
    long eventTime = startingEVentTime;

    for (int i = 0; i < steps - 1; i++) {
      x += xStep;
      y += yStep;
      eventTime += timeBetweenEvents;
      event = MotionEvent.obtain(downTime, eventTime, MotionEvent.ACTION_MOVE, x, y, 0);
      move.add(event);
    }

    eventTime += timeBetweenEvents;
    move.add(getMotionEvent(downTime, eventTime, MotionEvent.ACTION_MOVE, destination));
    return move;
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

  final class Scroll {

    private Point origin;
    private Point destination;
    private long downTime;
    // A regular scroll usually has 15 gestures, where the last 5 are used for deceleration
    final static int INITIAL_STEPS = 10;
    final static int DECELERATION_STEPS = 5;
    final int TOTAL_STEPS = INITIAL_STEPS + DECELERATION_STEPS;
    // Time in milliseconds to provide a speed similar to scroll
    final long TIME_BETWEEN_EVENTS = 50;

    public Scroll(Point origin, Point destination, long downTime) {
      this.origin = origin;
      this.destination = destination;
      this.downTime = downTime;
    }

    // This method is used to calculate the point where the deceleration will start at 20% of the
    // distance to the destination point
    private Point getDecelerationPoint() {
      int deltaX = (destination.x - origin.x);
      int deltaY = (destination.y - origin.y);
      // Coordinates of reference point where deceleration should start for scroll gesture, on the
      // last 20% of the total distance to scroll
      int xRef = (int)(deltaX * 0.8);
      int yRef = (int)(deltaY * 0.8);
      return new Point(origin.x + xRef, origin.y + yRef);
    }

    private long getEventTimeForReferencePoint() {
      return (downTime + INITIAL_STEPS * TIME_BETWEEN_EVENTS);
    }

    private long getEventTimeForDestinationPoint() {
      return (downTime + TOTAL_STEPS * TIME_BETWEEN_EVENTS);
    }
  }
}