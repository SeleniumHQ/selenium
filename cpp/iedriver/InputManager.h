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

#ifndef WEBDRIVER_IE_INPUTMANAGER_H_
#define WEBDRIVER_IE_INPUTMANAGER_H_

#include <vector>

#include "CustomTypes.h"
#include "ElementScrollBehavior.h"

namespace Json {
  class Value;
}

namespace webdriver {

struct KeyInfo {
  WORD key_code;
  UINT scan_code;
  bool is_extended_key;
  bool is_webdriver_key;
};

// Forward declaration of classes to avoid
// circular include files.
class ElementRepository;
class InteractionsManager;

class InputManager {
 public:
  InputManager(void);
  virtual ~InputManager(void);

  void Initialize(ElementRepository* element_map);

  int PerformInputSequence(BrowserHandle browser_wrapper, 
                           const Json::Value& sequence);
  int MouseMoveTo(BrowserHandle browser_wrapper,
                  std::string element_id,
                  bool offset_specified,
                  int x_offset,
                  int y_offset);
  int MouseButtonDown(BrowserHandle browser_wrapper);
  int MouseButtonUp(BrowserHandle browser_wrapper);
  int MouseClick(BrowserHandle browser_wrapper, int button);
  int MouseDoubleClick(BrowserHandle browser_wrapper);
  int SendKeystrokes(BrowserHandle browser_wrapper,
                     Json::Value keystroke_array,
                     bool auto_release_modifier_keys);
  bool SetFocusToBrowser(BrowserHandle browser_wrapper);

  void SetPersistentEvents(bool is_firing);
  void StopPersistentEvents(void);

  bool enable_native_events(void) const { return this->use_native_events_; }
  void set_enable_native_events(const bool enable_native_events) { 
    this->use_native_events_ = enable_native_events;
  }

  bool require_window_focus(void) const { return this->require_window_focus_; }
  void set_require_window_focus(const bool require_window_focus) { 
    this->require_window_focus_ = require_window_focus;
  }

  ElementScrollBehavior scroll_behavior(void) const {
    return this->scroll_behavior_; 
  }
  void set_scroll_behavior(const ElementScrollBehavior scroll_behavior) {
    this->scroll_behavior_ = scroll_behavior;
  }

  VARIANT keyboard_state(void) const { return this->keyboard_state_; }
  void set_keyboard_state(VARIANT state) { this->keyboard_state_ = state; }

  VARIANT mouse_state(void) const { return this->mouse_state_; }
  void set_mouse_state(VARIANT state) { this->mouse_state_ = state; }

  long last_known_mouse_x(void) const { return this->last_known_mouse_x_; }
  void set_last_known_mouse_x(const long x_coordinate) {
    this->last_known_mouse_x_ = x_coordinate; 
  }

  long last_known_mouse_y(void) const { return this->last_known_mouse_y_; }
  void set_last_known_mouse_y(const long y_coordinate) {
    this->last_known_mouse_y_ = y_coordinate;
  }

 private:
  void GetNormalizedCoordinates(HWND window_handle,
                                int x,
                                int y,
                                int* normalized_x,
                                int* normalized_y);
  void AddMouseInput(HWND window_handle, long flag, int x, int y);
  void AddKeyboardInput(HWND window_handle, wchar_t character);

  void CreateKeyboardInputItem(KeyInfo key_info, DWORD initial_flags, bool is_generating_keyup);

  bool IsModifierKey(wchar_t character);

  KeyInfo GetKeyInfo(HWND windows_handle, wchar_t character);
  
  bool WaitForInputEventProcessing(int input_count);

  bool use_native_events_;
  bool require_window_focus_;
  long last_known_mouse_x_;
  long last_known_mouse_y_;

  bool is_shift_pressed_;
  bool is_control_pressed_;
  bool is_alt_pressed_;

  ElementScrollBehavior scroll_behavior_;

  CComVariant keyboard_state_;
  CComVariant mouse_state_;

  ElementRepository* element_map_;
  InteractionsManager* interactions_manager_;

  std::vector<INPUT> inputs_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_INPUTMANAGER_H_
