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


namespace webdriver {

// All the required information to post a keyboard event message.
struct KeySendingData {
  HWND to_window;
  HKL layout;
  BYTE* keyboardState;
  int pause_time;
};

class EventFiringData;

class InteractionsManager {
 public:
  InteractionsManager(void);
  ~InteractionsManager(void);

  // Keyboard interactions
  void sendKeys(HWND windowHandle, const wchar_t* value, int timePerKey);
  void releaseModifierKeys(HWND windowHandle, int timePerKey);
  void stopPersistentEventFiring();
  void setEnablePersistentHover(bool enablePersistentHover);

  // Mouse interactions
  LRESULT clickAt(HWND directInputTo, long x, long y, long button);
  LRESULT doubleClickAt(HWND directInputTo, long x, long y);
  LRESULT mouseDownAt(HWND directInputTo, long x, long y, long button);
  LRESULT mouseUpAt(HWND directInputTo, long x, long y, long button);
  LRESULT mouseMoveTo(HWND directInputTo,
                      long duration,
                      long fromX,
                      long fromY,
                      long toX,
                      long toY);
  LRESULT mouseDoubleClickDown(HWND directInputTo, long x, long y);

  static DWORD WINAPI MouseEventFiringFunction(LPVOID lpParam);

  // Defaults to false, unless the driver explicitly turns this on.
  static bool gEnablePersistentEventFiring;
  // Thread for firing event
  static HANDLE hConstantEventsThread;

 private:
  void backgroundUnicodeKeyPress(HWND ieWindow, wchar_t c, int pause);
  void sendModifierKeyDown(HWND hwnd,
                           HKL layout,
                           int modifierKeyCode,
                           BYTE keyboardState[256],
                           int pause);
  void sendModifierKeyUp(HWND hwnd,
                         HKL layout,
                         int modifierKeyCode,
                         BYTE keyboardState[256],
                         int pause);
  void sendModifierKeyDownIfNeeded(bool shouldSend,
                                   HWND hwnd,
                                   HKL layout,
                                   int modifierKeyCode,
                                   BYTE keyboardState[256],
                                   int pause);
  void sendModifierKeyUpIfNeeded(bool shouldSend,
                                 HWND hwnd,
                                 HKL layout,
                                 int modifierKeyCode,
                                 BYTE keyboardState[256],
                                 int pause);

  bool isShiftPressNeeded(WORD keyCode);
  bool isControlPressNeeded(WORD keyCode);
  bool isAltPressNeeded(WORD keyCode);
  
  LPARAM generateKeyMessageParam(UINT scanCode, bool extended);
  
  void backgroundKeyDown(HWND hwnd,
                         HKL layout,
                         BYTE keyboardState[256],
                         WORD keyCode,
                         UINT scanCode,
                         bool extended,
                         int pause);
  void backgroundKeyUp(HWND hwnd,
                       HKL layout,
                       BYTE keyboardState[256],
                       WORD keyCode,
                       UINT scanCode,
                       bool extended,
                       int pause);
  void backgroundKeyPress(HWND hwnd,
                          HKL layout,
                          BYTE keyboardState[256],
                          WORD keyCode,
                          UINT scanCode,
                          bool extended,
                          int pause);
  
  bool isClearAllModifiersCode(wchar_t c);
  bool isShiftCode(wchar_t c);
  bool isControlCode(wchar_t c);
  bool isAltCode(wchar_t c);
  bool isModifierCharacter(wchar_t c);
  
  void sendSingleModifierEventAndAdjustState(bool matchingModifier,
                                             bool& modifierState,
                                             int modifierKeyCode,
                                             KeySendingData sendData);
  void postModifierReleaseMessages(bool releaseShift, 
                                   bool releaseControl,
                                   bool releaseAlt,
                                   KeySendingData sendData);
  void sendModifierKeyEvent(wchar_t c, 
                            bool& shiftKey,
                            bool& controlKey,
                            bool& altKey,
                            KeySendingData sendData);

  void fillEventData(long button,
                     bool buttonDown,
                     UINT *message,
                     WPARAM *wparam);

  bool isSameThreadAs(HWND other);

  unsigned long distanceBetweenPoints(long fromX,
                                      long fromY,
                                      long toX,
                                      long toY);

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
