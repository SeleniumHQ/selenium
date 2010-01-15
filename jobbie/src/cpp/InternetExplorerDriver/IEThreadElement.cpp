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

// IEThread.cpp : implementation file
//
#include "stdafx.h"
#include <ctime>
#include <cctype>
#include <algorithm>

#include "IEThread.h"
#include "interactions.h"
#include "logging.h"
#include "utils.h"
#include "EventReleaser.h"
#include "errorcodes.h"

using namespace std;

const LPCTSTR ie8WindowNames[] = {
        _T("Frame Tab"),
        _T("TabWindowClass"),
        _T("Shell DocObject View"),
        _T("Internet Explorer_Server"),
        NULL
};

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


#define ON_THREAD_ELEMENT(dataMarshaller, p_HtmlElement) \
	ON_THREAD_COMMON(dataMarshaller) \
	IHTMLElement* p_HtmlElement = dataMarshaller.input_html_element_; \
	CComQIPtr<IHTMLElement> __elem__(p_HtmlElement); \
	checkValidDOM(__elem__);


HWND getIeServerWindow(HWND hwnd)
{
  HWND iehwnd = hwnd;

  for (int i = 0; ie6WindowNames[i] && iehwnd; i++) {
    iehwnd = getChildWindow(iehwnd, ie6WindowNames[i]);
  }

  if (!iehwnd) {
    iehwnd = hwnd;
    for (int i = 0; ie7WindowNames[i] && iehwnd; i++) {
      iehwnd = getChildWindow(iehwnd, ie7WindowNames[i]);
    }
  }

  if (!iehwnd) {
    iehwnd = hwnd;
    for (int i = 0; ie8WindowNames[i] && iehwnd; i++) {
      iehwnd = getChildWindow(iehwnd, ie8WindowNames[i]);
    }
  }

  return iehwnd;
}

struct keyboardData {
	HWND main;
	HWND hwnd;
	HANDLE hdl_EventToNotifyWhenNavigationCompleted;
	const wchar_t* text;

	keyboardData(): hdl_EventToNotifyWhenNavigationCompleted(NULL) {}
};

const LPCTSTR fileDialogNames[] = {
	_T("#32770"),
	_T("ComboBoxEx32"),
	_T("ComboBox"),
	_T("Edit"),
	NULL
};

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

    LOG(WARN) << "No edit found";
    return false;
}

WORD WINAPI setFileValue(keyboardData* data) {
	SCOPETRACER
	EventReleaser ER(data->hdl_EventToNotifyWhenNavigationCompleted);

    Sleep(200);
    HWND ieMain = data->main;
    HWND dialogHwnd = ::GetLastActivePopup(ieMain);

    int maxWait = 10;
    while ((dialogHwnd == ieMain) && --maxWait) {
		Sleep(200);
		dialogHwnd = ::GetLastActivePopup(ieMain);
    }

    if (!dialogHwnd || (dialogHwnd == ieMain)) {
        LOG(WARN) << "No dialog found";
        return false;
    }

	return sendKeysToFileUploadAlert(dialogHwnd, data->text);
}

void IeThread::OnElementSendKeys(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	bool displayed;
	int res = isDisplayed(pElement, &displayed);
	if (res != SUCCESS || !displayed) {
		data.error_code = EELEMENTNOTDISPLAYED;
		return;
	}

	if (!isEnabled(pElement)) {
		data.error_code = EELEMENTNOTENABLED;
		return;
	}

	data.error_code = SUCCESS;

	LPCWSTR newValue = data.input_string_;
	CComQIPtr<IHTMLElement> element(pElement);
	checkValidDOM(element);

	const HWND hWnd = getHwnd();
	const HWND ieWindow = getIeServerWindow(hWnd);

	keyboardData keyData;
    keyData.main = hWnd;  // IE's main window
	keyData.hwnd = ieWindow;
	keyData.text = newValue;

	element->scrollIntoView(CComVariant(VARIANT_TRUE));

	CComQIPtr<IHTMLInputFileElement> file(element);
	if (file) {
		DWORD threadId;
		tryTransferEventReleaserToNotifyNavigCompleted(&SC);
		keyData.hdl_EventToNotifyWhenNavigationCompleted = m_EventToNotifyWhenNavigationCompleted;
		::CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE) setFileValue, (void *) &keyData, 0, &threadId);

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

	sendKeys(ieWindow, keyData.text, pIED->getSpeed());
}


void IeThread::OnElementIsDisplayed(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	bool displayed;
	data.error_code = isDisplayed(pElement, &displayed);
	data.output_bool_ = displayed;
}

int isElementDisplayed(IHTMLElement* element, bool* displayed) 
{
	SCOPETRACER
	CComQIPtr<IHTMLElement2> e2(element);
	if (!e2) {
		return EOBSOLETEELEMENT;
	}

	CComPtr<IHTMLCurrentStyle> style;
	CComBSTR display;

	e2->get_currentStyle(&style);
	if(!style) {
		return EOBSOLETEELEMENT;
	}
	style->get_display(&display);
	std::wstring displayValue = combstr2cw(display);

	if (_wcsicmp(L"none", displayValue.c_str()) == 0) {
		*displayed = false;
		return SUCCESS;
	}

	CComPtr<IHTMLElement> parent;
	element->get_parentElement(&parent);

	if (!parent) {
		*displayed = true;
		return SUCCESS;
	}

	// Check that parent has style
	CComQIPtr<IHTMLElement2> parent2(parent);

	CComPtr<IHTMLCurrentStyle> parentStyle;
	parent2->get_currentStyle(&parentStyle);

	if (parentStyle) {
		return isElementDisplayed(parent, displayed);
	}

	return SUCCESS;
}

bool isElementVisible(IHTMLElement* element) 
{
	SCOPETRACER
	CComQIPtr<IHTMLElement2> e2(element);
	if (!e2) {
		return false;
	}
	CComPtr<IHTMLCurrentStyle> curr;
	CComBSTR visible;

	e2->get_currentStyle(&curr);
	if(!curr) {
		throw std::wstring(L"appears to manipulate obsolete DOM element.");
	}
	curr->get_visibility(&visible);

	std::wstring visibleValue = combstr2cw(visible);

	int isVisible = _wcsicmp(L"hidden", visibleValue.c_str());
	if (isVisible == 0) {
		return false;
	}

	// If the style attribute was set on this class and contained visibility, then stop
	CComPtr<IHTMLStyle> style;
	element->get_style(&style);
	if (style) {
		CComBSTR visibleStyle;
		style->get_visibility(&visibleStyle);
		if (visibleStyle) {
			return true;  // because we'd have returned false earlier, otherwise
		}
	}

	CComPtr<IHTMLElement> parent;
	element->get_parentElement(&parent);
	if (parent) {
		return isElementVisible(parent);
	}

	return true;
}

int IeThread::isNodeDisplayed(IHTMLDOMNode *node, bool* result) 
{
	if (!node) {
		*result = false;
		return SUCCESS;
	}

	// Walk up the parents of the node until we either find an element or null
	CComQIPtr<IHTMLElement> element(node);
	if (!element) {
		CComPtr<IHTMLDOMNode> parent;
		node->get_parentNode(&parent);
		return isNodeDisplayed(parent, result);
	}
	return isDisplayed(element, result);
}

int IeThread::isDisplayed(IHTMLElement *element, bool* result)
{
	SCOPETRACER
	CComQIPtr<IHTMLInputHiddenElement> hidden(element);
	if (hidden) {
		*result = false;
		return SUCCESS;
	}

	bool displayed;
	int value = isElementDisplayed(element, &displayed);

	if (value != SUCCESS) {
		return value;
	}

	*result = displayed && isElementVisible(element);
	return SUCCESS;
}

void IeThread::OnElementIsEnabled(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	data.output_bool_ = isEnabled(pElement);
}

void IeThread::OnElementGetLocationOnceScrolledIntoView(WPARAM w, LPARAM lp)
{
	SCOPETRACER
    ON_THREAD_ELEMENT(data, pElement)

    HWND hwnd;
    long x = 0, y = 0, width = 0, height = 0;

    int result = getLocationWhenScrolledIntoView(pElement, &hwnd, &x, &y, &width, &height);
	if (result != SUCCESS) {
		data.error_code = result;
	}

    SAFEARRAY* args = SafeArrayCreateVector(VT_VARIANT, 0, 5);
    
    long index = 0;
    VARIANT hwndRes;
    hwndRes.vt = VT_I8;
    hwndRes.llVal = (LONGLONG) hwnd;
    SafeArrayPutElement(args, &index, &hwndRes);

    index = 1;
    VARIANT xRes;
    xRes.vt = VT_I4;
    xRes.lVal = x;
    SafeArrayPutElement(args, &index, &xRes);

    index = 2;
    VARIANT yRes;
    yRes.vt = VT_I4;
    yRes.lVal = y;
    SafeArrayPutElement(args, &index, &yRes);

	index = 3;
    VARIANT widthRes;
    widthRes.vt = VT_I4;
    widthRes.lVal = width;
    SafeArrayPutElement(args, &index, &widthRes);

	index = 4;
    VARIANT heightRes;
    heightRes.vt = VT_I4;
    heightRes.lVal = height;
    SafeArrayPutElement(args, &index, &heightRes);

    data.output_safe_array_ = args;
}

void IeThread::OnElementGetLocation(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	long x = 0, y = 0;

	CComQIPtr<IHTMLElement2> element2(pElement);
	if (!element2) {
		// TODO(alexis): return an adhoc array
		return;
	}
	CComPtr<IHTMLRect> rect;
	element2->getBoundingClientRect(&rect);

	rect->get_left(&x);
	rect->get_top(&y);

	CComQIPtr<IHTMLDOMNode2> node(element2);
	CComPtr<IDispatch> ownerDocDispatch;
	node->get_ownerDocument(&ownerDocDispatch);
	CComQIPtr<IHTMLDocument3> ownerDoc(ownerDocDispatch);

	CComPtr<IHTMLElement> tempDoc;
	ownerDoc->get_documentElement(&tempDoc);

	CComQIPtr<IHTMLElement2> docElement(tempDoc);
	long left = 0, top = 0;
	docElement->get_scrollLeft(&left);
	docElement->get_scrollTop(&top);

	x += left;
	y += top;

	SAFEARRAY* args = SafeArrayCreateVector(VT_VARIANT, 0, 2);
	
	long index = 0;
	VARIANT xRes;
	xRes.vt = VT_I4;
	xRes.lVal = x;
	SafeArrayPutElement(args, &index, (void*) &xRes);

	index = 1;
	VARIANT yRes;
	yRes.vt = VT_I4;
	yRes.lVal = y;
	SafeArrayPutElement(args, &index, &yRes);

	data.output_safe_array_ = args;
}

void IeThread::OnElementGetHeight(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	bool displayed;
	int result = isDisplayed(pElement, &displayed);
	if (result != SUCCESS) {
		data.error_code = result;
		return;
	}

	long& height = data.output_long_;

	pElement->get_offsetHeight(&height);
}

void IeThread::OnElementGetWidth(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	bool displayed;
	int result = isDisplayed(pElement, &displayed);
	if (result != SUCCESS) {
		data.error_code = result;
		return;
	}

	long& width = data.output_long_;

	pElement->get_offsetWidth(&width);
}

void IeThread::OnIsElementFresh(WPARAM w, LPARAM lp) 
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement);

	// Walk up the tree until we find no parent or the html tag
	CComPtr<IHTMLElement> parent(pElement);
	while (parent) {
		CComQIPtr<IHTMLHtmlElement> html(parent);
		if (html) {
			data.output_bool_ = true;
			return;
		}
		CComPtr<IHTMLElement> next;
		parent->get_parentElement(&next);
		parent = next;
	}
	data.output_bool_ = false;
}

void IeThread::OnElementGetTagName(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	std::wstring& ret = data.output_string_;

	getTagName(pElement, ret);
}

void IeThread::getTextAreaValue(IHTMLElement *pElement, std::wstring& res)
{
	SCOPETRACER
	CComQIPtr<IHTMLTextAreaElement> textarea(pElement);
	CComBSTR result;
	textarea->get_value(&result);

	res = combstr2cw(result);
}

void IeThread::OnElementClear(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	CComQIPtr<IHTMLElement2> element2(pElement);
	if (!element2) {
		return;
	}

	CComQIPtr<IHTMLTextAreaElement> textArea(pElement);
	CComQIPtr<IHTMLInputElement> inputElement(pElement);
	CComBSTR v;
	if (textArea) {
		textArea->get_value(&v);
	}
	if (inputElement) {
		inputElement->get_value(&v);
	}
	bool fireChange = v.Length() > 0;

	element2->focus();

	if (textArea) textArea->put_value(L"");
	if (inputElement) inputElement->put_value(L"");
	
	if (fireChange) {
		CComPtr<IHTMLEventObj> eventObj;
		newEventObject(pElement, eventObj);
		fireEvent(pElement, eventObj, L"onchange");
	}

	element2->blur();

	HWND hWnd = getHwnd();
	LRESULT lr;

	SendMessageTimeoutW(hWnd, WM_SETTEXT, 0, (LPARAM) L"", SMTO_ABORTIFHUNG, 3000, (PDWORD_PTR)&lr);
}

void IeThread::OnElementIsSelected(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	data.output_bool_ = isSelected(pElement);
}

void IeThread::OnElementSetSelected(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	bool currentlySelected = isSelected(pElement);

	if (!this->isEnabled(pElement))
	{
		data.error_code = EELEMENTNOTENABLED;
		return;
	}

	bool displayed;
	int result = this->isDisplayed(pElement, &displayed);
	if (result != SUCCESS || !displayed) 
	{
		data.error_code = EELEMENTNOTDISPLAYED;
		return;
	}

	/* TODO(malcolmr): Why not: if (isSelected()) return; ? Do we really need to re-set 'checked=true' for checkbox and do effectively nothing for select?
	   Maybe we should check for disabled elements first? */

	data.error_code = SUCCESS;

	if (isCheckbox(pElement)) {

		if (!isSelected(pElement)) {
			click(pElement);
		}

		CComBSTR checked(L"checked");
		CComBSTR isTrue(L"true");
		CComVariant isChecked(isTrue);
		pElement->setAttribute(checked, isChecked, 0);

		if (currentlySelected != isSelected(pElement)) {
			CComPtr<IHTMLEventObj> eventObj;
			newEventObject(pElement, eventObj);
			fireEvent(pElement, eventObj, L"onchange");
		}

		return;
    }

	if (isRadio(pElement)) {
		if (!isSelected(pElement)) {
			click(pElement);
		}

		CComBSTR selected(L"selected");
		CComBSTR isTrue(L"true");
		CComVariant select(isTrue);
		pElement->setAttribute(selected, select, 0);

		if (currentlySelected != isSelected(pElement)) {
			CComPtr<IHTMLEventObj> eventObj;
			newEventObject(pElement, eventObj);
			fireEvent(pElement, eventObj, L"onchange");
		}

		return;
    }

	CComQIPtr<IHTMLOptionElement> option(pElement);
	if (option) {
		option->put_selected(VARIANT_TRUE);

		// Looks like we'll need to fire the event on the select element and not the option. Assume for now that the parent node is a select. Which is dumb
		CComQIPtr<IHTMLDOMNode> node(pElement);
		CComPtr<IHTMLDOMNode> parent;
		node->get_parentNode(&parent);

		if (currentlySelected != isSelected(pElement)) {
			CComPtr<IHTMLEventObj> eventObj;
			newEventObject(pElement, eventObj);
			fireEvent(pElement, parent, eventObj, L"onchange");
		}

		return;
	}

	data.error_code = EELEMENTNOTSELECTED;
}

void IeThread::OnElementToggle(WPARAM w, LPARAM lp) 
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	// It only makes sense to toggle check boxes or options in a multi-select
	CComBSTR tagName;
	HRESULT hr = pElement->get_tagName(&tagName);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Unable to get tag name";
		data.error_code = ENOSUCHELEMENT;
		return;
	}

	if ((tagName != L"OPTION") &&
		!isCheckbox(pElement)) 
	{
		data.error_code = ENOTIMPLEMENTED;
		return;
	}

	int res = click(pElement, &SC);
	data.error_code = res;
	if (res == SUCCESS || res != EELEMENTNOTDISPLAYED) {
		data.error_code = res;
		return;
	} 

	if (tagName == L"OPTION") {
		CComQIPtr<IHTMLOptionElement> option(pElement);
		if (!option) {
			LOG(ERROR) << "Cannot convert an element to an option, even though the tag name is right";
			data.error_code = ENOSUCHELEMENT;
			return;
		}

		VARIANT_BOOL selected;
		hr = option->get_selected(&selected);
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Cannot tell whether or not the element is selected";
			data.error_code = ENOSUCHELEMENT;
			return;
		}

		if (selected == VARIANT_TRUE) {
			hr = option->put_selected(VARIANT_FALSE);
		} else {
			hr = option->put_selected(VARIANT_TRUE);
		}
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Failed to set selection";
			data.error_code = EEXPECTEDERROR;
			return;
		}

		//Looks like we'll need to fire the event on the select element and not the option. Assume for now that the parent node is a select. Which is dumb
		CComQIPtr<IHTMLDOMNode> node(pElement);
		if (!node) {
			LOG(WARN) << "Current element is not an DOM node";
			data.error_code = ENOSUCHELEMENT;
			return;
		}
		CComPtr<IHTMLDOMNode> parent;
		hr = node->get_parentNode(&parent);
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Cannot get parent node";
			data.error_code = ENOSUCHELEMENT;
			return;
		}

		CComPtr<IHTMLEventObj> eventObj;
		newEventObject(pElement, eventObj);
		fireEvent(pElement, parent, eventObj, L"onchange");

		data.error_code = SUCCESS;
	}
}

void IeThread::OnElementGetValueOfCssProp(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	getValueOfCssProperty(pElement, data.input_string_, data.output_string_);
}

void IeThread::OnElementGetText(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)
	getText(pElement, data.output_string_);
}

void IeThread::OnElementClick(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	int res = click(pElement, &SC);

	data.error_code = res;
}

void IeThread::OnElementSubmit(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	submit(pElement, &SC);
}

void IeThread::newEventObject(IHTMLElement *pElement, CComPtr<IHTMLEventObj>& r_eventObject)
{
	SCOPETRACER
	CComPtr<IDispatch> dispatch;
	pElement->get_document(&dispatch);
	CComQIPtr<IHTMLDocument4> doc(dispatch);

	CComVariant empty;
	doc->createEventObject(&empty, &r_eventObject);
}

void IeThread::fireEvent(IHTMLElement *pElement, IHTMLEventObj* eventObject, LPCWSTR eventName)
{
	SCOPETRACER
	CComQIPtr<IHTMLDOMNode> node(pElement);
	fireEvent(pElement, node, eventObject, eventName);
}

void IeThread::fireEvent(IHTMLElement *pElement, IHTMLDOMNode* fireOn, IHTMLEventObj* eventObject, LPCWSTR eventName)
{
	SCOPETRACER
	CComVariant eventref;
	V_VT(&eventref) = VT_DISPATCH;
	V_DISPATCH(&eventref) = eventObject;

	CComBSTR onChange(eventName);
	VARIANT_BOOL cancellable;

	CComQIPtr<IHTMLElement3> element3(fireOn);
	element3->fireEvent(onChange, &eventref, &cancellable);
}

bool IeThread::isCheckbox(IHTMLElement *pElement)
{
	SCOPETRACER
	CComQIPtr<IHTMLInputElement> input(pElement);
	if (!input) {
		return false;
	}

	CComBSTR typeName;
	input->get_type(&typeName);
	return _wcsicmp(combstr2cw(typeName), L"checkbox") == 0;
}

bool IeThread::isRadio(IHTMLElement *pElement)
{
	SCOPETRACER
	CComQIPtr<IHTMLInputElement> input(pElement);
	if (!input) {
		return false;
	}

	CComBSTR typeName;
	input->get_type(&typeName);
	return _wcsicmp(combstr2cw(typeName), L"radio") == 0;
}

void IeThread::getTagName(IHTMLElement *pElement, std::wstring& res)
{
	CComBSTR temp;
	pElement->get_tagName(&temp);
    res = combstr2cw(temp);
    transform(res.begin(), res.end(), res.begin(), tolower);
}

bool IeThread::isSelected(IHTMLElement *pElement)
{
	SCOPETRACER
	CComQIPtr<IHTMLOptionElement> option(pElement);
	if (option) {
		VARIANT_BOOL isSelected;
		option->get_selected(&isSelected);
		return isSelected == VARIANT_TRUE;
	}

	if (isCheckbox(pElement) || isRadio(pElement)) {
		CComQIPtr<IHTMLInputElement> input(pElement);

		VARIANT_BOOL isChecked;
		input->get_checked(&isChecked);
		return isChecked == VARIANT_TRUE;
	}

	return false;
}

int getLocation(HWND hwnd, IHTMLElement* element, long* left, long* right, long* top, long* bottom)
{
	*top, *left, *bottom, *right = 0;

	wait(100);

	// getBoundingClientRect. Note, the docs talk about this possibly being off by 2,2
    // and Jon Resig mentions some problems too. For now, we'll hope for the best
    // http://ejohn.org/blog/getboundingclientrect-is-awesome/

    CComPtr<IHTMLElement2> element2;
	HRESULT hr = element->QueryInterface(&element2);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Unable to cast element to correct type";
		return EOBSOLETEELEMENT;
	}

    CComPtr<IHTMLRect> rect;
	hr = element2->getBoundingClientRect(&rect);
    if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Cannot figure out where the element is on screen";
		return EUNHANDLEDERROR;
    }

	long t, b, l, r = 0;

    rect->get_top(&t);
    rect->get_left(&l);
	rect->get_bottom(&b);
    rect->get_right(&r);

	// On versions of IE prior to 8 on Vista, if the element is out of the 
	// viewport this would seem to return 0,0,0,0. IE 8 returns position in 
	// the DOM regardless of whether it's in the browser viewport.

	// Handle the easy case first: does the element have size
	long w = r - l;
	long h = b - t;
	if (w < 0 || h < 0) { return EELEMENTNOTDISPLAYED; }

	// The element has a location, but is it in the viewport?
	// Turns out that the dimensions given (at least on IE 8 on vista)
	// are relative to the view port so get the dimensions of the window
	WINDOWINFO winInfo;
	if (!GetWindowInfo(hwnd, &winInfo)) {
		LOG(WARN) << "Cannot determine size of window";
		return EELEMENTNOTDISPLAYED;
	}
    long winWidth = winInfo.rcClient.right - winInfo.rcClient.left;
    long winHeight = winInfo.rcClient.bottom - winInfo.rcClient.top;

	// Hurrah! Now we know what the visible area of the viewport is
	// Is the element visible in the X axis?
	if (l < 0 || l > winWidth) {
		return EELEMENTNOTDISPLAYED;
	}

	// And in the Y?
	if (t < 0 || t > winHeight) {
		return EELEMENTNOTDISPLAYED;
	}

	// TODO(simon): we should clip the size returned to the viewport
	*left = l;
	*right = r;
	*top = t;
	*bottom = b;

	return SUCCESS;
}

int IeThread::getLocationWhenScrolledIntoView(IHTMLElement *pElement, HWND* hwnd, long *x, long *y, long* w, long* h)
{
	SCOPETRACER
    CComPtr<IHTMLDOMNode2> node;
	HRESULT hr = pElement->QueryInterface(&node);

    if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Cannot cast html element to node";
		return ENOSUCHELEMENT;
    }

    bool displayed;
	int result = isDisplayed(pElement, &displayed);
	if (result != SUCCESS) {
		return result;
	} 

	if (!displayed) {
        return EELEMENTNOTDISPLAYED;
    }

    if (!isEnabled(pElement)) {
        return EELEMENTNOTENABLED;
    }

    const HWND hWnd = getHwnd();
	const HWND ieWindow = getIeServerWindow(hWnd);

	long top, left, bottom, right = 0;
	result = getLocation(ieWindow, pElement, &left, &right, &top, &bottom);
	if (result != SUCCESS) {
		// Scroll the element into view
		LOG(DEBUG) << "Will need to scroll element into view";
		HRESULT hr = pElement->scrollIntoView(CComVariant(VARIANT_TRUE));
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Cannot scroll element into view";
			return EOBSOLETEELEMENT;
		}

		result = getLocation(ieWindow, pElement, &left, &right, &top, &bottom);
	}

	if (result != SUCCESS) {
		return result;
	}

	long width = right - left;
	long height = bottom - top;

    long clickX = left;
	long clickY = top;

	LOG(DEBUG) << "(x, y, w, h): " << clickX << ", " << clickY << ", " << width << ", " << height << endl;

    if (height == 0 || width == 0) {
        LOG(DEBUG) << "Element would not be visible because it lacks height and/or width.";
        return EELEMENTNOTDISPLAYED;
    }

	// This is a little funky.
	if (ieRelease > 7) {
		clickX += 2;
		clickY += 2;
	}

	*x = clickX;
	*y = clickY;
	*w = width;
	*h = height;


    CComPtr<IDispatch> ownerDocDispatch;
    hr = node->get_ownerDocument(&ownerDocDispatch);
	if (FAILED(hr)) {
		LOG(WARN) << "Unable to locate owning document";
		return ENOSUCHDOCUMENT;
	}
    CComQIPtr<IHTMLDocument3> ownerDoc(ownerDocDispatch);
	if (!ownerDoc) {
		LOG(WARN) << "Found document but it's not the expected type";
		return ENOSUCHDOCUMENT;
	}

    CComPtr<IHTMLElement> docElement;
    hr = ownerDoc->get_documentElement(&docElement);
	if (FAILED(hr)) {
		LOG(WARN) << "Unable to locate document element";
		return ENOSUCHDOCUMENT;
	}

    CComQIPtr<IHTMLElement2> e2(docElement);
    if (!e2) {
        LOG(WARN) << "Unable to get underlying html element from the document";
        return EUNHANDLEDERROR;
    }

    CComQIPtr<IHTMLDocument2> doc2(ownerDoc);
	if (!doc2) {
		LOG(WARN) << "Have the owning document, but unable to process";
		return ENOSUCHDOCUMENT;
	}

    long clientLeft, clientTop;
    e2->get_clientLeft(&clientLeft);
    e2->get_clientTop(&clientTop);

    clickX += clientLeft;
    clickY += clientTop;

    // We now know the location of the element within its frame.
    // Where is the frame in relation to the HWND, though?
    // The ieWindow is the ultimate container, without chrome,
    // so if we know its location, we can subtract the screenLeft and screenTop
    // of the window.

    WINDOWINFO winInfo;
    GetWindowInfo(ieWindow, &winInfo);
    clickX -= winInfo.rcWindow.left;
    clickY -= winInfo.rcWindow.top;

    CComPtr<IHTMLWindow2> win2;
    hr = doc2->get_parentWindow(&win2);
	if (FAILED(hr)) {
		LOG(WARN) << "Cannot obtain parent window";
		return ENOSUCHWINDOW;
	}
    CComQIPtr<IHTMLWindow3> win3(win2);
	if (!win3) {
		LOG(WARN) << "Can't obtain parent window";
		return ENOSUCHWINDOW;
	}
    long screenLeft, screenTop;
    hr = win3->get_screenLeft(&screenLeft);
	if (FAILED(hr)) {
		LOG(WARN) << "Unable to determine left corner of window";
		return ENOSUCHWINDOW;
	}
    hr = win3->get_screenTop(&screenTop);
	if (FAILED(hr)) {
		LOG(WARN) << "Unable to determine top edge of window";
		return ENOSUCHWINDOW;
	}

    clickX += screenLeft;
    clickY += screenTop;

    *hwnd = ieWindow;
    *x = clickX;
    *y = clickY;
    return SUCCESS;
}


int IeThread::click(IHTMLElement *pElement, CScopeCaller *pSC)
{
	SCOPETRACER

	long x = 0, y = 0, w = 0, h = 0;
	HWND ieWindow;
	int result = getLocationWhenScrolledIntoView(pElement, &ieWindow, &x, &y, &w, &h);
	if (result != SUCCESS) {
		return result;
	}

	long clickX = x + (w ? w / 2 : 0);
	long clickY = y + (h ? h / 2 : 0);

	// Create a mouse move, mouse down, mouse up OS event
	LRESULT lresult = mouseMoveTo(ieWindow, 10, x, y, clickX, clickY);
	if (result != SUCCESS) {
		return result;
	}
	
	lresult = clickAt(ieWindow, clickX, clickY);
    if (result != SUCCESS) {
		return result;
	}

	tryTransferEventReleaserToNotifyNavigCompleted(pSC);
	waitForNavigateToFinish();

	return SUCCESS;
}

bool IeThread::isEnabled(IHTMLElement *pElement)
{
	SCOPETRACER
	CComQIPtr<IHTMLElement3> elem3(pElement);
	if (!elem3) {
		return false;
	}
	VARIANT_BOOL isDisabled;
	elem3->get_disabled(&isDisabled);
	return !isDisabled;
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

LPCWSTR mangleColour(LPCWSTR propertyName, LPCWSTR toMangle)
{
	if (wcsstr(propertyName, L"color") == NULL)
		return toMangle;

	// Look for each of the named colours and mangle them.
	for (int i = 0; colourNames2hex[i][0]; i++) {
		if (_wcsicmp(colourNames2hex[i][0], toMangle) == 0)
			return colourNames2hex[i][1];
	}

	return toMangle;
}

#define BSTR_VALUE(method, cssName)     if (_wcsicmp(cssName, propertyName) == 0) { CComBSTR bstr; method(&bstr); resultStr = combstr2cw(bstr); return;}
#define VARIANT_VALUE(method, cssName)  if (_wcsicmp(cssName, propertyName) == 0) { CComVariant var; method(&var); resultStr = mangleColour(propertyName, comvariant2cw(var)); return;}

void IeThread::getValueOfCssProperty(IHTMLElement *pElement, LPCWSTR propertyName, std::wstring& resultStr)
{
	SCOPETRACER
	CComQIPtr<IHTMLElement2> styled(pElement);
	if (!styled) {
		return;
	}

	CComBSTR name(propertyName);

	CComPtr<IHTMLCurrentStyle> style;
	styled->get_currentStyle(&style);

	/*
	// This is what I'd like to write.

	CComVariant value;
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

	resultStr = L"";
}

void IeThread::getText(IHTMLElement *pElement, std::wstring& res)
{
	SCOPETRACER
	CComBSTR tagName;
	pElement->get_tagName(&tagName);
	bool isTitle = tagName == L"TITLE";
	bool isPre = tagName == L"PRE";

	if (isTitle)
	{
		getTitle(res);
		return;
	}

	CComQIPtr<IHTMLDOMNode> node(pElement);
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

	res = std::wstring(itStart, itEnd);
}

/* static */ void IeThread::getText(std::wstring& toReturn, IHTMLDOMNode* node, bool isPreformatted)
{
	SCOPETRACER
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
	bool displayed;
	

	for (long i = 0; i < length; i++)
	{
		CComPtr<IDispatch> dispatch2;
		children->item(i, &dispatch2);
		CComQIPtr<IHTMLDOMNode> child(dispatch2);

		CComBSTR childName;
		child->get_nodeName(&childName);

		CComQIPtr<IHTMLDOMTextNode> textNode(child);
		
		isNodeDisplayed(node, &displayed);
		if (textNode && displayed) {
			CComBSTR text;
			textNode->get_data(&text);

			for (unsigned int i = 0; i < text.Length(); i++) {
				if (text[i] == 160) {
					text[i] = L' ';
				}
			}

			collapsingAppend(toReturn, isPreformatted ?
				std::wstring(combstr2cw(text)) // bstr2wstring(text)
				: collapseWhitespace(text));
		} else if (wcscmp(combstr2cw(childName), L"PRE") == 0) {
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
/*static*/ void IeThread::collapsingAppend(std::wstring& s, const std::wstring& s2)
{
	if (s.empty() || s2.empty()) {
		s += s2;
		return;
	}

	// \r\n abutting \r\n collapses.
	if (s.length() >= 2 && s2.length() >= 2) {
		if (s[s.length() - 2] == L'\r' && s[s.length() - 1] == L'\n' &&
			s2[0] == L'\r' && s2[1] == L'\n') {
			s += s2.substr(2);
			return;
		}
	}

	// wspace abutting wspace collapses into a space character.
	if ((iswspace(s[s.length() - 1]) && s[s.length() - 1] != L'\n') &&
		(iswspace(s2[0]) && s[0] != L'\r')) {
		s += s2.substr(1);
		return;
	}

	s += s2;
}

/*static*/ std::wstring IeThread::collapseWhitespace(CComBSTR& comtext)
{
	std::wstring toReturn(L"");
	int previousWasSpace = false;
	wchar_t previous = L'X';
	bool newlineAlreadyAppended = false;

	LPCWSTR text = combstr2cw(comtext);

	// Need to keep an eye out for '\r\n'
	for (unsigned int i = 0; i < wcslen(text); i++) {
		wchar_t c = text[i];
		int currentIsSpace = iswspace(c);

		// Append the character if the previous was not whitespace
		if (!(currentIsSpace && previousWasSpace)) {
			toReturn += c;
			newlineAlreadyAppended = false;
		} else if (previous == L'\r' && c == L'\n' && !newlineAlreadyAppended) {
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

/*static */ bool IeThread::isBlockLevel(IHTMLDOMNode *node)
{
	SCOPETRACER
	CComQIPtr<IHTMLElement> e(node);

	if (e) {
		CComBSTR tagName;
		e->get_tagName(&tagName);

		bool isBreak = false;
		if (!wcscmp(L"BR", tagName)) {
			isBreak = true;
		}

		if (isBreak) {
			return true;
		}
	}

	CComQIPtr<IHTMLElement2> element2(node);
	if (!element2) {
		return false;
	}

	CComPtr<IHTMLCurrentStyle> style;
	element2->get_currentStyle(&style);

	if (!style) {
		return false;
	}

	CComQIPtr<IHTMLCurrentStyle2> style2(style);

	if (!style2) {
		return false;
	}

	VARIANT_BOOL isBlock;
	style2->get_isBlock(&isBlock);

	return isBlock == VARIANT_TRUE;
}

void IeThread::submit(IHTMLElement *pElement, CScopeCaller *pSC)
{
	SCOPETRACER
	CComQIPtr<IHTMLFormElement> form(pElement);
	if (form) {
		form->submit();
	} else {
		CComQIPtr<IHTMLInputElement> input(pElement);
		if (input) {
			CComBSTR typeName;
			input->get_type(&typeName);

			LPCWSTR type = combstr2cw(typeName);

			if (_wcsicmp(L"submit", type) == 0 || _wcsicmp(L"image", type) == 0) {
				click(pElement);
			} else {
				CComPtr<IHTMLFormElement> form2;
				input->get_form(&form2);
				form2->submit();
			}
		} else {
			findParentForm(pElement, &form);
			if (!form) {
				throw std::wstring(L"Unable to find the containing form");
			}
			form->submit();
		}
	}

	///////
	tryTransferEventReleaserToNotifyNavigCompleted(pSC);
	waitForNavigateToFinish();
}

void IeThread::findParentForm(IHTMLElement *pElement, IHTMLFormElement **pform)
{
	SCOPETRACER
	CComQIPtr<IHTMLElement> current(pElement);

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

void IeThread::OnElementGetChildrenWithTagName(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)

	std::vector<IHTMLElement*> &allElems = data.output_list_html_element_;
	LPCWSTR tagName= data.input_string_;

	CComQIPtr<IHTMLElement2> element2(pElement);
	CComBSTR name(tagName);
	CComPtr<IHTMLElementCollection> elementCollection;
	element2->getElementsByTagName(name, &elementCollection);

	long length = 0;
	elementCollection->get_length(&length);

	for (int i = 0; i < length; i++) {
		CComVariant idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		CComVariant zero;
		zero.vt = VT_I4;
		zero.lVal = 0;

		CComPtr<IDispatch> dispatch;
		elementCollection->item(idx, zero, &dispatch);
		CComQIPtr<IHTMLDOMNode> node(dispatch);
		CComQIPtr<IHTMLElement> elem(node);
		if(elem)
		{
			IHTMLElement *pDom = NULL;
			elem.CopyTo(&pDom);
			allElems.push_back(pDom);
		}
	}
}


void IeThread::OnElementRelease(WPARAM w, LPARAM lp)
{
	SCOPETRACER
	ON_THREAD_ELEMENT(data, pElement)
	pElement->Release();
}








