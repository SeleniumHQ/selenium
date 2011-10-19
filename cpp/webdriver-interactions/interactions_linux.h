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

#ifndef _INTERACTIONS_LINUX_H_
#define _INTERACTIONS_LINUX_H_

#include <gdk/gdk.h>

#define INTERACTIONS_DEBUG
#define INTERACTIONS_LOG_FILE "/tmp/native_ff_events_log"

guint32 TimeSinceBootMsec();
void sleep_for_ms(int sleep_time_ms);

bool event_earlier_than(GdkEvent* ev, guint32 compare_time);
bool is_gdk_keyboard_event(GdkEvent* ev);
bool is_gdk_mouse_event(GdkEvent* ev);
void print_key_event(GdkEvent* p_ev);

void init_logging();
extern guint32 gModifiersState;

extern "C"
{
bool pending_input_events();
extern guint32 gLatestEventTime;

}

#endif  // _INTERACTIONS_LINUX_H_
