/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
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

#include "errorcodes.h"
#include "interactions.h"
#include "logging.h"

using namespace std;

#pragma data_seg(".LISTENER")
static bool pressed = false;
static HHOOK hook = 0;
#pragma data_seg()
#pragma comment(linker, "/section:.LISTENER,rws")

void backgroundUnicodeKeyPress(HWND ieWindow, wchar_t c, int pause)
{
	pause = pause / 3;

	pressed = false;
	PostMessage(ieWindow, WM_KEYDOWN, VkKeyScanW(c), 0);
	PostMessage(ieWindow, WM_USER, 1234, 5678);
	wait(pause);

	// TODO: There must be a better way to tell when the keydown is processed
	clock_t maxWait = clock() + 250;
	while (!pressed && clock() < maxWait) {
		wait(5);
	}

	PostMessage(ieWindow, WM_CHAR, c, 0);

	wait(pause);

	PostMessage(ieWindow, WM_KEYUP, VkKeyScanW(c), 0);

	wait(pause);
}

void backgroundKeyPress(HWND hwnd, HKL layout, BYTE keyboardState[256],
		WORD keyCode, UINT scanCode, bool extended, int pause)
{
	pause = pause / 3;

	const int needsShift = (keyCode & 0x0100);
	const int needsControl = (keyCode & 0x0200);
	const int needsAlt = (keyCode & 0x0400);

	LPARAM shiftKey = 1;
	if (needsShift) {
		keyboardState[VK_SHIFT] |= 0x80;

		shiftKey |= MapVirtualKeyEx(VK_SHIFT, 0, layout) << 16;
		if (!PostMessage(hwnd, WM_KEYDOWN, VK_SHIFT, shiftKey))
			cerr << "Shift down failed: " << GetLastError() << endl;

		wait(pause);
	}

	LPARAM controlKey = 1;
	if (needsControl) {
		keyboardState[VK_CONTROL] |= 0x80;

		controlKey |= MapVirtualKeyEx(VK_CONTROL, 0, layout) << 16;
		if (!PostMessage(hwnd, WM_KEYDOWN, VK_CONTROL, controlKey))
			cerr << "Control down failed: " << GetLastError() << endl;
		wait(pause);
	}

	LPARAM altKey = 1;
	if (needsAlt) {
		keyboardState[VK_MENU] |= 0x80;

		altKey |= MapVirtualKeyEx(VK_MENU, 0, layout) << 16;
		if (!PostMessage(hwnd, WM_KEYDOWN, VK_MENU, altKey))
			cerr << "Alt down failed: " << GetLastError() << endl;
		wait(pause);
	}

	keyCode = LOBYTE(keyCode);
	keyboardState[keyCode] |= 0x80;

	SetKeyboardState(keyboardState);

	LPARAM lparam = 1;
	lparam |= scanCode << 16;
	if (extended) {
		lparam |= 1 << 24;
	}

	pressed = false;
	if (!PostMessage(hwnd, WM_KEYDOWN, keyCode, lparam))
		cerr << "Key down failed: " << GetLastError() << endl;

	PostMessage(hwnd, WM_USER, 1234, 5678);

	// Listen out for the keypress event which IE synthesizes when IE
	// processes the keydown message. Use a time out, just in case we
	// have not got the logic right :)

	clock_t maxWait = clock() + 5000;
	while (!pressed) {
		wait(5);
		if (clock() >= maxWait) {
			cerr << "Timeout awaiting keypress: " << keyCode << endl;
			break;
		}
	}

	keyboardState[keyCode] &= ~0x80;

	lparam |= 0x3 << 30;
	if (!PostMessage(hwnd, WM_KEYUP, keyCode, lparam))
		cerr << "Key up failed: " << GetLastError() << endl;

	wait(pause);


	if (needsShift) {
		keyboardState[VK_SHIFT] &= ~0x80;

		shiftKey |= 0x3 << 30;
		if (!PostMessage(hwnd, WM_KEYUP, VK_SHIFT, shiftKey))
			cerr << "Shift up failed: " << GetLastError() << endl;
		wait(pause);
	}

	if (needsControl) {
		keyboardState[VK_CONTROL] &= ~0x80;

		controlKey |= 0x3 << 30;
		if (!PostMessage(hwnd, WM_KEYUP, VK_CONTROL, controlKey))
			cerr << "Control up failed: " << GetLastError() << endl;
		wait(pause);
	}

	if (needsAlt) {
		keyboardState[VK_MENU] &= ~0x80;

		altKey |= 0x3 << 30;
		if (!PostMessage(hwnd, WM_KEYUP, VK_MENU, altKey))
			cerr << "Alt up failed: " << GetLastError() << endl;
		wait(pause);
	}

	SetKeyboardState(keyboardState);
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

extern "C"
{
void sendKeys(WINDOW_HANDLE windowHandle, const wchar_t* value, int timePerKey)
{
	if (!windowHandle) { return; }

	HWND directInputTo = static_cast<HWND>(windowHandle);
	DWORD currThreadId = GetCurrentThreadId();
	DWORD ieWinThreadId = GetWindowThreadProcessId(directInputTo, NULL);

	HINSTANCE moduleHandle;
	GetModuleHandleEx(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS, (LPCTSTR)
			&sendKeys, &moduleHandle);

	hook = SetWindowsHookEx(WH_GETMESSAGE, (HOOKPROC) &GetMessageProc,
			moduleHandle, ieWinThreadId);

	// Attach to the IE thread so we can send keys to it.
	if (ieWinThreadId != currThreadId) {
		AttachThreadInput(currThreadId, ieWinThreadId, true);
	}

	HKL layout = GetKeyboardLayout(ieWinThreadId);
	BYTE keyboardState[256];
	::ZeroMemory(keyboardState, sizeof(keyboardState));

	bool controlKey = false;
	bool shiftKey = false;
	bool altKey = false;

	for (const wchar_t *p = value; *p; ++p) {
		const wchar_t c = *p;

		bool extended = false;

		UINT scanCode = 0;
		WORD keyCode = 0;

		if (c == 0xE000U) {
			shiftKey = controlKey = altKey = false;
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
		} else if (c == 0xE008U) {  // shift (left)
			shiftKey = !shiftKey;
			continue;
		} else if (c == 0xE009U) {  // control (left)
			controlKey = !controlKey;
			continue;
		} else if (c == 0xE00AU) {  // alt (left)
			altKey = !altKey;
			continue;
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
				cerr << "No translation for key. Assuming unicode input: " << c << endl;
				backgroundUnicodeKeyPress(directInputTo, c, timePerKey);
				continue;  // bogus
			}
		}

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

	if (hook) {
		UnhookWindowsHookEx(hook);
	}

	if (ieWinThreadId != currThreadId) {
		AttachThreadInput(currThreadId, ieWinThreadId, false);
	}
}

bool isSameThreadAs(HWND other) 
{
	DWORD currThreadId = GetCurrentThreadId();
	DWORD winThreadId = GetWindowThreadProcessId(other, NULL);

	return winThreadId == currThreadId;
}

LRESULT clickAt(WINDOW_HANDLE handle, long x, long y) 
{
	if (!handle) { return ENULLPOINTER; }

	HWND directInputTo = (HWND) handle;

	LRESULT result = mouseDownAt(handle, x, y);
    if (result != 0) {
		LOG(WARN) << "Mouse down did not succeed whilst clicking";
		return result;
	}

	return mouseUpAt(handle, x, y);
}

LRESULT mouseDownAt(WINDOW_HANDLE directInputTo, long x, long y)
{
	if (!directInputTo) { return ENULLPOINTER; }

	if (!isSameThreadAs((HWND) directInputTo)) {
		BOOL toReturn = PostMessage((HWND) directInputTo, WM_LBUTTONDOWN, MK_LBUTTON, MAKELONG(x, y));

		// Wait until we know that the previous message has been processed
		SendMessage((HWND) directInputTo, WM_USER, 0, 0);
		return toReturn ? 0 : 1;  // Because 0 means success.
	} else {
		return SendMessage((HWND) directInputTo, WM_LBUTTONDOWN, MK_LBUTTON, MAKELONG(x, y));
	}
}

LRESULT mouseUpAt(WINDOW_HANDLE directInputTo, long x, long y) 
{
	if (!directInputTo) { return ENULLPOINTER; }

	SendMessage((HWND) directInputTo, WM_MOUSEMOVE, 0, MAKELPARAM(x, y));
	if (!isSameThreadAs((HWND) directInputTo)) {
		BOOL toReturn = PostMessage((HWND) directInputTo, WM_LBUTTONUP, MK_LBUTTON, MAKELONG(x, y));

		// Wait until we know that the previous message has been processed
		SendMessage((HWND) directInputTo, WM_USER, 0, 0);
		return toReturn ? 0 : 1;  // Because 0 means success.
	} else {
		return SendMessage((HWND) directInputTo, WM_LBUTTONUP, MK_LBUTTON, MAKELONG(x, y));
	}}

LRESULT mouseMoveTo(WINDOW_HANDLE handle, long duration, long fromX, long fromY, long toX, long toY)
{
	if (!handle) { return ENULLPOINTER; }

	HWND directInputTo = (HWND) handle;

	// How many steps?
	int steps = 15;
	long sleep = duration / steps;

  LPRECT r = new RECT();
  GetWindowRect(directInputTo, r);

	for (int i = 0; i < steps; i++) {
	  //To avoid integer division rounding and cumulative floating point errors,
	  //calculate from scratch each time
	  int currentX = fromX + ((toX - fromX) * ((double)i) / steps);
		int currentY = fromY + ((toY - fromY) * ((double)i) / steps);
	  SendMessage(directInputTo, WM_MOUSEMOVE, 0, MAKELPARAM(currentX, currentY));
		wait(sleep);
	}
	
	SendMessage(directInputTo, WM_MOUSEMOVE, 0, MAKELPARAM(toX, toY));

  delete r;
  return 0;
}

BOOL_TYPE pending_keyboard_events()
{
  return false;
}

}
