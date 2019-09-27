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

using namespace std;

guint32 gLatestEventTime = 0;

// This is the timestamp needed in the GDK events.
guint32 TimeSinceBootMsec()
{
    struct timespec clk_tm;
    const int msec_nsec_factor = 1000000;
    const int sec_msec_factor = 1000;

    int clk_ret = clock_gettime(CLOCK_MONOTONIC, &clk_tm);
    if (clk_ret == 0)
    {
      return (clk_tm.tv_sec * sec_msec_factor +
              (clk_tm.tv_nsec / msec_nsec_factor));
    }
    return 0;
}

void sleep_for_ms(int sleep_time_ms)
{
  struct timespec sleep_time;
  sleep_time.tv_sec = sleep_time_ms / 1000;
  sleep_time.tv_nsec = (sleep_time_ms % 1000) * 1000000;
  nanosleep(&sleep_time, NULL);
}

bool is_gdk_keyboard_event(GdkEvent* ev)
{
  return ((ev->type == GDK_KEY_PRESS) || (ev->type == GDK_KEY_RELEASE));
}

bool is_gdk_mouse_event(GdkEvent* ev)
{
  return ((ev->type == GDK_BUTTON_PRESS) || (ev->type == GDK_BUTTON_RELEASE) ||
          (ev->type == GDK_MOTION_NOTIFY) || (ev->type == GDK_2BUTTON_PRESS));
}

bool event_earlier_than(GdkEvent* ev, guint32 compare_time)
{
  assert(is_gdk_keyboard_event(ev) || is_gdk_mouse_event(ev));
  return (ev->key.time <= compare_time);
}

void print_key_event(GdkEvent* p_ev)
{
  if (!((p_ev->type == GDK_KEY_PRESS) || (p_ev->type == GDK_KEY_RELEASE))) {
    LOG(DEBUG) << "Not a key event.";
    return;
  }
  const gchar* gdk_name = gdk_keyval_name(p_ev->key.keyval);
  const char* kNameUnknown = "UNKNOWN";
  const char* print_name = (gdk_name != NULL ? gdk_name : kNameUnknown);

  std::string ev_type = (p_ev->type == GDK_KEY_PRESS ? "press" : "release");
  LOG(DEBUG) << "Type: " << ev_type <<  "Key code: " << p_ev->key.keyval <<
             " (" << print_name << ") time: " <<
             p_ev->key.time << " state: " << p_ev->key.state << " hw keycode: "
             << (int) p_ev->key.hardware_keycode << " ";
}

bool additional_events_to_wait_for(GdkEvent* p_event)
{
  return ((p_event->type == GDK_LEAVE_NOTIFY) ||
          (p_event->type == GDK_ENTER_NOTIFY));

}

void init_logging()
{
#ifdef INTERACTIONS_DEBUG
  static bool log_initalized = false;
  if (!log_initalized) {
    LOG::Level("DEBUG");
    LOG::File(INTERACTIONS_LOG_FILE, "a");
    log_initalized = true;
  }
#endif
}

extern "C"
{
bool pending_input_events()
{
  LOG(DEBUG) << "Waiting for all events to be processed. Latest: " << gLatestEventTime;
  GdkEvent* lastEvent = gdk_event_peek();
  LOG(DEBUG) << "Got event: " <<
             (lastEvent != NULL ? lastEvent->type : 0);
  if ((lastEvent != NULL) && is_gdk_keyboard_event(lastEvent)) {
    print_key_event(lastEvent);
  }

  bool ret_val = false;
  if (lastEvent != NULL &&
      (((is_gdk_keyboard_event(lastEvent) || is_gdk_mouse_event(lastEvent)) &&
      event_earlier_than(lastEvent, gLatestEventTime))
       || (additional_events_to_wait_for(lastEvent)))) {
    ret_val = true;
  }

  if (lastEvent != NULL) {
    gdk_event_free(lastEvent);
  }
  LOG(DEBUG) << "Returning: " << ret_val;

  return ret_val;
}

// Does nothing on Linux
void stopPersistentEventFiring()
{
}

void setEnablePersistentHover(bool enablePersistentHover)
{
}

}
