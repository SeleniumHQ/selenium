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

#ifndef WEBDRIVER_IE_PERSISTENTEVENTSIMULATOR_H_
#define WEBDRIVER_IE_PERSISTENTEVENTSIMULATOR_H_

namespace webdriver {

class PersistentEventSimulator {
 public:
  PersistentEventSimulator(void);
  virtual ~PersistentEventSimulator(void);

  void StartPersistentEventFiring(HWND inputTo, long toX, long toY, WPARAM buttonValue);
  void StopPersistentEventFiring();

  static DWORD WINAPI MouseEventFiringFunction(LPVOID lpParam);

  bool is_firing_events(void) const { return this->is_firing_events_; }
  void set_is_firing_events(const bool value) { this->is_firing_events_ = value; }

  bool is_running(void) const { return this->is_running_; }
  void set_is_running(const bool value) { this->is_running_ = value; }

  HWND target_window_handle(void) const { return this->target_window_handle_; }
  long x_coordinate(void) const { return this->x_coordinate_; }
  long y_coordinate(void) const { return this->y_coordinate_; }
  WPARAM button_state(void) const { return this->button_state_; }

 private:
  bool is_firing_events_;
  bool is_running_;
  HWND target_window_handle_;
  long x_coordinate_;
  long y_coordinate_;
  WPARAM button_state_;

  PersistentEventSimulator* persistent_event_simulator_;
  HANDLE event_firing_thread_handle_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_PERSISTENTEVENTSIMULATOR_H_
