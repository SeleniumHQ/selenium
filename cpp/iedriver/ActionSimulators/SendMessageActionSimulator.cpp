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

#include "SendMessageActionSimulator.h"

#include <assert.h>
#include <math.h>

#include "errorcodes.h"
#include "logging.h"

#include "../DocumentHost.h"
#include "../HookProcessor.h"
#include "../WindowUtilities.h"

namespace webdriver {

SendMessageActionSimulator::SendMessageActionSimulator() {
  this->keyboard_state_buffer_.resize(256);
  ::ZeroMemory(&this->keyboard_state_buffer_[0],
               this->keyboard_state_buffer_.size());
}

SendMessageActionSimulator::~SendMessageActionSimulator() {
}

int SendMessageActionSimulator::SimulateActions(BrowserHandle browser_wrapper,
                                                std::vector<INPUT> inputs,
                                                InputState* input_state) {
  LOG(TRACE) << "Entering InputManager::PerformInputWithSendMessage";
  HWND window_handle = browser_wrapper->GetContentWindowHandle();

  HookProcessor message_processor;
  message_processor.Initialize("GetMessageProc", WH_GETMESSAGE);
  if (!message_processor.CanSetWindowsHook(window_handle)) {
    LOG(WARN) << "Keystrokes may be slow! There is a mismatch in the "
              << "bitness between the driver and browser. In particular, "
              << "be sure you are not attempting to use a 64-bit "
              << "IEDriverServer.exe against IE 10 or 11, even on 64-bit "
              << "Windows.";
  }

  DWORD browser_thread_id = ::GetWindowThreadProcessId(window_handle, NULL);
  DWORD current_thread_id = ::GetCurrentThreadId();
  BOOL attached = ::AttachThreadInput(current_thread_id, browser_thread_id, TRUE);

  HKL layout = GetKeyboardLayout(browser_thread_id);

  int double_click_time = ::GetDoubleClickTime();

  std::vector<INPUT>::const_iterator input_iterator = inputs.begin();
  for (; input_iterator != inputs.end(); ++input_iterator) {
    INPUT current_input = *input_iterator;
    if (current_input.type == INPUT_MOUSE) {
      if (current_input.mi.dwFlags & MOUSEEVENTF_MOVE) {
        this->SendMouseMoveMessage(window_handle,
                                   *input_state,
                                   current_input.mi.dx,
                                   current_input.mi.dy);
      } else if (current_input.mi.dwFlags & MOUSEEVENTF_LEFTDOWN) {
        bool is_double_click = this->IsInputDoubleClick(current_input,
                                                        *input_state);
        this->SendMouseDownMessage(window_handle,
                                   *input_state,
                                   WD_CLIENT_LEFT_MOUSE_BUTTON,
                                   current_input.mi.dx,
                                   current_input.mi.dy,
                                   is_double_click);
      } else if (current_input.mi.dwFlags & MOUSEEVENTF_LEFTUP) {
        this->SendMouseUpMessage(window_handle,
                                 *input_state,
                                 WD_CLIENT_LEFT_MOUSE_BUTTON,
                                 current_input.mi.dx,
                                 current_input.mi.dy);
      } else if (current_input.mi.dwFlags & MOUSEEVENTF_RIGHTDOWN) {
        bool is_double_click = this->IsInputDoubleClick(current_input,
                                                        *input_state);
        this->SendMouseDownMessage(window_handle,
                                   *input_state,
                                   WD_CLIENT_RIGHT_MOUSE_BUTTON,
                                   current_input.mi.dx,
                                   current_input.mi.dy,
                                   is_double_click);
      } else if (current_input.mi.dwFlags & MOUSEEVENTF_RIGHTUP) {
        this->SendMouseUpMessage(window_handle,
                                 *input_state,
                                 WD_CLIENT_RIGHT_MOUSE_BUTTON,
                                 current_input.mi.dx,
                                 current_input.mi.dy);
      }
    } else if (current_input.type == INPUT_KEYBOARD) {
      bool unicode = (current_input.ki.dwFlags & KEYEVENTF_UNICODE) != 0;
      bool extended = (current_input.ki.dwFlags & KEYEVENTF_EXTENDEDKEY) != 0;
      if (current_input.ki.dwFlags & KEYEVENTF_KEYUP) {
        this->SendKeyUpMessage(window_handle,
                               *input_state,
                               current_input.ki.wVk,
                               current_input.ki.wScan,
                               extended,
                               unicode,
                               layout,
                               &this->keyboard_state_buffer_);
      } else {
        this->SendKeyDownMessage(window_handle,
                                 *input_state,
                                 current_input.ki.wVk,
                                 current_input.ki.wScan,
                                 extended,
                                 unicode,
                                 layout,
                                 &this->keyboard_state_buffer_);
      }
    } else if (current_input.type == INPUT_HARDWARE) {
      ::Sleep(current_input.hi.uMsg);
    }
    this->UpdateInputState(current_input, input_state);
  }
  attached = ::AttachThreadInput(current_thread_id, browser_thread_id, FALSE);
  message_processor.Dispose();
  return WD_SUCCESS;
}

bool SendMessageActionSimulator::IsInputDoubleClick(INPUT current_input,
                                                    InputState input_state) {
  DWORD double_click_time = ::GetDoubleClickTime();
  unsigned int time_since_last_click = static_cast<unsigned int>(static_cast<float>(clock() - input_state.last_click_time) / CLOCKS_PER_SEC * 1000);
  bool button_pressed = true;
  if ((current_input.mi.dwFlags & MOUSEEVENTF_LEFTDOWN) != 0) {
    button_pressed = input_state.is_left_button_pressed;
  }

  if ((current_input.mi.dwFlags & MOUSEEVENTF_RIGHTDOWN) != 0) {
    button_pressed = input_state.is_right_button_pressed;
  }

  if (!button_pressed &&
      input_state.mouse_x == current_input.mi.dx &&
      input_state.mouse_y == current_input.mi.dy &&
      time_since_last_click < double_click_time) {
    return true;
  }
  return false;
}

void SendMessageActionSimulator::SendKeyDownMessage(HWND window_handle,
                                                    InputState input_state,
                                                    int key_code,
                                                    int scan_code,
                                                    bool extended,
                                                    bool unicode,
                                                    HKL layout,
                                                    std::vector<BYTE>* keyboard_state) {
  LPARAM lparam = 0;
  clock_t max_wait = clock() + 250;

  if (key_code == VK_SHIFT || key_code == VK_CONTROL || key_code == VK_MENU) {
    (*keyboard_state)[key_code] |= 0x80;

    lparam = 1 | ::MapVirtualKeyEx(key_code, 0, layout) << 16;
    if (!::PostMessage(window_handle, WM_KEYDOWN, key_code, lparam)) {
      LOG(WARN) << "Modifier keydown failed: " << ::GetLastError();
    }

    WindowUtilities::Wait(0);
    return;
  }

  if (unicode) {
    wchar_t c = static_cast<wchar_t>(scan_code);
    SHORT keyscan = VkKeyScanW(c);
    HookProcessor::ResetEventCount();
    ::PostMessage(window_handle, WM_KEYDOWN, keyscan, lparam);
    ::PostMessage(window_handle, WM_USER, 1234, 5678);
    WindowUtilities::Wait(0);
    bool is_processed = HookProcessor::GetEventCount() > 0;
    while (!is_processed && clock() < max_wait) {
      WindowUtilities::Wait(5);
      is_processed = HookProcessor::GetEventCount() > 0;
    }
    ::PostMessage(window_handle, WM_CHAR, c, lparam);
    WindowUtilities::Wait(0);
  } else {
    key_code = LOBYTE(key_code);
    (*keyboard_state)[key_code] |= 0x80;
    ::SetKeyboardState(&((*keyboard_state)[0]));
    
    lparam = 1 | scan_code << 16;
    if (extended) {
      lparam |= 1 << 24;
    }

    HookProcessor::ResetEventCount();
    if (!::PostMessage(window_handle, WM_KEYDOWN, key_code, lparam)) {
      LOG(WARN) << "Key down failed: " << ::GetLastError();
    }

    ::PostMessage(window_handle, WM_USER, 1234, 5678);

    // Listen out for the keypress event which IE synthesizes when IE
    // processes the keydown message. Use a time out, just in case we
    // have not got the logic right :)

    bool is_processed = HookProcessor::GetEventCount() > 0;
    max_wait = clock() + 5000;
    while (!is_processed && clock() < max_wait) {
      WindowUtilities::Wait(5);
      is_processed = HookProcessor::GetEventCount() > 0;
      if (clock() >= max_wait) {
        LOG(WARN) << "Timeout awaiting keypress: " << key_code;
        break;
      }
    }
  }
}

void SendMessageActionSimulator::SendKeyUpMessage(HWND window_handle,
                                                  InputState input_state,
                                                  int key_code,
                                                  int scan_code,
                                                  bool extended,
                                                  bool unicode,
                                                  HKL layout,
                                                  std::vector<BYTE>* keyboard_state) {
  LPARAM lparam = 0;

  if (key_code == VK_SHIFT || key_code == VK_CONTROL || key_code == VK_MENU) {
    (*keyboard_state)[key_code] &= ~0x80;

    lparam = 1 | ::MapVirtualKeyEx(key_code, 0, layout) << 16;
    lparam |= 0x3 << 30;
    if (!::PostMessage(window_handle, WM_KEYUP, key_code, lparam)) {
      LOG(WARN) << "Modifier keyup failed: " << ::GetLastError();
    }

    WindowUtilities::Wait(0);
    return;
  }

  if (unicode) {
    wchar_t c = static_cast<wchar_t>(scan_code);
    SHORT keyscan = VkKeyScanW(c);
    ::PostMessage(window_handle, WM_KEYUP, keyscan, lparam);
  } else {
    key_code = LOBYTE(key_code);
    (*keyboard_state)[key_code] &= ~0x80;
    ::SetKeyboardState(&((*keyboard_state)[0]));

    lparam = 1 | scan_code << 16;
    if (extended) {
      lparam |= 1 << 24;
    }

    lparam |= 0x3 << 30;
    if (!::PostMessage(window_handle, WM_KEYUP, key_code, lparam)) {
      LOG(WARN) << "Key up failed: " << ::GetLastError();
    }

    WindowUtilities::Wait(0);
  }
}

void SendMessageActionSimulator::SendMouseMoveMessage(HWND window_handle,
                                                      InputState input_state,
                                                      int x,
                                                      int y) {
  LRESULT message_timeout = 0;
  DWORD_PTR send_message_result = 0;
  WPARAM button_value = 0;
  if (input_state.is_left_button_pressed) {
    button_value |= MK_LBUTTON;
  }
  if (input_state.is_right_button_pressed) {
    button_value |= MK_RBUTTON;
  }
  if (input_state.is_shift_pressed) {
    button_value |= MK_SHIFT;
  }
  if (input_state.is_control_pressed) {
    button_value |= MK_CONTROL;
  }
  LPARAM coordinates = MAKELPARAM(x, y);
  message_timeout = ::SendMessageTimeout(window_handle,
                                         WM_MOUSEMOVE,
                                         button_value,
                                         coordinates,
                                         SMTO_NORMAL,
                                         100,
                                         &send_message_result);
  if (message_timeout == 0) {
    LOGERR(WARN) << "MouseMove: SendMessageTimeout failed";
  }
}

void SendMessageActionSimulator::SendMouseDownMessage(HWND window_handle,
                                                      InputState input_state,
                                                      int button,
                                                      int x,
                                                      int y,
                                                      bool is_double_click) {
  UINT msg = WM_LBUTTONDOWN;
  WPARAM button_value = MK_LBUTTON;
  if (is_double_click) {
    msg = WM_LBUTTONDBLCLK;
  }
  if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
    msg = WM_RBUTTONDOWN;
    button_value = MK_RBUTTON;
    if (is_double_click) {
      msg = WM_RBUTTONDBLCLK;
    }
  }
  int modifier = 0;
  if (input_state.is_shift_pressed) {
    modifier |= MK_SHIFT;
  }
  if (input_state.is_control_pressed) {
    modifier |= MK_CONTROL;
  }
  button_value |= modifier;
  LPARAM coordinates = MAKELPARAM(x, y);
  // Must use PostMessage for mouse down because message gets lost with
  // SendMessage and variants. Use a SendMessage with WM_USER to ensure
  // the posted message has been processed.
  ::PostMessage(window_handle, msg, button_value, coordinates);
  ::SendMessage(window_handle, WM_USER, 0, 0);

  // This 5 millisecond sleep is important for the click element scenario,
  // as it allows the element to register and respond to the focus event. 
  ::Sleep(5);
}


void SendMessageActionSimulator::SendMouseUpMessage(HWND window_handle,
                                                    InputState input_state,
                                                    int button,
                                                    int x,
                                                    int y) {
  UINT msg = WM_LBUTTONUP;
  WPARAM button_value = MK_LBUTTON;
  if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
    msg = WM_RBUTTONUP;
    button_value = MK_RBUTTON;
  }
  int modifier = 0;
  if (input_state.is_shift_pressed) {
    modifier |= MK_SHIFT;
  }
  if (input_state.is_control_pressed) {
    modifier |= MK_CONTROL;
  }
  button_value |= modifier;
  LPARAM coordinates = MAKELPARAM(x, y);
  // To properly mimic manual mouse movement, we need a move before the up.
  ::SendMessage(window_handle, WM_MOUSEMOVE, modifier, coordinates);
  // Must use PostMessage for mouse up because message gets lost with
  // SendMessage and variants. Use a SendMessage with WM_USER to ensure
  // the posted message has been processed.
  ::PostMessage(window_handle, msg, button_value, coordinates);
  ::SendMessage(window_handle, WM_USER, 0, 0);
}

} // namespace webdriver

#ifdef __cplusplus
extern "C" {
#endif

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
