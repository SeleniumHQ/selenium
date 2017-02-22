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

#include "InteractionsManager.h"

#include <assert.h>
#include <math.h>

#include "logging.h"

#include "HookProcessor.h"
#include "WindowUtilities.h"

#define ENULLPOINTER 22

namespace webdriver {

bool InteractionsManager::gEnablePersistentEventFiring = false;
HANDLE InteractionsManager::hConstantEventsThread = NULL;

class EventFiringData
{
 public:
  EventFiringData(HWND directInputTo, long onX, long onY, WPARAM buttonValue) :
    m_shouldFire(true), m_keepRunning(true),
    m_to(directInputTo), m_x(onX), m_y(onY), m_buttonState(buttonValue) { }
  // Used to control temporary firing of events.
  void pauseFiring() { m_shouldFire = false; }
  void resumeFiring() { m_shouldFire = true; }
  bool shouldFire() { return m_shouldFire; }
  // Used to control the existance of the background thread:
  // when shouldRun returns false the thread will exit.
  void stopRunning() { m_keepRunning = false; }
  bool shouldRun() { return m_keepRunning; }

  // Information on where to send the event to.
  HWND getTarget() { return m_to; }
  long getXLocation() { return m_x; }
  long getYLocation() { return m_y; }
  WPARAM getInputDevicesState() { return m_buttonState; }

  // Update the keyboard state.
  void setInputDevicesState(WPARAM buttonValue) { m_buttonState = buttonValue; }

  // Fire events to a new window / coordinates.
  void setNewTarget(HWND directInputTo, long onX, long onY, WPARAM buttonValue)
  {
    m_to = directInputTo;
    m_x = onX;
    m_y = onY;
    m_buttonState = buttonValue;
  }

 private:
  bool m_shouldFire;
  bool m_keepRunning;
  HWND m_to;
  long m_x, m_y;
  WPARAM m_buttonState;
};

InteractionsManager::InteractionsManager() {
}

InteractionsManager::~InteractionsManager() {
}

void InteractionsManager::pausePersistentEventsFiring()
{
  if (!gEnablePersistentEventFiring) {
    // Persistent event firing is disabled.
    return;
  }
  if ((hConstantEventsThread != NULL) && (EVENT_FIRING_DATA != NULL)) {
    EVENT_FIRING_DATA->pauseFiring();
    Sleep(10 /* ms */);
  }
}

// Helper method to update the state of a given flag according to a toggle.
void InteractionsManager::setStateByFlag(bool shouldSetFlag, UINT flagValue)
{
  if (!gEnablePersistentEventFiring) {
    // Persistent event firing is disabled.
    return;
  }
  if ((hConstantEventsThread == NULL) || (EVENT_FIRING_DATA == NULL)) {
    return;
  }

  WPARAM currentInputState = EVENT_FIRING_DATA->getInputDevicesState();
  if (shouldSetFlag) {
    currentInputState |= flagValue;
  }
  else {
    currentInputState = currentInputState & (~static_cast<WPARAM>(flagValue));
  }
  EVENT_FIRING_DATA->setInputDevicesState(currentInputState);
}

void InteractionsManager::updateShiftKeyState(bool isShiftPressed)
{
  setStateByFlag(isShiftPressed, MK_SHIFT);
}

void InteractionsManager::updateLeftMouseButtonState(bool isButtonPressed)
{
  setStateByFlag(isButtonPressed, MK_LBUTTON);
}

// Creates a new thread if there isn't one up and running.
void InteractionsManager::resumePersistentEventsFiring(
  HWND inputTo, long toX, long toY, WPARAM buttonValue)
{
  if (!gEnablePersistentEventFiring) {
    // Persistent event firing is disabled.
    return;
  }

  if (hConstantEventsThread == NULL) {
    EVENT_FIRING_DATA = new EventFiringData(inputTo, toX, toY, buttonValue);
    hConstantEventsThread = CreateThread(
      NULL, // Security permissions.
      0, // default stack size.
      MouseEventFiringFunction,
      EVENT_FIRING_DATA,
      0, // default creation flags
      NULL);
  }
  else {
    EVENT_FIRING_DATA->setNewTarget(inputTo, toX, toY, buttonValue);
    EVENT_FIRING_DATA->resumeFiring();
  }
}

void InteractionsManager::resumePersistentEventsFiring()
{
  if (!gEnablePersistentEventFiring) {
    // Persistent event firing is disabled.
    return;
  }
  if ((hConstantEventsThread == NULL) || (EVENT_FIRING_DATA == NULL)) {
    return;
  }
  EVENT_FIRING_DATA->resumeFiring();
}

void InteractionsManager::stopPersistentEventFiring()
{
  if ((hConstantEventsThread != NULL) && (EVENT_FIRING_DATA != NULL)) {
    EVENT_FIRING_DATA->stopRunning();
    WaitForSingleObject(hConstantEventsThread, 2500 /* ms */);
    CloseHandle(hConstantEventsThread);
    hConstantEventsThread = NULL;
    delete EVENT_FIRING_DATA;
    EVENT_FIRING_DATA = NULL;
  }
}

void InteractionsManager::setEnablePersistentHover(bool enablePersistentHover)
{
  gEnablePersistentEventFiring = enablePersistentHover;
}

// Function passed to the thread.
DWORD WINAPI InteractionsManager::MouseEventFiringFunction(LPVOID lpParam)
{
  EventFiringData* firingData;

  firingData = (EventFiringData*)lpParam;
  // busy-wait loop, waiting for 10 milliseconds between
  // dispatching events. Since the thread is usually
  // paused for short periods of time (tens of milliseconds),
  // a more modern signalling method was not used.
  while (firingData->shouldRun()) {
    if (firingData->shouldFire()) {
      HWND target = firingData->getTarget();
      if (IsWindow(target)) {
        SendMessage(firingData->getTarget(),
          WM_MOUSEMOVE, firingData->getInputDevicesState(),
          MAKELPARAM(firingData->getXLocation(),
            firingData->getYLocation()));
      }
    }
    Sleep(10 /* ms */);
  }

  return 0;
}

void InteractionsManager::SendKeyDownMessage(HWND window_handle, bool shift_pressed, bool control_pressed, bool alt_pressed, int key_code, int scan_code, bool extended, bool unicode, bool shifted, HKL layout, std::vector<BYTE>* keyboard_state) {
  LPARAM lparam = 0;
  clock_t max_wait = clock() + 250;

  shiftPressed = shift_pressed;
  controlPressed = control_pressed;
  altPressed = alt_pressed;

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

void InteractionsManager::SendKeyUpMessage(HWND window_handle, bool shift_pressed, bool control_pressed, bool alt_pressed, int key_code, int scan_code, bool extended, bool unicode, bool shifted, HKL layout, std::vector<BYTE>* keyboard_state) {
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

void InteractionsManager::SendMouseMoveMessage(HWND window_handle, bool shift_pressed, bool control_pressed, bool left_pressed, bool right_pressed, int x, int y) {
  LRESULT message_timeout = 0;
  DWORD_PTR send_message_result = 0;
  WPARAM button_value = 0;
  if (left_pressed) {
    button_value |= MK_LBUTTON;
  }
  if (right_pressed) {
    button_value |= MK_RBUTTON;
  }
  if (shift_pressed) {
    button_value |= MK_SHIFT;
  }
  if (control_pressed) {
    button_value |= MK_CONTROL;
  }
  LPARAM coordinates = MAKELPARAM(x, y);
  message_timeout = ::SendMessageTimeout(window_handle, WM_MOUSEMOVE, button_value, coordinates, SMTO_NORMAL, 100, &send_message_result);
  if (message_timeout == 0) {
    LOGERR(WARN) << "MouseMove: SendMessageTimeout failed";
  }
}

void InteractionsManager::SendMouseDownMessage(HWND window_handle, bool shift_pressed, bool control_pressed, bool left_pressed, bool right_pressed, int button, int x, int y, bool is_double_click) {
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
  if (shift_pressed) {
    modifier |= MK_SHIFT;
  }
  if (control_pressed) {
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


void InteractionsManager::SendMouseUpMessage(HWND window_handle, bool shift_pressed, bool control_pressed, bool left_pressed, bool right_pressed, int button, int x, int y) {
  UINT msg = WM_LBUTTONUP;
  WPARAM button_value = MK_LBUTTON;
  if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
    msg = WM_RBUTTONUP;
    button_value = MK_RBUTTON;
  }
  int modifier = 0;
  if (shift_pressed) {
    modifier |= MK_SHIFT;
  }
  if (control_pressed) {
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
