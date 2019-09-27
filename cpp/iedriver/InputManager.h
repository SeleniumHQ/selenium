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
#include "InputState.h"
#include "ElementScrollBehavior.h"

namespace Json {
  class Value;
}

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class ActionSimulator;
class IElementManager;
class InteractionsManager;

struct InputManagerSettings {
  IElementManager* element_repository;
  bool use_native_events;
  bool require_window_focus;
  bool enable_persistent_hover;
  ElementScrollBehavior scroll_behavior;
};

struct KeyInfo {
  WORD key_code;
  UINT scan_code;
  bool is_extended_key;
  bool is_webdriver_key;
  bool is_ignored_key;
  bool is_force_scan_code;
  wchar_t character;
};

class InputManager {
public:
  InputManager(void);
  virtual ~InputManager(void);

  void Initialize(InputManagerSettings settings);

  int PerformInputSequence(BrowserHandle browser_wrapper,
                           const Json::Value& sequence,
                           std::string* error_info);
  void Reset(BrowserHandle browser_wrapper);

  //void StartPersistentEvents(void);
  //void StopPersistentEvents(void);

  bool enable_native_events(void) const { return this->use_native_events_; }

  bool require_window_focus(void) const { return this->require_window_focus_; }

  bool use_persistent_hover(void) const { return this->use_persistent_hover_; }

  ElementScrollBehavior scroll_behavior(void) const {
    return this->scroll_behavior_;
  }
  void set_scroll_behavior(const ElementScrollBehavior scroll_behavior) {
    this->scroll_behavior_ = scroll_behavior;
  }

  bool is_shift_pressed(void) const { return this->current_input_state_.is_shift_pressed; }
  bool is_control_pressed(void) const { return this->current_input_state_.is_control_pressed; }
  bool is_alt_pressed(void) const { return this->current_input_state_.is_alt_pressed; }
  clock_t last_click_time(void) const { return this->current_input_state_.last_click_time; }

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

  void AddMouseInput(HWND window_handle, long input_action, int x, int y);
  void AddKeyboardInput(HWND window_handle, std::wstring key, bool key_up, InputState* input_state);
  void AddPauseInput(HWND window_handle, int duration);

  void CreateKeyboardInputItem(KeyInfo key_info, DWORD initial_flags, bool is_generating_keyup);

  bool IsModifierKey(wchar_t character);

  KeyInfo GetKeyInfo(HWND windows_handle, wchar_t character);
  InputState CloneCurrentInputState(void);
  void UpdatePressedKeys(wchar_t character, bool press_key);
  bool IsKeyPressed(wchar_t character);
  bool IsSingleKey(const std::wstring& input);

  void SetupKeyDescriptions(void);
  std::wstring GetKeyDescription(const wchar_t character);

  int GetTicks(const Json::Value& sequences, Json::Value* ticks);
  HANDLE AcquireMutex(void);
  void ReleaseMutex(HANDLE mutex_handle);

  bool use_native_events_;
  bool use_persistent_hover_;
  bool require_window_focus_;

  InputState current_input_state_;

  ElementScrollBehavior scroll_behavior_;

  IElementManager* element_map_;
  ActionSimulator* action_simulator_;

  std::vector<INPUT> inputs_;
  std::vector<wchar_t> pressed_keys_;
  std::map<wchar_t, std::wstring> key_descriptions_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_INPUTMANAGER_H_
