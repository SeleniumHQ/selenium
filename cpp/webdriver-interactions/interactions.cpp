/*
Licensed to the Software Freedom Conservancy (SFC) under one
or more contributor license agreements. See the NOTICE file
distributed with this work for additional information
regarding copyright ownership. The SFC licenses this file
to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#include "stdafx.h"

#include <ctime>
#include <string>
#include <iostream>

#include "interactions.h"
#include "interactions_common.h"
#include "logging.h"
#include "event_firing_thread.h"

#define ENULLPOINTER 22

using namespace std;

#pragma data_seg(".LISTENER")
static bool pressed = false;
// The following booleans indicate whether any of the modifier keys are
// depressed. These booleans represent the state from the user's point of
// view - not if a modifier is depressed for the current key press (there
// is an explanation on why modifier keys have to be pressed and depressed
// for some keys below).
// Each modifier key can only be held down when sendKeys was called without
// calling releaseModifierKeys. The modifier key will only be released when
// sendKeys(Keys.NULL) is called or sendKeys() is called again (with the same
// modifier).
// Ordinarily, sendKeys would generate the following keys sequence when
// called with sendKeys("AB"):
// Shift_Down A_Down A_Up Shift_Up Shift_Down B_Down B_Up Shift_Up
// However, when sendKeys is called using the new Interactions API,
// the modifier keys are not released. So, we want the letters to be
// capitalized if Shift is pressed. The following calls:
// * sendKeyPress(SHIFT)
// * sendKeys("ab")
// * sendKeyRelease(SHIFT)
// Should generate the following events:
// Shift_Down A_Down A_Up B_Down B_Up Shift_Up
// With *capital* a and b. Using this boolean, we can tell if the shift key
// was held down by these calls and should generate upper-case chars.
static bool shiftPressed = false;
static bool controlPressed = false;
static bool altPressed = false;
static HHOOK hook = 0;
static HINSTANCE moduleHandle = NULL;

#pragma data_seg()
#pragma comment(linker, "/section:.LISTENER,rws")

// Left Mouse button pressed?
static bool leftMouseButtonPressed = false;

void backgroundUnicodeKeyPress(HWND ieWindow, wchar_t c, int pause)
{
  pause = pause / 3;

  // IE can crash if keyscan < 0. It's unclear this will
  // do anything unless the correct keyboard layout is active,
  // as the unicode character 'c' will already have its
  // appropriate capitalization.
  SHORT keyscan = VkKeyScanW(c);
  if (keyscan < 0) { 
    keyscan = 0;
  }
  pressed = false;
  PostMessage(ieWindow, WM_KEYDOWN, keyscan, 0);
  PostMessage(ieWindow, WM_USER, 1234, 5678);
  wait(pause);

  // TODO: There must be a better way to tell when the keydown is processed
  clock_t maxWait = clock() + 250;
  while (!pressed && clock() < maxWait) {
    wait(5);
  }

  PostMessage(ieWindow, WM_CHAR, c, 0);

  wait(pause);

  PostMessage(ieWindow, WM_KEYUP, keyscan, 0);

  wait(pause);
}

void sendModifierKeyDown(HWND hwnd, HKL layout, int modifierKeyCode,
    BYTE keyboardState[256], int pause) {
    keyboardState[modifierKeyCode] |= 0x80;

    LPARAM modifierKey = 1 | MapVirtualKeyEx(modifierKeyCode, 0, layout) << 16;
    if (!PostMessage(hwnd, WM_KEYDOWN, modifierKeyCode, modifierKey)) {
        LOG(WARN) << "Modifier keydown failed: " << GetLastError();
    }

    wait(pause);
}

void sendModifierKeyUp(HWND hwnd, HKL layout, int modifierKeyCode,
    BYTE keyboardState[256], int pause) {
    keyboardState[modifierKeyCode] &= ~0x80;

    LPARAM modifierKey = 1 | MapVirtualKeyEx(modifierKeyCode, 0, layout) << 16;
    modifierKey |= 0x3 << 30;

    if (!PostMessage(hwnd, WM_KEYUP, modifierKeyCode, modifierKey)) {
        LOG(WARN) << "Modifier keyup failed: " << GetLastError();
    }
    wait(pause);

}

void sendModifierKeyDownIfNeeded(bool shouldSend, HWND hwnd, HKL layout,
    int modifierKeyCode, BYTE keyboardState[256], int pause) {

    if (shouldSend) {
        sendModifierKeyDown(hwnd, layout, modifierKeyCode, keyboardState,
            pause);
    }
}

void sendModifierKeyUpIfNeeded(bool shouldSend, HWND hwnd, HKL layout,
    int modifierKeyCode, BYTE keyboardState[256], int pause) {

    if (shouldSend) {
        sendModifierKeyUp(hwnd, layout, modifierKeyCode, keyboardState,
            pause);
    }
}

bool isShiftPressNeeded(WORD keyCode) {
    return (keyCode & 0x0100) != 0;
}

bool isControlPressNeeded(WORD keyCode) {
    return (keyCode & 0x0200) != 0;
}

bool isAltPressNeeded(WORD keyCode) {
    return (keyCode & 0x0400) != 0; 
}

LPARAM generateKeyMessageParam(UINT scanCode, bool extended)
{
	LPARAM lparam = 1;
	lparam |= scanCode << 16;
	if (extended) {
		lparam |= 1 << 24;
	}
	
	return lparam;
}

void backgroundKeyDown(HWND hwnd, HKL layout, BYTE keyboardState[256],
		WORD keyCode, UINT scanCode, bool extended, int pause)
{
    // For capital letters and symbols requiring the shift key to be pressed,
    // A Shift key press must preceed. Unless the shift key is pressed - if
    // shiftPressed is true, then a shift key-down was sent in the past.
    sendModifierKeyDownIfNeeded(isShiftPressNeeded(keyCode) && (!shiftPressed), hwnd, layout,
        VK_SHIFT, keyboardState, pause);

    sendModifierKeyDownIfNeeded(isControlPressNeeded(keyCode) && (!controlPressed), hwnd, layout,
        VK_CONTROL, keyboardState, pause);

    sendModifierKeyDownIfNeeded(isAltPressNeeded(keyCode) && (!altPressed), hwnd, layout,
        VK_MENU, keyboardState, pause);

    // In order to produce an upper case character, the keyboard state should
    // be modified. See the documentation of shiftPressed to understand why
    // it's done only in this case.
    if ((shiftPressed) || (isShiftPressNeeded(keyCode))) {
      keyboardState[VK_SHIFT] |= 0x80;
    }

    keyCode = LOBYTE(keyCode);
    keyboardState[keyCode] |= 0x80;

    SetKeyboardState(keyboardState);

    LPARAM lparam = generateKeyMessageParam(scanCode, extended);

    pressed = false;
    if (!PostMessage(hwnd, WM_KEYDOWN, keyCode, lparam)) {
      LOG(WARN) << "Key down failed: " << GetLastError();
    }

    PostMessage(hwnd, WM_USER, 1234, 5678);

    // Listen out for the keypress event which IE synthesizes when IE
    // processes the keydown message. Use a time out, just in case we
    // have not got the logic right :)

    clock_t maxWait = clock() + 5000;
    while (!pressed) {
      wait(5);
      if (clock() >= maxWait) {
        LOG(WARN) << "Timeout awaiting keypress: " << keyCode;
        break;
      }
    }
}

void backgroundKeyUp(HWND hwnd, HKL layout, BYTE keyboardState[256],
		WORD keyCode, UINT scanCode, bool extended, int pause)
{
    WORD origKeyCode = keyCode;
	keyCode = LOBYTE(keyCode);
	keyboardState[keyCode] &= ~0x80;

    LPARAM lparam = generateKeyMessageParam(scanCode, extended);
	lparam |= 0x3 << 30;
	if (!PostMessage(hwnd, WM_KEYUP, keyCode, lparam)) {
	    LOG(WARN) << "Key up failed: " << GetLastError();
	}

	wait(pause);

  sendModifierKeyUpIfNeeded(isShiftPressNeeded(origKeyCode) && (!shiftPressed), hwnd, layout,
      VK_SHIFT, keyboardState, pause);
  sendModifierKeyUpIfNeeded(isControlPressNeeded(origKeyCode) && (!controlPressed), hwnd, layout,
      VK_CONTROL, keyboardState, pause);
  sendModifierKeyUpIfNeeded(isAltPressNeeded(origKeyCode) && (!altPressed), hwnd, layout,
      VK_MENU, keyboardState, pause);

    // If Shift was held down, we should reset the keyboard state for it
    // as well. See the comment in backgroundKeyDown on why it is set
    // in the first place.
    if ((shiftPressed) || (isShiftPressNeeded(origKeyCode))) {
      keyboardState[VK_SHIFT] &= ~0x80;
    }

	SetKeyboardState(keyboardState);
}


void backgroundKeyPress(HWND hwnd, HKL layout, BYTE keyboardState[256],
		WORD keyCode, UINT scanCode, bool extended, int pause)
{
	pause = pause / 3;

    backgroundKeyDown(hwnd, layout, keyboardState, keyCode, scanCode, extended, pause);
    backgroundKeyUp(hwnd, layout, keyboardState, keyCode, scanCode, extended, pause);
}

LRESULT CALLBACK GetMessageProc(int nCode, WPARAM wParam, LPARAM lParam)
{
	if ((nCode == HC_ACTION) && (wParam == PM_REMOVE)) {
		MSG* msg = reinterpret_cast<MSG*>(lParam);
		if (msg->message == WM_USER && msg->wParam == 1234 && msg->lParam == 5678) {
			pressed = true;
		}
	}

	return CallNextHookEx(hook, nCode, wParam, lParam);
}

bool isClearAllModifiersCode(wchar_t c)
{
  return (c == 0xE000U);
}

bool isShiftCode(wchar_t c)
{
  return (c == 0xE008U); // shift (left)
}

bool isControlCode(wchar_t c)
{
  return (c == 0xE009U); // control (left)
}

bool isAltCode(wchar_t c)
{
  return (c == 0xE00AU); // alt (left)
}

bool isModifierCharacter(wchar_t c)
{
  return isClearAllModifiersCode(c) || isShiftCode(c) || isControlCode(c) ||
    isAltCode(c);
}

// All the required information to post a keyboard event message.
struct KeySendingData {
  HWND to_window;
  HKL layout;
  BYTE* keyboardState;
  int pause_time;
};

void sendSingleModifierEventAndAdjustState(bool matchingModifier,
    bool& modifierState, int modifierKeyCode, KeySendingData sendData)
{
  if (!matchingModifier) {
    return;
  }

  if (modifierState) {
    sendModifierKeyUp(sendData.to_window, sendData.layout,
        modifierKeyCode, sendData.keyboardState, sendData.pause_time);
  } else {
    sendModifierKeyDown(sendData.to_window, sendData.layout,
        modifierKeyCode, sendData.keyboardState, sendData.pause_time);
  }
  modifierState = !modifierState;
}

void postModifierReleaseMessages(bool releaseShift, bool releaseControl, bool releaseAlt,
    KeySendingData sendData)
{
    sendModifierKeyUpIfNeeded(releaseShift, sendData.to_window, sendData.layout, VK_SHIFT, sendData.keyboardState, sendData.pause_time);
    sendModifierKeyUpIfNeeded(releaseControl, sendData.to_window, sendData.layout, VK_CONTROL, sendData.keyboardState, sendData.pause_time);
    sendModifierKeyUpIfNeeded(releaseAlt, sendData.to_window, sendData.layout, VK_MENU, sendData.keyboardState, sendData.pause_time);
}

void sendModifierKeyEvent(wchar_t c, bool& shiftKey, bool& controlKey,
    bool& altKey, KeySendingData sendData)

{
  if (isClearAllModifiersCode(c)) {
    postModifierReleaseMessages(shiftKey, controlKey, altKey, sendData);

    shiftKey = controlKey = altKey = false;
  } else {
    sendSingleModifierEventAndAdjustState(isShiftCode(c), shiftKey, VK_SHIFT, sendData);
    sendSingleModifierEventAndAdjustState(isControlCode(c), controlKey, VK_CONTROL, sendData);
    sendSingleModifierEventAndAdjustState(isAltCode(c), altKey, VK_MENU, sendData);
    if (isShiftCode(c)) {
      updateShiftKeyState(shiftKey);
    }
  }
}

static HKL attachInputToIEThread(HWND directInputTo)
{
	DWORD currThreadId = GetCurrentThreadId();
	DWORD ieWinThreadId = GetWindowThreadProcessId(directInputTo, NULL);

	GetModuleHandleEx(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS, (LPCTSTR)
			&sendKeys, &moduleHandle);

	hook = SetWindowsHookEx(WH_GETMESSAGE, (HOOKPROC) &GetMessageProc,
			moduleHandle, ieWinThreadId);

  if (hook == NULL) {
    LOGERR(WARN) << "Unable to set Windows hook. Individual keystrokes will be very slow";
  }

  // Attach to the IE thread so we can send keys to it.
	if (ieWinThreadId != currThreadId) {
		AttachThreadInput(currThreadId, ieWinThreadId, true);
	}

	return GetKeyboardLayout(ieWinThreadId);
}

static void detachInputFromIEThread(HWND directInputTo)
{
	DWORD currThreadId = GetCurrentThreadId();
	DWORD ieWinThreadId = GetWindowThreadProcessId(directInputTo, NULL);

	if (hook) {
		UnhookWindowsHookEx(hook);
	}

	if (moduleHandle) {
		FreeLibrary(moduleHandle);
	}

	if (ieWinThreadId != currThreadId) {
		AttachThreadInput(currThreadId, ieWinThreadId, false);
	}
}

extern "C"
{
void sendKeys(WINDOW_HANDLE windowHandle, const wchar_t* value, int timePerKey)
{
	if (!windowHandle) {
	  LOG(WARN) << "Window handle is invalid";
	  return;
	}

	HWND directInputTo = static_cast<HWND>(windowHandle);

	HKL layout = attachInputToIEThread(directInputTo);
	BYTE keyboardState[256];
	::ZeroMemory(keyboardState, sizeof(keyboardState));

	bool controlKey = controlPressed;
	bool shiftKey = shiftPressed;
	bool altKey = altPressed;
  KeySendingData sendData;
  sendData.to_window = directInputTo;
  sendData.layout = layout;
  sendData.keyboardState = keyboardState;
  sendData.pause_time = timePerKey;

	for (const wchar_t *p = value; *p; ++p) {
		const wchar_t c = *p;

		bool extended = false;

		UINT scanCode = 0;
		WORD keyCode = 0;

    if (isModifierCharacter(c)) {
      sendModifierKeyEvent(c, shiftKey, controlKey, altKey, sendData);
      shiftPressed = shiftKey;
      controlPressed = controlKey;
      altPressed = altKey;
      continue;
		} else if (c == 0xE001U) {  // ^break
			keyCode = VK_CANCEL;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE002U) {  // help
			keyCode = VK_HELP;
			scanCode = keyCode;
		} else if (c == 0xE003U) {  // back space
			keyCode = VK_BACK;
			scanCode = keyCode;
		} else if (c == 0xE004U) {  // tab
			keyCode = VK_TAB;
			scanCode = keyCode;
		} else if (c == 0xE005U) {  // clear
			keyCode = VK_CLEAR;
			scanCode = keyCode;
		} else if (c == 0xE006U) {  // return
			keyCode = VK_RETURN;
			scanCode = keyCode;
		} else if (c == 0xE007U) {  // enter
			keyCode = VK_RETURN;
			scanCode = keyCode;
		} else if (c == 0xE00BU) {  // pause
			keyCode = VK_PAUSE;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE00CU) {  // escape
			keyCode = VK_ESCAPE;
			scanCode = keyCode;
		} else if (c == 0xE00DU) {  // space
			keyCode = VK_SPACE;
			scanCode = keyCode;
		} else if (c == 0xE00EU) {  // page up
			keyCode = VK_PRIOR;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE00FU) {  // page down
			keyCode = VK_NEXT;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE010U) {  // end
			keyCode = VK_END;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE011U) {  // home
			keyCode = VK_HOME;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE012U) {  // left arrow
			keyCode = VK_LEFT;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE013U) {  // up arrow
			keyCode = VK_UP;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE014U) {  // right arrow
			keyCode = VK_RIGHT;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE015U) {  // down arrow
			keyCode = VK_DOWN;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE016U) {  // insert
			keyCode = VK_INSERT;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE017U) {  // delete
			keyCode = VK_DELETE;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE018U) {  // semicolon
			keyCode = VkKeyScanExW(L';', layout);
			scanCode = MapVirtualKeyExW(LOBYTE(keyCode), 0, layout);
		} else if (c == 0xE019U) {  // equals
			keyCode = VkKeyScanExW(L'=', layout);
			scanCode = MapVirtualKeyExW(LOBYTE(keyCode), 0, layout);
		} else if (c == 0xE01AU) {  // numpad0
			keyCode = VK_NUMPAD0;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE01BU) {  // numpad1
			keyCode = VK_NUMPAD1;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE01CU) {  // numpad2
			keyCode = VK_NUMPAD2;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE01DU) {  // numpad3
			keyCode = VK_NUMPAD3;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE01EU) {  // numpad4
			keyCode = VK_NUMPAD4;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE01FU) {  // numpad5
			keyCode = VK_NUMPAD5;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE020U) {  // numpad6
			keyCode = VK_NUMPAD6;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE021U) {  // numpad7
			keyCode = VK_NUMPAD7;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE022U) {  // numpad8
			keyCode = VK_NUMPAD8;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE023U) {  // numpad9
			keyCode = VK_NUMPAD9;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE024U) {  // multiply
			keyCode = VK_MULTIPLY;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE025U) {  // add
			keyCode = VK_ADD;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE026U) {  // separator
			keyCode = VkKeyScanExW(L',', layout);
			scanCode = MapVirtualKeyExW(LOBYTE(keyCode), 0, layout);
		} else if (c == 0xE027U) {  // subtract
			keyCode = VK_SUBTRACT;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE028U) {  // decimal
			keyCode = VK_DECIMAL;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE029U) {  // divide
			keyCode = VK_DIVIDE;
			scanCode = keyCode;
			extended = true;
		} else if (c == 0xE031U) {  // F1
			keyCode = VK_F1;
			scanCode = keyCode;
		} else if (c == 0xE032U) {  // F2
			keyCode = VK_F2;
			scanCode = keyCode;
		} else if (c == 0xE033U) {  // F3
			keyCode = VK_F3;
			scanCode = keyCode;
		} else if (c == 0xE034U) {  // F4
			keyCode = VK_F4;
			scanCode = keyCode;
		} else if (c == 0xE035U) {  // F5
			keyCode = VK_F5;
			scanCode = keyCode;
		} else if (c == 0xE036U) {  // F6
			keyCode = VK_F6;
			scanCode = keyCode;
		} else if (c == 0xE037U) {  // F7
			keyCode = VK_F7;
			scanCode = keyCode;
		} else if (c == 0xE038U) {  // F8
			keyCode = VK_F8;
			scanCode = keyCode;
		} else if (c == 0xE039U) {  // F9
			keyCode = VK_F9;
			scanCode = keyCode;
		} else if (c == 0xE03AU) {  // F10
			keyCode = VK_F10;
			scanCode = keyCode;
		} else if (c == 0xE03BU) {  // F11
			keyCode = VK_F11;
			scanCode = keyCode;
		} else if (c == 0xE03CU) {  // F12
			keyCode = VK_F12;
			scanCode = keyCode;
		} else if (c == L'\n') {    // line feed
			keyCode = VK_RETURN;
			scanCode = keyCode;
		} else if (c == L'\r') {    // carriage return
			continue;  // skip it
		} else {
			keyCode = VkKeyScanExW(c, layout);
			scanCode = MapVirtualKeyExW(LOBYTE(keyCode), 0, layout);
			if (!scanCode || (keyCode == 0xFFFFU)) {
				LOG(WARN) << "No translation for key. Assuming unicode input: " << c;
				backgroundUnicodeKeyPress(directInputTo, c, timePerKey);
				continue;  // bogus
			}
		}

        // Note: There is *no* need to OR the keyCode with 0x0100 if
        // shiftPressed is true. ORing the keyCode with these values is to
        // indicate the backgroundKeyPress procedure that a modifier key
        // press and release should be produced for this keyCode. However,
        // when shiftPressed is true the events for the modifier were
        // already generated by the sendKeyPress function.
		if (shiftKey)
			keyCode |= static_cast<WORD>(0x0100);
		if (controlKey)
			keyCode |= static_cast<WORD>(0x0200);
		if (altKey)
			keyCode |= static_cast<WORD>(0x0400);

		int pause = timePerKey;

		// Pause for control, alt, and shift generation: if we create these
		// chars too fast, the target element may generated spurious chars.

		if (keyCode & static_cast<WORD>(0x0100)) {
			pause = (35 * 3);  // uppercase char
		} else if (shiftKey || controlKey || altKey) {
		    pause = (35 * 3);  // shift|alt|ctrl
		}

		backgroundKeyPress(directInputTo, layout, keyboardState, keyCode, scanCode,
				extended, pause);
	}

    detachInputFromIEThread(directInputTo);
}

void releaseModifierKeys(WINDOW_HANDLE windowHandle, int timePerKey)
{
	if (!windowHandle) {
	  LOG(WARN) << "Window handle is invalid";
	  return;
	}

	HWND directInputTo = static_cast<HWND>(windowHandle);

	HKL layout = attachInputToIEThread(directInputTo);
	BYTE keyboardState[256];
	::ZeroMemory(keyboardState, sizeof(keyboardState));

  KeySendingData sendData;

  sendData.to_window = directInputTo;
  sendData.layout = layout;
  sendData.keyboardState = keyboardState;
  sendData.pause_time = 35;

  if ((shiftPressed) || (controlPressed) || (altPressed)) {
    postModifierReleaseMessages(shiftPressed, controlPressed, altPressed, sendData);
    shiftPressed = false;
    controlPressed = false;
    altPressed = false;
  }

  detachInputFromIEThread(directInputTo);
}

bool isSameThreadAs(HWND other) 
{
	DWORD currThreadId = GetCurrentThreadId();
	DWORD winThreadId = GetWindowThreadProcessId(other, NULL);

	return winThreadId == currThreadId;
}

LRESULT clickAt(WINDOW_HANDLE handle, long x, long y, long button)
{
	if (!handle) {
	  LOG(WARN) << "Window handle is invalid";
	  return ENULLPOINTER;
	}

	HWND directInputTo = (HWND) handle;

	LRESULT result = mouseDownAt(handle, x, y, button);
    if (result != 0) {
		LOG(WARN) << "Mouse down did not succeed whilst clicking";
		return result;
	}

	return mouseUpAt(handle, x, y, button);
}

static LRESULT mouseDoubleClickDown(WINDOW_HANDLE directInputTo, long x, long y)
{
  if (!directInputTo) {
    LOG(WARN) << "Window handle is invalid";
    return ENULLPOINTER;
  }

  if (!isSameThreadAs((HWND) directInputTo)) {
    BOOL toReturn = PostMessage((HWND) directInputTo, WM_LBUTTONDBLCLK, MK_LBUTTON, MAKELONG(x, y));

    // Wait until we know that the previous message has been processed
    SendMessage((HWND) directInputTo, WM_USER, 0, 0);
    return toReturn ? 0 : 1;  // Because 0 means success.
  } else {
    return SendMessage((HWND) directInputTo, WM_LBUTTONDBLCLK, MK_LBUTTON, MAKELONG(x, y));
  }
}

LRESULT doubleClickAt(WINDOW_HANDLE handle, long x, long y)
{
  // A double click consists of the sequence
  // 1: mouseDown
  // 2: mouseUp
  // 3: doubleClick
  // 4: mouseUp
  // Which is the equivalent to two clicks with the second mouseDown event
  // is replaced by a doubleClick event.

  if (!handle) {
    LOG(WARN) << "Window handle is invalid";
    return ENULLPOINTER;
  }

  LRESULT  result = clickAt(handle, x, y, 0);
  if (result != 0) {
    LOG(WARN) << "Mouse down did not succeed whilst clicking";
    return result;
  }

  result = mouseDoubleClickDown(handle, x, y);
  if (result != 0) {
    LOG(WARN) << "Mouse down did not succeed whilst double clicking";
    return result;
  }

  return mouseUpAt(handle, x, y, 0);
}

static void fillEventData(long button, bool buttonDown, UINT *message, WPARAM *wparam)
{
  if(WD_CLIENT_RIGHT_MOUSE_BUTTON == button) {
    if(buttonDown) {
      *message = WM_RBUTTONDOWN;
    } else {
      *message = WM_RBUTTONUP;
    }
    *wparam = MK_RBUTTON;
  } else { // middle button support is declared in json wire protocol but it is not supported
    leftMouseButtonPressed = buttonDown;
    if(buttonDown) {
      *message = WM_LBUTTONDOWN;
    } else {
      *message = WM_LBUTTONUP;
    }
    *wparam = MK_LBUTTON;
  }
  if (shiftPressed) {
    *wparam |= MK_SHIFT;
  }
}

LRESULT mouseDownAt(WINDOW_HANDLE directInputTo, long x, long y, long button)
{
	if (!directInputTo) {
	  LOG(WARN) << "Window handle is invalid";
	  return ENULLPOINTER;
	}

	UINT message;
	WPARAM wparam;
        LRESULT returnValue;

	fillEventData(button, true, &message, &wparam);
        pausePersistentEventsFiring();

	if (!isSameThreadAs((HWND) directInputTo)) {
		BOOL toReturn = PostMessage((HWND) directInputTo, message, wparam, MAKELONG(x, y));

		// Wait until we know that the previous message has been processed
		SendMessage((HWND) directInputTo, WM_USER, 0, 0);
		returnValue = toReturn ? 0 : 1;  // Because 0 means success.
	} else {
		returnValue = SendMessage((HWND) directInputTo, message, wparam, MAKELONG(x, y));
	}

    // Assume it's the left mouse button.
    if(WD_CLIENT_RIGHT_MOUSE_BUTTON != button) {
      updateLeftMouseButtonState(true);
    }
    resumePersistentEventsFiring();

        return returnValue;
}

LRESULT mouseUpAt(WINDOW_HANDLE directInputTo, long x, long y, long button)
{
	if (!directInputTo) {
	  LOG(WARN) << "Window handle is invalid";
	  return ENULLPOINTER;
	}

 	UINT message;
 	WPARAM wparam;
        LRESULT returnValue;
 
 	fillEventData(button, false, &message, &wparam);
        pausePersistentEventsFiring();

	SendMessage((HWND) directInputTo, WM_MOUSEMOVE, (shiftPressed ? MK_SHIFT : 0), MAKELPARAM(x, y));
	if (!isSameThreadAs((HWND) directInputTo)) {
 		BOOL toReturn = PostMessage((HWND) directInputTo, message, wparam, MAKELONG(x, y));

		// Wait until we know that the previous message has been processed
		SendMessage((HWND) directInputTo, WM_USER, 0, 0);
		returnValue = toReturn ? 0 : 1;  // Because 0 means success.
	} else {
 		returnValue = SendMessage((HWND) directInputTo, message, wparam, MAKELONG(x, y));
	}
    // Assume it's the left mouse button.
    if(WD_CLIENT_RIGHT_MOUSE_BUTTON != button) {
      updateLeftMouseButtonState(false);
    }
    resumePersistentEventsFiring();

    return returnValue;
}

LRESULT mouseMoveTo(WINDOW_HANDLE handle, long duration, long fromX, long fromY, long toX, long toY)
{
  if (!handle) {
    LOG(WARN) << "Window handle is invalid";
    return ENULLPOINTER;
  }

  pausePersistentEventsFiring();

  HWND directInputTo = (HWND) handle;
  long pointsDistance = distanceBetweenPoints(fromX, fromY, toX, toY);
  const int stepSizeInPixels = 5;
  int steps = pointsDistance / stepSizeInPixels;

  long sleep = duration / max(steps, 1);

  WPARAM buttonValue = (leftMouseButtonPressed ? MK_LBUTTON : 0);
  if (shiftPressed) {
    buttonValue |= MK_SHIFT;
  }

  for (int i = 0; i < steps + 1; i++) {
    //To avoid integer division rounding and cumulative floating point errors,
    //calculate from scratch each time
    int currentX = (int)(fromX + ((toX - fromX) * ((double)i) / steps));
    int currentY = (int)(fromY + ((toY - fromY) * ((double)i) / steps));
    SendMessage(directInputTo, WM_MOUSEMOVE, buttonValue, MAKELPARAM(currentX, currentY));
    wait(sleep);
  }

  SendMessage(directInputTo, WM_MOUSEMOVE, buttonValue, MAKELPARAM(toX, toY));
  resumePersistentEventsFiring(directInputTo, toX, toY, buttonValue);

  return 0;
}

bool pending_input_events()
{
  return false;
}

}
