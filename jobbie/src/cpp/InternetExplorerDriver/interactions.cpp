#include "stdafx.h"

#include <ctime>

#include "interactions.h"
#include "utils.h"

const LPCTSTR fileDialogNames[] = {
	_T("#32770"),
	_T("ComboBoxEx32"),
	_T("ComboBox"),
	_T("Edit"),
	NULL
};

#pragma data_seg(".LISTENER")
bool pressed = false;
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
		WORD keyCode, UINT scanCode, bool extended, bool printable, int pause)
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
	// have not got "printable" right. :)

	clock_t maxWait = clock() + 5000;
	while (printable && !pressed) {
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
boolean sendKeysToFileUploadAlert(HWND dialogHwnd, const wchar_t* value) 
{
    HWND editHwnd = NULL;
    int maxWait = 10;
    while (!editHwnd && --maxWait) {
		wait(200);
		editHwnd = dialogHwnd;
		for (int i = 1; fileDialogNames[i]; ++i) {
			editHwnd = getChildWindow(editHwnd, fileDialogNames[i]);
		}
    }

    if (editHwnd) {
        // Attempt to set the value, looping until we succeed.
        const wchar_t* filename = value;
        size_t expected = wcslen(filename);
        size_t curr = 0;

        while (expected != curr) {
                SendMessage(editHwnd, WM_SETTEXT, 0, (LPARAM) filename);
                wait(1000);
                curr = SendMessage(editHwnd, WM_GETTEXTLENGTH, 0, 0);
        }

        HWND openHwnd = FindWindowExW(dialogHwnd, NULL, L"Button", L"&Open");
        if (openHwnd) {
                SendMessage(openHwnd, WM_LBUTTONDOWN, 0, 0);
                SendMessage(openHwnd, WM_LBUTTONUP, 0, 0);
        }

        return true;
    }

    cout << "No edit found" << endl;
    return false;
}

void sendKeys(HWND directInputTo, const wchar_t* value, int timePerKey)
{
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

		bool printable = false;
		bool extended = false;

		UINT scanCode = 0;
		WORD keyCode = 0;

		if (c == 0xE000U) {
			shiftKey = controlKey = altKey = false;
			continue;
		} else if (c == 0xE001U) {  // ^break
			keyCode = VK_CANCEL;
			scanCode = keyCode;
			printable = true;
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
			printable = true;
		} else if (c == 0xE00DU) {  // space
			keyCode = VK_SPACE;
			scanCode = keyCode;
			printable = true;
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
			printable = true;
		} else if (c == 0xE019U) {  // equals
			keyCode = VkKeyScanExW(L'=', layout);
			scanCode = MapVirtualKeyExW(LOBYTE(keyCode), 0, layout);
			printable = true;
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
			keyCode = VK_NUMPAD5;
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
			printable = true;
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
			printable = true;
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

		if (controlKey || altKey)
			printable = false;

		int pause = timePerKey;

		// Pause for control, alt, and shift generation: if we create these
		// chars too fast, the target element may generated spurious chars.

		if (keyCode & static_cast<WORD>(0x0100)) {
			pause = (35 * 3);  // uppercase char
		} else if (shiftKey || controlKey || altKey) {
		    pause = (35 * 3);  // shift|alt|ctrl
		}

		backgroundKeyPress(directInputTo, layout, keyboardState, keyCode, scanCode,
				extended, printable, pause);
	}

	if (hook) {
		UnhookWindowsHookEx(hook);
	}

	if (ieWinThreadId != currThreadId) {
		AttachThreadInput(currThreadId, ieWinThreadId, false);
	}
}

void clickAt(HWND directInputTo, long x, long y) 
{
	mouseDownAt(directInputTo, x, y);
	mouseUpAt(directInputTo, x, y);
}

void mouseDownAt(HWND directInputTo, long x, long y)
{
	SendMessage(directInputTo, WM_LBUTTONDOWN, MK_LBUTTON, MAKELONG(x, y));
}

void mouseUpAt(HWND directInputTo, long x, long y) 
{
	SendMessage(directInputTo, WM_LBUTTONUP, 0, MAKELONG(x, y));
}

}