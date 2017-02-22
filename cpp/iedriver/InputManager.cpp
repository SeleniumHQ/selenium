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

#include "Element.h"
#include "ElementRepository.h"
#include "HookProcessor.h"
#include "InteractionsManager.h"
#include "Script.h"
#include "StringUtilities.h"
#include "Generated/atoms.h"

#define USER_INTERACTION_MUTEX_NAME L"WebDriverUserInteractionMutex"
#define WAIT_TIME_IN_MILLISECONDS_PER_INPUT_EVENT 100

namespace webdriver {

InputManager::InputManager() {
  LOG(TRACE) << "Entering InputManager::InputManager";
  this->use_native_events_ = true;
  this->use_persistent_hover_ = false;
  this->require_window_focus_ = true;
  this->scroll_behavior_ = TOP;
  this->is_alt_pressed_ = false;
  this->is_control_pressed_ = false;
  this->is_shift_pressed_ = false;
  this->is_left_button_pressed_ = false;
  this->is_right_button_pressed_ = false;
  this->last_known_mouse_x_ = -1;
  this->last_known_mouse_y_ = -1;
  this->last_click_time_ = clock();

  this->keyboard_state_buffer_.resize(256);
  ::ZeroMemory(&this->keyboard_state_buffer_[0], this->keyboard_state_buffer_.size());

  CComVariant keyboard_state;
  keyboard_state.vt = VT_NULL;
  this->keyboard_state_ = keyboard_state;

  CComVariant mouse_state;
  mouse_state.vt = VT_NULL;
  this->mouse_state_ = mouse_state;

  this->interactions_manager_ = new InteractionsManager();
}

InputManager::~InputManager(void) {
  if (this->interactions_manager_ != NULL) {
    delete this->interactions_manager_;
  }
}

void InputManager::Initialize(ElementRepository* element_map) {
  LOG(TRACE) << "Entering InputManager::Initialize";
  this->element_map_ = element_map;
}

int InputManager::PerformInputSequence(BrowserHandle browser_wrapper, const Json::Value& sequences) {
  LOG(TRACE) << "Entering InputManager::PerformInputSequence";
  if (!sequences.isArray()) {
    return EUNHANDLEDERROR;
  }

  int status_code = WD_SUCCESS;
  // Use a single mutex, so that all instances synchronize on the same object 
  // for focus purposes.
  HANDLE mutex_handle = ::CreateMutex(NULL, FALSE, USER_INTERACTION_MUTEX_NAME);
  if (mutex_handle != NULL) {
    // Wait for up to the timeout (currently 30 seconds) for other sessions
    // to completely initialize.
    DWORD mutex_wait_status = ::WaitForSingleObject(mutex_handle, 30000);
    if (mutex_wait_status == WAIT_ABANDONED) {
      LOG(WARN) << "Acquired mutex, but received wait abandoned status. This "
                << "could mean the process previously owning the mutex was "
                << "unexpectedly terminated.";
    } else if (mutex_wait_status == WAIT_TIMEOUT) {
      LOG(WARN) << "Could not acquire mutex within the timeout. Multiple "
                << "instances may have incorrect synchronization for interactions";
    } else if (mutex_wait_status == WAIT_OBJECT_0) {
      LOG(DEBUG) << "Mutex acquired for user interaction.";
    }
  } else {
    LOG(WARN) << "Could not create user interaction mutex. Multiple " 
              << "instances of IE may behave unpredictably.";
  }

  std::vector<int> tick_durations;
  Json::Value ticks(Json::arrayValue);
  this->inputs_.clear();
  for (size_t i = 0; i < sequences.size(); ++i) {
    // N.B. If require_window_focus_ is true, all the following methods do is
    // fill the list of INPUT structs with the appropriate SendInput data
    // structures. Otherwise, the action gets performed within that method.
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
      if (ticks.size() <= j) {
        Json::Value tick(Json::arrayValue);
        ticks.append(tick);
        tick_durations.push_back(static_cast<int>(j));
      }
      Json::UInt action_index = static_cast<Json::UInt>(j);
      Json::Value action = actions[action_index];
      if (action.isMember("duration") && action["duration"].isInt() && action["duration"].asInt() >= tick_durations[j]) {
        tick_durations[j] = action["duration"].asInt();
      }
      ticks[action_index].append(action);
    }
  }
  int tick_duration = 0;
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
        return status_code;
      }
    }
  }

  // If there are inputs in the array, then we've queued up input actions
  // to be played back. So play them back.
  if (this->inputs_.size() > 0) {
    if (this->require_window_focus_) {
      this->PerformInputWithSendInput(browser_wrapper);
    } else {
      this->PerformInputWithSendMessage(browser_wrapper);
    }
  }

  ::Sleep(50);

  // Must always release the mutex.
  if (mutex_handle != NULL) {
    ::ReleaseMutex(mutex_handle);
    ::CloseHandle(mutex_handle);
  }
  return status_code;
}

int InputManager::PerformInputWithSendInput(BrowserHandle browser_wrapper) {
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

  HWND window_handle = browser_wrapper->GetContentWindowHandle();
  // Loop through all of the input items, and find all of the sleeps.
  std::vector<size_t> sleep_indexes;
  for (size_t i = 0; i < this->inputs_.size(); ++i) {
    INPUT current_input = this->inputs_[i];
    this->UpdateInputState(current_input);
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
      this->inputs_[i] = current_input;
    }
  }

  // Send all inputs between sleeps, sleeping in between.
  size_t next_input_index = 0;
  std::vector<size_t>::const_iterator it = sleep_indexes.begin();
  for (; it != sleep_indexes.end(); ++it) {
    INPUT sleep_input = this->inputs_[*it];
    size_t number_of_inputs = *it - next_input_index;
    if (number_of_inputs > 0) {
      this->SetFocusToBrowser(browser_wrapper);
      HookProcessor::ResetEventCount();
      int sent_inputs = ::SendInput(static_cast<int>(number_of_inputs), &this->inputs_[next_input_index], sizeof(INPUT));
      this->WaitForInputEventProcessing(sent_inputs);
    }
    ::Sleep(this->inputs_[*it].hi.uMsg);
    next_input_index = *it + 1;
  }
  // Now send any inputs after the last sleep, if any.
  size_t last_inputs = this->inputs_.size() - next_input_index;
  if (last_inputs > 0) {
    this->SetFocusToBrowser(browser_wrapper);
    HookProcessor::ResetEventCount();
    int sent_inputs = ::SendInput(static_cast<int>(last_inputs), &this->inputs_[next_input_index], sizeof(INPUT));
    this->WaitForInputEventProcessing(sent_inputs);
  }

  // We're done here, so uninstall the hooks, and reset the buffer size.
  keyboard_hook.Dispose();
  mouse_hook.Dispose();

  return WD_SUCCESS;
}

int InputManager::PerformInputWithSendMessage(BrowserHandle browser_wrapper) {
  HookProcessor message_processor;
  message_processor.Initialize("GetMessageProc", WH_GETMESSAGE);

  HWND window_handle = browser_wrapper->GetContentWindowHandle();
  DWORD browser_thread_id = ::GetWindowThreadProcessId(window_handle, NULL);
  DWORD current_thread_id = ::GetCurrentThreadId();
  BOOL attached = ::AttachThreadInput(current_thread_id, browser_thread_id, TRUE);

  HKL layout = GetKeyboardLayout(browser_thread_id);

  int double_click_time = ::GetDoubleClickTime();

  std::vector<INPUT>::const_iterator input_iterator = this->inputs_.begin();
  for (; input_iterator != this->inputs_.end(); ++input_iterator) {
    INPUT current_input = *input_iterator;
    if (current_input.type == INPUT_MOUSE) {
      if (current_input.mi.dwFlags & MOUSEEVENTF_MOVE) {
        this->interactions_manager_->SendMouseMoveMessage(window_handle, this->is_shift_pressed_, this->is_control_pressed_, this->is_left_button_pressed_, this->is_right_button_pressed_, current_input.mi.dx, current_input.mi.dy);
      } else if (current_input.mi.dwFlags & MOUSEEVENTF_LEFTDOWN) {
        bool is_double_click = false;
        int time_since_last_click = static_cast<int>(static_cast<float>(clock() - this->last_click_time_) / CLOCKS_PER_SEC * 1000);
        if (!this->is_left_button_pressed_ &&
            this->last_known_mouse_x_ == current_input.mi.dx &&
            this->last_known_mouse_y_ == current_input.mi.dy &&
            time_since_last_click < double_click_time) {
          is_double_click = true;
        }
        this->interactions_manager_->SendMouseDownMessage(window_handle, this->is_shift_pressed_, this->is_control_pressed_, this->is_left_button_pressed_, this->is_right_button_pressed_, WD_CLIENT_LEFT_MOUSE_BUTTON, current_input.mi.dx, current_input.mi.dy, is_double_click);
      } else if (current_input.mi.dwFlags & MOUSEEVENTF_LEFTUP) {
        this->interactions_manager_->SendMouseUpMessage(window_handle, this->is_shift_pressed_, this->is_control_pressed_, this->is_left_button_pressed_, this->is_right_button_pressed_, WD_CLIENT_LEFT_MOUSE_BUTTON, current_input.mi.dx, current_input.mi.dy);
      } else if (current_input.mi.dwFlags & MOUSEEVENTF_RIGHTDOWN) {
        bool is_double_click = false;
        int time_since_last_click = static_cast<int>(static_cast<float>(clock() - this->last_click_time_) / CLOCKS_PER_SEC * 1000);
        if (!this->is_right_button_pressed_ &&
            this->last_known_mouse_x_ == current_input.mi.dx &&
            this->last_known_mouse_y_ == current_input.mi.dy &&
            time_since_last_click < double_click_time) {
          is_double_click = true;
        }
        this->interactions_manager_->SendMouseDownMessage(window_handle, this->is_shift_pressed_, this->is_control_pressed_, this->is_left_button_pressed_, this->is_right_button_pressed_, WD_CLIENT_RIGHT_MOUSE_BUTTON, current_input.mi.dx, current_input.mi.dy, is_double_click);
      } else if (current_input.mi.dwFlags & MOUSEEVENTF_RIGHTUP) {
        this->interactions_manager_->SendMouseUpMessage(window_handle, this->is_shift_pressed_, this->is_control_pressed_, this->is_left_button_pressed_, this->is_right_button_pressed_, WD_CLIENT_RIGHT_MOUSE_BUTTON, current_input.mi.dx, current_input.mi.dy);
      }
    } else if (current_input.type == INPUT_KEYBOARD) {
      bool unicode = (current_input.ki.dwFlags & KEYEVENTF_UNICODE) != 0;
      bool extended = (current_input.ki.dwFlags & KEYEVENTF_EXTENDEDKEY) != 0;
      bool shifted = (current_input.ki.dwFlags & KEYEVENTF_SCANCODE) != 0;
      if (current_input.ki.dwFlags & KEYEVENTF_KEYUP) {
        this->interactions_manager_->SendKeyUpMessage(window_handle, this->is_shift_pressed_, this->is_control_pressed_, this->is_alt_pressed_, current_input.ki.wVk, current_input.ki.wScan, extended, unicode, shifted, layout, &this->keyboard_state_buffer_);
      } else {
        this->interactions_manager_->SendKeyDownMessage(window_handle, this->is_shift_pressed_, this->is_control_pressed_, this->is_alt_pressed_, current_input.ki.wVk, current_input.ki.wScan, extended, unicode, shifted, layout, &this->keyboard_state_buffer_);
      }
    } else if (current_input.type == INPUT_HARDWARE) {
      ::Sleep(current_input.hi.uMsg);
    }
    this->UpdateInputState(current_input);
  }
  attached = ::AttachThreadInput(current_thread_id, browser_thread_id, FALSE);
  message_processor.Dispose();
  return WD_SUCCESS;
}

void InputManager::UpdateInputState(INPUT current_input) {
  if (current_input.type == INPUT_MOUSE) {
    if (current_input.mi.dwFlags & MOUSEEVENTF_MOVE) {
      this->last_known_mouse_x_ = current_input.mi.dx;
      this->last_known_mouse_y_ = current_input.mi.dy;
    } else if (current_input.mi.dwFlags & MOUSEEVENTF_LEFTDOWN) {
      this->is_left_button_pressed_ = true;
    } else if (current_input.mi.dwFlags & MOUSEEVENTF_LEFTUP) {
      if (this->is_left_button_pressed_ && 
          this->last_known_mouse_x_ == current_input.mi.dx &&
          this->last_known_mouse_y_ == current_input.mi.dy) {
        this->last_click_time_ = clock();
      }
      this->is_left_button_pressed_ = false;
    } else if (current_input.mi.dwFlags & MOUSEEVENTF_RIGHTDOWN) {
      this->is_right_button_pressed_ = true;
    } else if (current_input.mi.dwFlags & MOUSEEVENTF_RIGHTUP) {
      this->is_right_button_pressed_ = false;
    }
  } else if (current_input.type == INPUT_KEYBOARD) {
    if (current_input.ki.dwFlags & KEYEVENTF_KEYUP) {
      if (current_input.ki.wVk == VK_SHIFT) {
        this->is_shift_pressed_ = false;
      } else if (current_input.ki.wVk == VK_CONTROL) {
        this->is_control_pressed_ = false;
      } else if (current_input.ki.wVk == VK_MENU) {
        this->is_alt_pressed_ = false;
      }
    } else {
      if (current_input.ki.wVk == VK_SHIFT) {
        this->is_shift_pressed_ = true;
      } else if (current_input.ki.wVk == VK_CONTROL) {
        this->is_control_pressed_ = true;
      } else if (current_input.ki.wVk == VK_MENU) {
        this->is_alt_pressed_ = true;
      }
    }
  }
}

InputState InputManager::CloneCurrentInputState(void) {
  InputState current_input_state;
  current_input_state.is_alt_pressed = this->is_alt_pressed_;
  current_input_state.is_control_pressed = this->is_control_pressed_;
  current_input_state.is_shift_pressed = this->is_shift_pressed_;
  current_input_state.is_left_button_pressed = this->is_left_button_pressed_;
  current_input_state.is_right_button_pressed = this->is_right_button_pressed_;
  current_input_state.mouse_x = this->last_known_mouse_x_;
  current_input_state.mouse_y = this->last_known_mouse_y_;
  return current_input_state;
}

bool InputManager::WaitForInputEventProcessing(int input_count) {
  LOG(TRACE) << "Entering InputManager::WaitForInputEventProcessing";
  // Adaptive wait. The total wait time is the number of input messages
  // expected by the hook multiplied by a static wait time for each
  // message to be processed (currently 100 milliseconds). We should
  // exit out of this loop once the number of processed windows keyboard
  // or mouse messages processed by the system exceeds the number of
  // input events created by the call to SendInput.
  int total_timeout_in_milliseconds = input_count * WAIT_TIME_IN_MILLISECONDS_PER_INPUT_EVENT;
  clock_t end = clock() + (total_timeout_in_milliseconds / 1000 * CLOCKS_PER_SEC);

  int processed_event_count = HookProcessor::GetEventCount();
  bool inputs_processed = processed_event_count >= input_count;
  while (!inputs_processed && clock() < end) {
    // Sleep a short amount of time to prevent starving the processor.
    ::Sleep(25);
    processed_event_count = HookProcessor::GetEventCount();
    inputs_processed = processed_event_count >= input_count;
  }
  LOG(DEBUG) << "Number of inputs processed: " << processed_event_count;
  return inputs_processed;
}

bool InputManager::SetFocusToBrowser(BrowserHandle browser_wrapper) {
  LOG(TRACE) << "Entering InputManager::SetFocusToBrowser";
  UINT_PTR lock_timeout = 0;
  DWORD process_id = 0;
  DWORD thread_id = ::GetWindowThreadProcessId(browser_wrapper->GetContentWindowHandle(), &process_id);
  DWORD current_thread_id = ::GetCurrentThreadId();
  DWORD current_process_id = ::GetCurrentProcessId();
  HWND current_foreground_window = ::GetForegroundWindow();
  if (current_foreground_window != browser_wrapper->GetTopLevelWindowHandle()) {
    if (current_thread_id != thread_id) {
      ::AttachThreadInput(current_thread_id, thread_id, TRUE);
      ::SystemParametersInfo(SPI_GETFOREGROUNDLOCKTIMEOUT, 0, &lock_timeout, 0);
      ::SystemParametersInfo(SPI_SETFOREGROUNDLOCKTIMEOUT, 0, 0, SPIF_SENDWININICHANGE | SPIF_UPDATEINIFILE);
      ::AllowSetForegroundWindow(current_process_id);
    }
    ::SetForegroundWindow(browser_wrapper->GetTopLevelWindowHandle());
    if (current_thread_id != thread_id) {
      ::SystemParametersInfo(SPI_SETFOREGROUNDLOCKTIMEOUT, 0, reinterpret_cast<void*>(lock_timeout), SPIF_SENDWININICHANGE | SPIF_UPDATEINIFILE);
      ::AttachThreadInput(current_thread_id, thread_id, FALSE);
    }
  }
  return ::GetForegroundWindow() == browser_wrapper->GetTopLevelWindowHandle();
}

int InputManager::PointerMoveTo(BrowserHandle browser_wrapper, const Json::Value& move_to_action, InputState* input_state) {
  int status_code = WD_SUCCESS;
  bool element_specified = false;
  std::string origin = "viewport";
  if (move_to_action.isMember("origin")) {
    Json::Value origin_value = move_to_action["origin"];
    if (origin_value.isString()) {
      origin = origin_value.asString();
    } else if (origin_value.isObject() && origin_value.isMember("element-6066-11e4-a52e-4f735466cecf")) {
      origin = origin_value["element-6066-11e4-a52e-4f735466cecf"].asString();
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
  
  bool offset_specified = move_to_action.isMember("x") && move_to_action.isMember("y") && x_offset != 0 && y_offset != 0;

  long duration = 0;
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
  if (this->use_native_events_) {
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

    if (offset_specified) {
      // An offset was specified. At this point, the end coordinates should be
      // set to either (1) the previous mouse position if there was no element
      // specified, or (2) the origin of the element from which to calculate the
      // offset, or (3) the absolute position within the view port.
      if (origin == "viewport") {
        end_x = x_offset;
        end_y = y_offset;
      } else {
        end_x += x_offset;
        end_y += y_offset;
      }
    }

    HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
    if (end_x == input_state->mouse_x && end_y == input_state->mouse_y) {
      LOG(DEBUG) << "Omitting SendInput structure for mouse move; no movement required";
    } else {
      long difference_x = abs(end_x - input_state->mouse_x);
      long difference_y = abs(end_y - input_state->mouse_y);
      long distance = (long)sqrt(pow((double)difference_x, 2) + pow((double)difference_y, 2));

      const int step_count = 10;
      const int step_size = 5;
      int steps = distance / step_size;

      long step_sleep = duration / max(step_count, 1);

      for (int i = 0; i < step_count; i++) {
        //To avoid integer division rounding and cumulative floating point errors,
        //calculate from scratch each time
        int current_x = (int)(input_state->mouse_x + ((end_x - input_state->mouse_x) * ((double)i) / step_count));
        int current_y = (int)(input_state->mouse_y + ((end_y - input_state->mouse_y) * ((double)i) / step_count));
        this->AddMouseInput(browser_window_handle, MOUSEEVENTF_MOVE, current_x, current_y);
        if (step_sleep > 0) {
          this->AddPauseInput(browser_window_handle, step_sleep);
        }
      }
      this->AddMouseInput(browser_window_handle, MOUSEEVENTF_MOVE, end_x, end_y);
      if (step_sleep > 0) {
        this->AddPauseInput(browser_window_handle, step_sleep);
      }
    }
    input_state->mouse_x = end_x;
    input_state->mouse_y = end_y;
  } else { 
    // Fall back on synthesized events.
    LOG(DEBUG) << "Using synthetic events for mouse move";
    std::wstring script_source = L"(function() { return function(){" +
                                 atoms::asString(atoms::INPUTS) +
                                 L"; return webdriver.atoms.inputs.mouseMove(arguments[0], arguments[1], arguments[2], arguments[3]);" +
                                 L"};})();";

    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);
    Script script_wrapper(doc, script_source, 4);

    if (element_specified) {
      script_wrapper.AddArgument(target_element->element());
    } else {
      script_wrapper.AddNullArgument();
    }

    if (offset_specified) {
      script_wrapper.AddArgument(x_offset);
      script_wrapper.AddArgument(y_offset);
    } else {
      script_wrapper.AddNullArgument();
      script_wrapper.AddNullArgument();
    }

    script_wrapper.AddArgument(this->mouse_state_);
    status_code = script_wrapper.Execute();
    if (status_code == WD_SUCCESS) {
      this->mouse_state_ = script_wrapper.result();
    } else {
      LOG(WARN) << "Unable to execute js to mouse move";
    }
  }
  return status_code;
}

int InputManager::PointerDown(BrowserHandle browser_wrapper, const Json::Value& down_action, InputState* input_state) {
  int button = down_action["button"].asInt();
  if (this->use_native_events_) {
    HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
    LOG(DEBUG) << "Queuing SendInput structure for mouse button down";
    long button_event_value = MOUSEEVENTF_LEFTDOWN;
    if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
      button_event_value = MOUSEEVENTF_RIGHTDOWN;
    }
    this->AddMouseInput(browser_window_handle, button_event_value, input_state->mouse_x, input_state->mouse_y);
    if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
      input_state->is_right_button_pressed = true;
    } else {
      input_state->is_left_button_pressed = true;
    }
  } else {
    LOG(DEBUG) << "Using synthetic events for mouse button down";
    std::wstring script_source = L"(function() { return function(){" +
                                 atoms::asString(atoms::INPUTS) +
                                 L"; return webdriver.atoms.inputs.mouseButtonDown(arguments[0]);" +
                                 L"};})();";

    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);
    Script script_wrapper(doc, script_source, 1);
    script_wrapper.AddArgument(this->mouse_state_);
    int status_code = script_wrapper.Execute();
    if (status_code == WD_SUCCESS) {
      this->mouse_state_ = script_wrapper.result();
    } else {
      LOG(WARN) << "Unable to execute js to perform mouse button down";
      return status_code;
    }
  }
  return WD_SUCCESS;
}

int InputManager::PointerUp(BrowserHandle browser_wrapper, const Json::Value& up_action, InputState* input_state) {
  int button = up_action["button"].asInt();
  LOG(TRACE) << "Entering InputManager::MouseButtonUp";
  if (this->use_native_events_) {
    HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
    LOG(DEBUG) << "Queuing SendInput structure for mouse button down";
    long button_event_value = MOUSEEVENTF_LEFTUP;
    if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
      button_event_value = MOUSEEVENTF_RIGHTUP;
    }
    this->AddMouseInput(browser_window_handle, button_event_value, input_state->mouse_x, input_state->mouse_y);
    if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
      input_state->is_right_button_pressed = false;
    } else {
      input_state->is_left_button_pressed = false;
    }
  } else {
    LOG(DEBUG) << "Using synthetic events for mouse button up";
    std::wstring script_source = L"(function() { return function(){" +
                                 atoms::asString(atoms::INPUTS) +
                                 L"; return webdriver.atoms.inputs.mouseButtonUp(arguments[0]);" +
                                 L"};})();";

    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);
    Script script_wrapper(doc, script_source, 1);
    script_wrapper.AddArgument(this->mouse_state_);
    int status_code = script_wrapper.Execute();
    if (status_code == WD_SUCCESS) {
      this->mouse_state_ = script_wrapper.result();
    } else {
      LOG(WARN) << "Unable to execute js to perform mouse button up";
      return status_code;
    }
  }
  return WD_SUCCESS;
}

int InputManager::KeyDown(BrowserHandle browser_wrapper, const Json::Value & down_action, InputState* input_state) {
  int status_code = WD_SUCCESS;
  std::string key_value = down_action["value"].asString();
  std::wstring key = StringUtilities::ToWString(key_value);

  if (this->enable_native_events()) {
    HWND window_handle = browser_wrapper->GetContentWindowHandle();
    wchar_t character = key[0];
    this->AddKeyboardInput(window_handle, character, false, input_state);
  } else {
    LOG(DEBUG) << "Using synthetic events for sending keys";
    std::wstring script_source = L"(function() { return function(){" +
                                 atoms::asString(atoms::INPUTS) +
                                 L"; return webdriver.atoms.inputs.sendKeys(" +
                                 L"arguments[0], arguments[1], arguments[2], arguments[3]);" +
                                 L"};})();";
    //bool persist_modifier_keys = !auto_release_modifier_keys;

    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);
    Script script_wrapper(doc, script_source, 4);

    script_wrapper.AddNullArgument();
    script_wrapper.AddArgument(key);
    script_wrapper.AddArgument(this->keyboard_state());
    script_wrapper.AddArgument(true);
    status_code = script_wrapper.Execute();
    if (status_code == WD_SUCCESS) {
      this->set_keyboard_state(script_wrapper.result());
    }
    else {
      LOG(WARN) << "Unable to execute js to send keystrokes";
    }
  }
  return status_code;
}

int InputManager::KeyUp(BrowserHandle browser_wrapper, const Json::Value & up_action, InputState* input_state) {
  int status_code = WD_SUCCESS;
  std::string key_value = up_action["value"].asString();
  std::wstring key = StringUtilities::ToWString(key_value);

  if (this->enable_native_events()) {
    HWND window_handle = browser_wrapper->GetContentWindowHandle();
    wchar_t character = key[0];
    this->AddKeyboardInput(window_handle, character, true, input_state);
  } else {
    LOG(DEBUG) << "Using synthetic events for sending keys";
    std::wstring script_source = L"(function() { return function(){" +
      atoms::asString(atoms::INPUTS) +
      L"; return webdriver.atoms.inputs.sendKeys(" +
      L"arguments[0], arguments[1], arguments[2], arguments[3]);" +
      L"};})();";
    //bool persist_modifier_keys = !auto_release_modifier_keys;

    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);
    Script script_wrapper(doc, script_source, 4);

    script_wrapper.AddNullArgument();
    script_wrapper.AddArgument(key);
    script_wrapper.AddArgument(this->keyboard_state());
    script_wrapper.AddArgument(true);
    status_code = script_wrapper.Execute();
    if (status_code == WD_SUCCESS) {
      this->set_keyboard_state(script_wrapper.result());
    }
    else {
      LOG(WARN) << "Unable to execute js to send keystrokes";
    }
  }
  return status_code;
}

int InputManager::Pause(BrowserHandle browser_wrapper, const Json::Value & pause_action) {
  int status_code = 0;
  int duration = pause_action["duration"].asInt();
  if (duration > 0) {
    this->AddPauseInput(browser_wrapper->GetContentWindowHandle(), duration);
  }
  return status_code;
}

void InputManager::StartPersistentEvents() {
  if (this->use_persistent_hover_) {
    this->interactions_manager_->setEnablePersistentHover(true);
  }
}

void InputManager::StopPersistentEvents() {
  this->interactions_manager_->stopPersistentEventFiring();
}

void InputManager::GetNormalizedCoordinates(HWND window_handle, int x, int y, int* normalized_x, int* normalized_y) {
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

void InputManager::AddKeyboardInput(HWND window_handle, wchar_t character, bool key_up, InputState* input_state) {
  LOG(TRACE) << "Entering InputManager::AddKeyboardInput";

  if (this->IsModifierKey(character)) {
    KeyInfo modifier_key_info = { 0, 0, false, false };
    if (character == WD_KEY_SHIFT || (character == WD_KEY_NULL && input_state->is_shift_pressed)) {
      // If the character represents the Shift key, or represents the 
      // "release all modifiers" key and the Shift key is down, send
      // the appropriate down or up keystroke for the Shift key.
      modifier_key_info.key_code = VK_SHIFT;
      this->CreateKeyboardInputItem(modifier_key_info, 0, input_state->is_shift_pressed);
      if (input_state->is_shift_pressed) {
        input_state->is_shift_pressed = false;
      } else {
        input_state->is_shift_pressed = true;
      }
    }

    if (character == WD_KEY_CONTROL || (character == WD_KEY_NULL && input_state->is_control_pressed)) {
      // If the character represents the Control key, or represents the 
      // "release all modifiers" key and the Control key is down, send
      // the appropriate down or up keystroke for the Control key.
      modifier_key_info.key_code = VK_CONTROL;
      this->CreateKeyboardInputItem(modifier_key_info, 0, input_state->is_control_pressed);
      if (input_state->is_control_pressed) {
        input_state->is_control_pressed = false;
      } else {
        input_state->is_control_pressed = true;
      }
    }

    if (character == WD_KEY_ALT || (character == WD_KEY_NULL && input_state->is_alt_pressed)) {
      // If the character represents the Alt key, or represents the 
      // "release all modifiers" key and the Alt key is down, send
      // the appropriate down or up keystroke for the Alt key.
      modifier_key_info.key_code = VK_MENU;
      this->CreateKeyboardInputItem(modifier_key_info, 0, input_state->is_alt_pressed);
      if (input_state->is_alt_pressed) {
        input_state->is_alt_pressed = false;
      } else {
        input_state->is_alt_pressed = true;
      }
    }
    return;
  }

  KeyInfo key_info = this->GetKeyInfo(window_handle, character);
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

  if (HIBYTE(key_info.key_code) == 1 && !input_state->is_shift_pressed) {
    // Requested key is a Shift + <key>. Thus, don't use the key code.
    // Instead, send a Shift keystroke, and use the scan code of the key.
    if (!key_up) {
      KeyInfo shift_key_info = { VK_SHIFT, 0, false, false };
      this->CreateKeyboardInputItem(shift_key_info, 0, false);
    }

    this->CreateKeyboardInputItem(key_info, KEYEVENTF_SCANCODE, key_up);

    if (key_up) {
      KeyInfo shift_key_info = { VK_SHIFT, 0, false, false };
      this->CreateKeyboardInputItem(shift_key_info, 0, true);
    }
  } else {
    //key_info.scan_code = 0;

    this->CreateKeyboardInputItem(key_info, 0, key_up);
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
  input_element.ki.dwExtraInfo = 0;
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
         character == WD_KEY_NULL;
}

KeyInfo InputManager::GetKeyInfo(HWND window_handle, wchar_t character) {
  KeyInfo key_info;
  key_info.is_extended_key = false;
  key_info.is_webdriver_key = true;
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
                                    // skip it
  } else {
    key_info.key_code = VkKeyScanExW(character, layout);
    key_info.scan_code = MapVirtualKeyExW(LOBYTE(key_info.key_code), 0, layout);
    key_info.is_webdriver_key = false;
  }
  return key_info;
}

} // namespace webdriver

#ifdef __cplusplus
extern "C" {
#endif

LRESULT CALLBACK KeyboardHookProc(int nCode, WPARAM wParam, LPARAM lParam) {
  webdriver::HookProcessor::IncrementEventCount(1);
  return ::CallNextHookEx(NULL, nCode, wParam, lParam);
}

LRESULT CALLBACK MouseHookProc(int nCode, WPARAM wParam, LPARAM lParam) {
  webdriver::HookProcessor::IncrementEventCount(1);
  return ::CallNextHookEx(NULL, nCode, wParam, lParam);
}

LRESULT CALLBACK GetMessageProc(int nCode, WPARAM wParam, LPARAM lParam) {
  if ((nCode == HC_ACTION) && (wParam == PM_REMOVE)) {
    MSG* msg = reinterpret_cast<MSG*>(lParam);
    if (msg->message == WM_USER && msg->wParam == 1234 && msg->lParam == 5678) {
      int message_count = 50;
      webdriver::HookProcessor::IncrementEventCount(message_count);
    }
  }

  return CallNextHookEx(NULL, nCode, wParam, lParam);
}

#ifdef __cplusplus
}
#endif
