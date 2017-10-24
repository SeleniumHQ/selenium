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

#include <ctime>
#include <map>
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

struct InputState {
  bool is_shift_pressed;
  bool is_control_pressed;
  bool is_alt_pressed;
  bool is_left_button_pressed;
  bool is_right_button_pressed;
  long mouse_x;
  long mouse_y;
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
  bool SetFocusToBrowser(BrowserHandle browser_wrapper);
  void Reset(BrowserHandle browser_wrapper);

  void StartPersistentEvents(void);
  void StopPersistentEvents(void);

  bool enable_native_events(void) const { return this->use_native_events_; }
  void set_enable_native_events(const bool enable_native_events) {
    this->use_native_events_ = enable_native_events;
  }

  bool require_window_focus(void) const { return this->require_window_focus_; }
  void set_require_window_focus(const bool require_window_focus) {
    this->require_window_focus_ = require_window_focus;
  }

  bool use_persistent_hover(void) const { return this->use_persistent_hover_; }
  void set_use_persistent_hover(const bool use_persistent_hover) {
    this->use_persistent_hover_ = use_persistent_hover;
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

  bool is_shift_pressed(void) const { return this->is_shift_pressed_; }
  bool is_control_pressed(void) const { return this->is_control_pressed_; }
  bool is_alt_pressed(void) const { return this->is_alt_pressed_; }

  long last_known_mouse_x(void) const { return this->last_known_mouse_x_; }
  void set_last_known_mouse_x(const long x_coordinate) {
    this->last_known_mouse_x_ = x_coordinate; 
  }

  long last_known_mouse_y(void) const { return this->last_known_mouse_y_; }
  void set_last_known_mouse_y(const long y_coordinate) {
    this->last_known_mouse_y_ = y_coordinate;
  }

 private:
  int PointerMoveTo(BrowserHandle browser_wrapper,
                    const Json::Value& move_to_action,
                    InputState* input_state);
  int PointerDown(BrowserHandle browser_wrapper,
                  const Json::Value& down_action,
                  InputState* input_state);
  int PointerUp(BrowserHandle browser_wrapper,
                const Json::Value& up_action,
                InputState* input_state);
  int KeyDown(BrowserHandle browser_wrapper,
              const Json::Value& down_action,
              InputState* input_state);
  int KeyUp(BrowserHandle browser_wrapper,
            const Json::Value& up_action,
            InputState* input_state);
  int Pause(BrowserHandle browser_wrapper,
            const Json::Value& pause_action);

  void GetNormalizedCoordinates(HWND window_handle,
                                int x,
                                int y,
                                int* normalized_x,
                                int* normalized_y);
  void AddMouseInput(HWND window_handle, long input_action, int x, int y);
  void AddKeyboardInput(HWND window_handle, wchar_t character, bool key_up, InputState* input_state);
  void AddPauseInput(HWND window_handle, int duration);

  void CreateKeyboardInputItem(KeyInfo key_info, DWORD initial_flags, bool is_generating_keyup);

  bool IsModifierKey(wchar_t character);

  KeyInfo GetKeyInfo(HWND windows_handle, wchar_t character);
  InputState CloneCurrentInputState(void);
  void UpdateInputState(INPUT current_input);
  void UpdatePressedKeys(wchar_t character, bool press_key);

  bool WaitForInputEventProcessing(int input_count);
  int PerformInputWithSendInput(BrowserHandle browser_wrapper);
  int PerformInputWithSendMessage(BrowserHandle browser_wrapper);

  void SetupKeyDescriptions(void);
  std::wstring GetKeyDescription(const wchar_t character);

  bool use_native_events_;
  bool use_persistent_hover_;
  bool require_window_focus_;
  long last_known_mouse_x_;
  long last_known_mouse_y_;

  bool is_shift_pressed_;
  bool is_control_pressed_;
  bool is_alt_pressed_;
  bool is_left_button_pressed_;
  bool is_right_button_pressed_;

  clock_t last_click_time_;

  ElementScrollBehavior scroll_behavior_;

  CComVariant keyboard_state_;
  CComVariant mouse_state_;

  ElementRepository* element_map_;
  InteractionsManager* interactions_manager_;

  std::vector<INPUT> inputs_;
  std::vector<BYTE> keyboard_state_buffer_;
  std::vector<wchar_t> pressed_keys_;
  std::map<wchar_t, std::wstring> key_descriptions_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_INPUTMANAGER_H_
