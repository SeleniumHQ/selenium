// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "PersistentEventSimulator.h"

#define THREAD_TERMINATION_WAIT_TIME_IN_MILLISECONDS 2500
#define THREAD_SLEEP_TIME_IN_MILLISECONDS 10

namespace webdriver {

PersistentEventSimulator::PersistentEventSimulator() {
  this->target_window_handle_ = NULL;
  this->x_coordinate_ = 0;
  this->y_coordinate_ = 0;
  this->button_state_ = 0;
  this->event_firing_thread_handle_ = NULL;
  this->is_firing_events_ = false;
}

PersistentEventSimulator::~PersistentEventSimulator() {
  if (this->event_firing_thread_handle_ != NULL) {
    this->is_running_ = false;
    ::WaitForSingleObject(this->event_firing_thread_handle_,
                          THREAD_TERMINATION_WAIT_TIME_IN_MILLISECONDS);
    ::CloseHandle(this->event_firing_thread_handle_);
    this->event_firing_thread_handle_ = NULL;
  }
}

DWORD WINAPI PersistentEventSimulator::MouseEventFiringFunction(LPVOID lpParam) {
  PersistentEventSimulator* persistent_event_simulator;

  persistent_event_simulator = reinterpret_cast<PersistentEventSimulator*>(lpParam);
  // busy-wait loop, waiting for 10 milliseconds between
  // dispatching events. Since the thread is usually
  // paused for short periods of time (tens of milliseconds),
  // a more modern signalling method was not used.
  while (persistent_event_simulator->is_running()) {
    if (persistent_event_simulator->is_firing_events()) {
      HWND target = persistent_event_simulator->target_window_handle();
      if (::IsWindow(target)) {
        ::SendMessage(target,
                      WM_MOUSEMOVE,
                      persistent_event_simulator->button_state(),
                      MAKELPARAM(persistent_event_simulator->x_coordinate(),
                                 persistent_event_simulator->y_coordinate()));
      }
    }
    ::Sleep(THREAD_SLEEP_TIME_IN_MILLISECONDS);
  }

  return 0;
}

void PersistentEventSimulator::StartPersistentEventFiring(HWND inputTo, long toX, long toY, WPARAM buttonValue) {
  this->target_window_handle_ = inputTo;
  this->x_coordinate_ = toX;
  this->y_coordinate_ = toY;
  this->button_state_ = buttonValue;
  if (this->event_firing_thread_handle_ == NULL) {
    this->is_running_ = true;
    this->event_firing_thread_handle_ = CreateThread(NULL, // Security permissions.
                                                     0, // default stack size.
                                                     MouseEventFiringFunction,
                                                     reinterpret_cast<LPVOID>(this),
                                                     0, // default creation flags
                                                     NULL);
  }
  this->is_firing_events_ = true;
}

void PersistentEventSimulator::StopPersistentEventFiring() {
  if (this->event_firing_thread_handle_ != NULL) {
    this->is_firing_events_ = false;
    ::Sleep(THREAD_SLEEP_TIME_IN_MILLISECONDS);
  }
}

} // namespace webdriver
