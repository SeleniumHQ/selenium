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

#ifndef WEBDRIVER_IE_INTERACTIONSMANAGER_H_
#define WEBDRIVER_IE_INTERACTIONSMANAGER_H_

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

#include <vector>

namespace webdriver {

class EventFiringData;

class InteractionsManager {
 public:
  InteractionsManager(void);
  ~InteractionsManager(void);

  void SendKeyDownMessage(HWND window_handle,
                          bool shift_pressed,
                          bool control_pressed,
                          bool alt_pressed,
                          int key_code,
                          int scan_code,
                          bool extended,
                          bool unicode,
                          bool shifted,
                          HKL layout,
                          std::vector<BYTE>* keyboard_state);
  void SendKeyUpMessage(HWND window_handle,
                        bool shift_pressed,
                        bool control_pressed,
                        bool alt_pressed,
                        int key_code,
                        int scan_code,
                        bool extended,
                        bool unicode,
                        bool shifted,
                        HKL layout,
                        std::vector<BYTE>* keyboard_state);

  void SendMouseMoveMessage(HWND window_handle,
                            bool shift_pressed,
                            bool control_pressed,
                            bool left_pressed,
                            bool right_pressed,
                            int x,
                            int y);
  void SendMouseUpMessage(HWND window_handle,
                          bool shift_pressed,
                          bool control_pressed,
                          bool left_pressed,
                          bool right_pressed,
                          int button,
                          int x,
                          int y);
  void SendMouseDownMessage(HWND window_handle,
                            bool shift_pressed,
                            bool control_pressed,
                            bool left_pressed,
                            bool right_pressed,
                            int button,
                            int x,
                            int y,
                            bool is_double_click);

  void stopPersistentEventFiring();
  void setEnablePersistentHover(bool enablePersistentHover);

  static DWORD WINAPI MouseEventFiringFunction(LPVOID lpParam);

  // Defaults to false, unless the driver explicitly turns this on.
  static bool gEnablePersistentEventFiring;
  // Thread for firing event
  static HANDLE hConstantEventsThread;

 private:

  void resumePersistentEventsFiring(HWND inputTo,
                                    long toX,
                                    long toY,
                                    WPARAM buttonValue);
  // Resume without changing the target. Used after pausing evennt
  // firing for mouse actions.
  void resumePersistentEventsFiring();
  // Pauses persistent event firing by the background thread.
  void pausePersistentEventsFiring();
  // When the state of the shift key changes, update the background thread
  // so that subsequent mouse over events will have the right keyboard state.
  void updateShiftKeyState(bool isShiftPressed);
  // When the left mouse button is pressed, update the background thread.
  // Otherwise IE gets confused.
  void updateLeftMouseButtonState(bool isButtonPressed);

  void setStateByFlag(bool shouldSetFlag, UINT flagValue);

  EventFiringData* EVENT_FIRING_DATA;

  bool shiftPressed;
  bool controlPressed;
  bool altPressed;

  bool leftMouseButtonPressed;

};

} // namespace webdriver

#endif // WEBDRIVER_IE_INTERACTIONSMANAGER_H_
