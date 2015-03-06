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

#include <ctime>
#include <string>
#include <iostream>
#include <fstream>

#include "interactions.h"

#include "logging.h"

#include <gdk/gdk.h>
#include <gdk/gdkkeysyms.h>
#include <X11/Xlib.h>
#include <time.h>
#include <stdlib.h>
#include <assert.h>
#include <list>
#include <algorithm>
#include <functional>

#include "translate_keycode_linux.h"
#include "interactions_linux.h"
#include "interactions_common.h"

using namespace std;

enum MouseEventType { bMousePress, bMouseRelease, bMouse2ButtonPress };
// This class handles generation of mouse press / release events.
class MouseEventsHandler
{
public:
  MouseEventsHandler(GdkDrawable* win_handle);
  virtual ~MouseEventsHandler();

  // Creates a series of mouse events (i.e mouse up/down)
  list<GdkEvent*> CreateEventsForMouseMove(long x, long y);
  list<GdkEvent*> CreateEventsForMouseClick(long x, long y, long button);
  list<GdkEvent*> CreateEventsForMouseDoubleClick(long x, long y);
  list<GdkEvent*> CreateEventsForMouseDown(long x, long y, long button);
  list<GdkEvent*> CreateEventsForMouseUp(long x, long y, long button);
  // Returns the time of the latest event.
  guint32 get_last_event_time();

private:
  // Create mouse move event
  GdkEvent* CreateMouseMotionEvent(long x, long y);
  
  // Create mouse button event (up/down)
  GdkEvent* CreateMouseButtonEvent(MouseEventType ev_type, long x, long y, long button);

  // The window handle to be used.
  GdkDrawable* win_handle_;
  // Time of the most recent event created.
  guint32 last_event_time_;
};

MouseEventsHandler::MouseEventsHandler(GdkDrawable* win_handle) :
  win_handle_(win_handle), last_event_time_(TimeSinceBootMsec())
{
}

guint32 MouseEventsHandler::get_last_event_time()
{
  return last_event_time_;
}

GdkDevice* getSomeDevice()
{
  GList *pList = gdk_devices_list();
  GList *currNode = pList;
  GdkDevice *currDevice = NULL;
  while ((currNode != NULL) && (currDevice == NULL)) {
    currDevice = (GdkDevice*) currNode->data;
    currNode = currNode->next;
  }

  return (GdkDevice*) g_object_ref(currDevice);
}

GdkEvent* MouseEventsHandler::CreateMouseMotionEvent(long x, long y)
{
    GdkEvent* p_ev = gdk_event_new(GDK_MOTION_NOTIFY);
    p_ev->motion.window = GDK_WINDOW(g_object_ref(win_handle_));
    p_ev->motion.send_event = 0; // NOT a synthesized event.
    p_ev->motion.time = TimeSinceBootMsec();
    p_ev->motion.x = x;
    p_ev->motion.y = y;
    p_ev->motion.axes = NULL;
    p_ev->motion.is_hint = 0;
    // It is necessary to provide a device. any device.
    p_ev->motion.device = getSomeDevice();
    p_ev->motion.state = gModifiersState;

    // Also update the latest event time
    last_event_time_ = p_ev->motion.time;
    return p_ev;
}


GdkEvent* MouseEventsHandler::CreateMouseButtonEvent(MouseEventType ev_type, long x, long y, long button)
{
    GdkEventType gdk_ev = GDK_BUTTON_PRESS;
    if (ev_type == bMouseRelease) {
      gdk_ev = GDK_BUTTON_RELEASE;
    } else if (ev_type == bMouse2ButtonPress) {
      gdk_ev = GDK_2BUTTON_PRESS;
    }
    GdkEvent* p_ev = gdk_event_new(gdk_ev);
    p_ev->button.window = GDK_WINDOW(g_object_ref(win_handle_));
    p_ev->button.send_event = 0; // NOT a synthesized event.
    p_ev->button.time = TimeSinceBootMsec();
    p_ev->button.x = x;
    p_ev->button.y = y;
    p_ev->button.button = button;
    p_ev->button.device = getSomeDevice();
    p_ev->button.state = gModifiersState;

    // Also update the latest event time
    last_event_time_ = p_ev->motion.time;
    return p_ev;
}


list<GdkEvent*> MouseEventsHandler::CreateEventsForMouseDown(long x, long y, long button)
{
  GdkEvent* down = CreateMouseButtonEvent(bMousePress, x, y, button);
  list<GdkEvent*> ret_list;
  ret_list.push_back(down);
  return ret_list;
}


list<GdkEvent*> MouseEventsHandler::CreateEventsForMouseUp(long x, long y, long button)
{
  GdkEvent* up = CreateMouseButtonEvent(bMouseRelease, x, y, button);
  list<GdkEvent*> ret_list;
  ret_list.push_back(up);
  return ret_list;
}

list<GdkEvent*> MouseEventsHandler::CreateEventsForMouseDoubleClick(long x, long y)
{
  // double click is only possible with the left mouse button
  const int leftMouseButton = 1;
  list<GdkEvent*> ret_list;
  ret_list.push_back(CreateMouseButtonEvent(bMousePress, x, y, leftMouseButton));
  ret_list.push_back(CreateMouseButtonEvent(bMouseRelease, x, y, leftMouseButton));
  ret_list.push_back(CreateMouseButtonEvent(bMousePress, x, y, leftMouseButton));
  ret_list.push_back(CreateMouseButtonEvent(bMouse2ButtonPress, x, y, leftMouseButton));
  ret_list.push_back(CreateMouseButtonEvent(bMouseRelease, x, y, leftMouseButton));
  return ret_list;
}

list<GdkEvent*> MouseEventsHandler::CreateEventsForMouseClick(long x, long y, long button)
{
  GdkEvent* down = CreateMouseButtonEvent(bMousePress, x, y, button);
  GdkEvent* up = CreateMouseButtonEvent(bMouseRelease, x, y, button);

  list<GdkEvent*> ret_list;
  ret_list.push_back(down);
  ret_list.push_back(up);
  return ret_list;
}

list<GdkEvent*> MouseEventsHandler::CreateEventsForMouseMove(long x, long y)
{
  GdkEvent* move = CreateMouseMotionEvent(x, y);
  list<GdkEvent*> ret_list;
  ret_list.push_back(move);
  return ret_list;
}

MouseEventsHandler::~MouseEventsHandler()
{
}

static void submit_and_free_event(GdkEvent* p_mouse_event, int sleep_time_ms)
{
  gdk_event_put(p_mouse_event);
  GdkDevice* usedDevice = NULL;
  if (p_mouse_event->type == GDK_MOTION_NOTIFY) {
    usedDevice = p_mouse_event->motion.device;
  } else {
    usedDevice = p_mouse_event->button.device;
  }
  g_object_unref(usedDevice);
  gdk_event_free(p_mouse_event);
  sleep_for_ms(sleep_time_ms);
}

static void print_mouse_event(GdkEvent* p_ev)
{
  if (!((p_ev->type == GDK_BUTTON_PRESS) || (p_ev->type == GDK_BUTTON_RELEASE)
        || (p_ev->type == GDK_MOTION_NOTIFY) || p_ev->type == GDK_2BUTTON_PRESS)) {
    LOG(DEBUG) << "Not a mouse event.";
    return;
  }

  std::string ev_type;
  if (p_ev->type == GDK_BUTTON_PRESS) {
    ev_type = "press";
  };

  if (p_ev->type == GDK_BUTTON_RELEASE) {
    ev_type = "release";
  };

  if (p_ev->type == GDK_MOTION_NOTIFY) {
    ev_type = "motion";
  };

  if (p_ev->type == GDK_2BUTTON_PRESS) {
    ev_type = "2press";
  };
  LOG(DEBUG) << "Type: " << ev_type <<  " time: " <<
             p_ev->key.time;
}

static void submit_and_free_events_list(list<GdkEvent*>& events_list,
                                        int sleep_time_ms)
{
    for_each(events_list.begin(), events_list.end(), print_mouse_event);

    for_each(events_list.begin(), events_list.end(),
             bind2nd(ptr_fun(submit_and_free_event), sleep_time_ms));

    events_list.clear();
}

extern "C"
{
WD_RESULT clickAt(WINDOW_HANDLE windowHandle, long x, long y, long button)
{
  init_logging();

  LOG(DEBUG) << "---------- starting clickAt: " << windowHandle <<  "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  if (button == 2) {
    // the right mouse button has the value 3 in GDK
    button = 3;
  } else {
    // the left mouse button is default
    button = 1;
  }

  MouseEventsHandler mousep_handler(hwnd);

  list<GdkEvent*> events_for_mouse = mousep_handler.CreateEventsForMouseClick(x, y, button);
  const int timePerEvent = 10 /* ms */;
  submit_and_free_events_list(events_for_mouse, timePerEvent);


  if (gLatestEventTime < mousep_handler.get_last_event_time()) {
    gLatestEventTime = mousep_handler.get_last_event_time();
  }

  LOG(DEBUG) << "---------- Ending clickAt ----------";
  return 0;
}

WD_RESULT doubleClickAt(WINDOW_HANDLE windowHandle, long x, long y)
{
  init_logging();

  LOG(DEBUG) << "---------- starting doubleClickAt: " << windowHandle <<  "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  MouseEventsHandler mousep_handler(hwnd);

  const int timePerEvent = 10 /* ms */;
  list<GdkEvent*> events_for_mouse = mousep_handler.CreateEventsForMouseDoubleClick(x, y);
  submit_and_free_events_list(events_for_mouse, timePerEvent);

  if (gLatestEventTime < mousep_handler.get_last_event_time()) {
    gLatestEventTime = mousep_handler.get_last_event_time();
  }

  LOG(DEBUG) << "---------- Ending doubleClickAt ----------";
  return 0;
}

/**
 * mouseMoveTo
 */
WD_RESULT mouseMoveTo(WINDOW_HANDLE windowHandle, long duration, long fromX, long fromY, long toX, long toY)
{
  init_logging();
  const int timePerEvent = 10 /* ms */;

  LOG(DEBUG) << "---------- starting mouseMoveTo: " << windowHandle <<  "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  MouseEventsHandler mousep_handler(hwnd);

  long pointsDistance = distanceBetweenPoints(fromX, fromY, toX, toY);
  const int stepSizeInPixels = 5;
  int steps = pointsDistance / stepSizeInPixels;

  // If the distance between the points is less than stepSizeInPixels,
  // make sure enough move events aregenerated.
  // * If the start and finish points are the same, one step is needed.
  // Otherwise, generate at least 2 move events: one one the start
  // point and the other on the end point.
  if ((fromX == toX) && (fromY == toY)) {
    steps = 1;
  } else {
    steps = max(steps, 2);
  }

  assert(steps > 0);
  LOG(DEBUG) << "From: (" << fromX << ", " << fromY << ") to: (" << toX << ", " << toY << ")";
  LOG(DEBUG) << "Distance: " << pointsDistance << " steps: " << steps;

  for (int i = 0; i < steps; ++i) {
    // To avoid integer division rounding and cumulative floating point errors,
    // calculate from scratch each time. We adjust the divider to steps - 1
    // to get a move event generated on the exact starting point as well
    // as the end point.
    int div_by = max(steps - 1, 1);
    int currentX = fromX + ((toX - fromX) * ((double)i) / div_by);
    int currentY = fromY + ((toY - fromY) * ((double)i) / div_by);
    LOG(DEBUG) << "Moving to: (" << currentX << ", " << currentY << ")";
    list<GdkEvent*> events_for_mouse = mousep_handler.CreateEventsForMouseMove(currentX, currentY);
    submit_and_free_events_list(events_for_mouse, timePerEvent);
  }



  if (gLatestEventTime < mousep_handler.get_last_event_time()) {
    gLatestEventTime = mousep_handler.get_last_event_time();
  }

  LOG(DEBUG) << "---------- Ending mouseMoveTo ----------";
  return 0;
}

/**
 * mouseDownAt
 */
WD_RESULT mouseDownAt(WINDOW_HANDLE windowHandle, long x, long y, long button)
{
  init_logging();

  const int timePerEvent = 10 /* ms */;

  LOG(DEBUG) << "---------- starting mouseDownAt: " << windowHandle <<  "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  MouseEventsHandler mousep_handler(hwnd);

  struct timespec sleep_time;
  sleep_time.tv_sec = timePerEvent / 1000;
  sleep_time.tv_nsec = (timePerEvent % 1000) * 1000000;
  LOG(DEBUG) << "Sleep time is " << sleep_time.tv_sec << " seconds and " <<
            sleep_time.tv_nsec << " nanoseconds.";

  list<GdkEvent*> events_for_mouse = mousep_handler.CreateEventsForMouseDown(x, y, button);
  submit_and_free_events_list(events_for_mouse, timePerEvent);


  if (gLatestEventTime < mousep_handler.get_last_event_time()) {
    gLatestEventTime = mousep_handler.get_last_event_time();
  }

  LOG(DEBUG) << "---------- Ending mouseDownAt ----------";
  return 0;
}

/**
 * mouseUpAt
 */
WD_RESULT mouseUpAt(WINDOW_HANDLE windowHandle, long x, long y, long button)
{
  init_logging();

  const int timePerEvent = 10 /* ms */;

  LOG(DEBUG) << "---------- starting mouseUpAt: " << windowHandle <<  "---------";
  GdkDrawable* hwnd = (GdkDrawable*) windowHandle;

  MouseEventsHandler mousep_handler(hwnd);

  struct timespec sleep_time;
  sleep_time.tv_sec = timePerEvent / 1000;
  sleep_time.tv_nsec = (timePerEvent % 1000) * 1000000;
  LOG(DEBUG) << "Sleep time is " << sleep_time.tv_sec << " seconds and " <<
            sleep_time.tv_nsec << " nanoseconds.";

  list<GdkEvent*> events_for_mouse = mousep_handler.CreateEventsForMouseUp(x, y, button);
  submit_and_free_events_list(events_for_mouse, timePerEvent);


  if (gLatestEventTime < mousep_handler.get_last_event_time()) {
    gLatestEventTime = mousep_handler.get_last_event_time();
  }

  LOG(DEBUG) << "---------- Ending mouseUpAt ----------";
  return 0;
}

bool pending_mouse_events()
{
  init_logging();
  LOG(DEBUG) << "Waiting for all events to be processed";
  GdkEvent* lastEvent = gdk_event_peek();
  LOG(DEBUG) << "Got event: " <<
             (lastEvent != NULL ? lastEvent->type : 0);

  bool ret_val = false;
  if (lastEvent != NULL && is_gdk_mouse_event(lastEvent) &&
         event_earlier_than(lastEvent, gLatestEventTime)) {
    ret_val = true;
  }

  if (lastEvent != NULL) {
    gdk_event_free(lastEvent);
  }
  LOG(DEBUG) << "Returning: " << ret_val;

  return ret_val;
}

} // extern C
