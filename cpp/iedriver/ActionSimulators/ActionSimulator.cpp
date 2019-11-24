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

#include "ActionSimulator.h"

namespace webdriver {

ActionSimulator::ActionSimulator() {
}

ActionSimulator::~ActionSimulator() {
}


void ActionSimulator::UpdateInputState(INPUT current_input,
                                       InputState* input_state) {
  if (current_input.type == INPUT_MOUSE) {
    if (current_input.mi.dwFlags & MOUSEEVENTF_MOVE) {
      input_state->mouse_x = current_input.mi.dx;
      input_state->mouse_y = current_input.mi.dy;
    } else if (current_input.mi.dwFlags & MOUSEEVENTF_LEFTDOWN) {
      input_state->is_left_button_pressed = true;
    } else if (current_input.mi.dwFlags & MOUSEEVENTF_LEFTUP) {
      if (input_state->is_left_button_pressed &&
        input_state->mouse_x == current_input.mi.dx &&
        input_state->mouse_y == current_input.mi.dy) {
        input_state->last_click_time = clock();
      }
      input_state->is_left_button_pressed = false;
    } else if (current_input.mi.dwFlags & MOUSEEVENTF_RIGHTDOWN) {
      input_state->is_right_button_pressed = true;
    } else if (current_input.mi.dwFlags & MOUSEEVENTF_RIGHTUP) {
      input_state->is_right_button_pressed = false;
    }
  } else if (current_input.type == INPUT_KEYBOARD) {
    if (current_input.ki.dwFlags & KEYEVENTF_KEYUP) {
      if (current_input.ki.wVk == VK_SHIFT) {
        input_state->is_shift_pressed = false;
      } else if (current_input.ki.wVk == VK_CONTROL) {
        input_state->is_control_pressed = false;
      } else if (current_input.ki.wVk == VK_MENU) {
        input_state->is_alt_pressed = false;
      }
    } else {
      if (current_input.ki.wVk == VK_SHIFT) {
        input_state->is_shift_pressed = true;
      } else if (current_input.ki.wVk == VK_CONTROL) {
        input_state->is_control_pressed = true;
      } else if (current_input.ki.wVk == VK_MENU) {
        input_state->is_alt_pressed = true;
      }
    }
  }
}

}
