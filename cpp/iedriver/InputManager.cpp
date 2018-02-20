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

#include "InputManager.h"

#include <ctime>

#include "errorcodes.h"
#include "json.h"
#include "keycodes.h"
#include "logging.h"

#include "ActionSimulators/JavaScriptActionSimulator.h"
#include "ActionSimulators/SendInputActionSimulator.h"
#include "ActionSimulators/SendMessageActionSimulator.h"
#include "DocumentHost.h"
#include "Element.h"
#include "HookProcessor.h"
#include "IElementManager.h"
#include "Script.h"
#include "StringUtilities.h"
#include "Generated/atoms.h"

#define USER_INTERACTION_MUTEX_NAME L"WebDriverUserInteractionMutex"
#define WAIT_TIME_IN_MILLISECONDS_PER_INPUT_EVENT 100

#define MODIFIER_KEY_SHIFT 1
#define MODIFIER_KEY_CTRL 2
#define MODIFIER_KEY_ALT 4

namespace webdriver {

InputManager::InputManager() {
  LOG(TRACE) << "Entering InputManager::InputManager";
  this->use_native_events_ = true;
  this->use_persistent_hover_ = false;
  this->require_window_focus_ = true;
  this->scroll_behavior_ = TOP;
  this->current_input_state_.is_alt_pressed = false;
  this->current_input_state_.is_control_pressed = false;
  this->current_input_state_.is_shift_pressed = false;
  this->current_input_state_.is_left_button_pressed = false;
  this->current_input_state_.is_right_button_pressed = false;
  this->current_input_state_.mouse_x = 0;
  this->current_input_state_.mouse_y = 0;
  this->current_input_state_.last_click_time = clock();

  this->action_simulator_ = NULL;
}

InputManager::~InputManager(void) {
  if (this->action_simulator_ != NULL) {
    delete this->action_simulator_;
  }
}

void InputManager::Initialize(InputManagerSettings settings) {
  LOG(TRACE) << "Entering InputManager::Initialize";
  this->element_map_ = settings.element_repository;
  this->scroll_behavior_ = settings.scroll_behavior;
  this->use_native_events_ = settings.use_native_events;
  this->use_persistent_hover_ = settings.enable_persistent_hover;
  this->require_window_focus_ = settings.require_window_focus;
  if (settings.use_native_events) {
    if (settings.require_window_focus) {
      this->action_simulator_ = new SendInputActionSimulator();
    } else {
      this->action_simulator_ = new SendMessageActionSimulator();
    }
  } else {
    this->action_simulator_ = new JavaScriptActionSimulator();
  }
  this->SetupKeyDescriptions();
}

int InputManager::PerformInputSequence(BrowserHandle browser_wrapper,
                                       const Json::Value& sequences) {
  LOG(TRACE) << "Entering InputManager::PerformInputSequence";
  if (!sequences.isArray()) {
    return EUNHANDLEDERROR;
  }

  int status_code = WD_SUCCESS;
  // Use a single mutex, so that all instances synchronize on the same object 
  // for focus purposes.
  HANDLE mutex_handle = this->AcquireMutex();

  Json::Value ticks(Json::arrayValue);
  status_code = this->GetTicks(sequences, &ticks);
  if (status_code != WD_SUCCESS) {
    this->ReleaseMutex(mutex_handle);
    return status_code;
  }

  this->inputs_.clear();
  this->current_input_state_.last_click_time = 0;
  InputState current_input_state = this->CloneCurrentInputState();
  for (size_t i = 0; i < ticks.size(); ++i) {
    Json::UInt tick_index = static_cast<Json::UInt>(i);
    Json::Value tick = ticks[tick_index];
    for (size_t j = 0; j < tick.size(); ++j) {
      Json::UInt action_index = static_cast<Json::UInt>(j);
      Json::Value action = tick[action_index];
      std::string action_subtype = action["type"].asString();
      if (action_subtype == "pointerMove") {
        status_code = this->PointerMoveTo(browser_wrapper, action, &current_input_state);
      } else if (action_subtype == "pointerDown") {
        status_code = this->PointerDown(browser_wrapper, action, &current_input_state);
      } else if (action_subtype == "pointerUp") {
        status_code = this->PointerUp(browser_wrapper, action, &current_input_state);
      } else if (action_subtype == "keyDown") {
        status_code = this->KeyDown(browser_wrapper, action, &current_input_state);
      } else if (action_subtype == "keyUp") {
        status_code = this->KeyUp(browser_wrapper, action, &current_input_state);
      } else if (action_subtype == "pause") {
        status_code = this->Pause(browser_wrapper, action);
      }

      if (status_code != WD_SUCCESS) {
        this->ReleaseMutex(mutex_handle);
        return status_code;
      }
    }
  }

  // If there are inputs in the array, then we've queued up input actions
  // to be played back. So play them back.
  if (this->inputs_.size() > 0) {
    LOG(DEBUG) << "Processing a total of " << this->inputs_.size() << " input events";
    this->action_simulator_->SimulateActions(browser_wrapper,
                                             this->inputs_,
                                             &this->current_input_state_);
  }

  ::Sleep(50);

  this->ReleaseMutex(mutex_handle);
  return status_code;
}

int InputManager::GetTicks(const Json::Value& sequences, Json::Value* ticks) {
  for (size_t i = 0; i < sequences.size(); ++i) {
    Json::UInt index = static_cast<Json::UInt>(i);
    Json::Value device_sequence = sequences[index];
    if (!device_sequence.isMember("type") && !device_sequence["type"].isString()) {
      return EINVALIDARGUMENT;
    }

    std::string device_type = device_sequence["type"].asString();
    if (device_type != "key" && device_type != "pointer" && device_type != "none") {
      return EINVALIDARGUMENT;
    }

    if (!device_sequence.isMember("id") && !device_sequence["id"].isString()) {
      return EINVALIDARGUMENT;
    }

    std::string device_id = device_sequence["id"].asString();

    if (!device_sequence.isMember("actions") && !device_sequence["actions"].isArray()) {
      return EINVALIDARGUMENT;
    }

    // TODO: Add guards against bad action structure. Assume correct input for now.
    Json::Value actions = device_sequence["actions"];
    for (size_t j = 0; j < actions.size(); ++j) {
      if (ticks->size() <= j) {
        Json::Value tick(Json::arrayValue);
        ticks->append(tick);
      }
      Json::UInt action_index = static_cast<Json::UInt>(j);
      Json::Value action = actions[action_index];
      (*ticks)[action_index].append(action);
    }
  }
  return WD_SUCCESS;
}

HANDLE InputManager::AcquireMutex() {
  HANDLE mutex_handle = ::CreateMutex(NULL, FALSE, USER_INTERACTION_MUTEX_NAME);
  if (mutex_handle != NULL) {
    // Wait for up to the timeout (currently 30 seconds) for the mutex to be
    // released.
    DWORD mutex_wait_status = ::WaitForSingleObject(mutex_handle, 30000);
    if (mutex_wait_status == WAIT_ABANDONED) {
      LOG(WARN) << "Acquired mutex, but received wait abandoned status. This "
        << "could mean the process previously owning the mutex was "
        << "unexpectedly terminated.";
    }
    else if (mutex_wait_status == WAIT_TIMEOUT) {
      LOG(WARN) << "Could not acquire mutex within the timeout. Multiple "
        << "instances may have incorrect synchronization for interactions";
    }
    else if (mutex_wait_status == WAIT_OBJECT_0) {
      LOG(DEBUG) << "Mutex acquired for user interaction.";
    }
  }
  else {
    LOG(WARN) << "Could not create user interaction mutex. Multiple "
      << "instances of IE may behave unpredictably.";
  }
  return mutex_handle;
}

void InputManager::ReleaseMutex(HANDLE mutex_handle) {
  if (mutex_handle != NULL) {
    ::ReleaseMutex(mutex_handle);
    ::CloseHandle(mutex_handle);
  }
}

InputState InputManager::CloneCurrentInputState(void) {
  InputState current_input_state;
  current_input_state.is_alt_pressed = this->current_input_state_.is_alt_pressed;
  current_input_state.is_control_pressed = this->current_input_state_.is_control_pressed;
  current_input_state.is_shift_pressed = this->current_input_state_.is_shift_pressed;
  current_input_state.is_left_button_pressed = this->current_input_state_.is_left_button_pressed;
  current_input_state.is_right_button_pressed = this->current_input_state_.is_right_button_pressed;
  current_input_state.mouse_x = this->current_input_state_.mouse_x;
  current_input_state.mouse_y = this->current_input_state_.mouse_y;
  return current_input_state;
}

void InputManager::Reset(BrowserHandle browser_wrapper) {
  LOG(TRACE) << "Entering InputManager::Reset";
  Json::Value reset_sequence(Json::arrayValue);

  Json::Value mouse_input_source;
  mouse_input_source["type"] = "pointer";
  mouse_input_source["id"] = "default mouse";
  Json::Value mouse_parameters;
  mouse_parameters["pointerType"] = "mouse";
  mouse_input_source["parameters"] = mouse_parameters;
  mouse_input_source["actions"] = Json::Value(Json::arrayValue);

  if (this->current_input_state_.is_left_button_pressed ||
      this->current_input_state_.is_right_button_pressed) {
    if (this->current_input_state_.is_left_button_pressed) {
      LOG(DEBUG) << "Releasing left mouse button";
      Json::Value left_button_up;
      left_button_up["type"] = "pointerUp";
      left_button_up["button"] = WD_CLIENT_LEFT_MOUSE_BUTTON;
      mouse_input_source["actions"].append(left_button_up);
    }

    if (this->current_input_state_.is_right_button_pressed) {
      LOG(DEBUG) << "Releasing right mouse button";
      Json::Value right_button_up;
      right_button_up["type"] = "pointerUp";
      right_button_up["button"] = WD_CLIENT_RIGHT_MOUSE_BUTTON;
      mouse_input_source["actions"].append(right_button_up);
    }
  }

  Json::Value keyboard_input_source;
  keyboard_input_source["type"] = "key";
  keyboard_input_source["id"] = "default keyboard";
  keyboard_input_source["actions"] = Json::Value(Json::arrayValue);

  if (this->pressed_keys_.size() > 0) {
    for (size_t i = 0; i < mouse_input_source["actions"].size(); ++i) {
      Json::Value pause_action;
      pause_action["type"] = "pause";
      pause_action["duration"] = 0;
      keyboard_input_source["actions"].append(pause_action);
    }

    LOG(DEBUG) << "Releasing " << this->pressed_keys_.size() << " keys";
    std::vector<wchar_t>::const_reverse_iterator it = this->pressed_keys_.rbegin();
    for (; it != this->pressed_keys_.rend(); ++it) {
      std::wstring key_value = L"";
      key_value.append(1, *it);
      std::wstring key_description= this->GetKeyDescription(*it);
      LOG(DEBUG) << "Key: " << LOGWSTRING(key_description);
      Json::Value keyup;
      keyup["type"] = "keyUp";
      keyup["value"] = StringUtilities::ToString(key_value);
      keyboard_input_source["actions"].append(keyup);
    }
    this->pressed_keys_.clear();
  }

  if (this->current_input_state_.mouse_x > 0 ||
      this->current_input_state_.mouse_y > 0) {
    LOG(DEBUG) << "Resetting mouse position";
    this->current_input_state_.mouse_x = 0;
    this->current_input_state_.mouse_y = 0;
  }

  if (mouse_input_source["actions"].size() > 0) {
    reset_sequence.append(mouse_input_source);
  }

  if (keyboard_input_source["actions"].size() > 0) {
    reset_sequence.append(keyboard_input_source);
  }

  if (reset_sequence.size() > 0) {
    this->PerformInputSequence(browser_wrapper, reset_sequence);
  }
}

int InputManager::PointerMoveTo(BrowserHandle browser_wrapper,
                                const Json::Value& move_to_action,
                                InputState* input_state) {
  LOG(TRACE) << "Entering InputManager::PointerMoveTo";
  int status_code = WD_SUCCESS;
  bool element_specified = false;
  std::string origin = "viewport";
  if (move_to_action.isMember("origin")) {
    Json::Value origin_value = move_to_action["origin"];
    if (origin_value.isString()) {
      origin = origin_value.asString();
    } else if (origin_value.isObject() && origin_value.isMember(JSON_ELEMENT_PROPERTY_NAME)) {
      origin = origin_value[JSON_ELEMENT_PROPERTY_NAME].asString();
      element_specified = true;
    }
  }

  int x_offset = 0;
  if (move_to_action.isMember("x") && move_to_action["x"].isInt()) {
    x_offset = move_to_action["x"].asInt();
  }

  int y_offset = 0;
  if (move_to_action.isMember("y") && move_to_action["y"].isInt()) {
    y_offset = move_to_action["y"].asInt();
  }
  
  bool offset_specified = move_to_action.isMember("x") &&
                          move_to_action.isMember("y") &&
                          (x_offset != 0 || y_offset != 0);

  long duration = 100;
  if (move_to_action.isMember("duration") && move_to_action["duration"].isInt()) {
    duration = move_to_action["duration"].asInt();
  }

  ElementHandle target_element;
  if (element_specified) {
    status_code = this->element_map_->GetManagedElement(origin, &target_element);
    if (status_code != WD_SUCCESS) {
      return status_code;
    }
  }
  if (this->action_simulator_->UseExtraInfo()) {
    MouseExtraInfo* extra_info = new MouseExtraInfo();
    if (element_specified) {
      extra_info->element = target_element->element();
    } else {
      extra_info->element = NULL;
    }
    extra_info->offset_specified = offset_specified;
    extra_info->offset_x = x_offset;
    extra_info->offset_y = y_offset;
    INPUT mouse_input;
    mouse_input.type = INPUT_MOUSE;
    mouse_input.mi.dwFlags = MOUSEEVENTF_MOVE;
    mouse_input.mi.dx = 0;
    mouse_input.mi.dy = 0;
    mouse_input.mi.dwExtraInfo = reinterpret_cast<ULONG_PTR>(extra_info);
    mouse_input.mi.mouseData = 0;
    mouse_input.mi.time = 0;
    this->inputs_.push_back(mouse_input);
  } else {
    long start_x = input_state->mouse_x;
    long start_y = input_state->mouse_y;

    long end_x = start_x;
    long end_y = start_y;
    if (element_specified) {
      LocationInfo element_location;
      LocationInfo move_location;
      status_code = target_element->GetClickLocation(this->scroll_behavior_,
                                                     &element_location,
                                                     &move_location);
      // We can't use the status code alone here. Even though the center of the
      // element may not reachable via the mouse, we might still be able to move
      // to whatever portion of the element *is* visible in the viewport, especially
      // if we have an offset specifed, so we have to have an extra check.
      if (status_code != WD_SUCCESS) {
        if (status_code == EELEMENTCLICKPOINTNOTSCROLLED && !offset_specified) {
          // If no offset is specified (meaning "move to the element's center"),
          // and the "could not scroll center point into view" status code is
          // returned, bail out here.
          LOG(WARN) << "No offset was specified, and the center point of the element could not be scrolled into view.";
          return status_code;
        } else {
          LOG(WARN) << "Element::CalculateClickPoint() returned an error code indicating the element is not reachable.";
          return status_code;
        }
      }

      // An element was specified as the starting point, so we know the end of the mouse
      // move will be at some offset from the element origin.
      end_x = element_location.x;
      end_y = element_location.y;
      if (!offset_specified) {
        // No offset was specified, which means move to the center of the element. 
        end_x = move_location.x;
        end_y = move_location.y;
      }
    }

    if (origin == "viewport") {
      end_x = x_offset;
      end_y = y_offset;
    } else {
      if (offset_specified) {
        // An offset was specified. At this point, the end coordinates should be
        // set to either (1) the previous mouse position if there was no element
        // specified, or (2) the origin of the element from which to calculate the
        // offset.
        end_x += x_offset;
        end_y += y_offset;
      }
    }

    LOG(DEBUG) << "Queueing SendInput structure for mouse move (origin: " << origin
               << ", x: " << end_x << ", y: " << end_y << ")";
    HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
    if (end_x == input_state->mouse_x && end_y == input_state->mouse_y) {
      LOG(DEBUG) << "Omitting SendInput structure for mouse move; no movement required (x: "
                 << end_x << ", y: " << end_y << ")";
    } else {
      const int min_duration = 50;
      int step_count = 10;
      if (duration <= min_duration) {
        step_count = 0;
      }
      long step_sleep = duration / max(step_count, 1);

      long x_distance = end_x - input_state->mouse_x;
      long y_distance = end_y - input_state->mouse_y;
      for (int i = 0; i < step_count; i++) {
        //To avoid integer division rounding and cumulative floating point errors,
        //calculate from scratch each time
        double step_progress = ((double)i) / step_count;
        int current_x = (int)(input_state->mouse_x + (x_distance * step_progress));
        int current_y = (int)(input_state->mouse_y + (y_distance * step_progress));
        this->AddMouseInput(browser_window_handle, MOUSEEVENTF_MOVE, current_x, current_y);
        if (step_sleep > 0) {
          this->AddPauseInput(browser_window_handle, step_sleep);
        }
      }
      this->AddMouseInput(browser_window_handle, MOUSEEVENTF_MOVE, end_x, end_y);
    }
    input_state->mouse_x = end_x;
    input_state->mouse_y = end_y;
  }
  return status_code;
}

int InputManager::PointerDown(BrowserHandle browser_wrapper,
                              const Json::Value& down_action,
                              InputState* input_state) {
  LOG(TRACE) << "Entering InputManager::PointerDown";
  int button = down_action["button"].asInt();
  HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
  LOG(DEBUG) << "Queueing SendInput structure for mouse button down";
  long button_event_value = MOUSEEVENTF_LEFTDOWN;
  if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
    button_event_value = MOUSEEVENTF_RIGHTDOWN;
  }
  this->AddMouseInput(browser_window_handle,
                      button_event_value,
                      input_state->mouse_x,
                      input_state->mouse_y);
  if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
    input_state->is_right_button_pressed = true;
  } else {
    input_state->is_left_button_pressed = true;
  }
  return WD_SUCCESS;
}

int InputManager::PointerUp(BrowserHandle browser_wrapper,
                            const Json::Value& up_action,
                            InputState* input_state) {
  LOG(TRACE) << "Entering InputManager::PointerUp";
  int button = up_action["button"].asInt();
  HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
  LOG(DEBUG) << "Queueing SendInput structure for mouse button up";
  long button_event_value = MOUSEEVENTF_LEFTUP;
  if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
    button_event_value = MOUSEEVENTF_RIGHTUP;
  }
  this->AddMouseInput(browser_window_handle,
                      button_event_value,
                      input_state->mouse_x,
                      input_state->mouse_y);
  if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
    input_state->is_right_button_pressed = false;
  } else {
    input_state->is_left_button_pressed = false;
  }
  return WD_SUCCESS;
}

int InputManager::KeyDown(BrowserHandle browser_wrapper,
                          const Json::Value& down_action,
                          InputState* input_state) {
  int status_code = WD_SUCCESS;
  std::string key_value = down_action["value"].asString();
  std::wstring key = StringUtilities::ToWString(key_value);

  if (this->action_simulator_->UseExtraInfo()) {
    LOG(DEBUG) << "Using synthetic events for sending keys";
    KeyboardExtraInfo* extra_info = new KeyboardExtraInfo();
    extra_info->character = key;
    INPUT input_element;
    input_element.type = INPUT_KEYBOARD;

    input_element.ki.wVk = 0;
    input_element.ki.wScan = 0;
    input_element.ki.dwFlags = 0;
    input_element.ki.dwExtraInfo = reinterpret_cast<ULONG_PTR>(extra_info);
    input_element.ki.time = 0;
    this->inputs_.push_back(input_element);
  } else {
    HWND window_handle = browser_wrapper->GetContentWindowHandle();
    wchar_t character = key[0];
    this->AddKeyboardInput(window_handle, character, false, input_state);
  }
  return status_code;
}

int InputManager::KeyUp(BrowserHandle browser_wrapper,
                        const Json::Value& up_action,
                        InputState* input_state) {
  int status_code = WD_SUCCESS;
  std::string key_value = up_action["value"].asString();
  std::wstring key = StringUtilities::ToWString(key_value);

  if (!this->action_simulator_->UseExtraInfo()) {
    HWND window_handle = browser_wrapper->GetContentWindowHandle();
    wchar_t character = key[0];
    this->AddKeyboardInput(window_handle, character, true, input_state);
  }
  return status_code;
}

int InputManager::Pause(BrowserHandle browser_wrapper,
                        const Json::Value& pause_action) {
  int status_code = 0;
  int duration = pause_action["duration"].asInt();
  if (duration > 0) {
    this->AddPauseInput(browser_wrapper->GetContentWindowHandle(), duration);
  }
  return status_code;
}

void InputManager::AddPauseInput(HWND window_handle, int duration) {
  // Leverage the INPUT_HARDWARE type.
  INPUT pause_input;
  pause_input.type = INPUT_HARDWARE;
  pause_input.hi.uMsg = duration;
  this->inputs_.push_back(pause_input);
}

void InputManager::AddMouseInput(HWND window_handle, long input_action, int x, int y) {
  LOG(TRACE) << "Entering InputManager::AddMouseInput";
  INPUT mouse_input;
  mouse_input.type = INPUT_MOUSE;
  mouse_input.mi.dwFlags = input_action | MOUSEEVENTF_ABSOLUTE;
  mouse_input.mi.dx = x;
  mouse_input.mi.dy = y;
  mouse_input.mi.dwExtraInfo = 0;
  mouse_input.mi.mouseData = 0;
  mouse_input.mi.time = 0;
  this->inputs_.push_back(mouse_input);
}

void InputManager::AddKeyboardInput(HWND window_handle,
                                    wchar_t character,
                                    bool key_up,
                                    InputState* input_state) {
  LOG(TRACE) << "Entering InputManager::AddKeyboardInput";

  std::wstring log_key = this->GetKeyDescription(character);
  std::string log_event = "key down";
  if (key_up) {
    log_event = "key up";
  }
  LOG(DEBUG) << "Queueing SendInput structure for " << log_event
             << " (key: " << LOGWSTRING(log_key) << ")";

  if (this->IsModifierKey(character)) {
    KeyInfo modifier_key_info = { 0, 0, false, false, false, character };
    // If the character represents the Shift key, or represents the 
    // "release all modifiers" key and the Shift key is down, send
    // the appropriate down or up keystroke for the Shift key.
    if (character == WD_KEY_SHIFT ||
        character == WD_KEY_R_SHIFT ||
        (character == WD_KEY_NULL && input_state->is_shift_pressed)) {
      modifier_key_info.key_code = VK_SHIFT;
      this->CreateKeyboardInputItem(modifier_key_info,
                                    0,
                                    input_state->is_shift_pressed);
      if (input_state->is_shift_pressed) {
        input_state->is_shift_pressed = false;
      } else {
        input_state->is_shift_pressed = true;
      }
      this->UpdatePressedKeys(WD_KEY_SHIFT, input_state->is_shift_pressed);
    }

    // If the character represents the Control key, or represents the 
    // "release all modifiers" key and the Control key is down, send
    // the appropriate down or up keystroke for the Control key.
    if (character == WD_KEY_CONTROL ||
        character == WD_KEY_R_CONTROL ||
        (character == WD_KEY_NULL && input_state->is_control_pressed)) {
      modifier_key_info.key_code = VK_CONTROL;
      this->CreateKeyboardInputItem(modifier_key_info,
                                    0,
                                    input_state->is_control_pressed);
      if (input_state->is_control_pressed) {
        input_state->is_control_pressed = false;
      } else {
        input_state->is_control_pressed = true;
      }
      this->UpdatePressedKeys(WD_KEY_CONTROL, input_state->is_control_pressed);
    }

    // If the character represents the Alt key, or represents the 
    // "release all modifiers" key and the Alt key is down, send
    // the appropriate down or up keystroke for the Alt key.
    if (character == WD_KEY_ALT ||
        character == WD_KEY_R_ALT ||
        (character == WD_KEY_NULL && input_state->is_alt_pressed)) {
      modifier_key_info.key_code = VK_MENU;
      this->CreateKeyboardInputItem(modifier_key_info,
                                    0,
                                    input_state->is_alt_pressed);
      if (input_state->is_alt_pressed) {
        input_state->is_alt_pressed = false;
      } else {
        input_state->is_alt_pressed = true;
      }
      this->UpdatePressedKeys(WD_KEY_ALT, input_state->is_alt_pressed);
    }
    return;
  }

  this->UpdatePressedKeys(character, !key_up);

  KeyInfo key_info = this->GetKeyInfo(window_handle, character);
  if (key_info.is_ignored_key) {
    return;
  }

  if (!key_info.is_webdriver_key) {
    if (!key_info.scan_code || (key_info.key_code == 0xFFFFU)) {
      LOG(WARN) << "No translation for key. Assuming unicode input: " << character;

      key_info.scan_code = static_cast<WORD>(character);
      key_info.key_code = 0;
      key_info.is_extended_key = false;

      this->CreateKeyboardInputItem(key_info, KEYEVENTF_UNICODE, key_up);
      return;
    }
  }


  unsigned short modifier_key_info = HIBYTE(key_info.key_code);
  if (modifier_key_info != 0) {
    // Requested key is a <modifier keys> + <key>. Thus, don't use the key code.
    // Instead, send the modifier keystrokes, and use the scan code of the key.
    bool is_shift_required = (modifier_key_info & MODIFIER_KEY_SHIFT) != 0 &&
                             !input_state->is_shift_pressed;
    bool is_control_required = (modifier_key_info & MODIFIER_KEY_CTRL) != 0 &&
                               !input_state->is_control_pressed;
    bool is_alt_required = (modifier_key_info & MODIFIER_KEY_ALT) != 0 &&
                           !input_state->is_alt_pressed;
    if (!key_up) {
      if (is_shift_required) {
        KeyInfo shift_key_info = { VK_SHIFT, 0, false, false, false, character };
        this->CreateKeyboardInputItem(shift_key_info, 0, false);
      }
      if (is_control_required) {
        KeyInfo control_key_info = { VK_CONTROL, 0, false, false, false, character };
        this->CreateKeyboardInputItem(control_key_info, 0, false);
      }
      if (is_alt_required) {
        KeyInfo alt_key_info = { VK_MENU, 0, false, false, false, character };
        this->CreateKeyboardInputItem(alt_key_info, 0, false);
      }
    }

    this->CreateKeyboardInputItem(key_info, KEYEVENTF_SCANCODE, key_up);

    if (key_up) {
      if (is_shift_required) {
        KeyInfo shift_key_info = { VK_SHIFT, 0, false, false, false, character };
        this->CreateKeyboardInputItem(shift_key_info, 0, true);
      }
      if (is_control_required) {
        KeyInfo control_key_info = { VK_CONTROL, 0, false, false, false, character };
        this->CreateKeyboardInputItem(control_key_info, 0, true);
      }
      if (is_alt_required) {
        KeyInfo alt_key_info = { VK_MENU, 0, false, false, false, character };
        this->CreateKeyboardInputItem(alt_key_info, 0, true);
      }
    }
  } else {
    this->CreateKeyboardInputItem(key_info, 0, key_up);
  }
}

void InputManager::UpdatePressedKeys(wchar_t character, bool press_key) {
  std::wstring log_string = this->GetKeyDescription(character);
  if (press_key) {
    LOG(TRACE) << "Adding key: " << LOGWSTRING(log_string);
    this->pressed_keys_.push_back(character);
  } else {
    LOG(TRACE) << "Removing key: " << LOGWSTRING(log_string);
    std::vector<wchar_t>::const_reverse_iterator reverse_it = this->pressed_keys_.rbegin();
    for (; reverse_it != this->pressed_keys_.rend(); ++reverse_it) {
      if (*reverse_it == character) {
        break;
      }
    }
    if (reverse_it != this->pressed_keys_.rend()) {
      // Must advance the forward iterator to be on the right element
      // of the vector.
      std::vector<wchar_t>::const_iterator it = reverse_it.base();
      this->pressed_keys_.erase(--it);
    }
  }
}

void InputManager::CreateKeyboardInputItem(KeyInfo key_info,
                                           DWORD initial_flags,
                                           bool is_generating_key_up) {
  INPUT input_element;
  input_element.type = INPUT_KEYBOARD;

  input_element.ki.wVk = key_info.key_code;
  input_element.ki.wScan = key_info.scan_code;
  input_element.ki.dwFlags = initial_flags;
  input_element.ki.dwExtraInfo = key_info.character;
  input_element.ki.time = 0;

  if (key_info.is_extended_key) {
    input_element.ki.dwFlags |= KEYEVENTF_EXTENDEDKEY;
  }
  if (is_generating_key_up) {
    input_element.ki.dwFlags |= KEYEVENTF_KEYUP;
  }

  this->inputs_.push_back(input_element);
}

bool InputManager::IsModifierKey(wchar_t character) {
  return character == WD_KEY_SHIFT ||
         character == WD_KEY_CONTROL ||
         character == WD_KEY_ALT ||
         character == WD_KEY_R_SHIFT ||
         character == WD_KEY_R_CONTROL ||
         character == WD_KEY_R_ALT ||
         character == WD_KEY_NULL;
}

KeyInfo InputManager::GetKeyInfo(HWND window_handle, wchar_t character) {
  KeyInfo key_info;
  key_info.is_ignored_key = false;
  key_info.is_extended_key = false;
  key_info.is_webdriver_key = true;
  key_info.key_code = 0;
  key_info.scan_code = 0;
  key_info.character = character;
  DWORD process_id = 0;
  DWORD thread_id = ::GetWindowThreadProcessId(window_handle, &process_id);
  HKL layout = ::GetKeyboardLayout(thread_id);
  if (character == WD_KEY_CANCEL) {  // ^break
    key_info.key_code = VK_CANCEL;
    key_info.scan_code = VK_CANCEL;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_HELP) {  // help
    key_info.key_code = VK_HELP;
    key_info.scan_code = VK_HELP;
  }
  else if (character == WD_KEY_BACKSPACE) {  // back space
    key_info.key_code = VK_BACK;
    key_info.scan_code = VK_BACK;
  }
  else if (character == WD_KEY_TAB) {  // tab
    key_info.key_code = VK_TAB;
    key_info.scan_code = VK_TAB;
  }
  else if (character == WD_KEY_CLEAR) {  // clear
    key_info.key_code = VK_CLEAR;
    key_info.scan_code = VK_CLEAR;
  }
  else if (character == WD_KEY_RETURN) {  // return
    key_info.key_code = VK_RETURN;
    key_info.scan_code = VK_RETURN;
  }
  else if (character == WD_KEY_ENTER) {  // enter
    key_info.key_code = VK_RETURN;
    key_info.scan_code = VK_RETURN;
  }
  else if (character == WD_KEY_PAUSE) {  // pause
    key_info.key_code = VK_PAUSE;
    key_info.scan_code = VK_PAUSE;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_ESCAPE) {  // escape
    key_info.key_code = VK_ESCAPE;
    key_info.scan_code = VK_ESCAPE;
  }
  else if (character == WD_KEY_SPACE) {  // space
    key_info.key_code = VK_SPACE;
    key_info.scan_code = VK_SPACE;
  }
  else if (character == WD_KEY_PAGEUP) {  // page up
    key_info.key_code = VK_PRIOR;
    key_info.scan_code = VK_PRIOR;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_PAGEDOWN) {  // page down
    key_info.key_code = VK_NEXT;
    key_info.scan_code = VK_NEXT;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_END) {  // end
    key_info.key_code = VK_END;
    key_info.scan_code = VK_END;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_HOME) {  // home
    key_info.key_code = VK_HOME;
    key_info.scan_code = VK_HOME;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_LEFT) {  // left arrow
    key_info.key_code = VK_LEFT;
    key_info.scan_code = VK_LEFT;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_UP) {  // up arrow
    key_info.key_code = VK_UP;
    key_info.scan_code = VK_UP;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_RIGHT) {  // right arrow
    key_info.key_code = VK_RIGHT;
    key_info.scan_code = VK_RIGHT;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_DOWN) {  // down arrow
    key_info.key_code = VK_DOWN;
    key_info.scan_code = VK_DOWN;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_INSERT) {  // insert
    key_info.key_code = VK_INSERT;
    key_info.scan_code = VK_INSERT;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_DELETE) {  // delete
    key_info.key_code = VK_DELETE;
    key_info.scan_code = VK_DELETE;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_SEMICOLON) {  // semicolon
    key_info.key_code = VkKeyScanExW(L';', layout);
    key_info.scan_code = MapVirtualKeyExW(LOBYTE(key_info.key_code), 0, layout);
  }
  else if (character == WD_KEY_EQUALS) {  // equals
    key_info.key_code = VkKeyScanExW(L'=', layout);
    key_info.scan_code = MapVirtualKeyExW(LOBYTE(key_info.key_code), 0, layout);
  }
  else if (character == WD_KEY_NUMPAD0) {  // numpad0
    key_info.key_code = VK_NUMPAD0;
    key_info.scan_code = VK_NUMPAD0;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_NUMPAD1) {  // numpad1
    key_info.key_code = VK_NUMPAD1;
    key_info.scan_code = VK_NUMPAD1;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_NUMPAD2) {  // numpad2
    key_info.key_code = VK_NUMPAD2;
    key_info.scan_code = VK_NUMPAD2;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_NUMPAD3) {  // numpad3
    key_info.key_code = VK_NUMPAD3;
    key_info.scan_code = VK_NUMPAD3;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_NUMPAD4) {  // numpad4
    key_info.key_code = VK_NUMPAD4;
    key_info.scan_code = VK_NUMPAD4;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_NUMPAD5) {  // numpad5
    key_info.key_code = VK_NUMPAD5;
    key_info.scan_code = VK_NUMPAD5;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_NUMPAD6) {  // numpad6
    key_info.key_code = VK_NUMPAD6;
    key_info.scan_code = VK_NUMPAD6;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_NUMPAD7) {  // numpad7
    key_info.key_code = VK_NUMPAD7;
    key_info.scan_code = VK_NUMPAD7;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_NUMPAD8) {  // numpad8
    key_info.key_code = VK_NUMPAD8;
    key_info.scan_code = VK_NUMPAD8;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_NUMPAD9) {  // numpad9
    key_info.key_code = VK_NUMPAD9;
    key_info.scan_code = VK_NUMPAD9;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_MULTIPLY) {  // multiply
    key_info.key_code = VK_MULTIPLY;
    key_info.scan_code = VK_MULTIPLY;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_ADD) {  // add
    key_info.key_code = VK_ADD;
    key_info.scan_code = VK_ADD;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_SEPARATOR) {  // separator
    key_info.key_code = VkKeyScanExW(L',', layout);
    key_info.scan_code = MapVirtualKeyExW(LOBYTE(key_info.key_code), 0, layout);
  }
  else if (character == WD_KEY_SUBTRACT) {  // subtract
    key_info.key_code = VK_SUBTRACT;
    key_info.scan_code = VK_SUBTRACT;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_DECIMAL) {  // decimal
    key_info.key_code = VK_DECIMAL;
    key_info.scan_code = VK_DECIMAL;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_DIVIDE) {  // divide
    key_info.key_code = VK_DIVIDE;
    key_info.scan_code = VK_DIVIDE;
    key_info.is_extended_key = true;
  }
  else if (character == WD_KEY_F1) {  // F1
    key_info.key_code = VK_F1;
    key_info.scan_code = VK_F1;
  }
  else if (character == WD_KEY_F2) {  // F2
    key_info.key_code = VK_F2;
    key_info.scan_code = VK_F2;
  }
  else if (character == WD_KEY_F3) {  // F3
    key_info.key_code = VK_F3;
    key_info.scan_code = VK_F3;
  }
  else if (character == WD_KEY_F4) {  // F4
    key_info.key_code = VK_F4;
    key_info.scan_code = VK_F4;
  }
  else if (character == WD_KEY_F5) {  // F5
    key_info.key_code = VK_F5;
    key_info.scan_code = VK_F5;
  }
  else if (character == WD_KEY_F6) {  // F6
    key_info.key_code = VK_F6;
    key_info.scan_code = VK_F6;
  }
  else if (character == WD_KEY_F7) {  // F7
    key_info.key_code = VK_F7;
    key_info.scan_code = VK_F7;
  }
  else if (character == WD_KEY_F8) {  // F8
    key_info.key_code = VK_F8;
    key_info.scan_code = VK_F8;
  }
  else if (character == WD_KEY_F9) {  // F9
    key_info.key_code = VK_F9;
    key_info.scan_code = VK_F9;
  }
  else if (character == WD_KEY_F10) {  // F10
    key_info.key_code = VK_F10;
    key_info.scan_code = VK_F10;
  }
  else if (character == WD_KEY_F11) {  // F11
    key_info.key_code = VK_F11;
    key_info.scan_code = VK_F11;
  }
  else if (character == WD_KEY_F12) {  // F12
    key_info.key_code = VK_F12;
    key_info.scan_code = VK_F12;
  }
  else if (character == L'\n') {    // line feed
    key_info.key_code = VK_RETURN;
    key_info.scan_code = VK_RETURN;
  }
  else if (character == L'\r') {    // carriage return
    key_info.is_ignored_key = true; // skip it
  } else {
    key_info.key_code = VkKeyScanExW(character, layout);
    key_info.scan_code = MapVirtualKeyExW(LOBYTE(key_info.key_code), 0, layout);
    key_info.is_webdriver_key = false;
  }
  return key_info;
}

std::wstring InputManager::GetKeyDescription(const wchar_t character) {
  std::wstring description = L"";
  description.append(1, character);
  std::map<wchar_t, std::wstring>::const_iterator it = this->key_descriptions_.find(character);
  if (it != this->key_descriptions_.end()) {
    description = it->second;
  }
  return description;
}

void InputManager::SetupKeyDescriptions() {
  this->key_descriptions_[WD_KEY_NULL] = L"Unidentified";
  this->key_descriptions_[WD_KEY_CANCEL] = L"Cancel";
  this->key_descriptions_[WD_KEY_HELP] = L"Help";
  this->key_descriptions_[WD_KEY_BACKSPACE] = L"Backspace";
  this->key_descriptions_[WD_KEY_TAB] = L"Tab";
  this->key_descriptions_[WD_KEY_CLEAR] = L"Clear";
  this->key_descriptions_[WD_KEY_RETURN] = L"Return";
  this->key_descriptions_[WD_KEY_ENTER] = L"Enter";
  this->key_descriptions_[WD_KEY_SHIFT] = L"Shift";
  this->key_descriptions_[WD_KEY_CONTROL] = L"Control";
  this->key_descriptions_[WD_KEY_ALT] = L"Alt";
  this->key_descriptions_[WD_KEY_PAUSE] = L"Pause";
  this->key_descriptions_[WD_KEY_ESCAPE] = L"Escape";
  this->key_descriptions_[WD_KEY_SPACE] = L"Space";
  this->key_descriptions_[WD_KEY_PAGEUP] = L"PageUp";
  this->key_descriptions_[WD_KEY_PAGEDOWN] = L"PageDown";
  this->key_descriptions_[WD_KEY_END] = L"End";
  this->key_descriptions_[WD_KEY_HOME] = L"Home";
  this->key_descriptions_[WD_KEY_LEFT] = L"ArrowLeft";
  this->key_descriptions_[WD_KEY_UP] = L"ArrowUp";
  this->key_descriptions_[WD_KEY_RIGHT] = L"ArrowRight";
  this->key_descriptions_[WD_KEY_DOWN] = L"ArrowDown";
  this->key_descriptions_[WD_KEY_INSERT] = L"Insert";
  this->key_descriptions_[WD_KEY_DELETE] = L"Delete";
  this->key_descriptions_[WD_KEY_SEMICOLON] = L";";
  this->key_descriptions_[WD_KEY_EQUALS] = L"=";
  this->key_descriptions_[WD_KEY_NUMPAD0] = L"0";
  this->key_descriptions_[WD_KEY_NUMPAD1] = L"1";
  this->key_descriptions_[WD_KEY_NUMPAD2] = L"2";
  this->key_descriptions_[WD_KEY_NUMPAD3] = L"3";
  this->key_descriptions_[WD_KEY_NUMPAD4] = L"4";
  this->key_descriptions_[WD_KEY_NUMPAD5] = L"5";
  this->key_descriptions_[WD_KEY_NUMPAD6] = L"6";
  this->key_descriptions_[WD_KEY_NUMPAD7] = L"7";
  this->key_descriptions_[WD_KEY_NUMPAD8] = L"8";
  this->key_descriptions_[WD_KEY_NUMPAD9] = L"9";
  this->key_descriptions_[WD_KEY_MULTIPLY] = L"*";
  this->key_descriptions_[WD_KEY_ADD] = L"+";
  this->key_descriptions_[WD_KEY_SEPARATOR] = L",";
  this->key_descriptions_[WD_KEY_SUBTRACT] = L"-";
  this->key_descriptions_[WD_KEY_DECIMAL] = L".";
  this->key_descriptions_[WD_KEY_DIVIDE] = L"/";
  this->key_descriptions_[WD_KEY_F1] = L"F1";
  this->key_descriptions_[WD_KEY_F2] = L"F2";
  this->key_descriptions_[WD_KEY_F3] = L"F3";
  this->key_descriptions_[WD_KEY_F4] = L"F4";
  this->key_descriptions_[WD_KEY_F5] = L"F5";
  this->key_descriptions_[WD_KEY_F6] = L"F6";
  this->key_descriptions_[WD_KEY_F7] = L"F7";
  this->key_descriptions_[WD_KEY_F8] = L"F8";
  this->key_descriptions_[WD_KEY_F9] = L"F9";
  this->key_descriptions_[WD_KEY_F10] = L"F10";
  this->key_descriptions_[WD_KEY_F11] = L"F11";
  this->key_descriptions_[WD_KEY_F12] = L"F12";
  this->key_descriptions_[WD_KEY_META] = L"Meta";
  this->key_descriptions_[WD_KEY_ZEN] = L"ZenkakuHankaku";
  this->key_descriptions_[WD_KEY_R_SHIFT] = L"Shift";
  this->key_descriptions_[WD_KEY_R_CONTROL] = L"Control";
  this->key_descriptions_[WD_KEY_R_ALT] = L"Alt";
  this->key_descriptions_[WD_KEY_R_META] = L"Meta";
  this->key_descriptions_[WD_KEY_R_PAGEUP] = L"PageUp";
  this->key_descriptions_[WD_KEY_R_PAGEDN] = L"PageDown";
  this->key_descriptions_[WD_KEY_R_END] = L"End";
  this->key_descriptions_[WD_KEY_R_HOME] = L"Home";
  this->key_descriptions_[WD_KEY_R_LEFT] = L"ArrowLeft";
  this->key_descriptions_[WD_KEY_R_UP] = L"ArrowUp";
  this->key_descriptions_[WD_KEY_R_RIGHT] = L"ArrowRight";
  this->key_descriptions_[WD_KEY_R_DOWN] = L"ArrowDown";
  this->key_descriptions_[WD_KEY_R_INSERT] = L"Insert";
  this->key_descriptions_[WD_KEY_R_DELETE] = L"Delete";
}

} // namespace webdriver
