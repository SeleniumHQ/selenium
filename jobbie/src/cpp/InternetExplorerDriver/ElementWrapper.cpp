
#include "StdAfx.h"
#include "ElementWrapper.h"
#include "utils.h"
#include <iostream>

using namespace std;

#include <comutil.h>
#include <comdef.h>

ElementWrapper::ElementWrapper(InternetExplorerDriver* ie, IHTMLDOMNode* node)
{
	node->QueryInterface(__uuidof(IHTMLElement), (void**)&element);
	this->ie = ie;
}

ElementWrapper::~ElementWrapper()
{
	element->Release();
}

const wchar_t* ElementWrapper::getAttribute(const wchar_t* name) 
{
	wchar_t *lookFor = (wchar_t *)name;

	if (_wcsicmp(L"class", name) == 0) {
		lookFor = L"className";
	}

	BSTR attributeName = SysAllocString(lookFor);
	VARIANT value;
	element->getAttribute(attributeName, 0, &value);
	const wchar_t* toReturn = variant2wchar(value);
	VariantClear(&value);
	return toReturn;
}

const wchar_t* ElementWrapper::getValue()
{
	BSTR temp;
	element->get_tagName(&temp);
	const wchar_t *name = bstr2wchar(temp);
	SysFreeString(temp);

	int value = _wcsicmp(L"textarea", name);
	delete name;

	if (value == 0) 
		return this->getTextAreaValue();
	return this->getAttribute(L"value");
}

InternetExplorerDriver* ElementWrapper::setValue(wchar_t* newValue)
{
	CComQIPtr<IHTMLInputFileElement, &__uuidof(IHTMLInputFileElement)> file(element);
	if (file) {
		setInputFileValue(newValue);
	}

	CComQIPtr<IHTMLElement2, &__uuidof(IHTMLElement2)> element2 = element;

	IDispatch* dispatch;
	element->get_document(&dispatch);
	CComQIPtr<IHTMLDocument4, &__uuidof(IHTMLDocument4)> doc = dispatch;
	dispatch->Release();
	CComQIPtr<IHTMLElement3, &__uuidof(IHTMLElement3)> element3 = element;

	VARIANT empty;
	VariantInit(&empty);

	size_t length = wcslen(newValue);

	CComBSTR valueAttributeName = SysAllocString(L"value");
	VARIANT reallyNewValue;
	VariantInit(&reallyNewValue);
	reallyNewValue.vt = VT_BSTR;
	reallyNewValue.bstrVal = SysAllocString(L"");
	element->setAttribute(valueAttributeName, reallyNewValue, 0);
	VariantClear(&reallyNewValue);

	CComBSTR onKeyDown = SysAllocString(L"onkeydown");
	CComBSTR onKeyPress = SysAllocString(L"onkeypress");
	CComBSTR onKeyUp = SysAllocString(L"onkeyup");
	VARIANT_BOOL cancellable;

	element2->focus();

	for (size_t i = 0; i < length; i++) {
		VariantInit(&reallyNewValue);
		reallyNewValue.vt = VT_BSTR;
		wchar_t* t = new wchar_t[i+2];
		wcsncpy_s(t, i+2, newValue, i+1);
		t[i+1] = '\0';
		reallyNewValue.bstrVal = SysAllocString(t);

		IHTMLEventObj* eventObject;
		doc->createEventObject(&empty, &eventObject);
		eventObject->put_keyCode((long) newValue[i]);

		VARIANT eventref;
		VariantInit(&eventref);
		V_VT(&eventref) = VT_DISPATCH;
		V_DISPATCH(&eventref) = eventObject;


        element3->fireEvent(onKeyDown, &eventref, &cancellable);
        element3->fireEvent(onKeyPress, &eventref, &cancellable);
		element->setAttribute(valueAttributeName, reallyNewValue, 0);
        element3->fireEvent(onKeyUp, &eventref, &cancellable);

		delete t;
		VariantClear(&eventref);
		VariantClear(&reallyNewValue);
	}
	element2->blur();

	IHTMLEventObj* eventObj = newEventObject();
	fireEvent(eventObj, L"onchange");
	eventObj->Release();

	VariantClear(&reallyNewValue);

	return new InternetExplorerDriver(ie);
}

bool ElementWrapper::isSelected()
{
	IHTMLOptionElement* option = NULL;
	element->QueryInterface(__uuidof(IHTMLOptionElement), (void**)&option);
	if (option != NULL) {
		VARIANT_BOOL isSelected;
		option->get_selected(&isSelected);
		option->Release();
		return isSelected == VARIANT_TRUE;
	}

	if (isCheckbox()) {
		IHTMLInputElement* input;
		element->QueryInterface(__uuidof(IHTMLInputElement), (void**)&input);
		VARIANT_BOOL isChecked;
		input->get_checked(&isChecked);
		input->Release();

		return isChecked == VARIANT_TRUE;
	}

	return false;
}

InternetExplorerDriver* ElementWrapper::setSelected()
{
	bool currentlySelected = isSelected();

	if (isCheckbox()) {
		if (!isSelected()) {
			click();
		}

		BSTR checked = SysAllocString(L"checked");
		VARIANT isChecked;
		isChecked.vt = VT_BSTR;
		isChecked.bstrVal = SysAllocString(L"true");
		element->setAttribute(checked, isChecked, 0);
		VariantClear(&isChecked);

		if (currentlySelected != isSelected()) {
			IHTMLEventObj* eventObj = newEventObject();
			fireEvent(eventObj, L"onchange");
		}

		return new InternetExplorerDriver(ie);
    }

	IHTMLOptionElement* option = NULL;
	element->QueryInterface(__uuidof(IHTMLOptionElement), (void**)&option);
	if (option != NULL) {
		option->put_selected(VARIANT_TRUE);
		option->Release();
		
		// Looks like we'll need to fire the event on the select element and not the option. Assume for now that the parent node is a select. Which is dumb
		IHTMLDOMNode* node;
		IHTMLDOMNode* parent;
		element->QueryInterface(__uuidof(IHTMLDOMNode), (void**)&node);
		node->get_parentNode(&parent);
		node->Release();

		if (currentlySelected != isSelected()) {
			IHTMLEventObj* eventObj = newEventObject();
			fireEvent(parent, eventObj, L"onchange");
		}
		parent->Release();
		
		return new InternetExplorerDriver(ie);
	}

	if (!this->isEnabled()) 
		throw "Unable to select a disabled element";
	throw "Unable to select element.";
}

bool ElementWrapper::isEnabled() 
{
	IHTMLElement3* elem;
	element->QueryInterface(__uuidof(IHTMLElement3), (void**)&elem);
	VARIANT_BOOL isDisabled;
	elem->get_disabled(&isDisabled);
	elem->Release();
	return isDisabled ? false : true;
}

bool ElementWrapper::isDisplayed()
{
	CComQIPtr<IHTMLElement2, &__uuidof(IHTMLElement2)> elem = element;
	IHTMLCurrentStyle* style;
	BSTR display;
	BSTR visible;

	elem->get_currentStyle(&style);
	style->get_display(&display);
	style->get_visibility(&visible);

	const wchar_t *displayValue = bstr2wchar(display);
	const wchar_t *visibleValue = bstr2wchar(visible);

	int isDisplayed = _wcsicmp(L"none", displayValue);
	int isVisible = _wcsicmp(L"hidden", visibleValue);

	delete displayValue;
	delete visibleValue;
	SysFreeString(display);
	SysFreeString(visible);
	style->Release();

	return isDisplayed != 0 && isVisible != 0;
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

	CComBSTR table = CComBSTR(L"TABLE");
	CComBSTR body = CComBSTR(L"BODY");

	while (parent) 
	{
		CComBSTR tagName;
		parent->get_tagName(&tagName);

		if (table == tagName || body == tagName) 
		{
			IHTMLElement2* parent2;
			parent->QueryInterface(__uuidof(IHTMLElement2), (void**) &parent2);
				
			parent2->get_clientLeft(&x);
			totalX += x;

			parent2->Release();
		}

		SysFreeString(tagName);
		parent->get_offsetLeft(&x);
		totalX += x;
		IHTMLElement* t;
		parent->get_offsetParent(&t);
		parent->Release();

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

	CComBSTR table = CComBSTR(L"TABLE");
	CComBSTR body = CComBSTR(L"BODY");

	while (parent) 
	{
		CComBSTR tagName;
		parent->get_tagName(&tagName);

		if (table == tagName || body == tagName) 
		{
			IHTMLElement2* parent2;
			parent->QueryInterface(__uuidof(IHTMLElement2), (void**) &parent2);
				
			parent2->get_clientTop(&y);
			totalY += y;

			parent2->Release();
		}

		SysFreeString(tagName);
		parent->get_offsetLeft(&y);
		totalY += y;
		IHTMLElement* t;
		parent->get_offsetParent(&t);
		parent->Release();

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

const std::wstring ElementWrapper::getText() 
{
	BSTR tagName;
	element->get_tagName(&tagName);
	bool isTitle = tagName == L"TITLE";
	bool isPre = tagName == L"PRE";
	SysFreeString(tagName);

	if (isTitle)
	{
		return ie->getTitle();
	}

	std::wstring toReturn(L"");
	std::wstring textSoFar(L"");
	CComQIPtr<IHTMLDOMNode, &__uuidof(IHTMLDOMNode)> node(element); 

	getText(toReturn, node, textSoFar, isPre);

	std::wstring text(collapseWhitespace(textSoFar));
	text += toReturn;

	std::wstring::reverse_iterator from = text.rbegin();
	std::wstring::reverse_iterator end = text.rend();

	size_t count = text.length();
	while (from < end && iswspace(*from)) {
		count--;
		from++;
	}

	text.erase(count, text.length());

	return text;
}

void ElementWrapper::getText(std::wstring& toReturn, IHTMLDOMNode* node, std::wstring& textSoFar, bool isPreformatted)
{
	IDispatch* dispatch;
	node->get_childNodes(&dispatch);
	CComQIPtr<IHTMLDOMChildrenCollection, &__uuidof(IHTMLDOMChildrenCollection)> children(dispatch);
	dispatch->Release();

	if (children == NULL)
		return;

	long length = 0;
	children->get_length(&length);
	for (long i = 0; i < length; i++) 
	{
		children->item(i, &dispatch);
		IHTMLDOMNode* child;
		dispatch->QueryInterface(__uuidof(IHTMLDOMNode), (void**) &child);
		dispatch->Release();

		BSTR childName;
		child->get_nodeName(&childName);
		
		IHTMLDOMTextNode* textNode;
		child->QueryInterface(__uuidof(IHTMLDOMTextNode), (void**) &textNode);

		if (textNode) {
			CComBSTR text;
			textNode->get_data(&text);

			for (unsigned int i = 0; i < text.Length(); i++) {
				if (text[i] == 160) {
					text[i] = L' ';
				}
			}

			toReturn += text;
			SysFreeString(text);
			textNode->Release();
		} else if (!wcscmp(childName, L"PRE")) {
			toReturn += collapseWhitespace(textSoFar);
			
			textSoFar.clear();
			textSoFar += L"";

			getText(toReturn, child, textSoFar, true);
			toReturn += textSoFar;

			textSoFar.clear();
			textSoFar += L"";
		} else {
			getText(toReturn, child, textSoFar, false);
		}

		SysFreeString(childName);
		child->Release();
	}

	IHTMLElement* e;
	node->QueryInterface(__uuidof(IHTMLElement), (void**) &e);
	BSTR nodeName;
	if (e) {
		e->get_tagName(&nodeName);
	}

	if (isBlockLevel(node)) {
		if (wcscmp(nodeName, L"PRE")) {
			toReturn += collapseWhitespace(textSoFar);
			textSoFar.clear();
			textSoFar += L"";
		}

		toReturn += L"\r\n";
	}

	if (e) {
		SysFreeString(nodeName);
		e->Release();
	}
}

std::wstring ElementWrapper::collapseWhitespace(const std::wstring &text)
{
	std::wstring toReturn(L"");
	int previousWasSpace = false;

	for (unsigned int i = 0; i < text.length(); i++) {
		wchar_t c = text[i];
		int currentIsSpace = iswspace(c);
		if (!(currentIsSpace && previousWasSpace)) {
			toReturn += c;
		}
		
		previousWasSpace = currentIsSpace;
	}

	return toReturn;
}

const wchar_t* ElementWrapper::getTextAreaValue() 
{
	IHTMLTextAreaElement* textarea;
	element->QueryInterface(__uuidof(IHTMLTextAreaElement), (void**)&textarea);

	BSTR result;
	textarea->get_value(&result);
	textarea->Release();

	const wchar_t* toReturn = bstr2wchar(result);
	SysFreeString(result);
	return toReturn;
}

bool ElementWrapper::isBlockLevel(IHTMLDOMNode *node)
{
	CComQIPtr<IHTMLElement, &__uuidof(IHTMLElement)> e(node);

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

InternetExplorerDriver* ElementWrapper::click()
{
	CComQIPtr<IHTMLDOMNode2, &__uuidof(IHTMLDOMNode2)> node = element;
	CComQIPtr<IHTMLDocument4, &__uuidof(IHTMLDocument4)> doc;

	IDispatch* dispatch;
	node->get_ownerDocument(&dispatch);
	doc = dispatch;
	dispatch->Release();

	CComQIPtr<IHTMLElement3, &__uuidof(IHTMLElement3)> element3;
	element3 = element;

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
	element3->fireEvent(mouseUp, &eventref, &cancellable);
	SysFreeString(mouseDown);
	SysFreeString(mouseUp);

	element->click();

	VariantClear(&eventref);

	ie->waitForNavigateToFinish();

	return new InternetExplorerDriver(ie);
}

InternetExplorerDriver* ElementWrapper::submit()
{
	IHTMLFormElement* form = NULL;
	element->QueryInterface(__uuidof(IHTMLFormElement), (void**)&form);
	if (form != NULL) {
		form->submit();
		form->Release();
	} else {
		IHTMLInputElement* input = NULL;
		element->QueryInterface(__uuidof(IHTMLInputElement), (void**)&input);
		if (input != NULL) {
			BSTR typeName;
			input->get_type(&typeName);
			const wchar_t* type = bstr2wchar(typeName);

			if (type != NULL && (_wcsicmp(L"submit", type) == 0 || _wcsicmp(L"image", type) == 0)) {
				click();
			} else {
				input->get_form(&form);
				form->submit();
				form->Release();
			}

			delete type;
			SysFreeString(typeName);
			input->Release();
		} else {
			form = findParentForm();
			if (form == NULL) {
				throw "Unable to find the containing form";
			} 
			form->submit();
			form->Release();
		}
	}

	ie->waitForNavigateToFinish();
	return new InternetExplorerDriver(ie);
}

void ElementWrapper::setNode(IHTMLDOMNode* fromNode)
{
	if (element != NULL)
		element->Release();
	fromNode->QueryInterface(__uuidof(IHTMLElement), (void**)&element);
}

bool ElementWrapper::isCheckbox()
{
	BSTR tagName;
	element->get_tagName(&tagName);
	const wchar_t* name = bstr2wchar(tagName);
	SysFreeString(tagName);

	bool isCheckbox = false;
	if (_wcsicmp(name, L"input") == 0) {
		IHTMLInputElement* input;
		element->QueryInterface(__uuidof(IHTMLInputElement), (void**)&input);
		BSTR typeName;
		input->get_type(&typeName);
		const wchar_t* type = bstr2wchar(typeName);
		isCheckbox = type != NULL && _wcsicmp(type, L"checkbox") == 0;
		delete type;
		SysFreeString(typeName);
		input->Release();
	}

	delete name;
	return isCheckbox;
}

IHTMLFormElement* ElementWrapper::findParentForm() 
{
	IHTMLElement* current = element;
	IHTMLFormElement* form = NULL;
	current->QueryInterface(__uuidof(IHTMLFormElement), (void**)&form);
    while (!(current == NULL || form != NULL)) {
		IHTMLElement* temp;
		current->get_parentElement(&temp);
		if (current != element) {
			current->Release();
		}
		current = temp;
		current->QueryInterface(__uuidof(IHTMLFormElement), (void**)&form);
    }
	if (current != element)
		current->Release();
	return form;
}

std::vector<ElementWrapper*>* ElementWrapper::getChildrenWithTagName(const wchar_t* tagName) 
{
	CComQIPtr<IHTMLElement2, &__uuidof(IHTMLElement2)> element2 = element;
	CComBSTR name = SysAllocString(tagName);
	IHTMLElementCollection* elementCollection;
	element2->getElementsByTagName(name, &elementCollection);

	long length = 0;
	elementCollection->get_length(&length);

	std::vector<ElementWrapper*>* toReturn = new std::vector<ElementWrapper*>();

	for (int i = 0; i < length; i++) {
		VARIANT idx;
		idx.vt = VT_I4;
		idx.lVal = i;
		IDispatch* dispatch;
		VARIANT zero;
		zero.vt = VT_I4;
		zero.lVal = 0;
		elementCollection->item(idx, zero, &dispatch);
		VariantClear(&idx);
		VariantClear(&zero);

		IHTMLDOMNode* node;
		dispatch->QueryInterface(__uuidof(IHTMLDOMNode), (void**)&node);
		dispatch->Release();

		toReturn->push_back(new ElementWrapper(ie, node));
		node->Release();
	}

	elementCollection->Release();
	return toReturn;
}

IHTMLEventObj* ElementWrapper::newEventObject() 
{
	IDispatch* dispatch;
	element->get_document(&dispatch);
	CComQIPtr<IHTMLDocument4, &__uuidof(IHTMLDocument4)> doc = dispatch;
	dispatch->Release();
		
	VARIANT empty;
	VariantInit(&empty);
	IHTMLEventObj* eventObject;
	doc->createEventObject(&empty, &eventObject);
	return eventObject;
}

void ElementWrapper::fireEvent(IHTMLEventObj* eventObject, const OLECHAR* eventName) 
{
	CComQIPtr<IHTMLDOMNode, &__uuidof(IHTMLDOMNode)> node = element;
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

void ElementWrapper::setInputFileValue(wchar_t* newValue) 
{
	bool initialVis = ie->getVisible();
	// Bring the IE window to the front.
	ie->bringToFront();

	CComQIPtr<IHTMLElement2, &__uuidof(IHTMLElement2)> element2(element);
	element2->focus();
	
	wchar_t c;
	while ((c = *newValue++)) 
	{
		short keyCode = VkKeyScan(c); 
		bool needsShift = (keyCode >> 8) & 1;

		if (needsShift)
		{
			keyPress(VK_LSHIFT, false);
		}

		keyPress(keyCode);

		if(needsShift)
		{
			keyPress(VK_SHIFT, true);
		}
	}

	ie->setVisible(initialVis);
}

void ElementWrapper::keyPress(short keyCode) 
{
	keyPress(keyCode, false);
	keyPress(keyCode, true);
}

void ElementWrapper::keyPress(short keyCode, bool shouldRelease)
{
	keybd_event(keyCode, 0, (shouldRelease ? KEYEVENTF_KEYUP : 0), 0);
/*
	// This doesn't work as it should. I have no idea why.
		INPUT input;
		ZeroMemory(&input, sizeof(input));

		input.type = INPUT_KEYBOARD;
		input.ki.time = 0;
		input.ki.wVk = (WORD) keyCode;
		//input.ki.dwFlags = KEYEVENTF_UNICODE;
		input.ki.dwFlags = 0;
		input.ki.dwExtraInfo = 0;

		if (shouldRelease)
			input.ki.dwFlags &= KEYEVENTF_KEYUP;

		SendInput(1, &input, sizeof(input));
*/	
}