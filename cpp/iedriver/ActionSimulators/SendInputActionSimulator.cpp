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

#include "SendInputActionSimulator.h"

#include "errorcodes.h"
#include "logging.h"

#include "../DocumentHost.h"
#include "../HookProcessor.h"
#include "../messages.h"

#define WAIT_TIME_IN_MILLISECONDS_PER_INPUT_EVENT 100

namespace webdriver {


SendInputActionSimulator::SendInputActionSimulator() {
}

SendInputActionSimulator::~SendInputActionSimulator() {
}

int SendInputActionSimulator::SimulateActions(BrowserHandle browser_wrapper,
                                              std::vector<INPUT> inputs,
                                              InputState* input_state) {
  LOG(TRACE) << "Entering SendInputActionSimulator::SimulateActions";
  // SendInput simulates mouse and keyboard events at a very low level, so
  // low that there is no guarantee that IE will have processed the resulting
  // windows messages before this method returns. Therefore, we'll install
  // keyboard and mouse hooks that will count the number of Windows messages
  // processed by any application the system. There is a potential for this
  // code to be wrong if the user is interacting with the system via mouse and
  // keyboard during this process. Since this code path should only be hit if
  // the requireWindowFocus capability is turned on, and since SendInput is 
  // documented to not allow other input events to be interspersed into the
  // input queue, the risk is hopefully minimized.
  HookProcessor keyboard_hook;
  keyboard_hook.Initialize("KeyboardHookProc", WH_KEYBOARD);

  HookProcessor mouse_hook;
  mouse_hook.Initialize("MouseHookProc", WH_MOUSE);

  bool is_button_swapped = ::GetSystemMetrics(SM_SWAPBUTTON) != 0;

  HWND window_handle = browser_wrapper->GetContentWindowHandle();
  // Loop through all of the input items, and find all of the sleeps.
  std::vector<size_t> sleep_indexes;
  for (size_t i = 0; i < inputs.size(); ++i) {
    INPUT current_input = inputs[i];
    this->UpdateInputState(current_input, input_state);
    if (current_input.type == INPUT_HARDWARE && current_input.hi.uMsg > 0) {
      sleep_indexes.push_back(i);
    } else if (current_input.type == INPUT_MOUSE) {
      // We use the INPUT structure to store absolute pixel
      // coordinates for the SendMessage case, but SendInput
      // requires normalized coordinates.
      int normalized_x = 0, normalized_y = 0;
      this->GetNormalizedCoordinates(window_handle,
                                     current_input.mi.dx,
                                     current_input.mi.dy,
                                     &normalized_x,
                                     &normalized_y);
      current_input.mi.dx = normalized_x;
      current_input.mi.dy = normalized_y;

      // If the buttons are swapped on the mouse (most often referred to
      // as "left-handed"), where the right button is primary and the
      // left button is secondary, we need to swap those when using
      // SendInput.
      unsigned long normalized_flags = this->NormalizeButtons(is_button_swapped,
                                                              current_input.mi.dwFlags);
           
      current_input.mi.dwFlags = normalized_flags;
      inputs[i] = current_input;
    }
  }

  // Send all inputs between sleeps, sleeping in between.
  size_t next_input_index = 0;
  std::vector<size_t>::const_iterator it = sleep_indexes.begin();
  for (; it != sleep_indexes.end(); ++it) {
    size_t sleep_input_index = *it;
    INPUT sleep_input = inputs[sleep_input_index];
    size_t number_of_inputs = sleep_input_index - next_input_index;
    if (number_of_inputs > 0) {
      this->SendInputToBrowser(browser_wrapper,
                               inputs,
                               static_cast<int>(next_input_index),
                               static_cast<int>(number_of_inputs));
    }
    LOG(DEBUG) << "Processing pause event";
    ::Sleep(inputs[sleep_input_index].hi.uMsg);
    next_input_index = sleep_input_index + 1;
  }
  // Now send any inputs after the last sleep, if any.
  size_t last_inputs = inputs.size() - next_input_index;
  if (last_inputs > 0) {
    this->SendInputToBrowser(browser_wrapper,
                             inputs,
                             static_cast<int>(next_input_index),
                             static_cast<int>(last_inputs));
  }

  // We're done here, so uninstall the hooks, and reset the buffer size.
  keyboard_hook.Dispose();
  mouse_hook.Dispose();

  return WD_SUCCESS;
}

void SendInputActionSimulator::SendInputToBrowser(BrowserHandle browser_wrapper,
                                                  std::vector<INPUT> inputs,
                                                  int start_index,
                                                  int input_count) {
  if (input_count > 0) {
    bool focus_set = browser_wrapper->SetFocusToBrowser();
    if (!focus_set) {
      LOG(WARN) << "Focus not set to browser window";
    }
    HookProcessor::ResetEventCount();
    int sent_inputs = 0;
    for (int i = start_index; i < start_index + input_count; ++i) {
      ::SendInput(1, &inputs[i], sizeof(INPUT));
      sent_inputs += 1;
    }
    this->WaitForInputEventProcessing(sent_inputs);
  }
}

void SendInputActionSimulator::GetNormalizedCoordinates(HWND window_handle,
                                                        int x,
                                                        int y,
                                                        int* normalized_x,
                                                        int* normalized_y) {
  LOG(TRACE) << "Entering InputManager::GetNormalizedCoordinates";
  POINT cursor_position;
  cursor_position.x = x;
  cursor_position.y = y;
  ::ClientToScreen(window_handle, &cursor_position);

  int screen_width = ::GetSystemMetrics(SM_CXSCREEN) - 1;
  int screen_height = ::GetSystemMetrics(SM_CYSCREEN) - 1;
  *normalized_x = static_cast<int>(cursor_position.x * (65535.0f / screen_width));
  *normalized_y = static_cast<int>(cursor_position.y * (65535.0f / screen_height));
}

unsigned long SendInputActionSimulator::NormalizeButtons(bool is_button_swapped,
                                                         unsigned long input_flags) {
  unsigned long flags = input_flags;
  if (is_button_swapped) {
    if (flags & MOUSEEVENTF_LEFTDOWN) {
      flags &= ~(MOUSEEVENTF_LEFTDOWN);
      flags |= MOUSEEVENTF_RIGHTDOWN;
    }
    else if (flags & MOUSEEVENTF_LEFTUP) {
      flags &= ~(MOUSEEVENTF_LEFTUP);
      flags |= MOUSEEVENTF_RIGHTUP;
    }
    else if (flags & MOUSEEVENTF_RIGHTDOWN) {
      flags &= ~(MOUSEEVENTF_RIGHTDOWN);
      flags |= MOUSEEVENTF_LEFTDOWN;
    }
    else if (flags & MOUSEEVENTF_RIGHTUP) {
      flags &= ~(MOUSEEVENTF_RIGHTUP);
      flags |= MOUSEEVENTF_LEFTUP;
    }
  }
  return flags;
}

bool SendInputActionSimulator::WaitForInputEventProcessing(int input_count) {
  LOG(TRACE) << "Entering InputManager::WaitForInputEventProcessing";
  // Adaptive wait. The total wait time is the number of input messages
  // expected by the hook multiplied by a static wait time for each
  // message to be processed (currently 100 milliseconds). We should
  // exit out of this loop once the number of processed windows keyboard
  // or mouse messages processed by the system exceeds the number of
  // input events created by the call to SendInput.
  int total_timeout_in_milliseconds = input_count * WAIT_TIME_IN_MILLISECONDS_PER_INPUT_EVENT;
  clock_t end = clock() + static_cast<clock_t>(((total_timeout_in_milliseconds / 1000.0) * CLOCKS_PER_SEC));

  int processed_event_count = HookProcessor::GetEventCount();
  bool inputs_processed = processed_event_count >= input_count;
  while (!inputs_processed && clock() < end) {
    // Sleep a short amount of time to prevent starving the processor.
    ::Sleep(25);
    processed_event_count = HookProcessor::GetEventCount();
    inputs_processed = processed_event_count >= input_count;
  }
  LOG(DEBUG) << "Requested waiting for " << input_count
             << " events, processed " << processed_event_count << " events,"
             << " timed out after " << total_timeout_in_milliseconds
             << " milliseconds";
  return inputs_processed;
}

} // namespace webdriver

#ifdef __cplusplus
extern "C" {
#endif

LRESULT CALLBACK KeyboardHookProc(int nCode, WPARAM wParam, LPARAM lParam) {
  if (nCode == HC_ACTION) {
    webdriver::HookProcessor::IncrementEventCount(1);
  }
  return ::CallNextHookEx(NULL, nCode, wParam, lParam);
}

LRESULT CALLBACK MouseHookProc(int nCode, WPARAM wParam, LPARAM lParam) {
  if (nCode == HC_ACTION) {
    webdriver::HookProcessor::IncrementEventCount(1);
  }
  return ::CallNextHookEx(NULL, nCode, wParam, lParam);
}

#ifdef __cplusplus
}
#endif
