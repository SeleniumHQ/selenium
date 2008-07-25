#include "StdAfx.h"

#include <iostream>

#include <comutil.h>
#include <comdef.h>
#include <ctime>

#include "ElementWrapper.h"
#include "utils.h"

using namespace std;

ElementWrapper::ElementWrapper(InternetExplorerDriver* ie, IHTMLDOMNode* node)
	: element(node)
{
	this->ie = ie;
}

ElementWrapper::~ElementWrapper()
{
}

std::wstring ElementWrapper::getAttribute(const std::wstring& name) 
{
	CComBSTR attributeName;
	if (_wcsicmp(L"class", name.c_str()) == 0) {
		attributeName = L"className";
	} else {
		attributeName = name.c_str();
	}

	CComVariant value;
	element->getAttribute(attributeName, 0, &value);
	return variant2wchar(value);
}

std::wstring ElementWrapper::getValue()
{
	CComBSTR temp;
	element->get_tagName(&temp);
	std::wstring name(bstr2wstring(temp));

	if (_wcsicmp(L"textarea", name.c_str()) == 0)
		return getTextAreaValue();

	return getAttribute(L"value");
}

const LPCTSTR ie7WindowNames[] = {
	_T("TabWindowClass"),
	_T("Shell DocObject View"),
	_T("Internet Explorer_Server"),
	NULL
};

const LPCTSTR ie6WindowNames[] = {
	_T("Shell DocObject View"),
	_T("Internet Explorer_Server"),
	NULL
};

// "Internet Explorer_Server" + 1
#define LONGEST_NAME 25

HWND getChildWindow(HWND hwnd, LPCTSTR name)
{
	TCHAR pszClassName[LONGEST_NAME]; 
	HWND hwndtmp = GetWindow(hwnd, GW_CHILD);
	while(hwndtmp != NULL) {
		GetClassName(hwndtmp, pszClassName, LONGEST_NAME);
		if (lstrcmp(pszClassName, name) == 0)
			return hwndtmp;
		hwndtmp = GetWindow(hwndtmp, GW_HWNDNEXT);
	}
	return NULL;
}

HWND getIeServerWindow(HWND hwnd) 
{
	HWND iehwnd = hwnd;

	for (int i = 0; ie7WindowNames[i] && iehwnd; i++) {
		iehwnd = getChildWindow(iehwnd, ie7WindowNames[i]);
	}

	if (!iehwnd) {
		for (int i = 0; ie6WindowNames[i] && iehwnd; i++) {
			iehwnd = getChildWindow(iehwnd, ie6WindowNames[i]);
		}
	}

	return iehwnd;
}

const LPCTSTR fileDialogNames[] = {
	_T("#32770"),
	_T("ComboBoxEx32"),
	_T("ComboBox"),
	_T("Edit"),
	NULL
};

struct keyboardData {
	HWND hwnd;
	const wchar_t* text;
};

WORD WINAPI setFileValue(keyboardData* data) {
	HWND parentWindow = data->hwnd;
	const wchar_t* filename = data->text;
	HWND dialogHwnd = FindWindowW(fileDialogNames[0], NULL);

	int lookFor = 30;
	while (!dialogHwnd && lookFor) {
		Sleep(200);
		--lookFor;
		dialogHwnd = FindWindowW(fileDialogNames[0], NULL);
	}

	if (!dialogHwnd) {
		cout << "No dialog found" << endl;
		return false;
	}

	HWND editHwnd = NULL;
	int max_count = 10;
	for (int max_count = 10; max_count && !editHwnd; --max_count) {
		wait(200);
		editHwnd = dialogHwnd;
		for (int i = 1; fileDialogNames[i] && dialogHwnd; i++) {
			editHwnd = getChildWindow(editHwnd, fileDialogNames[i]);
		}
	}

	if (editHwnd) {
		// Attempt to set the value, looping until we succeed.
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

#pragma data_seg(".LISTENER")
bool pressed = false;
static HHOOK hook = 0;
#pragma data_seg()
#pragma comment(linker, "/section:.LISTENER,rws")

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
		if (reinterpret_cast<MSG*>(lParam)->message == WM_CHAR) {
			pressed = true;
		}
	}

	return CallNextHookEx(hook, nCode, wParam, lParam);
}

void ElementWrapper::sendKeys(const std::wstring& newValue)
{
	const HWND hWnd = ie->getHwnd();
	const HWND ieWindow = getIeServerWindow(hWnd);

	keyboardData keyData;
	keyData.hwnd = ieWindow;
	keyData.text = newValue.c_str();

	element->scrollIntoView(CComVariant(VARIANT_TRUE));

	CComQIPtr<IHTMLInputFileElement> file(element);
	if (file) {
		DWORD threadId;
		CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE) &setFileValue, &keyData, 0, &threadId);
		element->click();
		// We're now blocked until the dialog closes.
		return;
	}

	CComQIPtr<IHTMLElement2> element2(element);
	element2->focus();

	// Check we have focused the element.
	CComPtr<IDispatch> dispatch;
	element->get_document(&dispatch);
	CComQIPtr<IHTMLDocument2> document(dispatch);

	bool hasFocus = false;
	clock_t maxWait = clock() + 1000;
	for (int i = clock(); i < maxWait; i = clock()) {
		wait(1);
		CComPtr<IHTMLElement> activeElement;
		if (document->get_activeElement(&activeElement) == S_OK) {
			CComQIPtr<IHTMLElement2> activeElement2(activeElement);
			if (element2.IsEqualObject(activeElement2)) {
				hasFocus = true;
				break;
			}
		}
	}
	
	if (!hasFocus) {
		cerr << "We don't have focus on element." << endl;
	}

	DWORD currThreadId = GetCurrentThreadId();
	DWORD ieWinThreadId = GetWindowThreadProcessId(ieWindow, NULL);

	HINSTANCE moduleHandle;
	GetModuleHandleEx(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS, (LPCTSTR)
			&getChildWindow, &moduleHandle);

	hook = SetWindowsHookEx(WH_GETMESSAGE, (HOOKPROC) &GetMessageProc,
			moduleHandle, ieWinThreadId);

	// Attach to the IE thread so we can send keys to it.
	if (ieWinThreadId != currThreadId) {
		AttachThreadInput(currThreadId, ieWinThreadId, true);
	}

	HKL layout = GetKeyboardLayout(GetCurrentThreadId());
	BYTE keyboardState[256];
	::ZeroMemory(keyboardState, sizeof(keyboardState));

	bool controlKey = false;
	bool shiftKey = false;
	bool altKey = false;

	for (const wchar_t *p = keyData.text; *p; ++p) {
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
			extended = false;
		} else if (c == 0xE003U) {  // back space
			keyCode = VK_BACK;
			scanCode = keyCode;
			extended = false;
		} else if (c == 0xE004U) {  // tab
			keyCode = VK_TAB;
			scanCode = keyCode;
			extended = false;
		} else if (c == 0xE005U) {  // clear
			keyCode = VK_CLEAR;
			scanCode = keyCode;
			extended = false;
		} else if (c == 0xE006U) {  // return
			keyCode = VK_RETURN;
			scanCode = keyCode;
			extended = false;
		} else if (c == 0xE007U) {  // enter
			keyCode = VK_RETURN;
			scanCode = keyCode;
			extended = true;
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
				cerr << "No translation for key: " << c << endl;
				continue;  // bogus
			}
		}

		if (shiftKey)
			keyCode |= static_cast<WORD>(0x0100);
		if (controlKey)
			keyCode |= static_cast<WORD>(0x0200);
		if (altKey)
			keyCode |= static_cast<WORD>(0x0400);

		backgroundKeyPress(ieWindow, layout, keyboardState, keyCode, scanCode,
				extended, printable, ie->getSpeed());
	}

	if (hook) {
		UnhookWindowsHookEx(hook);
	}

	if (ieWinThreadId != currThreadId) {
		AttachThreadInput(currThreadId, ieWinThreadId, false);
	}
}

void ElementWrapper::clear()
{
	CComQIPtr<IHTMLElement2> element2(element);

	CComBSTR valueAttributeName(L"value");
	VARIANT empty;
	CComBSTR emptyBstr(L"");
	empty.vt = VT_BSTR;
	empty.bstrVal = (BSTR)emptyBstr;
	element->setAttribute(valueAttributeName, empty, 0);

	HWND hWnd = ie->getHwnd();
	LRESULT lr;
	SendMessageTimeoutW(hWnd, WM_SETTEXT, 0, (LPARAM) L"", SMTO_ABORTIFHUNG, 3000, (DWORD*)&lr);
}

bool ElementWrapper::isSelected()
{
	CComQIPtr<IHTMLOptionElement> option(element);
	if (option) {
		VARIANT_BOOL isSelected;
		option->get_selected(&isSelected);
		return isSelected == VARIANT_TRUE;
	}

	if (isCheckbox()) {
		CComQIPtr<IHTMLInputElement> input(element);

		VARIANT_BOOL isChecked;
		input->get_checked(&isChecked);
		return isChecked == VARIANT_TRUE;
	}

	if (isRadio()) {
		std::wstring value(getAttribute(L"selected"));
		if (!value.c_str())
			return false;

		return _wcsicmp(value.c_str(), L"selected") == 0 || _wcsicmp(value.c_str(), L"true") == 0;
	}

	return false;
}

void ElementWrapper::setSelected()
{
	if (!this->isEnabled()) 
		throw "Unable to select a disabled element";

	bool currentlySelected = isSelected();

	/* TODO(malcolmr): Why not: if (isSelected()) return; ? Do we really need to re-set 'checked=true' for checkbox and do effectively nothing for select?
	   Maybe we should check for disabled elements first? */

	if (isCheckbox()) {
		if (!isSelected()) {
			click();
		}

		CComBSTR checked(L"checked");
		VARIANT isChecked;
		CComBSTR isTrue(L"true");
		isChecked.vt = VT_BSTR;
		isChecked.bstrVal = (BSTR)isTrue;
		element->setAttribute(checked, isChecked, 0);

		if (currentlySelected != isSelected()) {
			CComPtr<IHTMLEventObj> eventObj(newEventObject());
			fireEvent(eventObj, L"onchange");
		}

		return;
    }

	if (isRadio()) {
		if (!isSelected()) {
			click();
		}

		CComBSTR selected(L"selected");
		VARIANT select;
		CComBSTR isTrue(L"true");
		select.vt = VT_BSTR;
		select.bstrVal = (BSTR)isTrue;
		element->setAttribute(selected, select, 0);

		if (currentlySelected != isSelected()) {
			CComPtr<IHTMLEventObj> eventObj(newEventObject());
			fireEvent(eventObj, L"onchange");
		}

		return;
    }

	CComQIPtr<IHTMLOptionElement> option(element);
	if (option) {
		option->put_selected(VARIANT_TRUE);
		
		// Looks like we'll need to fire the event on the select element and not the option. Assume for now that the parent node is a select. Which is dumb
		CComQIPtr<IHTMLDOMNode> node(element);
		CComPtr<IHTMLDOMNode> parent;
		node->get_parentNode(&parent);

		if (currentlySelected != isSelected()) {
			CComPtr<IHTMLEventObj> eventObj(newEventObject());
			fireEvent(parent, eventObj, L"onchange");
		}
		
		return;
	}

	throw "Unable to select element.";
}

bool ElementWrapper::isEnabled() 
{
	CComQIPtr<IHTMLElement3> elem3(element);
	VARIANT_BOOL isDisabled;
	elem3->get_disabled(&isDisabled);
	return !isDisabled;
}

bool ElementWrapper::isDisplayed()
{
	bool toReturn = true;

	CComPtr<IHTMLElement> e(element);
	do {
		CComQIPtr<IHTMLElement2> e2(e);

		CComPtr<IHTMLCurrentStyle> style;
		CComBSTR display;
		CComBSTR visible;

		e2->get_currentStyle(&style);
		style->get_display(&display);
		style->get_visibility(&visible);

		std::wstring displayValue = bstr2wstring(display);
		std::wstring visibleValue = bstr2wstring(visible);

		int isDisplayed = _wcsicmp(L"none", displayValue.c_str());
		int isVisible = _wcsicmp(L"hidden", visibleValue.c_str());

		toReturn &= isDisplayed != 0 && isVisible != 0;

		CComPtr<IHTMLElement> parent;
		e->get_parentElement(&parent);
		e = parent;
	} while (e && toReturn);

	return toReturn;
}

bool ElementWrapper::toggle()
{
	click();
	return isSelected();
}

long ElementWrapper::getX() 
{
	long totalX = 0;
	long x;

	element->get_offsetLeft(&x);
	totalX += x;

	IHTMLElement* parent;
	element->get_offsetParent(&parent);

	CComBSTR table(L"TABLE");
	CComBSTR body(L"BODY");

	while (parent) 
	{
		CComBSTR tagName;
		parent->get_tagName(&tagName);

		if (table == tagName || body == tagName) 
		{
			CComQIPtr<IHTMLElement2> parent2(parent);
				
			parent2->get_clientLeft(&x);
			totalX += x;
		}

		parent->get_offsetLeft(&x);
		totalX += x;

		CComPtr<IHTMLElement> t;
		parent->get_offsetParent(&t);
		parent = t;
	}

	return totalX;
}

long ElementWrapper::getY() 
{
	long totalY = 0;
	long y;

	element->get_offsetTop(&y);
	totalY += y;

	IHTMLElement* parent;
	element->get_offsetParent(&parent);

	CComBSTR table(L"TABLE");
	CComBSTR body(L"BODY");

	while (parent) 
	{
		CComBSTR tagName;
		parent->get_tagName(&tagName);

		if (table == tagName || body == tagName) 
		{
			CComQIPtr<IHTMLElement2> parent2(parent);
				
			parent2->get_clientTop(&y);
			totalY += y;
		}

		parent->get_offsetLeft(&y);
		totalY += y;

		CComPtr<IHTMLElement> t;
		parent->get_offsetParent(&t);
		parent = t;
	}

	return totalY;
}

long ElementWrapper::getWidth() 
{
	long width;
	element->get_offsetWidth(&width);
	return width;
}

long ElementWrapper::getHeight() 
{
	long height;
	element->get_offsetHeight(&height);
	return height;
}

const wchar_t* colourNames2hex[][2] = {
	{ L"aqua",		L"#00ffff" },
	{ L"black",		L"#000000" },
	{ L"blue",		L"#0000ff" },
	{ L"fuchsia",	L"#ff00ff" },
	{ L"gray",		L"#808080" },
	{ L"green",		L"#008000" },
	{ L"lime",		L"#00ff00" },
	{ L"maroon",	L"#800000" },
	{ L"navy",		L"#000080" },
	{ L"olive",		L"#808000" },
	{ L"purple",	L"#800080" },
	{ L"red",		L"#ff0000" },
	{ L"silver",	L"#c0c0c0" },
	{ L"teal",		L"#008080" },
	{ L"white",		L"#ffffff" },
	{ L"yellow",	L"#ffff00" },
	{ NULL,			NULL }
};

std::wstring mangleColour(const std::wstring& propertyName, std::wstring& toMangle) 
{
	if (wcsstr(propertyName.c_str(), L"color") == NULL)
		return toMangle;

	// Look for each of the named colours and mangle them.
	for (int i = 0; colourNames2hex[i][0]; i++) {
		if (_wcsicmp(colourNames2hex[i][0], toMangle.c_str()) == 0) 
			return std::wstring(colourNames2hex[i][1]);
	}

	return toMangle;
}

#define BSTR_VALUE(method, cssName)     if (_wcsicmp(cssName, propertyName.c_str()) == 0) { CComBSTR bstr; method(&bstr); return bstr2wstring(bstr);}
#define VARIANT_VALUE(method, cssName)  if (_wcsicmp(cssName, propertyName.c_str()) == 0) { VARIANT var; method(&var); return mangleColour(propertyName.c_str(), variant2wchar(var));}

std::wstring ElementWrapper::getValueOfCssProperty(const std::wstring& propertyName)
{
	CComQIPtr<IHTMLElement2> styled(element);
	CComBSTR name(propertyName.c_str());

	CComPtr<IHTMLCurrentStyle> style;
	styled->get_currentStyle(&style);
	
	/*
	// This is what I'd like to write.

	VARIANT value;
	style->getAttribute(name, 0, &value);
	return variant2wchar(value);
	*/

	// So the way we've done this strikes me as a remarkably poor idea.
	
	/*
    Not implemented
		background-position
		clip
		column-count
        column-gap
        column-width
		float
		marker-offset
		opacity
		outline-top-width
        outline-right-width
        outline-bottom-width
        outline-left-width
        outline-top-color
        outline-right-color
        outline-bottom-color
        outline-left-color
        outline-top-style
        outline-right-style
        outline-bottom-style
        outline-left-style
		user-focus
        user-select
        user-modify
        user-input
		white-space
		word-spacing
	*/
	BSTR_VALUE(		style->get_backgroundAttachment,		L"background-attachment");
	VARIANT_VALUE(	style->get_backgroundColor,				L"background-color");
	BSTR_VALUE(		style->get_backgroundImage,				L"background-image");
	BSTR_VALUE(		style->get_backgroundRepeat,			L"background-repeat");
	VARIANT_VALUE(	style->get_borderBottomColor,			L"border-bottom-color");
	BSTR_VALUE(		style->get_borderBottomStyle,			L"border-bottom-style");
	VARIANT_VALUE(	style->get_borderBottomWidth,			L"border-bottom-width");
	VARIANT_VALUE(	style->get_borderLeftColor,				L"border-left-color");
	BSTR_VALUE(		style->get_borderLeftStyle,				L"border-left-style");
	VARIANT_VALUE(	style->get_borderLeftWidth,				L"border-left-width");
	VARIANT_VALUE(	style->get_borderRightColor,			L"border-right-color");
	BSTR_VALUE(		style->get_borderRightStyle,			L"border-right-style");
	VARIANT_VALUE(	style->get_borderRightWidth,			L"border-right-width");
	VARIANT_VALUE(	style->get_borderTopColor,				L"border-top-color");
	BSTR_VALUE(		style->get_borderTopStyle,				L"border-top-style");
	VARIANT_VALUE(	style->get_borderTopWidth,				L"border-top-width");
	VARIANT_VALUE(	style->get_bottom,						L"bottom");
	BSTR_VALUE(		style->get_clear,						L"clear");
	VARIANT_VALUE(	style->get_color,						L"color");
	BSTR_VALUE(		style->get_cursor,						L"cursor");
	BSTR_VALUE(		style->get_direction,					L"direction");
	BSTR_VALUE(		style->get_display,						L"display");
	BSTR_VALUE(		style->get_fontFamily,					L"font-family");
	VARIANT_VALUE(	style->get_fontSize,					L"font-size");
	BSTR_VALUE(		style->get_fontStyle,					L"font-style");
	VARIANT_VALUE(	style->get_fontWeight,					L"font-weight");
	VARIANT_VALUE(	style->get_height,						L"height");
	VARIANT_VALUE(	style->get_left,						L"left");
	VARIANT_VALUE(	style->get_letterSpacing,				L"letter-spacing");
	VARIANT_VALUE(	style->get_lineHeight,					L"line-height");
	BSTR_VALUE(		style->get_listStyleImage,				L"list-style-image");
	BSTR_VALUE(		style->get_listStylePosition,			L"list-style-position");
	BSTR_VALUE(		style->get_listStyleType,				L"list-style-type");
	BSTR_VALUE(		style->get_margin, 						L"margin");
	VARIANT_VALUE(	style->get_marginBottom, 				L"margin-bottom");
	VARIANT_VALUE(	style->get_marginRight, 				L"margin-right");
	VARIANT_VALUE(	style->get_marginTop, 					L"margin-top");
	VARIANT_VALUE(	style->get_marginLeft, 					L"margin-left");
	BSTR_VALUE(		style->get_overflow, 					L"overflow");
	BSTR_VALUE(		style->get_padding, 					L"padding");
	VARIANT_VALUE(	style->get_paddingBottom, 				L"padding-bottom");
	VARIANT_VALUE(	style->get_paddingLeft, 				L"padding-left");
	VARIANT_VALUE(	style->get_paddingRight, 				L"padding-right");
	VARIANT_VALUE(	style->get_paddingTop, 					L"padding-top");
	BSTR_VALUE(		style->get_position, 					L"position");
	VARIANT_VALUE(	style->get_right, 						L"right");
	BSTR_VALUE(		style->get_textAlign, 					L"text-align");
	BSTR_VALUE(		style->get_textDecoration, 				L"text-decoration");
	BSTR_VALUE(		style->get_textTransform, 				L"text-transform");
	VARIANT_VALUE(	style->get_top, 						L"top");
	VARIANT_VALUE(	style->get_verticalAlign,				L"vertical-align");
	BSTR_VALUE(		style->get_visibility,					L"visibility");
	VARIANT_VALUE(	style->get_width,						L"width");
	VARIANT_VALUE(	style->get_zIndex,						L"z-index");

	return NULL;
}

std::wstring ElementWrapper::getText() 
{
	CComBSTR tagName;
	element->get_tagName(&tagName);
	bool isTitle = tagName == L"TITLE";
	bool isPre = tagName == L"PRE";

	if (isTitle)
	{
		return ie->getTitle();
	}

	CComQIPtr<IHTMLDOMNode> node(element); 
	std::wstring toReturn(L"");
	getText(toReturn, node, isPre);

	/* Trim leading and trailing whitespace and line breaks. */
	std::wstring::const_iterator itStart = toReturn.begin();
	while (itStart != toReturn.end() && iswspace(*itStart)) {
		++itStart;
	}

	std::wstring::const_iterator itEnd = toReturn.end();
	while (itStart < itEnd) {
		--itEnd;
		if (!iswspace(*itEnd)) {
			++itEnd;
			break;
		}
	}

	return std::wstring(itStart, itEnd);
}

/* static */ void ElementWrapper::getText(std::wstring& toReturn, IHTMLDOMNode* node, bool isPreformatted)
{
	if (isBlockLevel(node)) {
		collapsingAppend(toReturn, L"\r\n");
	}

	CComPtr<IDispatch> dispatch;
	node->get_childNodes(&dispatch);
	CComQIPtr<IHTMLDOMChildrenCollection> children(dispatch);

	if (!children)
		return;

	long length = 0;
	children->get_length(&length);
	for (long i = 0; i < length; i++) 
	{
		CComPtr<IDispatch> dispatch2;
		children->item(i, &dispatch2);
		CComQIPtr<IHTMLDOMNode> child(dispatch2);

		CComBSTR childName;
		child->get_nodeName(&childName);
		
		CComQIPtr<IHTMLDOMTextNode> textNode(child);
		if (textNode) {
			CComBSTR text;
			textNode->get_data(&text);

			for (unsigned int i = 0; i < text.Length(); i++) {
				if (text[i] == 160) {
					text[i] = L' ';
				}
			}

			collapsingAppend(toReturn, isPreformatted ? bstr2wstring(text) : collapseWhitespace(text));
		} else if (wcscmp(childName, L"PRE") == 0) {
			getText(toReturn, child, true);
		} else {
			getText(toReturn, child, false);
		}
	}

	if (isBlockLevel(node)) {
		collapsingAppend(toReturn, L"\r\n");
	}
}

// Append s2 to s, collapsing intervening whitespace.
// Assumes that s and s2 have already been internally collapsed.
/*static*/ void ElementWrapper::collapsingAppend(std::wstring& s, const std::wstring& s2)
{
	if (s.empty() || s2.empty()) {
		s += s2;
		return;
	}

	// \r\n abutting \r\n collapses.
	if (s.length() >= 2 && s2.length() >= 2) {
		if (s[s.length() - 2] == '\r' && s[s.length() - 1] == '\n' &&
			s2[0] == '\r' && s2[1] == '\n') {
			s += s2.substr(2);
			return;
		}
	}

	// wspace abutting wspace collapses into a space character.
	if ((iswspace(s[s.length() - 1]) && s[s.length() - 1] != '\n') &&
		(iswspace(s2[0]) && s[0] != '\r')) {
		s += s2.substr(1);
		return;
	}

	s += s2;
}

/*static*/ std::wstring ElementWrapper::collapseWhitespace(const wchar_t *text)
{
	std::wstring toReturn(L"");
	int previousWasSpace = false;
	wchar_t previous = 'X';
	bool newlineAlreadyAppended = false;

	// Need to keep an eye out for '\r\n'
	for (unsigned int i = 0; i < wcslen(text); i++) {
		wchar_t c = text[i];
		int currentIsSpace = iswspace(c);

		// Append the character if the previous was not whitespace
		if (!(currentIsSpace && previousWasSpace)) {
			toReturn += c;
			newlineAlreadyAppended = false;
		} else if (previous == '\r' && c == '\n' && !newlineAlreadyAppended) {
			// If the previous char was '\r' and current is '\n' 
			// and we've not already appended '\r\n' append '\r\n'.

			// The previous char was '\r' and has already been appended and 
			// the current character is '\n'. Just appended that.
			toReturn += c; 
			newlineAlreadyAppended = true;
		}
		
		previousWasSpace = currentIsSpace;
		previous = c;
	}

	return toReturn;
}

std::wstring ElementWrapper::getTextAreaValue() 
{
	CComQIPtr<IHTMLTextAreaElement> textarea(element);
	CComBSTR result;
	textarea->get_value(&result);

	return bstr2wstring(result);
}

/*static */ bool ElementWrapper::isBlockLevel(IHTMLDOMNode *node)
{
	CComQIPtr<IHTMLElement> e(node);

	if (e) {
		BSTR tagName;
		e->get_tagName(&tagName);

		bool isBreak = false;
		if (!wcscmp(L"BR", tagName)) {
			isBreak = true;
		}

		SysFreeString(tagName);
		if (isBreak) {
			return true;
		}
	}

	CComQIPtr<IHTMLElement2, &__uuidof(IHTMLElement2)> element2(node);
	if (!element2) {
		return false;
	}

	IHTMLCurrentStyle* style;
	element2->get_currentStyle(&style);

	if (!style) {
		return false;
	}

	CComQIPtr<IHTMLCurrentStyle2, &__uuidof(IHTMLCurrentStyle2)> style2(style);
	style->Release();

	if (!style2) {
		return false;
	}

	VARIANT_BOOL isBlock;
	style2->get_isBlock(&isBlock);

	return isBlock == VARIANT_TRUE;
}

void ElementWrapper::click()
{
	CComQIPtr<IHTMLDOMNode2> node(element);
	
	if (!node) {
		cerr << "No node to click on" << endl;
		return;
	}

	IDispatch* dispatch;
	node->get_ownerDocument(&dispatch);
	CComQIPtr<IHTMLDocument4> doc(dispatch);
	dispatch->Release();

	CComQIPtr<IHTMLElement3> element3(element);
	CComQIPtr<IHTMLElement2> element2(element);
	
	IHTMLEventObj* eventObject;
	VARIANT empty;
	VariantInit(&empty);
	doc->createEventObject(&empty, &eventObject);

	VARIANT eventref;
	VariantInit(&eventref);
    V_VT(&eventref) = VT_DISPATCH;
    V_DISPATCH(&eventref) = eventObject;

	VARIANT_BOOL cancellable;
	BSTR mouseDown = SysAllocString(L"onmousedown");
	BSTR mouseUp = SysAllocString(L"onmouseup");

	element3->fireEvent(mouseDown, &eventref, &cancellable);
	element2->focus();
	element3->fireEvent(mouseUp, &eventref, &cancellable);
	SysFreeString(mouseDown);
	SysFreeString(mouseUp);

	element->click();

	VariantClear(&eventref);

	ie->waitForNavigateToFinish();
}

void ElementWrapper::submit()
{
	CComQIPtr<IHTMLFormElement> form(element);
	if (form) {
		form->submit();
	} else {
		CComQIPtr<IHTMLInputElement> input(element);
		if (input) {
			CComBSTR typeName;
			input->get_type(&typeName);
			std::wstring type = bstr2wstring(typeName);

			if (_wcsicmp(L"submit", type.c_str()) == 0 || _wcsicmp(L"image", type.c_str()) == 0) {
				click();
			} else {
				CComPtr<IHTMLFormElement> form2;
				input->get_form(&form2);
				form2->submit();
			}
		} else {
			findParentForm(&form);
			if (!form) {
				throw "Unable to find the containing form";
			} 
			form->submit();
		}
	}

	ie->waitForNavigateToFinish();
}

bool ElementWrapper::isCheckbox()
{
	CComQIPtr<IHTMLInputElement> input(element);
	if (!input) {
		return false;
	}

	CComBSTR typeName;
	input->get_type(&typeName);
	std::wstring type = bstr2wstring(typeName);
	return _wcsicmp(type.c_str(), L"checkbox") == 0;
}

bool ElementWrapper::isRadio()
{
	CComQIPtr<IHTMLInputElement> input(element);
	if (!input) {
		return false;
	}

	CComBSTR typeName;
	input->get_type(&typeName);
	std::wstring type = bstr2wstring(typeName);
	return _wcsicmp(type.c_str(), L"radio") == 0;
}

void ElementWrapper::findParentForm(IHTMLFormElement **pform)
{
	CComPtr<IHTMLElement> current(element);

	while (current) {
		CComQIPtr<IHTMLFormElement> form(current);
		if (form) {
			*pform = form.Detach();
			return;
		}

		CComPtr<IHTMLElement> temp;
		current->get_parentElement(&temp);
		current = temp;
    }
}

std::vector<ElementWrapper*>* ElementWrapper::getChildrenWithTagName(const std::wstring& tagName) 
{
	CComQIPtr<IHTMLElement2> element2(element);
	CComBSTR name(tagName.c_str());
	CComPtr<IHTMLElementCollection> elementCollection;
	element2->getElementsByTagName(name, &elementCollection);

	long length = 0;
	elementCollection->get_length(&length);

	std::vector<ElementWrapper*> *toReturn = new std::vector<ElementWrapper*>();

	for (int i = 0; i < length; i++) {
		VARIANT idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		VARIANT zero;
		zero.vt = VT_I4;
		zero.lVal = 0;

		CComPtr<IDispatch> dispatch;
		elementCollection->item(idx, zero, &dispatch);
		CComQIPtr<IHTMLDOMNode> node(dispatch);

		toReturn->push_back(new ElementWrapper(ie, node));
	}

	return toReturn;
}

IHTMLElement* ElementWrapper::getWrappedElement() 
{
	return element;
}

IHTMLEventObj* ElementWrapper::newEventObject() 
{
	IDispatch* dispatch;
	element->get_document(&dispatch);
	CComQIPtr<IHTMLDocument4> doc(dispatch);
	dispatch->Release();
		
	VARIANT empty;
	VariantInit(&empty);
	IHTMLEventObj* eventObject;
	doc->createEventObject(&empty, &eventObject);
	return eventObject;
}

void ElementWrapper::fireEvent(IHTMLEventObj* eventObject, const OLECHAR* eventName) 
{
	CComQIPtr<IHTMLDOMNode> node = element;
	fireEvent(node, eventObject, eventName);
}

void ElementWrapper::fireEvent(IHTMLDOMNode* fireOn, IHTMLEventObj* eventObject, const OLECHAR* eventName) 
{
	VARIANT eventref;
	VariantInit(&eventref);
	V_VT(&eventref) = VT_DISPATCH;
	V_DISPATCH(&eventref) = eventObject;

	BSTR onChange = SysAllocString(eventName);
	VARIANT_BOOL cancellable;

	CComQIPtr<IHTMLElement3, &__uuidof(IHTMLElement3)> element3 = fireOn;
	element3->fireEvent(onChange, &eventref, &cancellable);

	SysFreeString(onChange);
}
