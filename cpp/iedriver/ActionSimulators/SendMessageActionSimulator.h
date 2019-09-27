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

#ifndef WEBDRIVER_IE_SENDMESSAGEACTIONSIMULATOR_H_
#define WEBDRIVER_IE_SENDMESSAGEACTIONSIMULATOR_H_

// definitions for mouse buttons
// NOTE: These values correspond to GDK mouse button values.
// If these values are changed, native events for linux *will* be broken
// *unless* interactions_linux_mouse.cpp is updated.
#define MOUSEBUTTON_LEFT (1)
#define MOUSEBUTTON_MIDDLE (2)
#define MOUSEBUTTON_RIGHT (3)

#define WD_CLIENT_LEFT_MOUSE_BUTTON 0
#define WD_CLIENT_MIDDLE_MOUSE_BUTTON 1
#define WD_CLIENT_RIGHT_MOUSE_BUTTON 2

#include "ActionSimulator.h"

namespace webdriver {

class EventFiringData;

class SendMessageActionSimulator : public ActionSimulator {
 public:
  SendMessageActionSimulator(void);
  virtual ~SendMessageActionSimulator(void);

  int SimulateActions(BrowserHandle browser_wrapper,
                     std::vector<INPUT> inputs,
                     InputState* input_state);

 private:
  void SendKeyDownMessage(HWND window_handle,
                          InputState input_state,
                          int key_code,
                          int scan_code,
                          bool extended,
                          bool unicode,
                          HKL layout,
                          std::vector<BYTE>* keyboard_state);
  void SendKeyUpMessage(HWND window_handle,
                        InputState input_state,
                        int key_code,
                        int scan_code,
                        bool extended,
                        bool unicode,
                        HKL layout,
                        std::vector<BYTE>* keyboard_state);

  void SendMouseMoveMessage(HWND window_handle,
                            InputState input_state,
                            int x,
                            int y);
  void SendMouseUpMessage(HWND window_handle,
                          InputState input_state,
                          int button,
                          int x,
                          int y);
  void SendMouseDownMessage(HWND window_handle,
                            InputState input_state,
                            int button,
                            int x,
                            int y,
                            bool is_double_click);

  bool IsInputDoubleClick(INPUT current_input, InputState input_state);

  std::vector<BYTE> keyboard_state_buffer_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SENDMESSAGEACTIONSIMULATOR_H_
