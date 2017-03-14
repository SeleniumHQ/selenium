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
  this->require_window_focus_ = true;
  this->scroll_behavior_ = TOP;
  this->is_alt_pressed_ = false;
  this->is_control_pressed_ = false;
  this->is_shift_pressed_ = false;
  this->last_known_mouse_x_ = -1;
  this->last_known_mouse_y_ = -1;

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

int InputManager::PerformInputSequence(BrowserHandle browser_wrapper, const Json::Value& sequence) {
  LOG(TRACE) << "Entering InputManager::PerformInputSequence";
  if (!sequence.isArray()) {
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

  if (this->require_window_focus_) {
    this->SetFocusToBrowser(browser_wrapper);
  }
  this->inputs_.clear();
  for (size_t i = 0; i < sequence.size(); ++i) {
    // N.B. If require_window_focus_ is true, all the following methods do is
    // fill the list of INPUT structs with the appropriate SendInput data
    // structures. Otherwise, the action gets performed within that method.
    Json::UInt index = static_cast<Json::UInt>(i);
    Json::Value action = sequence[index];
    std::string action_name = action["action"].asString();
    if (action_name == "moveto") {
      bool offset_specified = action.isMember("xoffset") && action.isMember("yoffset");
      status_code = this->MouseMoveTo(browser_wrapper,
                                      action.get("element", "").asString(),
                                      offset_specified,
                                      action.get("xoffset", 0).asInt(),
                                      action.get("yoffset", 0).asInt());
    } else if (action_name == "buttondown") {
      status_code = this->MouseButtonDown(browser_wrapper);
    } else if (action_name == "buttonup") {
      status_code = this->MouseButtonUp(browser_wrapper);
    } else if (action_name == "click") {
      status_code = this->MouseClick(browser_wrapper, action.get("button", 0).asInt());
    } else if (action_name == "doubleclick") {
      status_code = this->MouseDoubleClick(browser_wrapper);
    } else if (action_name == "keys") {
      if (action.isMember("value")) {
        Json::Value keystroke_array = action.get("value", Json::Value(Json::arrayValue));
        bool auto_release_modifiers = action.get("releaseModifiers", false).asBool();
        status_code = this->SendKeystrokes(browser_wrapper, keystroke_array, auto_release_modifiers);
      }
    }
    if (status_code != WD_SUCCESS) {
      // Received an error for one of the actions in the sequence.
      // Abort the sequence.
      break;
    }
  }

  // If there are inputs in the array, then we've queued up input actions
  // to be played back. So play them back.
  int sent_event_count = 0;
  if (status_code == WD_SUCCESS && this->inputs_.size() > 0) {
    // Leverage the data buffer size member in the shared memory
    // space. We set it to zero here, then reset it to its previous
    // value after we're done. N.B., there's a potential race condition
    // where multiple threads might step on each other. Use with care.
    int original_data_buffer_size = HookProcessor::GetDataBufferSize();
    HookProcessor::SetDataBufferSize(0);

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

    sent_event_count = ::SendInput(static_cast<UINT>(this->inputs_.size()), &this->inputs_[0], sizeof(INPUT));
    LOG(DEBUG) << "Sent " << sent_event_count << " events via SendInput()";
    bool wait_succeeded = this->WaitForInputEventProcessing(sent_event_count);
    std::string success = wait_succeeded ? "true" : "false";
    LOG(DEBUG) << "Wait for input event processing returned " << success;

    // We're done here, so uninstall the hooks, and reset the buffer size.
    keyboard_hook.Dispose();
    mouse_hook.Dispose();

    // A small sleep after all messages have been detected by an application
    // event loop is appropriate here. This value (50 milliseconds is chosen
    // as it's probably undetectable by most people observing the test running. 
    ::Sleep(50);
  }

  // Must always release the mutex.
  if (mutex_handle != NULL) {
    ::ReleaseMutex(mutex_handle);
    ::CloseHandle(mutex_handle);
  }
  return status_code;
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

  bool inputs_processed = HookProcessor::GetDataBufferSize() >= input_count;
  while (!inputs_processed && clock() < end) {
    // Sleep a short amount of time to prevent starving the processor.
    ::Sleep(25);
    inputs_processed = HookProcessor::GetDataBufferSize() >= input_count;
  }
  LOG(DEBUG) << "Number of inputs processed: " << HookProcessor::GetDataBufferSize();
  return inputs_processed;
}

bool InputManager::SetFocusToBrowser(BrowserHandle browser_wrapper) {
  LOG(TRACE) << "Entering InputManager::SetFocusToBrowser";
  UINT_PTR lock_timeout = 0;
  DWORD process_id = 0;
  DWORD thread_id = ::GetWindowThreadProcessId(browser_wrapper->GetContentWindowHandle(), &process_id);
  DWORD current_thread_id = ::GetCurrentThreadId();
  HWND current_foreground_window = ::GetForegroundWindow();
  if (current_foreground_window != browser_wrapper->GetTopLevelWindowHandle()) {
    if (current_thread_id != thread_id) {
      ::AttachThreadInput(current_thread_id, thread_id, TRUE);
      ::SystemParametersInfo(SPI_GETFOREGROUNDLOCKTIMEOUT, 0, &lock_timeout, 0);
      ::SystemParametersInfo(SPI_SETFOREGROUNDLOCKTIMEOUT, 0, 0, SPIF_SENDWININICHANGE | SPIF_UPDATEINIFILE);
      ::AllowSetForegroundWindow(ASFW_ANY);
    }
    ::SetForegroundWindow(browser_wrapper->GetTopLevelWindowHandle());
    if (current_thread_id != thread_id) {
      ::SystemParametersInfo(SPI_SETFOREGROUNDLOCKTIMEOUT, 0, reinterpret_cast<void*>(lock_timeout), SPIF_SENDWININICHANGE | SPIF_UPDATEINIFILE);
      ::AttachThreadInput(current_thread_id, thread_id, FALSE);
    }
  }
  return ::GetForegroundWindow() == browser_wrapper->GetTopLevelWindowHandle();
}

int InputManager::MouseClick(BrowserHandle browser_wrapper, int button) {
  LOG(TRACE) << "Entering InputManager::MouseClick";
  if (this->use_native_events_) {
    HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
    if (this->require_window_focus_) {
      LOG(DEBUG) << "Queueing SendInput structure for mouse click";
      int down_flag = MOUSEEVENTF_LEFTDOWN;
      int up_flag = MOUSEEVENTF_LEFTUP;
      if (button == WD_CLIENT_MIDDLE_MOUSE_BUTTON) {
        down_flag = MOUSEEVENTF_MIDDLEDOWN;
        up_flag = MOUSEEVENTF_MIDDLEUP;
      } else if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
        down_flag = MOUSEEVENTF_RIGHTDOWN;
        up_flag = MOUSEEVENTF_RIGHTUP;
      }
      this->AddMouseInput(browser_window_handle, down_flag, this->last_known_mouse_x_, this->last_known_mouse_y_);
      this->AddMouseInput(browser_window_handle, up_flag, this->last_known_mouse_x_, this->last_known_mouse_y_);
    } else {
      LOG(DEBUG) << "Using SendMessage method for mouse click";
      this->interactions_manager_->clickAt(browser_window_handle,
                                           this->last_known_mouse_x_,
                                           this->last_known_mouse_y_,
                                           button);
    }
  } else {
    LOG(DEBUG) << "Using synthetic events for mouse click";
    int script_arg_count = 2;
    std::wstring script_source = L"(function() { return function(){" + 
                                  atoms::asString(atoms::INPUTS) + 
                                  L"; return webdriver.atoms.inputs.click(arguments[0], arguments[1]);" + 
                                  L"};})();";
    if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
      script_arg_count = 1;
      script_source = L"(function() { return function(){" + 
                      atoms::asString(atoms::INPUTS) + 
                      L"; return webdriver.atoms.inputs.rightClick(arguments[0]);" + 
                      L"};})();";
    } else if (button == WD_CLIENT_MIDDLE_MOUSE_BUTTON) {
      LOG(WARN) << "Only right and left mouse click types are supported by synthetic events. A left mouse click will be performed.";
    } else if (button < WD_CLIENT_LEFT_MOUSE_BUTTON || button > WD_CLIENT_RIGHT_MOUSE_BUTTON) {
      // Write to the log, but still attempt the "click" anyway. The atom should catch the error.
      LOG(ERROR) << "Unsupported mouse button type is specified: " << button;
    }

    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);
    Script script_wrapper(doc, script_source, script_arg_count);

    if (script_arg_count > 1) {
      // The click input atom takes an element as its first argument,
      // but if we're passing a mouse state (which we are), it contains
      // the element we're interested in, so pass a null value. Other
      // input atoms only take a single argument.
      script_wrapper.AddNullArgument();
    }

    script_wrapper.AddArgument(this->mouse_state_);
    int status_code = script_wrapper.Execute();
    if (status_code == WD_SUCCESS) {
      this->mouse_state_ = script_wrapper.result();
    } else {
      LOG(WARN) << "Unable to execute js to perform mouse click";
      return status_code;
    }
  }
  return WD_SUCCESS;
}

int InputManager::MouseButtonDown(BrowserHandle browser_wrapper) {
  LOG(TRACE) << "Entering InputManager::MouseButtonDown";
  if (this->use_native_events_) {
    HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
    if (this->require_window_focus_) {
      LOG(DEBUG) << "Queuing SendInput structure for mouse button down";
      this->AddMouseInput(browser_window_handle, MOUSEEVENTF_LEFTDOWN, this->last_known_mouse_x_, this->last_known_mouse_y_);
    } else { 
      LOG(DEBUG) << "Using SendMessage method for mouse button down";
      //TODO: json wire protocol allows 3 mouse button types for this command
      this->interactions_manager_->mouseDownAt(browser_window_handle,
                                               this->last_known_mouse_x_,
                                               this->last_known_mouse_y_,
                                               MOUSEBUTTON_LEFT);
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

int InputManager::MouseButtonUp(BrowserHandle browser_wrapper) {
  LOG(TRACE) << "Entering InputManager::MouseButtonUp";
  if (this->use_native_events_) {
    HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
    if (this->require_window_focus_) {
      LOG(DEBUG) << "Queuing SendInput structure for mouse button up";
      this->AddMouseInput(browser_window_handle, MOUSEEVENTF_LEFTUP, this->last_known_mouse_x_, this->last_known_mouse_y_);
    } else { 
      LOG(DEBUG) << "Using SendMessage method for mouse button up";
      //TODO: json wire protocol allows 3 mouse button types for this command
      this->interactions_manager_->mouseUpAt(browser_window_handle,
                                             this->last_known_mouse_x_,
                                             this->last_known_mouse_y_,
                                             MOUSEBUTTON_LEFT);
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

int InputManager::MouseDoubleClick(BrowserHandle browser_wrapper) {
  LOG(TRACE) << "Entering InputManager::MouseDoubleClick";
  if (this->use_native_events_) {
    HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
    if (this->require_window_focus_) {
      LOG(DEBUG) << "Queueing SendInput structure for mouse double click";
      this->AddMouseInput(browser_window_handle, MOUSEEVENTF_LEFTDOWN, this->last_known_mouse_x_, this->last_known_mouse_y_);
      this->AddMouseInput(browser_window_handle, MOUSEEVENTF_LEFTUP, this->last_known_mouse_x_, this->last_known_mouse_y_);
      this->AddMouseInput(browser_window_handle, MOUSEEVENTF_LEFTDOWN, this->last_known_mouse_x_, this->last_known_mouse_y_);
      this->AddMouseInput(browser_window_handle, MOUSEEVENTF_LEFTUP, this->last_known_mouse_x_, this->last_known_mouse_y_);
    } else { 
      LOG(DEBUG) << "Using SendMessage method for mouse double click";
      this->interactions_manager_->doubleClickAt(browser_window_handle,
                                                 this->last_known_mouse_x_,
                                                 this->last_known_mouse_y_);
    }
  } else {
    LOG(DEBUG) << "Using synthetic events for mouse double click";
    std::wstring script_source = L"(function() { return function(){" + 
                                  atoms::asString(atoms::INPUTS) + 
                                  L"; return webdriver.atoms.inputs.doubleClick(arguments[0]);" + 
                                  L"};})();";

    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);
    Script script_wrapper(doc, script_source, 1);
    script_wrapper.AddArgument(this->mouse_state_);
    int status_code = script_wrapper.Execute();
    if (status_code == WD_SUCCESS) {
      this->mouse_state_ = script_wrapper.result();
    } else {
      LOG(WARN) << "Unable to execute js to double click";
      return status_code;
    }
  }
  return WD_SUCCESS;
}

int InputManager::MouseMoveTo(BrowserHandle browser_wrapper, std::string element_id, bool offset_specified, int x_offset, int y_offset) {
  LOG(TRACE) << "Entering InputManager::MouseMoveTo";
  int status_code = WD_SUCCESS;    
  bool element_specified = element_id.size() != 0;
  ElementHandle target_element;
  if (element_specified) {
    status_code = this->element_map_->GetManagedElement(element_id, &target_element);
    if (status_code != WD_SUCCESS) {
      return status_code;
    }
  }
  if (this->use_native_events_) {
    long start_x = this->last_known_mouse_x_;
    long start_y = this->last_known_mouse_y_;

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
          LOG(WARN) <<  "No offset was specified, and the center point of the element could not be scrolled into view.";
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
      // offset.
      end_x += x_offset;
      end_y += y_offset;
    }

    HWND browser_window_handle = browser_wrapper->GetContentWindowHandle();
    if (this->require_window_focus_) {
      if (end_x == this->last_known_mouse_x_ && end_y == this->last_known_mouse_y_) {
        LOG(DEBUG) << "Omitting SendInput structure for mouse move; no movement required";
      } else {
        LOG(DEBUG) << "Queueing SendInput structure for mouse move";
        this->AddMouseInput(browser_window_handle, MOUSEEVENTF_MOVE, end_x, end_y);
      }
    } else {
      LOG(DEBUG) << "Using SendMessage method for mouse move";
      LRESULT move_result = this->interactions_manager_->mouseMoveTo(browser_window_handle,
                                                                     10,
                                                                     start_x,
                                                                     start_y,
                                                                     end_x,
                                                                     end_y);
    }
    this->last_known_mouse_x_ = end_x;
    this->last_known_mouse_y_ = end_y;
  } else { // Fall back on synthesized events.
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

void InputManager::SetPersistentEvents(bool is_firing) {
  this->interactions_manager_->setEnablePersistentHover(is_firing);
}

void InputManager::StopPersistentEvents() {
  this->interactions_manager_->stopPersistentEventFiring();
}

int InputManager::SendKeystrokes(BrowserHandle browser_wrapper, Json::Value keystroke_array, bool auto_release_modifier_keys) {
  LOG(TRACE) << "Entering InputManager::SendKeystrokes";
  int status_code = WD_SUCCESS;
  std::wstring keys = L"";
  for (unsigned int i = 0; i < keystroke_array.size(); ++i ) {
    std::string key(keystroke_array[i].asString());
    keys.append(StringUtilities::ToWString(key));
  }
  if (this->enable_native_events()) {
    HWND window_handle = browser_wrapper->GetContentWindowHandle();
    HookProcessor hook;
    if (!hook.CanSetWindowsHook(window_handle)) {
      LOG(WARN) << "SENDING KEYSTROKES WILL BE SLOW! There is a mismatch "
                << "in the bitness between the driver and browser. In "
                << "particular, be sure you are not attempting to use a "
                << "64-bit IEDriverServer.exe against IE 10 or 11, even on "
                << "64-bit Windows.";
    }
    if (this->require_window_focus_) {
      LOG(DEBUG) << "Queueing Sendinput structures for sending keys";
      for (unsigned int char_index = 0; char_index < keys.size(); ++char_index) {
        wchar_t character = keys[char_index];
        this->AddKeyboardInput(window_handle, character);
      }
      if (auto_release_modifier_keys) {
        this->AddKeyboardInput(window_handle, WD_KEY_NULL);
      }
    } else {
      LOG(DEBUG) << "Using SendMessage method for sending keys";
      this->interactions_manager_->sendKeys(window_handle, keys.c_str(), 0);
      if (auto_release_modifier_keys) {
        this->interactions_manager_->releaseModifierKeys(window_handle, 0);
      }
    }
  } else {
    LOG(DEBUG) << "Using synthetic events for sending keys";
    std::wstring script_source =
        L"(function() { return function(){" + 
        atoms::asString(atoms::INPUTS) + 
        L"; return webdriver.atoms.inputs.sendKeys(" +
        L"arguments[0], arguments[1], arguments[2], arguments[3]);" + 
        L"};})();";
    bool persist_modifier_keys = !auto_release_modifier_keys;

    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);
    Script script_wrapper(doc, script_source, 4);
          
    script_wrapper.AddNullArgument();
    script_wrapper.AddArgument(keys);
    script_wrapper.AddArgument(this->keyboard_state());
    script_wrapper.AddArgument(persist_modifier_keys);
    status_code = script_wrapper.Execute();
    if (status_code == WD_SUCCESS) {
      this->set_keyboard_state(script_wrapper.result());
    } else {
      LOG(WARN) << "Unable to execute js to send keystrokes";
    }
  }
  return status_code;
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

void InputManager::AddMouseInput(HWND window_handle, long input_action, int x, int y) {
  LOG(TRACE) << "Entering InputManager::AddMouseInput";
  int normalized_x = 0, normalized_y = 0;
  this->GetNormalizedCoordinates(window_handle,
                                 x, 
                                 y, 
                                 &normalized_x, 
                                 &normalized_y);
  INPUT mouse_input;
  mouse_input.type = INPUT_MOUSE;
  mouse_input.mi.dwFlags = input_action | MOUSEEVENTF_ABSOLUTE;
  mouse_input.mi.dx = normalized_x;
  mouse_input.mi.dy = normalized_y;
  mouse_input.mi.dwExtraInfo = 0;
  mouse_input.mi.mouseData = 0;
  mouse_input.mi.time = 0;
  this->inputs_.push_back(mouse_input);
}

void InputManager::AddKeyboardInput(HWND window_handle, wchar_t character) {
  LOG(TRACE) << "Entering InputManager::AddKeyboardInput";

  if (this->IsModifierKey(character)) {
    KeyInfo modifier_key_info = { 0, 0, false, false };
    if (character == WD_KEY_SHIFT || (character == WD_KEY_NULL && this->is_shift_pressed_)) {
      // If the character represents the Shift key, or represents the 
      // "release all modifiers" key and the Shift key is down, send
      // the appropriate down or up keystroke for the Shift key.
      modifier_key_info.key_code = VK_SHIFT;
      this->CreateKeyboardInputItem(modifier_key_info, 0, this->is_shift_pressed_);
      if (this->is_shift_pressed_) {
        this->is_shift_pressed_ = false;
      } else {
        this->is_shift_pressed_ = true;
      }
    }

    if (character == WD_KEY_CONTROL || (character == WD_KEY_NULL && this->is_control_pressed_)) {
      // If the character represents the Control key, or represents the 
      // "release all modifiers" key and the Control key is down, send
      // the appropriate down or up keystroke for the Control key.
      modifier_key_info.key_code = VK_CONTROL;
      this->CreateKeyboardInputItem(modifier_key_info, 0, this->is_control_pressed_);
      if (this->is_control_pressed_) {
        this->is_control_pressed_ = false;
      } else {
        this->is_control_pressed_ = true;
      }
    }

    if (character == WD_KEY_ALT || (character == WD_KEY_NULL && this->is_alt_pressed_)) {
      // If the character represents the Alt key, or represents the 
      // "release all modifiers" key and the Alt key is down, send
      // the appropriate down or up keystroke for the Alt key.
      modifier_key_info.key_code = VK_MENU;
      this->CreateKeyboardInputItem(modifier_key_info, 0, this->is_alt_pressed_);
      if (this->is_alt_pressed_) {
        this->is_alt_pressed_ = false;
      } else {
        this->is_alt_pressed_ = true;
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

      this->CreateKeyboardInputItem(key_info, KEYEVENTF_UNICODE, false);
      this->CreateKeyboardInputItem(key_info, KEYEVENTF_UNICODE, true);
      return;
    }
  }

  if (HIBYTE(key_info.key_code) == 1 && !this->is_shift_pressed_) {
    // Requested key is a Shift + <key>. Thus, don't use the key code.
    // Instead, send a Shift keystroke, and use the scan code of the key. 
    KeyInfo shift_key_info = { VK_SHIFT, 0, false, false };
    this->CreateKeyboardInputItem(shift_key_info, 0, false);

    key_info.key_code = 0;
    this->CreateKeyboardInputItem(key_info, KEYEVENTF_SCANCODE, false);
    this->CreateKeyboardInputItem(key_info, KEYEVENTF_SCANCODE, true);

    this->CreateKeyboardInputItem(shift_key_info, 0, true);
  } else {
    key_info.scan_code = 0;

    this->CreateKeyboardInputItem(key_info, 0, false);
    this->CreateKeyboardInputItem(key_info, 0, true);
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
  }
  else {
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
  // Yes, we could use the following one-liner:
  // webdriver::HookProcessor::SetDataBufferSize(++webdriver::HookProcessor::GetDataBufferSize());
  // but this construction is clearer of intent, and should be mostly
  // inlined by the compiler anyway.
  int message_count = webdriver::HookProcessor::GetDataBufferSize();
  ++message_count;
  webdriver::HookProcessor::SetDataBufferSize(message_count);
  return ::CallNextHookEx(NULL, nCode, wParam, lParam);
}

LRESULT CALLBACK MouseHookProc(int nCode, WPARAM wParam, LPARAM lParam) {
  // Yes, we could use the following one-liner:
  // webdriver::HookProcessor::SetDataBufferSize(++webdriver::HookProcessor::GetDataBufferSize());
  // but this construction is clearer of intent, and should be mostly
  // inlined by the compiler anyway.
  int message_count = webdriver::HookProcessor::GetDataBufferSize();
  ++message_count;
  webdriver::HookProcessor::SetDataBufferSize(message_count);
  return ::CallNextHookEx(NULL, nCode, wParam, lParam);
}

LRESULT CALLBACK GetMessageProc(int nCode, WPARAM wParam, LPARAM lParam) {
  if ((nCode == HC_ACTION) && (wParam == PM_REMOVE)) {
    MSG* msg = reinterpret_cast<MSG*>(lParam);
    if (msg->message == WM_USER && msg->wParam == 1234 && msg->lParam == 5678) {
      int message_count = webdriver::HookProcessor::GetDataBufferSize();
      message_count += 50;
      webdriver::HookProcessor::SetDataBufferSize(message_count);
    }
  }

  return CallNextHookEx(NULL, nCode, wParam, lParam);
}

#ifdef __cplusplus
}
#endif
